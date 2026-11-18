import type { ChessOutcomeSoundId, ChessPieceCode, SoundPresetId } from './useSound';

export interface ToneOpts {
	at: number;
	freq: number;
	endFreq?: number;
	dur: number;
	gain: number;
	wave?: OscillatorType;
	lpFreq?: number;
	attack?: number;
}

export interface NoiseOpts {
	at: number;
	centerFreq: number;
	q?: number;
	dur: number;
	gain: number;
	attack?: number;
}

export function emitTone(ctx: AudioContext, out: AudioNode, opts: ToneOpts): void {
	const {
		at,
		freq,
		endFreq,
		dur,
		gain: peakGain,
		wave = 'triangle',
		lpFreq = 2600,
		attack = 0.006,
	} = opts;

	const osc = ctx.createOscillator();
	const filter = ctx.createBiquadFilter();
	const amp = ctx.createGain();

	osc.type = wave;
	osc.frequency.setValueAtTime(freq, at);
	if (endFreq && endFreq > 0) {
		osc.frequency.exponentialRampToValueAtTime(endFreq, at + Math.max(0.012, dur * 0.85));
	}

	filter.type = 'lowpass';
	filter.frequency.setValueAtTime(lpFreq, at);
	filter.Q.setValueAtTime(0.65, at);

	const safeAttack = Math.min(attack, dur * 0.35);
	amp.gain.setValueAtTime(0.0008, at);
	amp.gain.linearRampToValueAtTime(peakGain, at + safeAttack);
	amp.gain.exponentialRampToValueAtTime(0.0005, at + dur);

	osc.connect(filter);
	filter.connect(amp);
	amp.connect(out);
	osc.start(at);
	osc.stop(at + dur + 0.018);
}

export function emitNoise(
	ctx: AudioContext,
	out: AudioNode,
	noiseBuf: AudioBuffer,
	opts: NoiseOpts
): void {
	const { at, centerFreq, q = 1.4, dur, gain: peakGain, attack = 0.003 } = opts;
	const src = ctx.createBufferSource();
	src.buffer = noiseBuf;

	const bp = ctx.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.setValueAtTime(centerFreq, at);
	bp.Q.setValueAtTime(q, at);

	const amp = ctx.createGain();
	const safeAttack = Math.min(attack, dur * 0.3);
	amp.gain.setValueAtTime(0.0008, at);
	amp.gain.linearRampToValueAtTime(peakGain, at + safeAttack);
	amp.gain.exponentialRampToValueAtTime(0.0005, at + dur);

	src.connect(bp);
	bp.connect(amp);
	amp.connect(out);
	src.start(at);
	src.stop(at + dur + 0.014);
}

/**
 * Distinct gentle wood-and-felt hover micro-cues per chess piece type.
 * Empty squares never call this function.
 */
export function emitChessPieceHover(
	ctx: AudioContext,
	out: AudioNode,
	noiseBuf: AudioBuffer,
	at: number,
	piece: ChessPieceCode
): void {
	switch (piece) {
		case 'p':
			emitTone(ctx, out, {
				at,
				freq: 520,
				endFreq: 345,
				dur: 0.048,
				gain: 0.022,
				wave: 'sine',
				lpFreq: 1850,
			});
			emitNoise(ctx, out, noiseBuf, { at, centerFreq: 1750, q: 1.8, dur: 0.022, gain: 0.009 });
			break;
		case 'n':
			emitTone(ctx, out, {
				at,
				freq: 380,
				endFreq: 255,
				dur: 0.036,
				gain: 0.016,
				wave: 'triangle',
				lpFreq: 1500,
			});
			emitTone(ctx, out, {
				at: at + 0.044,
				freq: 470,
				endFreq: 315,
				dur: 0.046,
				gain: 0.02,
				wave: 'triangle',
				lpFreq: 1650,
			});
			break;
		case 'b':
			emitTone(ctx, out, {
				at,
				freq: 640,
				endFreq: 587.33,
				dur: 0.072,
				gain: 0.017,
				wave: 'sine',
				lpFreq: 2100,
			});
			emitTone(ctx, out, {
				at: at + 0.006,
				freq: 960,
				endFreq: 880,
				dur: 0.052,
				gain: 0.008,
				wave: 'sine',
				lpFreq: 2100,
			});
			break;
		case 'r':
			emitTone(ctx, out, {
				at,
				freq: 185,
				endFreq: 112,
				dur: 0.068,
				gain: 0.026,
				wave: 'triangle',
				lpFreq: 950,
			});
			emitNoise(ctx, out, noiseBuf, { at, centerFreq: 920, q: 1.4, dur: 0.028, gain: 0.01 });
			break;
		case 'q':
			emitTone(ctx, out, {
				at,
				freq: 440,
				dur: 0.088,
				gain: 0.015,
				wave: 'sine',
				lpFreq: 2200,
				attack: 0.009,
			});
			emitTone(ctx, out, {
				at: at + 0.012,
				freq: 659.25,
				dur: 0.095,
				gain: 0.012,
				wave: 'sine',
				lpFreq: 2400,
				attack: 0.01,
			});
			break;
		case 'k':
			emitTone(ctx, out, {
				at,
				freq: 155,
				endFreq: 96,
				dur: 0.078,
				gain: 0.026,
				wave: 'sine',
				lpFreq: 900,
				attack: 0.007,
			});
			emitTone(ctx, out, {
				at: at + 0.006,
				freq: 310,
				endFreq: 220,
				dur: 0.065,
				gain: 0.012,
				wave: 'triangle',
				lpFreq: 1200,
			});
			break;
	}
}

export type HoverKind =
	| 'nav'
	| 'keycap'
	| 'cassette'
	| 'switch'
	| 'paper'
	| 'shutter'
	| 'bell'
	| 'copy'
	| 'portal'
	| 'close'
	| 'chess-tab'
	| 'sfx-tab'
	| 'vhs-glitch'
	| 'default';

/**
 * Whisper-soft dwell hover timbre matched to each button role.
 */
export function emitButtonHoverVoice(
	ctx: AudioContext,
	out: AudioNode,
	noiseBuf: AudioBuffer,
	at: number,
	kind: HoverKind
): void {
	switch (kind) {
		case 'nav':
			emitTone(ctx, out, { at, freq: 465, endFreq: 530, dur: 0.042, gain: 0.014, wave: 'sine', lpFreq: 1450 });
			break;
		case 'keycap':
			emitTone(ctx, out, { at, freq: 225, endFreq: 165, dur: 0.046, gain: 0.017, wave: 'triangle', lpFreq: 1100 });
			break;
		case 'cassette':
			emitTone(ctx, out, { at, freq: 195, endFreq: 248, dur: 0.046, gain: 0.017, wave: 'triangle', lpFreq: 1050 });
			emitNoise(ctx, out, noiseBuf, { at, centerFreq: 1120, q: 1.5, dur: 0.02, gain: 0.007 });
			break;
		case 'switch':
			emitTone(ctx, out, { at, freq: 590, endFreq: 675, dur: 0.032, gain: 0.012, wave: 'sine', lpFreq: 1650 });
			break;
		case 'paper':
			emitTone(ctx, out, { at, freq: 365, endFreq: 310, dur: 0.038, gain: 0.014, wave: 'sine', lpFreq: 1350 });
			emitNoise(ctx, out, noiseBuf, { at, centerFreq: 1050, q: 1.1, dur: 0.024, gain: 0.007 });
			break;
		case 'shutter':
			emitTone(ctx, out, { at, freq: 520, endFreq: 380, dur: 0.034, gain: 0.013, wave: 'triangle', lpFreq: 1550 });
			break;
		case 'bell':
			emitTone(ctx, out, { at, freq: 740, dur: 0.06, gain: 0.01, wave: 'sine', lpFreq: 1900 });
			break;
		case 'copy':
			emitTone(ctx, out, { at, freq: 560, endFreq: 645, dur: 0.034, gain: 0.012, wave: 'sine', lpFreq: 1650 });
			break;
		case 'portal':
			emitTone(ctx, out, { at, freq: 520, endFreq: 650, dur: 0.048, gain: 0.012, wave: 'sine', lpFreq: 1750 });
			break;
		case 'close':
			emitTone(ctx, out, { at, freq: 325, endFreq: 235, dur: 0.04, gain: 0.012, wave: 'sine', lpFreq: 1150 });
			break;
		case 'chess-tab':
			emitChessPieceHover(ctx, out, noiseBuf, at, 'n');
			break;
		case 'sfx-tab':
			emitTone(ctx, out, { at, freq: 295, endFreq: 390, dur: 0.046, gain: 0.015, wave: 'triangle', lpFreq: 1350 });
			break;
		case 'vhs-glitch':
			emitTone(ctx, out, { at, freq: 210, endFreq: 185, dur: 0.056, gain: 0.015, wave: 'triangle', lpFreq: 980 });
			break;
		default:
			emitTone(ctx, out, { at, freq: 395, endFreq: 445, dur: 0.038, gain: 0.013, wave: 'sine', lpFreq: 1380 });
			break;
	}
}

interface SequenceNote {
	offset: number;
	freq: number;
	dur: number;
	gain: number;
	wave?: OscillatorType;
	lpFreq?: number;
}

const CHESS_OUTCOME_SCORE: Record<ChessOutcomeSoundId, readonly SequenceNote[]> = {
	// Grand celebratory fanfare: G4-C5-E5-G5 pickup into lush Cmaj9 chord + high bell sparkle
	win_checkmate: [
		{ offset: 0.0, freq: 392.0, dur: 0.11, gain: 0.075, wave: 'triangle', lpFreq: 2400 },
		{ offset: 0.075, freq: 523.25, dur: 0.11, gain: 0.08, wave: 'triangle', lpFreq: 2500 },
		{ offset: 0.15, freq: 659.25, dur: 0.11, gain: 0.085, wave: 'triangle', lpFreq: 2600 },
		{ offset: 0.225, freq: 783.99, dur: 0.12, gain: 0.09, wave: 'triangle', lpFreq: 2800 },
		{ offset: 0.31, freq: 130.81, dur: 0.72, gain: 0.085, wave: 'sine', lpFreq: 950 },
		{ offset: 0.31, freq: 523.25, dur: 0.66, gain: 0.058, wave: 'triangle', lpFreq: 2600 },
		{ offset: 0.31, freq: 659.25, dur: 0.68, gain: 0.054, wave: 'triangle', lpFreq: 2800 },
		{ offset: 0.31, freq: 783.99, dur: 0.72, gain: 0.052, wave: 'triangle', lpFreq: 2900 },
		{ offset: 0.33, freq: 1174.66, dur: 0.56, gain: 0.036, wave: 'sine', lpFreq: 3100 },
		{ offset: 0.44, freq: 1046.5, dur: 0.24, gain: 0.055, wave: 'sine', lpFreq: 3200 },
		{ offset: 0.53, freq: 1318.51, dur: 0.28, gain: 0.05, wave: 'sine', lpFreq: 3200 },
		{ offset: 0.62, freq: 1567.98, dur: 0.48, gain: 0.044, wave: 'sine', lpFreq: 3200 },
	],

	// Upbeat brisk clock-chime victory cadence: ticking pickup -> victorious chord chime
	win_timeout: [
		{ offset: 0.0, freq: 783.99, dur: 0.075, gain: 0.075, wave: 'sine', lpFreq: 2600 },
		{ offset: 0.08, freq: 783.99, dur: 0.075, gain: 0.075, wave: 'sine', lpFreq: 2600 },
		{ offset: 0.16, freq: 880.0, dur: 0.095, gain: 0.082, wave: 'triangle', lpFreq: 2700 },
		{ offset: 0.24, freq: 987.77, dur: 0.11, gain: 0.086, wave: 'triangle', lpFreq: 2800 },
		{ offset: 0.32, freq: 261.63, dur: 0.54, gain: 0.075, wave: 'sine', lpFreq: 1200 },
		{ offset: 0.32, freq: 523.25, dur: 0.52, gain: 0.055, wave: 'triangle', lpFreq: 2500 },
		{ offset: 0.32, freq: 659.25, dur: 0.54, gain: 0.052, wave: 'triangle', lpFreq: 2600 },
		{ offset: 0.32, freq: 1046.5, dur: 0.56, gain: 0.068, wave: 'triangle', lpFreq: 2900 },
		{ offset: 0.44, freq: 1318.51, dur: 0.32, gain: 0.046, wave: 'sine', lpFreq: 3100 },
	],

	// Dramatic solemn minor defeat cadence: E4 -> D4 -> C4 -> B3 -> A3 over warm A-minor resolve
	loss_checkmate: [
		{ offset: 0.0, freq: 329.63, dur: 0.18, gain: 0.082, wave: 'triangle', lpFreq: 1850 },
		{ offset: 0.15, freq: 293.66, dur: 0.18, gain: 0.08, wave: 'triangle', lpFreq: 1750 },
		{ offset: 0.3, freq: 261.63, dur: 0.19, gain: 0.078, wave: 'triangle', lpFreq: 1650 },
		{ offset: 0.45, freq: 246.94, dur: 0.2, gain: 0.075, wave: 'sine', lpFreq: 1550 },
		{ offset: 0.61, freq: 110.0, dur: 0.64, gain: 0.088, wave: 'sine', lpFreq: 850 },
		{ offset: 0.61, freq: 164.81, dur: 0.6, gain: 0.055, wave: 'sine', lpFreq: 1200 },
		{ offset: 0.61, freq: 220.0, dur: 0.62, gain: 0.072, wave: 'triangle', lpFreq: 1500 },
		{ offset: 0.61, freq: 261.63, dur: 0.58, gain: 0.042, wave: 'sine', lpFreq: 1600 },
	],

	// Descending hourglass/clock run-out motif
	loss_timeout: [
		{ offset: 0.0, freq: 659.25, dur: 0.095, gain: 0.07, wave: 'sine', lpFreq: 2200 },
		{ offset: 0.11, freq: 523.25, dur: 0.11, gain: 0.07, wave: 'sine', lpFreq: 2050 },
		{ offset: 0.225, freq: 440.0, dur: 0.13, gain: 0.072, wave: 'triangle', lpFreq: 1900 },
		{ offset: 0.36, freq: 349.23, dur: 0.17, gain: 0.074, wave: 'triangle', lpFreq: 1750 },
		{ offset: 0.52, freq: 146.83, dur: 0.52, gain: 0.078, wave: 'sine', lpFreq: 950 },
		{ offset: 0.52, freq: 220.0, dur: 0.48, gain: 0.052, wave: 'sine', lpFreq: 1300 },
		{ offset: 0.52, freq: 293.66, dur: 0.5, gain: 0.068, wave: 'triangle', lpFreq: 1550 },
	],

	// Calm sportsmanlike resignation bow (mellow two-chord settle)
	loss_resign: [
		{ offset: 0.0, freq: 349.23, dur: 0.24, gain: 0.058, wave: 'sine', lpFreq: 1850 },
		{ offset: 0.0, freq: 440.0, dur: 0.24, gain: 0.05, wave: 'sine', lpFreq: 1950 },
		{ offset: 0.02, freq: 523.25, dur: 0.22, gain: 0.044, wave: 'sine', lpFreq: 2050 },
		{ offset: 0.24, freq: 164.81, dur: 0.26, gain: 0.06, wave: 'sine', lpFreq: 1200 },
		{ offset: 0.24, freq: 329.63, dur: 0.25, gain: 0.052, wave: 'sine', lpFreq: 1700 },
		{ offset: 0.24, freq: 392.0, dur: 0.25, gain: 0.046, wave: 'sine', lpFreq: 1800 },
		{ offset: 0.48, freq: 110.0, dur: 0.52, gain: 0.074, wave: 'sine', lpFreq: 880 },
		{ offset: 0.48, freq: 220.0, dur: 0.48, gain: 0.06, wave: 'triangle', lpFreq: 1350 },
		{ offset: 0.48, freq: 329.63, dur: 0.46, gain: 0.04, wave: 'sine', lpFreq: 1600 },
	],

	// Stalemate: quizzical floating Csus2 turnaround
	draw_stalemate: [
		{ offset: 0.0, freq: 523.25, dur: 0.1, gain: 0.07, wave: 'triangle', lpFreq: 2200 },
		{ offset: 0.095, freq: 587.33, dur: 0.1, gain: 0.07, wave: 'triangle', lpFreq: 2300 },
		{ offset: 0.19, freq: 739.99, dur: 0.11, gain: 0.068, wave: 'triangle', lpFreq: 2450 },
		{ offset: 0.29, freq: 261.63, dur: 0.56, gain: 0.064, wave: 'sine', lpFreq: 1400 },
		{ offset: 0.29, freq: 392.0, dur: 0.56, gain: 0.054, wave: 'sine', lpFreq: 1800 },
		{ offset: 0.29, freq: 587.33, dur: 0.58, gain: 0.052, wave: 'triangle', lpFreq: 2200 },
		{ offset: 0.29, freq: 783.99, dur: 0.54, gain: 0.046, wave: 'sine', lpFreq: 2400 },
	],

	// Threefold repetition: 3 symmetrical pendulum echoes -> balanced open fifth
	draw_threefold: [
		{ offset: 0.0, freq: 659.25, dur: 0.085, gain: 0.066, wave: 'sine', lpFreq: 2300 },
		{ offset: 0.085, freq: 783.99, dur: 0.1, gain: 0.062, wave: 'sine', lpFreq: 2400 },
		{ offset: 0.22, freq: 659.25, dur: 0.085, gain: 0.06, wave: 'sine', lpFreq: 2300 },
		{ offset: 0.305, freq: 783.99, dur: 0.1, gain: 0.058, wave: 'sine', lpFreq: 2400 },
		{ offset: 0.44, freq: 659.25, dur: 0.085, gain: 0.054, wave: 'sine', lpFreq: 2300 },
		{ offset: 0.525, freq: 783.99, dur: 0.1, gain: 0.052, wave: 'sine', lpFreq: 2400 },
		{ offset: 0.65, freq: 261.63, dur: 0.45, gain: 0.068, wave: 'sine', lpFreq: 1450 },
		{ offset: 0.65, freq: 392.0, dur: 0.45, gain: 0.054, wave: 'sine', lpFreq: 1800 },
	],

	// Insufficient material: sparse serene two-king open chime
	draw_insufficient: [
		{ offset: 0.0, freq: 392.0, dur: 0.18, gain: 0.068, wave: 'sine', lpFreq: 1850 },
		{ offset: 0.14, freq: 523.25, dur: 0.2, gain: 0.065, wave: 'sine', lpFreq: 2050 },
		{ offset: 0.31, freq: 392.0, dur: 0.24, gain: 0.056, wave: 'sine', lpFreq: 1850 },
		{ offset: 0.48, freq: 261.63, dur: 0.5, gain: 0.068, wave: 'sine', lpFreq: 1400 },
		{ offset: 0.48, freq: 392.0, dur: 0.5, gain: 0.052, wave: 'sine', lpFreq: 1750 },
	],

	// 50-move rule: steady balanced four-step cadence -> calm G6/sus settle
	draw_fifty_move: [
		{ offset: 0.0, freq: 293.66, dur: 0.14, gain: 0.072, wave: 'triangle', lpFreq: 1750 },
		{ offset: 0.135, freq: 349.23, dur: 0.14, gain: 0.072, wave: 'triangle', lpFreq: 1850 },
		{ offset: 0.27, freq: 440.0, dur: 0.14, gain: 0.072, wave: 'triangle', lpFreq: 2000 },
		{ offset: 0.405, freq: 392.0, dur: 0.22, gain: 0.075, wave: 'triangle', lpFreq: 1950 },
		{ offset: 0.56, freq: 293.66, dur: 0.44, gain: 0.058, wave: 'sine', lpFreq: 1500 },
		{ offset: 0.56, freq: 392.0, dur: 0.44, gain: 0.062, wave: 'sine', lpFreq: 1800 },
		{ offset: 0.56, freq: 493.88, dur: 0.44, gain: 0.045, wave: 'sine', lpFreq: 2000 },
	],
};

export function emitChessOutcomeStinger(
	ctx: AudioContext,
	out: AudioNode,
	baseAt: number,
	outcomeId: ChessOutcomeSoundId
): void {
	const score = CHESS_OUTCOME_SCORE[outcomeId];
	score.forEach((n) => {
		emitTone(ctx, out, {
			at: baseAt + n.offset,
			freq: n.freq,
			dur: n.dur,
			gain: n.gain,
			wave: n.wave ?? 'triangle',
			lpFreq: n.lpFreq ?? 2400,
			attack: 0.008,
		});
	});
}

export function emitUiPreset(
	ctx: AudioContext,
	out: AudioNode,
	noiseBuf: AudioBuffer,
	t0: number,
	presetId: SoundPresetId
): void {
	switch (presetId) {
		case 'nav':
			emitTone(ctx, out, { at: t0, freq: 420, endFreq: 590, dur: 0.052, gain: 0.11, wave: 'sine', lpFreq: 2100 });
			emitNoise(ctx, out, noiseBuf, { at: t0, centerFreq: 1650, q: 1.5, dur: 0.024, gain: 0.032 });
			break;

		case 'keycap':
			emitTone(ctx, out, { at: t0, freq: 165, endFreq: 72, dur: 0.065, gain: 0.2, wave: 'sine', lpFreq: 1200, attack: 0.004 });
			emitTone(ctx, out, { at: t0, freq: 330, endFreq: 144, dur: 0.058, gain: 0.072, wave: 'triangle', lpFreq: 1800, attack: 0.004 });
			emitTone(ctx, out, { at: t0, freq: 1320, endFreq: 580, dur: 0.028, gain: 0.115, wave: 'triangle', lpFreq: 2500, attack: 0.003 });
			break;

		case 'bubble':
			emitTone(ctx, out, { at: t0, freq: 270, endFreq: 720, dur: 0.105, gain: 0.18, wave: 'sine', lpFreq: 2400, attack: 0.012 });
			break;

		case 'paper':
			emitTone(ctx, out, { at: t0, freq: 580, endFreq: 330, dur: 0.042, gain: 0.155, wave: 'triangle', lpFreq: 1750, attack: 0.004 });
			emitTone(ctx, out, { at: t0, freq: 310, endFreq: 185, dur: 0.046, gain: 0.115, wave: 'sine', lpFreq: 1500, attack: 0.004 });
			emitNoise(ctx, out, noiseBuf, { at: t0, centerFreq: 1050, q: 1.0, dur: 0.034, gain: 0.05 });
			break;

		case 'switch':
			emitTone(ctx, out, { at: t0, freq: 440, endFreq: 640, dur: 0.048, gain: 0.155, wave: 'sine', lpFreq: 1850, attack: 0.004 });
			emitTone(ctx, out, { at: t0, freq: 880, endFreq: 960, dur: 0.034, gain: 0.048, wave: 'sine', lpFreq: 2100, attack: 0.003 });
			emitTone(ctx, out, { at: t0, freq: 220, endFreq: 140, dur: 0.032, gain: 0.105, wave: 'sine', lpFreq: 1200, attack: 0.003 });
			break;

		case 'shutter':
			emitNoise(ctx, out, noiseBuf, { at: t0, centerFreq: 2350, q: 1.7, dur: 0.024, gain: 0.072 });
			emitTone(ctx, out, { at: t0 + 0.004, freq: 480, endFreq: 210, dur: 0.042, gain: 0.125, wave: 'triangle', lpFreq: 2200, attack: 0.003 });
			emitNoise(ctx, out, noiseBuf, { at: t0 + 0.026, centerFreq: 1750, q: 1.8, dur: 0.022, gain: 0.058 });
			break;

		case 'copy':
			emitTone(ctx, out, { at: t0, freq: 659.25, dur: 0.058, gain: 0.1, wave: 'sine', lpFreq: 2400 });
			emitTone(ctx, out, { at: t0 + 0.048, freq: 880.0, dur: 0.11, gain: 0.11, wave: 'triangle', lpFreq: 2600 });
			break;

		case 'portal':
			emitTone(ctx, out, { at: t0, freq: 493.88, dur: 0.08, gain: 0.09, wave: 'sine', lpFreq: 2400 });
			emitTone(ctx, out, { at: t0 + 0.046, freq: 739.99, dur: 0.14, gain: 0.095, wave: 'triangle', lpFreq: 2600 });
			break;

		case 'close':
			emitTone(ctx, out, { at: t0, freq: 410, endFreq: 205, dur: 0.058, gain: 0.13, wave: 'sine', lpFreq: 1650, attack: 0.004 });
			emitNoise(ctx, out, noiseBuf, { at: t0, centerFreq: 980, q: 1.3, dur: 0.026, gain: 0.036 });
			break;

		case 'chessTab':
			emitTone(ctx, out, { at: t0, freq: 380, endFreq: 220, dur: 0.042, gain: 0.12, wave: 'triangle', lpFreq: 1700, attack: 0.004 });
			emitTone(ctx, out, { at: t0 + 0.052, freq: 320, endFreq: 165, dur: 0.068, gain: 0.15, wave: 'triangle', lpFreq: 1650, attack: 0.004 });
			emitTone(ctx, out, { at: t0 + 0.065, freq: 659.25, dur: 0.16, gain: 0.075, wave: 'sine', lpFreq: 2400 });
			break;

		case 'sfxTab':
			emitTone(ctx, out, { at: t0, freq: 210, endFreq: 88, dur: 0.078, gain: 0.16, wave: 'sine', lpFreq: 1400, attack: 0.004 });
			emitTone(ctx, out, { at: t0 + 0.025, freq: 523.25, endFreq: 783.99, dur: 0.095, gain: 0.095, wave: 'triangle', lpFreq: 2400 });
			break;

		case 'retroFail':
			emitTone(ctx, out, { at: t0, freq: 311.13, endFreq: 293.66, dur: 0.12, gain: 0.105, wave: 'triangle', lpFreq: 1650 });
			emitTone(ctx, out, { at: t0 + 0.105, freq: 220.0, endFreq: 185.0, dur: 0.22, gain: 0.115, wave: 'triangle', lpFreq: 1400 });
			break;

		case 'bell':
			emitTone(ctx, out, { at: t0, freq: 783.99, dur: 0.42, gain: 0.135, wave: 'sine', lpFreq: 2400, attack: 0.005 });
			emitTone(ctx, out, { at: t0, freq: 1567.98, dur: 0.22, gain: 0.042, wave: 'sine', lpFreq: 2600, attack: 0.005 });
			break;

		case 'cassette':
			emitTone(ctx, out, { at: t0, freq: 125, endFreq: 48, dur: 0.098, gain: 0.21, wave: 'sine', lpFreq: 950, attack: 0.004 });
			emitTone(ctx, out, { at: t0, freq: 250, endFreq: 105, dur: 0.09, gain: 0.092, wave: 'triangle', lpFreq: 1350, attack: 0.004 });
			emitTone(ctx, out, { at: t0 + 0.032, freq: 880, endFreq: 340, dur: 0.036, gain: 0.068, wave: 'triangle', lpFreq: 1900, attack: 0.003 });
			break;

		case 'chime':
			[523.25, 659.25, 783.99].forEach((freq, i) => {
				emitTone(ctx, out, { at: t0 + i * 0.055, freq, dur: 0.28, gain: 0.115, wave: 'sine', lpFreq: 2400 });
			});
			break;

		case 'twang': {
			const osc = ctx.createOscillator();
			const lfo = ctx.createOscillator();
			const lfoGain = ctx.createGain();
			const lp = ctx.createBiquadFilter();
			const amp = ctx.createGain();

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(165, t0);
			osc.frequency.exponentialRampToValueAtTime(240, t0 + 0.08);
			osc.frequency.exponentialRampToValueAtTime(175, t0 + 0.26);

			lfo.type = 'sine';
			lfo.frequency.setValueAtTime(22, t0);
			lfoGain.gain.setValueAtTime(14, t0);
			lfo.connect(lfoGain);
			lfoGain.connect(osc.frequency);

			lp.type = 'lowpass';
			lp.frequency.setValueAtTime(1850, t0);

			amp.gain.setValueAtTime(0.001, t0);
			amp.gain.linearRampToValueAtTime(0.175, t0 + 0.008);
			amp.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.28);

			osc.connect(lp);
			lp.connect(amp);
			amp.connect(out);
			lfo.start(t0);
			osc.start(t0);
			lfo.stop(t0 + 0.29);
			osc.stop(t0 + 0.29);
			break;
		}

		case 'vhsGlitch': {
			const noiseSrc = ctx.createBufferSource();
			noiseSrc.buffer = noiseBuf;
			const snowFilter = ctx.createBiquadFilter();
			snowFilter.type = 'bandpass';
			snowFilter.Q.setValueAtTime(1.5, t0);
			snowFilter.frequency.setValueAtTime(2200, t0);
			snowFilter.frequency.linearRampToValueAtTime(980, t0 + 0.09);
			snowFilter.frequency.linearRampToValueAtTime(2700, t0 + 0.18);
			snowFilter.frequency.linearRampToValueAtTime(1250, t0 + 0.31);

			const snowGain = ctx.createGain();
			snowGain.gain.setValueAtTime(0.001, t0);
			snowGain.gain.linearRampToValueAtTime(0.18, t0 + 0.01);
			snowGain.gain.linearRampToValueAtTime(0.045, t0 + 0.055);
			snowGain.gain.linearRampToValueAtTime(0.175, t0 + 0.095);
			snowGain.gain.linearRampToValueAtTime(0.038, t0 + 0.15);
			snowGain.gain.linearRampToValueAtTime(0.16, t0 + 0.195);
			snowGain.gain.linearRampToValueAtTime(0.055, t0 + 0.25);
			snowGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.34);

			noiseSrc.connect(snowFilter);
			snowFilter.connect(snowGain);
			snowGain.connect(out);
			noiseSrc.start(t0);
			noiseSrc.stop(t0 + 0.36);

			const motorOsc = ctx.createOscillator();
			const harmonicOsc = ctx.createOscillator();
			const buzzFilter = ctx.createBiquadFilter();
			const buzzGain = ctx.createGain();

			motorOsc.type = 'sawtooth';
			motorOsc.frequency.setValueAtTime(126, t0);
			motorOsc.frequency.linearRampToValueAtTime(68, t0 + 0.09);
			motorOsc.frequency.linearRampToValueAtTime(108, t0 + 0.17);
			motorOsc.frequency.exponentialRampToValueAtTime(54, t0 + 0.31);

			harmonicOsc.type = 'square';
			harmonicOsc.frequency.setValueAtTime(320, t0);
			harmonicOsc.frequency.linearRampToValueAtTime(195, t0 + 0.11);
			harmonicOsc.frequency.linearRampToValueAtTime(280, t0 + 0.2);
			harmonicOsc.frequency.exponentialRampToValueAtTime(135, t0 + 0.31);

			buzzFilter.type = 'lowpass';
			buzzFilter.frequency.setValueAtTime(1450, t0);

			buzzGain.gain.setValueAtTime(0.001, t0);
			buzzGain.gain.linearRampToValueAtTime(0.088, t0 + 0.015);
			buzzGain.gain.linearRampToValueAtTime(0.028, t0 + 0.09);
			buzzGain.gain.linearRampToValueAtTime(0.092, t0 + 0.15);
			buzzGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.33);

			motorOsc.connect(buzzFilter);
			harmonicOsc.connect(buzzFilter);
			buzzFilter.connect(buzzGain);
			buzzGain.connect(out);
			motorOsc.start(t0);
			harmonicOsc.start(t0);
			motorOsc.stop(t0 + 0.35);
			harmonicOsc.stop(t0 + 0.35);

			emitTone(ctx, out, {
				at: t0 + 0.29,
				freq: 240,
				endFreq: 92,
				dur: 0.06,
				gain: 0.115,
				wave: 'triangle',
				lpFreq: 1600,
			});
			break;
		}

		case 'chessMove':
		case 'chessCapture':
		case 'chessCastle':
		case 'chessCheck': {
			const triggerWood = (at: number, intensity: number, pitch = 1) => {
				emitTone(ctx, out, {
					at: at + 0.008,
					freq: 260 * pitch,
					endFreq: 125 * pitch,
					dur: 0.082,
					gain: 0.165 * intensity,
					wave: 'triangle',
					lpFreq: 1900,
					attack: 0.005,
				});
				emitNoise(ctx, out, noiseBuf, {
					at: at + 0.008,
					centerFreq: 1650 * pitch,
					q: 1.6,
					dur: 0.04,
					gain: 0.08 * intensity,
				});
			};
			if (presetId === 'chessMove') {
				triggerWood(t0, 0.95, 1);
			} else if (presetId === 'chessCapture') {
				triggerWood(t0, 1.12, 1.15);
				emitNoise(ctx, out, noiseBuf, { at: t0, centerFreq: 1650, q: 1.4, dur: 0.036, gain: 0.095 });
			} else if (presetId === 'chessCastle') {
				triggerWood(t0, 0.9, 1.05);
				triggerWood(t0 + 0.085, 0.95, 0.94);
			} else {
				triggerWood(t0, 1.02, 1.08);
				emitTone(ctx, out, { at: t0, freq: 880, dur: 0.14, gain: 0.095, wave: 'triangle', lpFreq: 2400 });
				emitTone(ctx, out, { at: t0 + 0.045, freq: 1174.66, dur: 0.14, gain: 0.095, wave: 'triangle', lpFreq: 2400 });
			}
			break;
		}

		case 'chessWin':
			emitChessOutcomeStinger(ctx, out, t0, 'win_checkmate');
			break;
		case 'chessLose':
			emitChessOutcomeStinger(ctx, out, t0, 'loss_checkmate');
			break;
		case 'chessDraw':
			emitChessOutcomeStinger(ctx, out, t0, 'draw_stalemate');
			break;

		case 'coin':
		default:
			emitTone(ctx, out, { at: t0, freq: 987.77, dur: 0.09, gain: 0.115, wave: 'triangle', lpFreq: 2600 });
			emitTone(ctx, out, { at: t0 + 0.068, freq: 1318.51, dur: 0.24, gain: 0.115, wave: 'triangle', lpFreq: 2700 });
			break;
	}
}
