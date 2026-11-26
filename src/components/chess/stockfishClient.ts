import { Chess } from 'chess.js';
import type { KrisTierId } from './chessProfiles';
import {
	TIER_ENGINE_CONFIG,
	computeHumanThinkMs,
	encodeMateCp,
	selectSanakamotoMove,
	type RawMultiPvCandidate,
} from './krisMoveSelector';

export type EngineState = 'loading' | 'ready' | 'thinking' | 'error';

export interface StockfishClientOptions {
	initialTier?: KrisTierId;
	onStateChange?: (state: EngineState) => void;
	onDownloadProgress?: (percent: number) => void;
}

export interface FindBestMoveContext {
	ply?: number;
	prevOpponentToSquare?: string | null;
	krisClockMs?: number;
}

interface SearchOutcome {
	candidates: RawMultiPvCandidate[];
	fallbackMove: string | null;
}

/**
 * Lightweight single-threaded Stockfish 19 Lite WASM Web Worker wrapper.
 * Runs hash-cleared fixed-horizon MultiPV searches across all 3 tiers
 * (`1900` Om Kris, `1500` ABG Kris, `1000` Bocil Kris) with Gaussian human-perception
 * calibration and natural Rapid pacing.
 */
export class StockfishClient {
	private worker: Worker | null = null;
	private progressChannel: MessageChannel | null = null;
	private epoch = 0;
	private isDisposed = false;
	private state: EngineState = 'loading';
	private configuredMultiPv: number | null = null;
	private readonly initialTier: KrisTierId;
	private readonly onStateChange?: (state: EngineState) => void;
	private readonly onDownloadProgress?: (percent: number) => void;

	private readyPromise: Promise<void>;
	private resolveReady!: () => void;
	private rejectReady!: (err: Error) => void;

	private activeSearch: {
		epoch: number;
		candidates: RawMultiPvCandidate[];
		resolve: (outcome: SearchOutcome | null) => void;
		reject: (err: Error) => void;
		timeoutId: number;
	} | null = null;

	private pendingReadyWaiters: Array<{
		resolve: () => void;
		reject: (err: Error) => void;
		timeoutId: number;
	}> = [];

	private pendingDelayTimers: Set<number> = new Set();
	private uciOkReceived = false;

	constructor(options: StockfishClientOptions = {}) {
		this.initialTier = options.initialTier ?? '1900';
		this.onStateChange = options.onStateChange;
		this.onDownloadProgress = options.onDownloadProgress;

		this.readyPromise = new Promise<void>((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		});

		this.initWorker();
	}

	private setState(next: EngineState) {
		if (this.isDisposed) return;
		this.state = next;
		this.onStateChange?.(next);
	}

	private postTierOptions(multiPv: number, includeStrengthReset: boolean) {
		if (!this.worker) return;
		if (includeStrengthReset) {
			this.worker.postMessage('setoption name Hash value 4');
			this.worker.postMessage('setoption name UCI_LimitStrength value false');
			this.worker.postMessage('setoption name Skill Level value 20');
		}
		this.worker.postMessage(`setoption name MultiPV value ${multiPv}`);
		this.configuredMultiPv = multiPv;
	}

	private initWorker() {
		try {
			const base = import.meta.env.BASE_URL || '/';
			const normalizedBase = base.endsWith('/') ? base : `${base}/`;
			const workerUrl = `${normalizedBase}stockfish/stockfish-19-lite-single.js`;
			const worker = new Worker(workerUrl);
			this.worker = worker;

			if (typeof MessageChannel !== 'undefined' && this.onDownloadProgress) {
				const channel = new MessageChannel();
				this.progressChannel = channel;
				channel.port1.onmessage = (ev: MessageEvent<{ percent?: number }>) => {
					const pct = ev.data?.percent;
					if (typeof pct === 'number' && Number.isFinite(pct)) {
						this.onDownloadProgress?.(Math.min(100, Math.max(0, Math.round(pct * 100))));
					}
				};
				worker.postMessage('setoption name CanOutputEngineDownloadProgress');
				worker.postMessage({ progressPort: channel.port2 }, [channel.port2]);
			}

			worker.onmessage = (ev: MessageEvent<string>) => {
				if (this.isDisposed) return;
				const line = typeof ev.data === 'string' ? ev.data.trim() : '';
				if (!line) return;
				this.handleUciLine(line);
			};

			worker.onerror = () => {
				if (this.isDisposed) return;
				const err = new Error('Stockfish Web Worker failed to initialize.');
				this.setState('error');
				if (!this.uciOkReceived) {
					this.rejectReady(err);
				}
				if (this.activeSearch) {
					window.clearTimeout(this.activeSearch.timeoutId);
					this.activeSearch.reject(err);
					this.activeSearch = null;
				}
				if (this.pendingReadyWaiters.length > 0) {
					const waiters = this.pendingReadyWaiters.splice(0);
					waiters.forEach((waiter) => {
						window.clearTimeout(waiter.timeoutId);
						waiter.reject(err);
					});
				}
			};

			worker.postMessage('uci');
		} catch (error) {
			this.setState('error');
			const err =
				error instanceof Error
					? error
					: new Error('Unable to start chess engine worker.');
			this.rejectReady(err);
		}
	}

	private handleUciLine(line: string) {
		if (line === 'uciok' && !this.uciOkReceived) {
			this.uciOkReceived = true;
			const cfg = TIER_ENGINE_CONFIG[this.initialTier];
			this.postTierOptions(cfg.multiPv, true);
			this.worker?.postMessage('isready');
			return;
		}

		if (line === 'readyok') {
			if (this.state === 'loading') {
				this.onDownloadProgress?.(100);
				this.setState('ready');
				this.resolveReady();
				return;
			}
			const nextWaiter = this.pendingReadyWaiters.shift();
			if (nextWaiter) {
				window.clearTimeout(nextWaiter.timeoutId);
				nextWaiter.resolve();
			}
			return;
		}

		if (
			this.activeSearch &&
			line.startsWith('info depth ') &&
			line.includes(' pv ') &&
			!line.includes(' upperbound') &&
			!line.includes(' lowerbound')
		) {
			const match = line.match(
				/\bdepth\s+(\d+)\b.*\bmultipv\s+(\d+)\b.*\bscore\s+(cp|mate)\s+(-?\d+)\b.*\bpv\s+(\S+)/
			);
			if (match) {
				const depth = Number(match[1]);
				const pv = Number(match[2]);
				const scoreKind = match[3];
				const scoreVal = Number(match[4]);
				const cp = scoreKind === 'cp' ? scoreVal : encodeMateCp(scoreVal);
				this.activeSearch.candidates.push({
					depth,
					pv,
					cp,
					isMateInOne: scoreKind === 'mate' && scoreVal === 1,
					move: match[5],
				});
			}
			return;
		}

		if (line.startsWith('bestmove')) {
			const token = line.split(/\s+/)[1];
			const engineMove = token && token !== '(none)' ? token : null;
			if (this.activeSearch) {
				window.clearTimeout(this.activeSearch.timeoutId);
				const { resolve, epoch, candidates } = this.activeSearch;
				this.activeSearch = null;
				if (epoch !== this.epoch) {
					resolve(null);
					return;
				}
				resolve({ candidates, fallbackMove: engineMove });
			}
		}
	}

	public async ensureReady(): Promise<void> {
		return this.readyPromise;
	}

	public cancelCurrentSearch() {
		this.epoch += 1;
		for (const timerId of this.pendingDelayTimers) {
			window.clearTimeout(timerId);
		}
		this.pendingDelayTimers.clear();
		if (this.activeSearch) {
			window.clearTimeout(this.activeSearch.timeoutId);
			this.activeSearch.resolve(null);
			this.activeSearch = null;
		}
		if (this.worker && this.uciOkReceived) {
			this.worker.postMessage('stop');
			if (this.state === 'thinking') {
				this.setState('ready');
			}
		}
	}

	public async startNewGame(tier?: KrisTierId): Promise<void> {
		await this.readyPromise;
		if (this.isDisposed || !this.worker) return;

		this.cancelCurrentSearch();
		if (tier) {
			const cfg = TIER_ENGINE_CONFIG[tier];
			if (this.configuredMultiPv !== cfg.multiPv) {
				this.postTierOptions(cfg.multiPv, false);
			}
		}
		this.worker.postMessage('ucinewgame');
		await this.waitReady();
	}

	private waitReady(): Promise<void> {
		if (this.isDisposed || !this.worker) return Promise.resolve();

		return new Promise<void>((resolve, reject) => {
			const entry = {
				resolve,
				reject,
				timeoutId: 0,
			};
			entry.timeoutId = window.setTimeout(() => {
				const idx = this.pendingReadyWaiters.indexOf(entry);
				if (idx !== -1) {
					this.pendingReadyWaiters.splice(idx, 1);
					reject(new Error('Chess engine timed out waiting for readyok.'));
				}
			}, 10000);
			this.pendingReadyWaiters.push(entry);
			this.worker?.postMessage('isready');
		});
	}

	private waitHumanPacing(ms: number): Promise<void> {
		if (ms <= 12 || this.isDisposed) return Promise.resolve();
		return new Promise<void>((resolve) => {
			const id = window.setTimeout(() => {
				this.pendingDelayTimers.delete(id);
				resolve();
			}, ms);
			this.pendingDelayTimers.add(id);
		});
	}

	public async findBestMove(
		fen: string,
		tier: KrisTierId = '1900',
		context: FindBestMoveContext = {}
	): Promise<string | null> {
		await this.readyPromise;
		if (this.isDisposed || !this.worker) return null;

		const game = new Chess(fen);
		const legalMoves = game.moves({ verbose: true });
		if (legalMoves.length === 0) return null;

		this.cancelCurrentSearch();
		const searchEpoch = this.epoch;
		this.setState('thinking');

		const ply = context.ply ?? 0;
		const krisClockMs = context.krisClockMs ?? 900_000;
		const isInCheck = game.inCheck();

		// Fast-path forced single legal move without invoking Stockfish search
		if (legalMoves.length === 1) {
			const only = legalMoves[0];
			const onlyUci = `${only.from}${only.to}${only.promotion ?? ''}`;
			const isRecapture = Boolean(
				only.captured && context.prevOpponentToSquare && only.to === context.prevOpponentToSquare
			);
			const delayMs = computeHumanThinkMs({
				tier,
				fromBook: false,
				ply,
				legalMoveCount: 1,
				isRecapture,
				isInCheck,
				evalSpreadCp: 0,
				isOnlyMove: true,
				krisClockMs,
			});
			await this.waitHumanPacing(delayMs);
			if (this.isDisposed || searchEpoch !== this.epoch) {
				if (this.state === 'thinking') this.setState('ready');
				return null;
			}
			if (this.state === 'thinking') this.setState('ready');
			return onlyUci;
		}

		const cfg = TIER_ENGINE_CONFIG[tier];
		if (this.configuredMultiPv !== cfg.multiPv) {
			this.postTierOptions(cfg.multiPv, false);
		}
		// Clear Transposition Table before every move so deeper cached lines never leak across plies
		this.worker.postMessage('setoption name Clear Hash');
		await this.waitReady();
		if (this.isDisposed || searchEpoch !== this.epoch || !this.worker) {
			if (this.state === 'thinking') this.setState('ready');
			return null;
		}

		const startedAt = performance.now();
		const outcome = await new Promise<SearchOutcome | null>((resolve, reject) => {
			const timeoutId = window.setTimeout(() => {
				if (this.activeSearch?.epoch === searchEpoch) {
					this.worker?.postMessage('stop');
				}
			}, 10000);

			this.activeSearch = {
				epoch: searchEpoch,
				candidates: [],
				resolve,
				reject,
				timeoutId,
			};

			this.worker?.postMessage(`position fen ${fen}`);
			this.worker?.postMessage(`go depth ${cfg.searchDepth}`);
		});

		if (!outcome || this.isDisposed || searchEpoch !== this.epoch) {
			if (this.state === 'thinking') this.setState('ready');
			return null;
		}

		const picked = selectSanakamotoMove({
			fen,
			rawCandidates: outcome.candidates,
			tier,
			ply: context.ply,
			prevOpponentToSquare: context.prevOpponentToSquare ?? null,
		});
		const finalMove = picked?.move ?? outcome.fallbackMove;
		if (!finalMove) {
			if (this.state === 'thinking') this.setState('ready');
			return null;
		}

		const selectedVerbose = legalMoves.find(
			(m) => `${m.from}${m.to}${m.promotion ?? ''}` === finalMove
		);
		const isRecapture = Boolean(
			selectedVerbose?.captured &&
				context.prevOpponentToSquare &&
				selectedVerbose.to === context.prevOpponentToSquare
		);

		const targetThinkMs = computeHumanThinkMs({
			tier,
			fromBook: false,
			ply,
			legalMoveCount: legalMoves.length,
			isRecapture,
			isInCheck,
			evalSpreadCp: picked?.evalSpreadCp ?? 0,
			isOnlyMove: picked?.isOnlyMove ?? false,
			krisClockMs,
		});

		const elapsed = performance.now() - startedAt;
		const remaining = Math.round(targetThinkMs - elapsed);
		if (remaining > 15) {
			await this.waitHumanPacing(remaining);
			if (this.isDisposed || searchEpoch !== this.epoch) {
				if (this.state === 'thinking') this.setState('ready');
				return null;
			}
		}

		if (this.state === 'thinking') this.setState('ready');
		return finalMove;
	}

	public dispose() {
		this.isDisposed = true;
		this.epoch += 1;
		for (const timerId of this.pendingDelayTimers) {
			window.clearTimeout(timerId);
		}
		this.pendingDelayTimers.clear();
		if (this.activeSearch) {
			window.clearTimeout(this.activeSearch.timeoutId);
			this.activeSearch.resolve(null);
			this.activeSearch = null;
		}
		if (this.pendingReadyWaiters.length > 0) {
			const waiters = this.pendingReadyWaiters.splice(0);
			waiters.forEach((waiter) => {
				window.clearTimeout(waiter.timeoutId);
				waiter.resolve();
			});
		}
		if (this.progressChannel) {
			try {
				this.progressChannel.port1.close();
			} catch {
				// Ignore channel close errors
			}
			this.progressChannel = null;
		}
		if (this.worker) {
			try {
				this.worker.postMessage('quit');
			} catch {
				// Ignore quit errors
			}
			this.worker.terminate();
			this.worker = null;
		}
	}
}
