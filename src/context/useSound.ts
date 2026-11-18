import { createContext, useContext } from 'react';

export type SoundPresetId =
	| 'keycap'
	| 'bubble'
	| 'paper'
	| 'switch'
	| 'bell'
	| 'cassette'
	| 'chime'
	| 'twang'
	| 'coin'
	| 'vhsGlitch'
	| 'chessMove'
	| 'chessCapture'
	| 'chessCastle'
	| 'chessCheck'
	| 'chessWin'
	| 'chessLose'
	| 'chessDraw';

export type BgmLevel = 'full' | 'low' | 'off';

export type MemePadId =
	| 'faah'
	| 'oof'
	| 'wow'
	| 'bruh'
	| 'omg'
	| 'yay'
	| 'okay'
	| 'god';

export type ChessPieceCode = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type ChessPromotionCode = 'n' | 'b' | 'r' | 'q';
export type ChessTerminalKind = 'win' | 'lose' | 'draw' | null;

export interface ChessMoveAudioSpec {
	piece: ChessPieceCode;
	isCapture?: boolean;
	isEnPassant?: boolean;
	castleSide?: 'k' | 'q' | null;
	promotion?: ChessPromotionCode | null;
	isCheck?: boolean;
	terminal?: ChessTerminalKind;
}

export interface SoundContextValue {
	soundEnabled: boolean;
	setSoundEnabled: (enabled: boolean) => void;
	toggleSound: () => void;
	bgmLevel: BgmLevel;
	setBgmLevel: (level: BgmLevel) => void;
	bgmEnabled: boolean;
	setBgmEnabled: (enabled: boolean) => void;
	toggleBgm: () => void;
	setBgmDuckForVideo: (ducked: boolean) => void;
	setBgmFocusAttenuated: (attenuated: boolean) => void;
	playHover: () => void;
	playClick: () => void;
	playPluck: (freq: number, fromPointerDown?: boolean, strandIndex?: number) => void;
	playPreset: (presetId: SoundPresetId, volumeScale?: number) => void;
	playChessMove: (spec: ChessMoveAudioSpec) => void;
	playMeme: (memeId: MemePadId) => void;
	preloadMemes: () => void;
	playCountdownCue: (isGo?: boolean) => void;
}

export const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function useSound() {
	const ctx = useContext(SoundContext);
	if (!ctx) {
		throw new Error('useSound must be used within a SoundProvider');
	}
	return ctx;
}
