import type { Chess } from 'chess.js';

/**
 * Curated mainline opening book (UCI moves) keyed by normalized 4-field FEN
 * (`board turn castling ep`) so Kristianto (calibrated to ~1900 Chess.com Rapid)
 * opens with principled theory rather than quirky side-lines on moves 1–5.
 */
const OPENING_BOOK: Record<string, readonly string[]> = {
	// Move 1 (White)
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
		'e2e4',
		'e2e4',
		'd2d4',
		'd2d4',
		'c2c4',
		'g1f3',
	],

	// Replies to 1. e4
	'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': [
		'c7c5',
		'c7c5',
		'e7e5',
		'e7e5',
		'c7c6',
		'e7e6',
	],
	// Replies to 1. d4
	'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': [
		'g8f6',
		'g8f6',
		'd7d5',
		'd7d5',
		'e7e6',
	],
	// Replies to 1. c4
	'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': ['e7e5', 'c7c5', 'g8f6', 'e7e6'],
	// Replies to 1. Nf3
	'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': ['d7d5', 'g8f6', 'c7c5'],

	// 1. e4 e5 -> 2. Nf3
	'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3', 'g1f3', 'f1c4'],
	// 1. e4 e5 2. Nf3 -> 2...Nc6 / 2...Nf6
	'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['b8c6', 'b8c6', 'g8f6'],
	// 1. e4 e5 2. Nf3 Nc6 -> Ruy Lopez / Italian / Scotch
	'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['f1b5', 'f1c4', 'd2d4'],
	// 1. e4 e5 2. Nf3 Nc6 3. Bb5 -> Morphy Defense / Berlin
	'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['a7a6', 'g8f6'],
	'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['b5a4'],
	'r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['g8f6'],
	'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['e1g1'],
	// 1. e4 e5 2. Nf3 Nc6 3. Bc4 -> Giuoco Piano / Two Knights
	'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['f8c5', 'g8f6'],
	'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['c2c3', 'd2d3', 'e1g1'],
	'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -': ['d2d3', 'b1c3', 'e1g1'],

	// 1. e4 c5 -> Open Sicilian / Alapin
	'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3', 'g1f3', 'c2c3'],
	'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['d7d6', 'b8c6', 'e7e6'],
	'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4'],
	'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4', 'f1b5'],
	'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4'],
	'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -': ['f3d4'],
	'rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -': ['g8f6'],
	'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -': ['b1c3'],
	'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -': ['a7a6', 'e7e6', 'g7g6'],

	// 1. e4 c6 (Caro-Kann) & 1. e4 e6 (French)
	'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],
	'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -': ['d7d5'],
	'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['b1c3', 'e4e5', 'e4d5'],
	'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],
	'rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -': ['d7d5'],
	'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['b1c3', 'b1d2', 'e4e5'],

	// 1. d4 d5 -> Queen's Gambit
	'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c2c4', 'c2c4', 'g1f3'],
	'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -': ['e7e6', 'c7c6', 'd5c4'],
	'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['b1c3', 'g1f3'],
	'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['g1f3', 'b1c3'],
	'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['e2e4', 'g1f3', 'e2e3'],

	// 1. d4 Nf6 -> 2. c4
	'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': ['c2c4', 'g1f3'],
	'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -': ['e7e6', 'g7g6', 'c7c5'],
	'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['b1c3', 'g1f3'],
	'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -': ['b1c3', 'g1f3'],
};

function normalizeBookKey(fen: string): string {
	return fen.split(' ').slice(0, 4).join(' ');
}

/**
 * Picks a legal mainline book move (UCI string) for the current position if available
 * within the active opponent tier's opening knowledge depth (`maxBookPly`).
 */
export function pickBookMove(chess: Chess, maxBookPly = 10): string | null {
	if (chess.history().length >= maxBookPly) return null;
	const key = normalizeBookKey(chess.fen());
	const candidates = OPENING_BOOK[key];
	if (!candidates || candidates.length === 0) return null;

	const legalUcis = new Set(
		chess.moves({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion ?? ''}`)
	);
	const valid = candidates.filter((uci) => legalUcis.has(uci));
	if (valid.length === 0) return null;

	return valid[Math.floor(Math.random() * valid.length)] ?? null;
}
