import type { Chess } from 'chess.js';
import type { KrisTierId } from './chessProfiles';
import {
	SANAKAMOTO_BOOKS,
	SANAKAMOTO_FALLBACK_BOOK,
	type WeightedBookMove,
} from './sanakamotoBookData';

function normalizeBookKey(fen: string): string {
	return fen.split(' ').slice(0, 4).join(' ');
}

function sampleWeightedMove(candidates: readonly WeightedBookMove[]): string | null {
	let total = 0;
	for (const [, weight] of candidates) {
		total += weight;
	}
	if (total <= 0) return candidates[0]?.[0] ?? null;

	let roll = Math.random() * total;
	for (const [uci, weight] of candidates) {
		roll -= weight;
		if (roll <= 0) return uci;
	}
	return candidates[candidates.length - 1]?.[0] ?? null;
}

/**
 * Picks a legal weighted opening move (UCI string) from Kristianto's real Chess.com
 * (`Sanakamoto-san`) repertoire for the active opponent tier within `maxBookPly`.
 */
export function pickBookMove(
	chess: Chess,
	tier: KrisTierId,
	maxBookPly = 10
): string | null {
	if (chess.history().length >= maxBookPly) return null;
	const key = normalizeBookKey(chess.fen());
	const rawCandidates = SANAKAMOTO_BOOKS[tier]?.[key] ?? SANAKAMOTO_FALLBACK_BOOK[key];
	if (!rawCandidates || rawCandidates.length === 0) return null;

	const legalUcis = new Set(
		chess.moves({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion ?? ''}`)
	);
	const valid = rawCandidates.filter(([uci]) => legalUcis.has(uci));
	if (valid.length === 0) return null;

	return sampleWeightedMove(valid);
}
