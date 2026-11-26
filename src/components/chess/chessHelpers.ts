import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';

export type ArrowColorKey = 'amber' | 'green' | 'blue' | 'red';

export interface BoardArrow {
	from: Square;
	to: Square;
	color: ArrowColorKey;
}

export interface SquareHighlight {
	square: Square;
	color: ArrowColorKey;
}

export interface TimelineFrame {
	fen: string;
	lastMove: { from: Square; to: Square } | null;
	inCheckSquare: Square | null;
}

export interface QueuedPremove {
	from: Square;
	to: Square;
}

export type GameResult =
	| { kind: 'checkmate'; winner: Color }
	| { kind: 'timeout'; winner: Color }
	| { kind: 'resign'; winner: Color }
	| {
			kind: 'draw';
			reason: 'stalemate' | 'threefold' | 'insufficient' | 'fifty-move';
	  };

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

export const PIECE_VALUES: Record<PieceSymbol, number> = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
};

export const CAPTURE_SORT_ORDER: Record<PieceSymbol, number> = {
	q: 0,
	r: 1,
	b: 2,
	n: 3,
	p: 4,
	k: 5,
};

export const ARROW_COLOR_HEX: Record<
	ArrowColorKey,
	{ fill: string; stroke: string; highlight: string }
> = {
	amber: {
		fill: 'rgba(245, 158, 11, 0.86)',
		stroke: 'rgba(245, 158, 11, 0.86)',
		highlight: 'rgba(245, 158, 11, 0.48)',
	},
	green: {
		fill: 'rgba(92, 230, 46, 0.85)',
		stroke: 'rgba(92, 230, 46, 0.85)',
		highlight: 'rgba(92, 230, 46, 0.44)',
	},
	blue: {
		fill: 'rgba(77, 157, 224, 0.86)',
		stroke: 'rgba(77, 157, 224, 0.86)',
		highlight: 'rgba(77, 157, 224, 0.45)',
	},
	red: {
		fill: 'rgba(253, 97, 65, 0.88)',
		stroke: 'rgba(253, 97, 65, 0.88)',
		highlight: 'rgba(253, 97, 65, 0.46)',
	},
};

export function pickRandomColor(): Color {
	if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
		const buf = new Uint32Array(1);
		crypto.getRandomValues(buf);
		return buf[0] % 2 === 0 ? 'w' : 'b';
	}
	return Math.random() < 0.5 ? 'w' : 'b';
}

export function formatClock(ms: number): string {
	const clamped = Math.max(0, ms);
	if (clamped > 0 && clamped < 10_000) {
		const totalTenths = Math.ceil(clamped / 100);
		const secs = Math.floor(totalTenths / 10);
		const tenths = totalTenths % 10;
		return `00:${String(secs).padStart(2, '0')}.${tenths}`;
	}
	const totalSeconds = Math.ceil(clamped / 1000);
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function squareFromCoords(rowIdx: number, colIdx: number, orientation: Color): Square {
	const file = orientation === 'w' ? FILES[colIdx] : FILES[7 - colIdx];
	const rank = orientation === 'w' ? 8 - rowIdx : 1 + rowIdx;
	return `${file}${rank}` as Square;
}

export function findCheckedKingSquare(chess: Chess): Square | null {
	if (!chess.inCheck()) return null;
	const turn = chess.turn();
	const board = chess.board();
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const cell = board[r][c];
			if (cell && cell.type === 'k' && cell.color === turn) {
				return cell.square;
			}
		}
	}
	return null;
}

export function buildTimelineFrame(
	chess: Chess,
	lastMove: { from: Square; to: Square } | null
): TimelineFrame {
	return {
		fen: chess.fen(),
		lastMove,
		inCheckSquare: findCheckedKingSquare(chess),
	};
}

export function getGameResultFromPosition(chess: Chess): GameResult | null {
	if (chess.isCheckmate()) {
		const winner: Color = chess.turn() === 'w' ? 'b' : 'w';
		return { kind: 'checkmate', winner };
	}
	if (chess.isStalemate()) {
		return { kind: 'draw', reason: 'stalemate' };
	}
	if (chess.isThreefoldRepetition()) {
		return { kind: 'draw', reason: 'threefold' };
	}
	if (chess.isInsufficientMaterial()) {
		return { kind: 'draw', reason: 'insufficient' };
	}
	if (chess.isDrawByFiftyMoves() || chess.isDraw()) {
		return { kind: 'draw', reason: 'fifty-move' };
	}
	return null;
}

export function parseUciMove(
	uci: string
): { from: Square; to: Square; promotion?: PieceSymbol } | null {
	if (uci.length < 4) return null;
	const from = uci.slice(0, 2) as Square;
	const to = uci.slice(2, 4) as Square;
	const promoChar = uci.length >= 5 ? (uci[4] as PieceSymbol) : undefined;
	return promoChar ? { from, to, promotion: promoChar } : { from, to };
}

export function arrowColorFromModifiers(e: {
	shiftKey?: boolean;
	altKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
}): ArrowColorKey {
	if (e.ctrlKey || e.metaKey) return 'red';
	if (e.shiftKey) return 'green';
	if (e.altKey) return 'blue';
	return 'amber';
}

export function squareCenterInViewBox(
	sq: Square,
	orientation: Color
): { x: number; y: number } {
	const fileIdx = FILES.indexOf(sq[0] as (typeof FILES)[number]);
	const rankNum = Number.parseInt(sq[1], 10);
	const col = orientation === 'w' ? fileIdx : 7 - fileIdx;
	const row = orientation === 'w' ? 8 - rankNum : rankNum - 1;
	return { x: col * 100 + 50, y: row * 100 + 50 };
}

export interface ArrowSvgGeometry {
	pathD: string;
	headPoints: string;
}

/**
 * Generates Chess.com-style vector arrow SVG geometry inside a fixed 800x800 board viewBox
 * (clean 90-degree L-bend for knight jumps, crisp trimmed shaft + arrowhead for straight lines).
 */
export function buildArrowSvgGeometry(
	from: Square,
	to: Square,
	orientation: Color
): ArrowSvgGeometry | null {
	if (from === to) return null;
	const p1 = squareCenterInViewBox(from, orientation);
	const p2 = squareCenterInViewBox(to, orientation);
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	const stepsX = Math.abs(Math.round(dx / 100));
	const stepsY = Math.abs(Math.round(dy / 100));
	const isKnight = (stepsX === 1 && stepsY === 2) || (stepsX === 2 && stepsY === 1);

	const startTrim = 20;
	const tipTrim = 10;
	const headLength = 26;
	const headHalfWidth = 21;

	let sx = p1.x;
	let sy = p1.y;
	let ux = 0;
	let uy = 0;

	if (isKnight) {
		const elbowX = stepsY === 2 ? p1.x : p2.x;
		const elbowY = stepsY === 2 ? p2.y : p1.y;

		const d1x = elbowX - p1.x;
		const d1y = elbowY - p1.y;
		const len1 = Math.hypot(d1x, d1y) || 1;
		sx = p1.x + (d1x / len1) * startTrim;
		sy = p1.y + (d1y / len1) * startTrim;

		const d2x = p2.x - elbowX;
		const d2y = p2.y - elbowY;
		const len2 = Math.hypot(d2x, d2y) || 1;
		ux = d2x / len2;
		uy = d2y / len2;

		const tipX = p2.x - ux * tipTrim;
		const tipY = p2.y - uy * tipTrim;
		const lineEndX = tipX - ux * headLength;
		const lineEndY = tipY - uy * headLength;
		const px = -uy;
		const py = ux;

		return {
			pathD: `M ${sx} ${sy} L ${elbowX} ${elbowY} L ${lineEndX} ${lineEndY}`,
			headPoints: `${tipX},${tipY} ${lineEndX + px * headHalfWidth},${lineEndY + py * headHalfWidth} ${lineEndX - px * headHalfWidth},${lineEndY - py * headHalfWidth}`,
		};
	}

	const len = Math.hypot(dx, dy);
	if (len <= 1) return null;
	ux = dx / len;
	uy = dy / len;
	const legX = p1.x + ux * startTrim;
	const legY = p1.y + uy * startTrim;

	const tipX = p2.x - ux * tipTrim;
	const tipY = p2.y - uy * tipTrim;
	const lineEndX = tipX - ux * headLength;
	const lineEndY = tipY - uy * headLength;
	const px = -uy;
	const py = ux;

	return {
		pathD: `M ${legX} ${legY} L ${lineEndX} ${lineEndY}`,
		headPoints: `${tipX},${tipY} ${lineEndX + px * headHalfWidth},${lineEndY + py * headHalfWidth} ${lineEndX - px * headHalfWidth},${lineEndY - py * headHalfWidth}`,
	};
}

export function buildCapturedSummary(movesSlice: Move[], activeBoard: ReturnType<Chess['board']>) {
	const capturedByWhite: PieceSymbol[] = [];
	const capturedByBlack: PieceSymbol[] = [];
	for (const mv of movesSlice) {
		if (mv.isCapture() && mv.captured) {
			if (mv.color === 'w') capturedByWhite.push(mv.captured);
			else capturedByBlack.push(mv.captured);
		}
	}
	capturedByWhite.sort((a, b) => CAPTURE_SORT_ORDER[a] - CAPTURE_SORT_ORDER[b]);
	capturedByBlack.sort((a, b) => CAPTURE_SORT_ORDER[a] - CAPTURE_SORT_ORDER[b]);

	let whiteScore = 0;
	let blackScore = 0;
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			const cell = activeBoard[r][c];
			if (!cell) continue;
			if (cell.color === 'w') whiteScore += PIECE_VALUES[cell.type];
			else blackScore += PIECE_VALUES[cell.type];
		}
	}

	return {
		capturedByWhite,
		capturedByBlack,
		materialDiff: whiteScore - blackScore,
	};
}

/**
 * Computes Lichess-style pseudo-legal premove destination squares for `from`:
 * ignores blocking pieces, allows targeting own or enemy squares for instant recaptures,
 * includes diagonal pawn premoves and 2-square pawn advances from the starting rank,
 * and includes castling destinations (plus king-onto-rook squares) when castling rights remain.
 */
export function getLichessPremoveTargets(
	chess: Chess,
	from: Square,
	playerColor: Color
): Set<Square> {
	const targets = new Set<Square>();
	const piece = chess.get(from);
	if (!piece || piece.color !== playerColor) return targets;

	const fileIdx = FILES.indexOf(from[0] as (typeof FILES)[number]);
	const rankIdx = Number.parseInt(from[1], 10) - 1;
	if (fileIdx < 0 || rankIdx < 0 || rankIdx > 7) return targets;

	const addIfValid = (f: number, r: number) => {
		if (f < 0 || f > 7 || r < 0 || r > 7) return;
		if (f === fileIdx && r === rankIdx) return;
		targets.add(`${FILES[f]}${r + 1}` as Square);
	};

	switch (piece.type) {
		case 'p': {
			const dir = playerColor === 'w' ? 1 : -1;
			const startRank = playerColor === 'w' ? 1 : 6;
			addIfValid(fileIdx, rankIdx + dir);
			if (rankIdx === startRank) {
				addIfValid(fileIdx, rankIdx + 2 * dir);
			}
			addIfValid(fileIdx - 1, rankIdx + dir);
			addIfValid(fileIdx + 1, rankIdx + dir);
			break;
		}
		case 'n': {
			for (const df of [-2, -1, 1, 2]) {
				for (const dr of [-2, -1, 1, 2]) {
					if (Math.abs(df) + Math.abs(dr) === 3) {
						addIfValid(fileIdx + df, rankIdx + dr);
					}
				}
			}
			break;
		}
		case 'b': {
			for (let r = 0; r < 8; r += 1) {
				for (let f = 0; f < 8; f += 1) {
					if (Math.abs(f - fileIdx) === Math.abs(r - rankIdx)) {
						addIfValid(f, r);
					}
				}
			}
			break;
		}
		case 'r': {
			for (let r = 0; r < 8; r += 1) {
				for (let f = 0; f < 8; f += 1) {
					if (f === fileIdx || r === rankIdx) {
						addIfValid(f, r);
					}
				}
			}
			break;
		}
		case 'q': {
			for (let r = 0; r < 8; r += 1) {
				for (let f = 0; f < 8; f += 1) {
					if (
						f === fileIdx ||
						r === rankIdx ||
						Math.abs(f - fileIdx) === Math.abs(r - rankIdx)
					) {
						addIfValid(f, r);
					}
				}
			}
			break;
		}
		case 'k': {
			for (let df = -1; df <= 1; df += 1) {
				for (let dr = -1; dr <= 1; dr += 1) {
					addIfValid(fileIdx + df, rankIdx + dr);
				}
			}
			const homeSquare = playerColor === 'w' ? 'e1' : 'e8';
			if (from === homeSquare) {
				const rights = chess.getCastlingRights(playerColor);
				const backRank = playerColor === 'w' ? '1' : '8';
				if (rights.k) {
					targets.add(`g${backRank}` as Square);
					targets.add(`h${backRank}` as Square);
				}
				if (rights.q) {
					targets.add(`c${backRank}` as Square);
					targets.add(`a${backRank}` as Square);
				}
			}
			break;
		}
	}

	return targets;
}

/**
 * Validates whether `from -> to` is a legal Lichess premove and normalizes
 * king-onto-rook castling drops (`e1 -> h1` -> `g1`, `e1 -> a1` -> `c1`, etc.).
 */
export function normalizePremoveTarget(
	chess: Chess,
	from: Square,
	to: Square,
	playerColor: Color
): Square | null {
	const targets = getLichessPremoveTargets(chess, from, playerColor);
	if (!targets.has(to)) return null;

	const piece = chess.get(from);
	if (piece?.type === 'k') {
		const homeSquare = playerColor === 'w' ? 'e1' : 'e8';
		if (from === homeSquare) {
			const rights = chess.getCastlingRights(playerColor);
			const backRank = playerColor === 'w' ? '1' : '8';
			if (rights.k && to === (`h${backRank}` as Square)) {
				return `g${backRank}` as Square;
			}
			if (rights.q && to === (`a${backRank}` as Square)) {
				return `c${backRank}` as Square;
			}
		}
	}

	return to;
}
