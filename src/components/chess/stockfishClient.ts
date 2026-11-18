import type { KrisTierId } from './chessProfiles';

export type EngineState = 'loading' | 'ready' | 'thinking' | 'error';

export interface StockfishClientOptions {
	initialTier?: KrisTierId;
	onStateChange?: (state: EngineState) => void;
	onDownloadProgress?: (percent: number) => void;
}

/** Calibrated UCI_Elo ceiling for ~1900 Chess.com Rapid (compensates CCRL Blitz compression). */
const UNC_1900_UCI_ELO = 2290;

interface MultiPvCandidate {
	pv: number;
	depth: number;
	cp: number;
	isMateInOne: boolean;
	move: string;
}

interface AccuracyBand {
	prob: number;
	minLoss: number;
	maxLoss: number;
}

const CALIBRATED_BANDS: Record<'1000' | '1500', readonly AccuracyBand[]> = {
	// Empirically calibrated (~59cp ACPL, 19% mistakes 100–249cp, 4% blunders >=250cp)
	'1500': [
		{ prob: 0.44, minLoss: 0, maxLoss: 25 },
		{ prob: 0.34, minLoss: 30, maxLoss: 115 },
		{ prob: 0.16, minLoss: 116, maxLoss: 230 },
		{ prob: 0.06, minLoss: 231, maxLoss: 340 },
	],
	// Empirically calibrated (~145cp ACPL, 28% mistakes 100–249cp, 24% blunders >=250cp)
	'1000': [
		{ prob: 0.24, minLoss: 0, maxLoss: 35 },
		{ prob: 0.32, minLoss: 45, maxLoss: 165 },
		{ prob: 0.28, minLoss: 170, maxLoss: 340 },
		{ prob: 0.16, minLoss: 341, maxLoss: 540 },
	],
};

function selectCalibratedMultiPvMove(
	rawCandidates: readonly MultiPvCandidate[],
	tier: '1000' | '1500'
): string | null {
	if (rawCandidates.length === 0) return null;

	// Use the highest reached depth for each distinct root candidate move
	let maxDepth = 0;
	for (const c of rawCandidates) {
		if (c.depth > maxDepth) maxDepth = c.depth;
	}
	const byMove = new Map<string, MultiPvCandidate>();
	for (const c of rawCandidates) {
		if (c.depth < maxDepth - 1) continue;
		const existing = byMove.get(c.move);
		if (!existing || c.depth > existing.depth) {
			byMove.set(c.move, c);
		}
	}

	const sorted = [...byMove.values()].sort((a, b) => b.cp - a.cp);
	if (sorted.length === 0) return rawCandidates[0].move;
	if (sorted.length === 1) return sorted[0].move;

	// Obvious mate-in-1 is spotted almost always by 1500 (98%) and usually by 1000 (85%)
	if (sorted[0].isMateInOne && Math.random() < (tier === '1500' ? 0.98 : 0.85)) {
		return sorted[0].move;
	}

	const bestCp = sorted[0].cp;
	const bands = CALIBRATED_BANDS[tier];
	const roll = Math.random();
	let acc = 0;
	let chosenBand = bands[bands.length - 1];
	for (const band of bands) {
		acc += band.prob;
		if (roll <= acc) {
			chosenBand = band;
			break;
		}
	}

	const inBand = sorted.filter((c) => {
		const loss = bestCp - c.cp;
		return loss >= chosenBand.minLoss && loss <= chosenBand.maxLoss;
	});
	if (inBand.length > 0) {
		return inBand[Math.floor(Math.random() * inBand.length)].move;
	}

	const withinMax = sorted.filter((c) => bestCp - c.cp <= chosenBand.maxLoss);
	const fallbackPool = withinMax.length > 0 ? withinMax : sorted;
	const targetMid = (chosenBand.minLoss + chosenBand.maxLoss) / 2;
	let closest = fallbackPool[0];
	let bestDist = Math.abs(bestCp - closest.cp - targetMid);
	for (let i = 1; i < fallbackPool.length; i += 1) {
		const cand = fallbackPool[i];
		const dist = Math.abs(bestCp - cand.cp - targetMid);
		if (dist < bestDist) {
			bestDist = dist;
			closest = cand;
		}
	}
	return closest.move;
}

/**
 * Lightweight single-threaded Stockfish 19 Lite WASM Web Worker wrapper.
 * Supports switching seamlessly across 3 calibrated strength profiles
 * ('1900' Unc Kris, '1500' Teen Kris, '1000' Lil' Kris) without reloading WASM.
 */
export class StockfishClient {
	private worker: Worker | null = null;
	private progressChannel: MessageChannel | null = null;
	private epoch = 0;
	private isDisposed = false;
	private state: EngineState = 'loading';
	private configuredMode: 'none' | 'uci1900' | 'multipv32' = 'none';
	private readonly initialTier: KrisTierId;
	private readonly onStateChange?: (state: EngineState) => void;
	private readonly onDownloadProgress?: (percent: number) => void;

	private readyPromise: Promise<void>;
	private resolveReady!: () => void;
	private rejectReady!: (err: Error) => void;

	private activeSearch: {
		epoch: number;
		tier: KrisTierId;
		candidates: MultiPvCandidate[];
		resolve: (uciMove: string | null) => void;
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

	private postModeOptions(targetMode: 'uci1900' | 'multipv32') {
		if (!this.worker) return;
		if (targetMode === 'uci1900') {
			this.worker.postMessage('setoption name MultiPV value 1');
			this.worker.postMessage('setoption name UCI_LimitStrength value true');
			this.worker.postMessage(`setoption name UCI_Elo value ${UNC_1900_UCI_ELO}`);
		} else {
			this.worker.postMessage('setoption name UCI_LimitStrength value false');
			this.worker.postMessage('setoption name Skill Level value 20');
			this.worker.postMessage('setoption name MultiPV value 32');
		}
		this.configuredMode = targetMode;
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
			const targetMode = this.initialTier === '1900' ? 'uci1900' : 'multipv32';
			this.postModeOptions(targetMode);
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
			this.activeSearch.tier !== '1900' &&
			line.startsWith('info depth ') &&
			line.includes(' pv ')
		) {
			const match = line.match(
				/\bdepth\s+(\d+)\b.*\bmultipv\s+(\d+)\b.*\bscore\s+(cp|mate)\s+(-?\d+)\b.*\bpv\s+(\S+)/
			);
			if (match) {
				const depth = Number(match[1]);
				const pv = Number(match[2]);
				const scoreKind = match[3];
				const scoreVal = Number(match[4]);
				const cp =
					scoreKind === 'cp'
						? scoreVal
						: scoreVal > 0
							? 2000 - scoreVal
							: -2000 + Math.abs(scoreVal);
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
				const { resolve, epoch, tier, candidates } = this.activeSearch;
				this.activeSearch = null;
				if (this.state === 'thinking') {
					this.setState('ready');
				}
				if (epoch !== this.epoch) {
					resolve(null);
					return;
				}
				if (tier === '1900') {
					resolve(engineMove);
				} else {
					const sampled = selectCalibratedMultiPvMove(candidates, tier);
					resolve(sampled ?? engineMove);
				}
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
			const targetMode = tier === '1900' ? 'uci1900' : 'multipv32';
			if (this.configuredMode !== targetMode) {
				this.postModeOptions(targetMode);
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
		thinkMs = 680
	): Promise<string | null> {
		await this.readyPromise;
		if (this.isDisposed || !this.worker) return null;

		this.cancelCurrentSearch();
		const searchEpoch = this.epoch;
		this.setState('thinking');

		const targetMode = tier === '1900' ? 'uci1900' : 'multipv32';
		if (this.configuredMode !== targetMode) {
			this.postModeOptions(targetMode);
			await this.waitReady();
			if (this.isDisposed || searchEpoch !== this.epoch || !this.worker) {
				if (this.state === 'thinking') this.setState('ready');
				return null;
			}
		}

		const startedAt = performance.now();
		const move = await new Promise<string | null>((resolve, reject) => {
			const timeoutId = window.setTimeout(() => {
				if (this.activeSearch?.epoch === searchEpoch) {
					this.worker?.postMessage('stop');
				}
			}, thinkMs + 8000);

			this.activeSearch = {
				epoch: searchEpoch,
				tier,
				candidates: [],
				resolve,
				reject,
				timeoutId,
			};

			this.worker?.postMessage(`position fen ${fen}`);
			if (tier === '1900') {
				this.worker?.postMessage(`go movetime ${thinkMs}`);
			} else {
				this.worker?.postMessage('go depth 5');
			}
		});

		if (!move || this.isDisposed || searchEpoch !== this.epoch) return null;

		// Keep brief natural human pacing for shallow depth-5 MultiPV searches without stalling UI
		if (tier !== '1900') {
			const elapsed = performance.now() - startedAt;
			const remaining = Math.round(thinkMs - elapsed);
			if (remaining > 15) {
				this.setState('thinking');
				await this.waitHumanPacing(remaining);
				if (this.isDisposed || searchEpoch !== this.epoch) {
					if (this.state === 'thinking') this.setState('ready');
					return null;
				}
				if (this.state === 'thinking') this.setState('ready');
			}
		}

		return move;
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
