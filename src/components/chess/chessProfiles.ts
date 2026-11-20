import type { LocalizedText } from '../../context/useLanguage';

export type KrisTierId = '1000' | '1500' | '1900';

export interface KrisProfile {
	id: KrisTierId;
	elo: number;
	name: LocalizedText;
	pillLabel: LocalizedText;
	tagline: LocalizedText;
	accentHex: string;
	openingBookMaxPly: number;
	thinkRangeMs: readonly [number, number];
}

export const DEFAULT_KRIS_TIER: KrisTierId = '1900';

export const KRIS_PROFILES: Record<KrisTierId, KrisProfile> = {
	'1000': {
		id: '1000',
		elo: 1000,
		name: { en: "Lil' Kris", id: 'Bocil Kris' },
		pillLabel: { en: "Lil' Kris", id: 'Bocil Kris' },
		tagline: {
			en: 'Chaos Kid · 15+0 Rapid',
			id: 'Mode Bocil · 15+0 Rapid',
		},
		accentHex: '#5CE62E',
		openingBookMaxPly: 4,
		thinkRangeMs: [1100, 3100],
	},
	'1500': {
		id: '1500',
		elo: 1500,
		name: { en: 'Teen Kris', id: 'ABG Kris' },
		pillLabel: { en: 'Teen Kris', id: 'ABG Kris' },
		tagline: {
			en: 'Sharp Grind · 15+0 Rapid',
			id: 'Mode ABG · 15+0 Rapid',
		},
		accentHex: '#94C9F2',
		openingBookMaxPly: 7,
		thinkRangeMs: [1300, 3800],
	},
	'1900': {
		id: '1900',
		elo: 1900,
		name: { en: 'Unc Kris', id: 'Om Kris' },
		pillLabel: { en: 'Unc Kris', id: 'Om Kris' },
		tagline: {
			en: 'Prime Veteran · 15+0 Rapid',
			id: 'Mode Senior · 15+0 Rapid',
		},
		accentHex: '#FFD426',
		openingBookMaxPly: 10,
		thinkRangeMs: [1400, 4400],
	},
};

export const KRIS_TIER_ORDER: readonly KrisTierId[] = ['1900', '1500', '1000'];
