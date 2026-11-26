import { Chess, type Color, type Move, type Square } from 'chess.js';
import type { KrisTierId } from './chessProfiles';

export interface RawMultiPvCandidate {
	pv: number;
	depth: number;
	cp: number;
	isMateInOne: boolean;
	move: string;
}

export interface TierEngineConfig {
	multiPv: number;
	searchDepth: number;
	noiseSigma: number;
	sharpNoiseBoost: number;
	maxUtilDrop: number;
	minPoolSize: number;
	endgameNoiseScale: number;
	mateInOneSpotProb: number;
	obviousRecaptureSpotProb: number;
	styleScale: number;
}

/**
 * Hash-cleared fixed-horizon MultiPV configs per tier (`go depth 2 / 3`) calibrated with
 * smooth human utility (`cpToHumanUtility`) and truncated Gaussian perceptual noise so each
 * tier plays at an accurate, consistent Chess.com Rapid Elo with `Sanakamoto-san` style bias.
 */
export const TIER_ENGINE_CONFIG: Record<KrisTierId, TierEngineConfig> = {
	'1000': {
		multiPv: 24,
		searchDepth: 2,
		noiseSigma: 14.0,
		sharpNoiseBoost: 0.35,
		maxUtilDrop: 66,
		minPoolSize: 5,
		endgameNoiseScale: 1.0,
		mateInOneSpotProb: 0.72,
		obviousRecaptureSpotProb: 0.78,
		styleScale: 0.85,
	},
	'1500': {
		multiPv: 16,
		searchDepth: 3,
		noiseSigma: 9.4,
		sharpNoiseBoost: 0.28,
		maxUtilDrop: 50,
		minPoolSize: 5,
		endgameNoiseScale: 1.0,
		mateInOneSpotProb: 0.90,
		obviousRecaptureSpotProb: 0.91,
		styleScale: 1.05,
	},
	'1900': {
		multiPv: 10,
		searchDepth: 3,
		noiseSigma: 4.2,
		sharpNoiseBoost: 0.2,
		maxUtilDrop: 30,
		minPoolSize: 4,
		endgameNoiseScale: 0.92,
		mateInOneSpotProb: 0.985,
		obviousRecaptureSpotProb: 0.985,
		styleScale: 1.2,
	},
};

export interface SelectMoveParams {
	fen: string;
	rawCandidates: readonly RawMultiPvCandidate[];
	tier: KrisTierId;
	ply?: number;
	prevOpponentToSquare?: string | null;
}

export interface SelectedMoveResult {
	move: string;
	evalSpreadCp: number;
	isOnlyMove: boolean;
}

export interface HumanThinkContext {
	tier: KrisTierId;
	fromBook: boolean;
	ply: number;
	legalMoveCount: number;
	isRecapture: boolean;
	isInCheck: boolean;
	evalSpreadCp: number;
	isOnlyMove: boolean;
	krisClockMs: number;
}

interface BoardFacts {
	turn: Color;
	oppColor: Color;
	ply: number;
	nonPawnPieces: number;
	ourQueenOnBoard: boolean;
	oppQueenOnBoard: boolean;
	oppQueenSquares: Square[];
	oppKingCoords: { file: number; rank: number } | null;
}

const FILES = 'abcdefgh';

/** Standard Lichess/Stockfish logistic mapping from centipawns to expected win percentage (0–100). */
export function cpToWinPct(cp: number): number {
	const clamped = Math.max(-2400, Math.min(2400, cp));
	return 100 / (1 + Math.exp(-0.00368208 * clamped));
}

/**
 * Blends Stockfish Win% with damped linear centipawns so large leads (+500..+800 cp)
 * still penalize hanging material instead of flattening out completely.
 */
function cpToHumanUtility(cp: number): number {
	const win = cpToWinPct(cp);
	const damped = Math.sign(cp) * 32 * Math.log1p(Math.abs(cp) / 350);
	return 0.65 * win + 0.35 * (50 + damped);
}

/** Samples a Box-Muller standard normal variable clamped to `[-clampZ, clampZ]` to avoid freak outlier tails. */
function sampleTruncatedNormal(clampZ = 3.2): number {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	return Math.max(-clampZ, Math.min(clampZ, z));
}

/** Converts a UCI `score mate N` value to the calibrated centipawn scale without drowning out tactics. */
export function encodeMateCp(mateIn: number): number {
	if (mateIn === 1) return 2400;
	if (mateIn > 1) return 2200 - 15 * Math.min(mateIn, 20);
	if (mateIn < 0) return -(2200 - 15 * Math.min(Math.abs(mateIn), 20));
	return -2400;
}

function estimatePlyFromFen(fen: string, turn: Color): number {
	const parts = fen.split(' ');
	const fullmove = Number.parseInt(parts[5] ?? '1', 10);
	const safeFull = Number.isFinite(fullmove) && fullmove >= 1 ? fullmove : 1;
	return (safeFull - 1) * 2 + (turn === 'b' ? 1 : 0);
}

function parseSquareCoords(sq: string): { file: number; rank: number } {
	return {
		file: FILES.indexOf(sq[0] ?? 'a'),
		rank: Number.parseInt(sq[1] ?? '1', 10) - 1,
	};
}

function extractBoardFacts(game: Chess, fen: string, explicitPly?: number): BoardFacts {
	const turn = game.turn();
	const oppColor: Color = turn === 'w' ? 'b' : 'w';
	const board = game.board();
	let nonPawnPieces = 0;
	let ourQueenOnBoard = false;
	const oppQueenSquares: Square[] = [];
	let oppKingCoords: { file: number; rank: number } | null = null;

	for (let r = 0; r < 8; r += 1) {
		for (let c = 0; c < 8; c += 1) {
			const cell = board[r][c];
			if (!cell) continue;
			if (cell.type !== 'p' && cell.type !== 'k') {
				nonPawnPieces += 1;
			}
			if (cell.type === 'q') {
				if (cell.color === turn) ourQueenOnBoard = true;
				else oppQueenSquares.push(cell.square);
			} else if (cell.type === 'k' && cell.color === oppColor) {
				oppKingCoords = { file: c, rank: 7 - r };
			}
		}
	}

	return {
		turn,
		oppColor,
		ply: explicitPly ?? estimatePlyFromFen(fen, turn),
		nonPawnPieces,
		ourQueenOnBoard,
		oppQueenOnBoard: oppQueenSquares.length > 0,
		oppQueenSquares,
		oppKingCoords,
	};
}

function isSquareLineAttackedByEnemyQueen(
	board: ReturnType<Chess['board']>,
	oppQueenSquares: readonly Square[],
	targetSq: Square
): boolean {
	if (oppQueenSquares.length === 0) return false;
	const target = parseSquareCoords(targetSq);
	for (const qSq of oppQueenSquares) {
		const q = parseSquareCoords(qSq);
		const df = target.file - q.file;
		const dr = target.rank - q.rank;
		if (df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr)) continue;
		const stepF = df === 0 ? 0 : df > 0 ? 1 : -1;
		const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
		let cf = q.file + stepF;
		let cr = q.rank + stepR;
		while (cf >= 0 && cf < 8 && cr >= 0 && cr < 8) {
			if (cf === target.file && cr === target.rank) return true;
			if (board[7 - cr][cf]) break;
			cf += stepF;
			cr += stepR;
		}
	}
	return false;
}

function computeBonusFromFacts(
	board: ReturnType<Chess['board']>,
	facts: BoardFacts,
	mv: Move | undefined,
	moveDeepCp: number,
	bestDeepCp: number,
	tier: KrisTierId
): number {
	if (!mv) return 0;
	const cfg = TIER_ENGINE_CONFIG[tier];
	const { turn, ply, ourQueenOnBoard, oppQueenOnBoard, oppQueenSquares, oppKingCoords } = facts;

	let bonus = 0;

	// 1. Heavy kingside castling preference (~82-86% in Sanakamoto-san's 1800+ games)
	if (mv.san === 'O-O') {
		bonus += ply <= 24 ? 38 : 28;
	} else if (mv.san === 'O-O-O') {
		bonus -= 14;
	}

	// 2. Early queen-trade aversion (Sanakamoto-san keeps queens on board until ~ply 40)
	if (ply < 36) {
		if (bestDeepCp >= 300) {
			if (mv.captured === 'q') bonus += 12;
		} else {
			if (mv.captured === 'q' && moveDeepCp < 220) {
				bonus -= 24;
			} else if (
				mv.piece === 'q' &&
				ourQueenOnBoard &&
				oppQueenOnBoard &&
				bestDeepCp < 150 &&
				isSquareLineAttackedByEnemyQueen(board, oppQueenSquares, mv.to)
			) {
				bonus -= 10;
			}
		}
	}

	// 3. Tactical initiative: proactive checks (~8% of moves in Sanakamoto-san's games)
	if (mv.san.includes('+') && bestDeepCp - moveDeepCp <= 60) {
		bonus += 12;
	}

	const fromCoords = parseSquareCoords(mv.from);
	const toCoords = parseSquareCoords(mv.to);
	const ourBackRank = turn === 'w' ? 0 : 7;

	// 4. Aggressive piece pressure advancing closer to opponent's King in middlegame
	if (
		ply >= 10 &&
		ply <= 50 &&
		oppKingCoords &&
		(mv.piece === 'n' || mv.piece === 'b' || mv.piece === 'r' || mv.piece === 'q')
	) {
		const distBefore = Math.max(
			Math.abs(fromCoords.file - oppKingCoords.file),
			Math.abs(fromCoords.rank - oppKingCoords.rank)
		);
		const distAfter = Math.max(
			Math.abs(toCoords.file - oppKingCoords.file),
			Math.abs(toCoords.rank - oppKingCoords.rank)
		);
		const inEnemyHalf = turn === 'w' ? toCoords.rank >= 3 : toCoords.rank <= 4;
		if (distAfter < distBefore && inEnemyHalf) {
			bonus += 7;
		}
	}

	// 5. Crisp minor-piece development out of the back rank early
	if (
		ply <= 18 &&
		(mv.piece === 'n' || mv.piece === 'b') &&
		fromCoords.rank === ourBackRank &&
		toCoords.rank !== ourBackRank
	) {
		bonus += 10;
	}

	// 6. Central & flank pawn breaks creating middlegame tension
	if (
		mv.piece === 'p' &&
		ply >= 8 &&
		ply <= 44 &&
		['c', 'd', 'e', 'f', 'g', 'h'].includes(mv.from[0] ?? '')
	) {
		const reachesTensionRank = turn === 'w' ? toCoords.rank >= 3 : toCoords.rank <= 4;
		if (reachesTensionRank && (Boolean(mv.captured) || bestDeepCp - moveDeepCp <= 25)) {
			bonus += 6;
		}
	}

	// 7. Anti-passive shuffle penalty when retreating developed pieces to back rank needlessly
	if (
		(mv.piece === 'n' || mv.piece === 'b' || mv.piece === 'r') &&
		toCoords.rank === ourBackRank &&
		fromCoords.rank !== ourBackRank &&
		!mv.captured &&
		!mv.san.includes('+') &&
		bestDeepCp - moveDeepCp > 10
	) {
		bonus -= 10;
	}

	const scaled = Math.round(bonus * cfg.styleScale);
	return Math.max(-34, Math.min(42, scaled));
}

/**
 * Computes a small bounded centipawn preference (`[-28, +32] cp`) aligned with
 * `Sanakamoto-san`'s empirical middlegame/endgame tendencies so moves feel authentic
 * without distorting tier Elo calibration.
 */
export function computeSanakamotoStyleBonusCp(
	game: Chess,
	uci: string,
	moveDeepCp: number,
	bestDeepCp: number,
	tier: KrisTierId
): number {
	const verboseMoves = game.moves({ verbose: true });
	const mv = verboseMoves.find((m) => `${m.from}${m.to}${m.promotion ?? ''}` === uci);
	const fen = game.fen();
	const facts = extractBoardFacts(game, fen);
	return computeBonusFromFacts(game.board(), facts, mv, moveDeepCp, bestDeepCp, tier);
}

/**
 * Selects a move from Stockfish MultiPV search output at a fixed tier horizon using
 * `Sanakamoto-san` style bias and calibrated truncated-Gaussian human-perception noise (`1000` / `1500` / `1900`).
 */
export function selectSanakamotoMove({
	fen,
	rawCandidates,
	tier,
	ply: explicitPly,
	prevOpponentToSquare,
}: SelectMoveParams): SelectedMoveResult | null {
	if (rawCandidates.length === 0) return null;

	const cfg = TIER_ENGINE_CONFIG[tier];

	const game = new Chess(fen);
	const facts = extractBoardFacts(game, fen, explicitPly);
	const isSimpleEndgame = facts.nonPawnPieces <= 6;

	// Choose highest available depth <= cfg.searchDepth (fallback to max depth if all exceed)
	let effectiveDepth = 0;
	let maxAvailableDepth = 0;
	for (const c of rawCandidates) {
		if (c.depth > maxAvailableDepth) maxAvailableDepth = c.depth;
		if (c.depth <= cfg.searchDepth && c.depth > effectiveDepth) {
			effectiveDepth = c.depth;
		}
	}
	if (effectiveDepth === 0) effectiveDepth = maxAvailableDepth;

	// Keep the latest resolved MultiPV pass per move at the target depth
	const byMove = new Map<string, RawMultiPvCandidate>();
	for (const c of rawCandidates) {
		if (c.depth === effectiveDepth) {
			byMove.set(c.move, c);
		}
	}

	if (byMove.size === 0) {
		const distByMove = new Map<string, { cand: RawMultiPvCandidate; dist: number }>();
		for (const c of rawCandidates) {
			const nextDist = Math.abs(c.depth - effectiveDepth);
			const prev = distByMove.get(c.move);
			if (!prev || nextDist <= prev.dist) {
				distByMove.set(c.move, { cand: c, dist: nextDist });
			}
		}
		for (const entry of distByMove.values()) {
			byMove.set(entry.cand.move, entry.cand);
		}
	}

	const sorted = [...byMove.values()].sort((a, b) => b.cp - a.cp);
	if (sorted.length === 0) return null;
	if (sorted.length === 1) {
		return { move: sorted[0].move, evalSpreadCp: 0, isOnlyMove: true };
	}

	const evalSpreadCp = Math.max(0, sorted[0].cp - sorted[1].cp);

	if (sorted[0].isMateInOne) {
		if (Math.random() < cfg.mateInOneSpotProb) {
			return { move: sorted[0].move, evalSpreadCp, isOnlyMove: false };
		}
		const nonMate = sorted.filter((c) => !c.isMateInOne);
		if (nonMate.length > 0) {
			return { move: nonMate[0].move, evalSpreadCp, isOnlyMove: false };
		}
	}

	const verboseMoves = game.moves({ verbose: true });
	const verboseByUci = new Map<string, Move>();
	for (const mv of verboseMoves) {
		verboseByUci.set(`${mv.from}${mv.to}${mv.promotion ?? ''}`, mv);
	}

	const topMoveVerbose = verboseByUci.get(sorted[0].move);
	if (
		prevOpponentToSquare &&
		topMoveVerbose &&
		topMoveVerbose.to === prevOpponentToSquare &&
		Boolean(topMoveVerbose.captured) &&
		evalSpreadCp >= 120 &&
		Math.random() < cfg.obviousRecaptureSpotProb
	) {
		return { move: sorted[0].move, evalSpreadCp, isOnlyMove: false };
	}

	const board = game.board();
	const bestCp = sorted[0].cp;
	const bestUtil = cpToHumanUtility(bestCp);

	// Always retain at least minPoolSize candidates so sharp positions do not lock to 100% #1
	const filteredPool = sorted.filter(
		(c, idx) => idx < cfg.minPoolSize || bestUtil - cpToHumanUtility(c.cp) <= cfg.maxUtilDrop
	);
	const activePool =
		filteredPool.length > 0 ? filteredPool : sorted.slice(0, cfg.minPoolSize);

	const sharpness = Math.min(1, evalSpreadCp / 300);
	const kScale = Math.max(
		0.85,
		Math.min(1.18, Math.sqrt(Math.log(12) / Math.log(Math.max(3, activePool.length))))
	);
	const endgameScale = isSimpleEndgame ? cfg.endgameNoiseScale : 1.0;
	const sigma = cfg.noiseSigma * (1 + cfg.sharpNoiseBoost * sharpness) * kScale * endgameScale;

	let bestNoisyUtility = -Infinity;
	let chosenMove = activePool[0].move;

	for (const c of activePool) {
		const rawLossCp = Math.max(0, bestCp - c.cp);
		const styleBonus =
			rawLossCp <= 160
				? computeBonusFromFacts(
						board,
						facts,
						verboseByUci.get(c.move),
						c.cp,
						bestCp,
						tier
					)
				: 0;
		const noisyUtility =
			cpToHumanUtility(c.cp + styleBonus) + sampleTruncatedNormal(3.2) * sigma;
		if (noisyUtility > bestNoisyUtility) {
			bestNoisyUtility = noisyUtility;
			chosenMove = c.move;
		}
	}

	return {
		move: chosenMove,
		evalSpreadCp,
		isOnlyMove: false,
	};
}

function randomBetween(min: number, max: number): number {
	return min + Math.random() * Math.max(0, max - min);
}

/**
 * Computes pleasant, natural `15+0 Rapid` thinking latency modeled after
 * `Sanakamoto-san`'s Open < Endgame < Middlegame rhythm, scaled down under clock pressure
 * and completely decoupled from Stockfish search duration.
 */
export function computeHumanThinkMs(ctx: HumanThinkContext): number {
	const {
		tier,
		fromBook,
		ply,
		legalMoveCount,
		isRecapture,
		isInCheck,
		evalSpreadCp,
		isOnlyMove,
		krisClockMs,
	} = ctx;

	if (ply === 0) {
		return Math.round(randomBetween(650, 1050));
	}

	if (isOnlyMove || legalMoveCount <= 1) {
		return Math.round(randomBetween(550, 950));
	}

	if (fromBook) {
		const ms = ply <= 3 ? randomBetween(650, 1250) : randomBetween(900, 1800);
		return Math.round(ms);
	}

	if (isRecapture && !isInCheck && evalSpreadCp > 120) {
		return Math.round(randomBetween(850, 1600));
	}

	const isOpening = ply <= 16;
	const isEndgame = ply >= 52;

	let baseMs: number;
	if (tier === '1000') {
		if (isOpening) baseMs = randomBetween(1100, 2100);
		else if (isEndgame) baseMs = randomBetween(1000, 2200);
		else baseMs = Math.random() < 0.15 ? randomBetween(3100, 4000) : randomBetween(1400, 3100);
	} else if (tier === '1500') {
		if (isOpening) baseMs = randomBetween(1300, 2400);
		else if (isEndgame) baseMs = randomBetween(1300, 2800);
		else baseMs = Math.random() < 0.18 ? randomBetween(3800, 4900) : randomBetween(1800, 3800);
	} else {
		if (isOpening) baseMs = randomBetween(1400, 2600);
		else if (isEndgame) baseMs = randomBetween(1500, 3200);
		else baseMs = Math.random() < 0.2 ? randomBetween(4400, 5800) : randomBetween(2100, 4400);
	}

	if (isInCheck || evalSpreadCp < 25) {
		baseMs *= randomBetween(1.15, 1.25);
	} else if (evalSpreadCp > 250) {
		baseMs *= 0.9;
	}

	if (krisClockMs < 120_000) {
		const ratio = Math.max(0, Math.min(1, krisClockMs / 120_000));
		const scale = 0.35 + 0.65 * ratio;
		baseMs = Math.max(500, baseMs * scale);
	}

	return Math.round(baseMs);
}
