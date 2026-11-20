import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	SoundContext,
	type AudioLevel,
	type BgmLevel,
	type ChessMoveAudioSpec,
	type ChessOutcomeSoundId,
	type ChessPieceCode,
	type ChessPromotionCode,
	type MemePadId,
	type SfxLevel,
	type SoundPresetId,
} from './useSound';
import {
	emitButtonHoverVoice,
	emitChessOutcomeStinger,
	emitChessPieceHover,
	emitTone,
	emitUiPreset,
	type HoverKind,
} from './soundSynths';

const DATA_SFX_PRESETS: Record<string, SoundPresetId> = {
	nav: 'nav',
	keycap: 'keycap',
	bubble: 'bubble',
	paper: 'paper',
	switch: 'switch',
	bell: 'bell',
	cassette: 'cassette',
	shutter: 'shutter',
	copy: 'copy',
	portal: 'portal',
	close: 'close',
	'chess-tab': 'chessTab',
	'sfx-tab': 'sfxTab',
	'retro-fail': 'retroFail',
	chime: 'chime',
	twang: 'twang',
	coin: 'coin',
	'vhs-glitch': 'vhsGlitch',
};

const HOVER_DWELL_MS = 120;
const HOVER_GLOBAL_COOLDOWN_MS = 140;
const HOVER_SAME_ELEMENT_COOLDOWN_MS = 350;
const TOUCH_SUPPRESS_WINDOW_MS = 700;

const CHESS_HOVER_PIECE_MAP: Record<string, ChessPieceCode> = {
	'chess-p': 'p',
	'chess-n': 'n',
	'chess-b': 'b',
	'chess-r': 'r',
	'chess-q': 'q',
	'chess-k': 'k',
};

const HOVER_KINDS: ReadonlySet<string> = new Set<HoverKind>([
	'nav',
	'keycap',
	'cassette',
	'switch',
	'paper',
	'shutter',
	'bell',
	'copy',
	'portal',
	'close',
	'chess-tab',
	'sfx-tab',
	'vhs-glitch',
	'default',
]);

interface HoverTargetMeta {
	kind: HoverKind;
	chessPiece?: ChessPieceCode;
}

const resolveHoverTargetMeta = (target: HTMLElement): HoverTargetMeta | null => {
	const explicitHover = target.closest('[data-hover-sfx]')?.getAttribute('data-hover-sfx');
	if (explicitHover === 'none') {
		return null;
	}
	if (explicitHover && explicitHover in CHESS_HOVER_PIECE_MAP) {
		return { kind: 'default', chessPiece: CHESS_HOVER_PIECE_MAP[explicitHover] };
	}
	if (target.hasAttribute('data-chess-square')) {
		// Empty or unannotated chess squares must never produce hover sounds
		return null;
	}
	if (explicitHover && HOVER_KINDS.has(explicitHover)) {
		return { kind: explicitHover as HoverKind };
	}
	const sfxAttr = target.closest('[data-sfx]')?.getAttribute('data-sfx');
	if (sfxAttr && HOVER_KINDS.has(sfxAttr)) {
		return { kind: sfxAttr as HoverKind };
	}
	return { kind: target.tagName === 'A' ? 'nav' : 'default' };
};

const BGM_AUDIO_SRC = '/audio/studio-bgm.mp3';
const BGM_SUBTLE_VOLUME = 0.18;
const BGM_LOW_VOLUME = 0.06;
const BGM_FOCUS_ATTENUATED_VOLUME = 0.055;
const BGM_FOCUS_LOW_VOLUME = 0.032;
const SFX_LOW_GAIN_SCALE = 0.36;

const NEXT_AUDIO_LEVEL: Record<AudioLevel, AudioLevel> = {
	full: 'low',
	low: 'off',
	off: 'full',
};

const BGM_LEVEL_SFX: Record<BgmLevel, { notes: readonly number[]; gain: number; step: number }> = {
	full: { notes: [523.25, 659.25, 783.99], gain: 0.1, step: 0.048 },
	low: { notes: [587.33, 440.0], gain: 0.088, step: 0.058 },
	off: { notes: [523.25, 392.0, 261.63], gain: 0.095, step: 0.055 },
};

const SFX_LEVEL_CUE: Record<
	SfxLevel,
	{ notes: readonly number[]; wave: OscillatorType; gain: number; step: number }
> = {
	full: { notes: [523.25, 659.25, 783.99], wave: 'triangle', gain: 0.105, step: 0.048 },
	low: { notes: [587.33, 440.0], wave: 'triangle', gain: 0.052, step: 0.058 },
	off: { notes: [440.0, 293.66, 220.0], wave: 'sine', gain: 0.065, step: 0.052 },
};

const parseSavedAudioLevel = (storageKey: string): AudioLevel => {
	if (typeof window === 'undefined') return 'full';
	const saved = window.localStorage.getItem(storageKey);
	if (saved === 'low') return 'low';
	if (saved === 'false' || saved === 'off') return 'off';
	return 'full';
};

const getSfxGainForLevel = (level: SfxLevel): number => (level === 'low' ? SFX_LOW_GAIN_SCALE : 1);

const getBgmTargetVolume = (level: BgmLevel, focusAttenuated: boolean): number => {
	if (level === 'off') return 0;
	if (level === 'low') {
		return focusAttenuated ? BGM_FOCUS_LOW_VOLUME : BGM_LOW_VOLUME;
	}
	return focusAttenuated ? BGM_FOCUS_ATTENUATED_VOLUME : BGM_SUBTLE_VOLUME;
};

const MEME_SFX_FILES: Record<MemePadId, string> = {
	faah: '/audio/memes/faah.mp3',
	oof: '/audio/memes/oof.mp3',
	wow: '/audio/memes/wow.mp3',
	bruh: '/audio/memes/bruh.mp3',
	omg: '/audio/memes/omg.mp3',
	yay: '/audio/memes/yay.mp3',
	okay: '/audio/memes/okay.mp3',
	god: '/audio/memes/god.mp3',
};

const isNavigationShortcutKey = (e: Event): boolean => {
	if (!(e instanceof KeyboardEvent)) return false;
	return (
		e.ctrlKey ||
		e.metaKey ||
		e.altKey ||
		e.key === 'F5' ||
		e.key === 'F12' ||
		e.key === 'Escape'
	);
};

const isPageActiveForeground = (): boolean => {
	if (typeof document === 'undefined') return false;
	const hasFocus = typeof document.hasFocus === 'function' ? document.hasFocus() : true;
	return !document.hidden && hasFocus;
};

export function SoundProvider({ children }: { children: ReactNode }) {
	const [sfxLevel, setSfxLevelState] = useState<SfxLevel>(() => parseSavedAudioLevel('kristianto-sfx'));
	const soundEnabled = sfxLevel !== 'off';
	const [bgmLevel, setBgmLevelState] = useState<BgmLevel>(() => parseSavedAudioLevel('kristianto-bgm'));
	const bgmEnabled = bgmLevel !== 'off';
	const [bgmDucked, setBgmDuckedState] = useState<boolean>(false);

	const sfxLevelRef = useRef<SfxLevel>(sfxLevel);
	const enabledRef = useRef(soundEnabled);
	const bgmLevelRef = useRef<BgmLevel>(bgmLevel);
	const bgmDuckedRef = useRef(bgmDucked);
	const ctxRef = useRef<AudioContext | null>(null);
	const masterChainRef = useRef<{
		ctx: AudioContext;
		input: AudioNode;
		cueInput: AudioNode;
		sfxLevelGain: GainNode;
	} | null>(null);
	const noiseBufRef = useRef<AudioBuffer | null>(null);
	const bgmBufferRef = useRef<AudioBuffer | null>(null);
	const bgmBytesPromiseRef = useRef<Promise<ArrayBuffer | null> | null>(null);
	const bgmDecodePromiseRef = useRef<Promise<AudioBuffer | null> | null>(null);
	const bgmSourceRef = useRef<AudioBufferSourceNode | null>(null);
	const bgmFadeGainRef = useRef<GainNode | null>(null);
	const bgmLevelGainRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
	const bgmFocusAttenuatedRef = useRef(false);
	const bgmEpochRef = useRef(0);
	const bgmLoopBoundsRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
	const bgmStopTimerRef = useRef<number | null>(null);
	const bgmStartedCtxTimeRef = useRef(0);
	const bgmStartOffsetRef = useRef(0);
	const bgmPausedAtOffsetRef = useRef(0);
	const lastHoverAtRef = useRef(0);
	const lastHoveredElRef = useRef<HTMLElement | null>(null);
	const lastHoveredElAtRef = useRef(0);
	const lastTouchAtRef = useRef(0);
	const lastClickAtRef = useRef(0);
	const lastPluckAtByStrandRef = useRef<Map<number, number>>(new Map());
	const memeBytesPromiseMapRef = useRef<Map<MemePadId, Promise<ArrayBuffer | null>>>(new Map());
	const memeBufferMapRef = useRef<Map<MemePadId, AudioBuffer>>(new Map());
	const memeDecodePromiseMapRef = useRef<Map<MemePadId, Promise<AudioBuffer | null>>>(new Map());
	const activeMemeVoicesMapRef = useRef<
		Map<MemePadId, { source: AudioBufferSourceNode; gain: GainNode }>
	>(new Map());
	const memeRequestEpochMapRef = useRef<Map<MemePadId, number>>(new Map());

	useEffect(() => {
		sfxLevelRef.current = sfxLevel;
		enabledRef.current = sfxLevel !== 'off';
		window.localStorage.setItem('kristianto-sfx', sfxLevel);
	}, [sfxLevel]);

	useEffect(() => {
		bgmLevelRef.current = bgmLevel;
		window.localStorage.setItem('kristianto-bgm', bgmLevel);
	}, [bgmLevel]);

	useEffect(() => {
		bgmDuckedRef.current = bgmDucked;
	}, [bgmDucked]);

	/**
	 * Safely obtain an active AudioContext ONLY inside genuine user-gesture callbacks
	 * (pointerdown / click / keydown / touchstart) so browsers never warn about autoplay.
	 */
	const getOrUnlockAudioContext = useCallback((): AudioContext | null => {
		if (typeof window === 'undefined') return null;
		const AudioCtx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		if (!AudioCtx) return null;

		if (!ctxRef.current) {
			ctxRef.current = new AudioCtx();
		}
		if (ctxRef.current.state === 'suspended') {
			ctxRef.current.resume().catch(() => {});
		}
		return ctxRef.current;
	}, []);

	const getRunningContext = useCallback((): AudioContext | null => {
		const ctx = ctxRef.current;
		if (!ctx || ctx.state !== 'running') return null;
		return ctx;
	}, []);

	const runWithContext = useCallback(
		(ctx: AudioContext | null, allowAsyncResume: boolean, fn: (activeCtx: AudioContext) => void) => {
			if (!ctx) return;
			if (ctx.state === 'running') {
				fn(ctx);
				return;
			}
			if (allowAsyncResume && ctx.state === 'suspended') {
				ctx.resume()
					.then(() => {
						if (ctx.state === 'running') {
							fn(ctx);
						}
					})
					.catch(() => {});
			}
		},
		[]
	);

	const getNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
		if (noiseBufRef.current) return noiseBufRef.current;
		const length = Math.floor(ctx.sampleRate * 0.5);
		const buf = ctx.createBuffer(1, length, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < length; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		noiseBufRef.current = buf;
		return buf;
	}, []);

	/**
	 * Shared SFX mastering bus: keeps laptop/desktop loudness identical and non-fatiguing
	 * while boosting 1.48 kHz presence and gently compressing peaks on coarse touch phones
	 * so micro-speakers project short foley & UI clicks cleanly without sounding harsh.
	 */
	const ensureMasterChain = useCallback((ctx: AudioContext) => {
		if (masterChainRef.current?.ctx === ctx) {
			return masterChainRef.current;
		}

		const isCompactSpeaker =
			typeof window !== 'undefined' &&
			(window.matchMedia('(pointer: coarse)').matches ||
				/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

		const highpass = ctx.createBiquadFilter();
		highpass.type = 'highpass';
		highpass.frequency.value = isCompactSpeaker ? 140 : 45;
		highpass.Q.value = 0.7;

		const presence = ctx.createBiquadFilter();
		presence.type = 'peaking';
		presence.frequency.value = isCompactSpeaker ? 1050 : 1200;
		presence.Q.value = 0.8;
		presence.gain.value = isCompactSpeaker ? 3.4 : 0.45;

		const warmthCap = ctx.createBiquadFilter();
		warmthCap.type = 'lowpass';
		warmthCap.frequency.value = isCompactSpeaker ? 4800 : 5400;
		warmthCap.Q.value = 0.6;

		const sfxLevelGain = ctx.createGain();
		sfxLevelGain.gain.setValueAtTime(getSfxGainForLevel(sfxLevelRef.current), ctx.currentTime);

		const makeup = ctx.createGain();
		makeup.gain.value = isCompactSpeaker ? 1.52 : 1.0;

		const compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = isCompactSpeaker ? -15 : -15.5;
		compressor.knee.value = 14;
		compressor.ratio.value = isCompactSpeaker ? 3.2 : 3.2;
		compressor.attack.value = 0.002;
		compressor.release.value = 0.1;

		highpass.connect(presence);
		presence.connect(warmthCap);
		warmthCap.connect(sfxLevelGain);
		sfxLevelGain.connect(makeup);
		makeup.connect(compressor);
		compressor.connect(ctx.destination);

		masterChainRef.current = { ctx, input: highpass, cueInput: makeup, sfxLevelGain };
		return masterChainRef.current;
	}, []);

	const getMasterDestination = useCallback(
		(ctx: AudioContext): AudioNode => ensureMasterChain(ctx).input,
		[ensureMasterChain]
	);

	const applySfxTargetGain = useCallback((level: SfxLevel, rampSec = 0.08) => {
		const ctx = ctxRef.current;
		const chain = masterChainRef.current;
		if (!ctx || !chain || chain.ctx !== ctx) return;
		const now = ctx.currentTime;
		const target = getSfxGainForLevel(level);
		chain.sfxLevelGain.gain.cancelScheduledValues(now);
		chain.sfxLevelGain.gain.setValueAtTime(chain.sfxLevelGain.gain.value, now);
		chain.sfxLevelGain.gain.linearRampToValueAtTime(target, now + rampSec);
	}, []);

	const playHoverForMeta = useCallback(
		(meta: HoverTargetMeta, targetEl?: HTMLElement | null) => {
			if (!enabledRef.current) return;
			const now = performance.now();
			if (now - lastHoverAtRef.current < HOVER_GLOBAL_COOLDOWN_MS) return;
			if (
				targetEl &&
				lastHoveredElRef.current === targetEl &&
				now - lastHoveredElAtRef.current < HOVER_SAME_ELEMENT_COOLDOWN_MS
			) {
				return;
			}

			const ctx = getRunningContext();
			if (!ctx) return;
			lastHoverAtRef.current = now;
			if (targetEl) {
				lastHoveredElRef.current = targetEl;
				lastHoveredElAtRef.current = now;
			}

			const t0 = ctx.currentTime + 0.004;
			const masterOut = getMasterDestination(ctx);
			const noiseBuf = getNoiseBuffer(ctx);
			if (meta.chessPiece) {
				emitChessPieceHover(ctx, masterOut, noiseBuf, t0, meta.chessPiece);
			} else {
				emitButtonHoverVoice(ctx, masterOut, noiseBuf, t0, meta.kind);
			}
		},
		[getMasterDestination, getNoiseBuffer, getRunningContext]
	);

	const playHover = useCallback(() => {
		playHoverForMeta({ kind: 'default' }, null);
	}, [playHoverForMeta]);

	const playClick = useCallback(() => {
		if (!enabledRef.current) return;
		const now = performance.now();
		if (now - lastClickAtRef.current < 45) return;
		lastClickAtRef.current = now;

		const ctx = getOrUnlockAudioContext();
		runWithContext(ctx, true, (activeCtx) => {
			const t0 = activeCtx.currentTime;
			const masterOut = getMasterDestination(activeCtx);
			emitTone(activeCtx, masterOut, {
				at: t0,
				freq: 340,
				endFreq: 510,
				dur: 0.068,
				gain: 0.088,
				wave: 'triangle',
				lpFreq: 2200,
				attack: 0.005,
			});
		});
	}, [getMasterDestination, getOrUnlockAudioContext, runWithContext]);

	const playPluck = useCallback(
		(freq: number, fromPointerDown = false, strandIndex = 1) => {
			if (!enabledRef.current) return;
			const strandKey = Number.isFinite(strandIndex) ? strandIndex : Math.round(freq);
			const now = performance.now();
			const lastAt = lastPluckAtByStrandRef.current.get(strandKey) ?? 0;
			if (now - lastAt < 155) return;

			const ctx = fromPointerDown ? getOrUnlockAudioContext() : getRunningContext();
			if (!ctx) return;
			lastPluckAtByStrandRef.current.set(strandKey, now);

			// Cohesive nylon/patch-cord pluck DNA across a Cmaj9 palette: preserve upper-mid harmonics
			// so C4/E4 read clearly even on compact smartphone speakers.
			const profiles = [
				{ bodyGain: 0.115, harmonicGain: 0.020, cutoffStart: 2100, cutoffEnd: 780, decay: 0.24 },
				{ bodyGain: 0.108, harmonicGain: 0.022, cutoffStart: 2400, cutoffEnd: 860, decay: 0.21 },
				{ bodyGain: 0.103, harmonicGain: 0.025, cutoffStart: 2700, cutoffEnd: 940, decay: 0.19 },
				{ bodyGain: 0.092, harmonicGain: 0.026, cutoffStart: 3000, cutoffEnd: 1080, decay: 0.17 },
			];
			const profile = profiles[((strandIndex % profiles.length) + profiles.length) % profiles.length];

			runWithContext(ctx, fromPointerDown, (activeCtx) => {
				const t0 = activeCtx.currentTime;
				const masterOut = getMasterDestination(activeCtx);
				const bodyOsc = activeCtx.createOscillator();
				const overtoneOsc = activeCtx.createOscillator();
				const filter = activeCtx.createBiquadFilter();
				const bodyGain = activeCtx.createGain();
				const overtoneGain = activeCtx.createGain();

				bodyOsc.type = 'triangle';
				bodyOsc.frequency.setValueAtTime(freq * 1.016, t0);
				bodyOsc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.028);

				overtoneOsc.type = 'sine';
				overtoneOsc.frequency.setValueAtTime(freq * 2, t0);
				overtoneOsc.frequency.exponentialRampToValueAtTime(freq * 1.99, t0 + 0.09);

				filter.type = 'lowpass';
				filter.Q.setValueAtTime(1.5, t0);
				filter.frequency.setValueAtTime(profile.cutoffStart, t0);
				filter.frequency.exponentialRampToValueAtTime(profile.cutoffEnd, t0 + profile.decay);

				bodyGain.gain.setValueAtTime(0.001, t0);
				bodyGain.gain.linearRampToValueAtTime(profile.bodyGain, t0 + 0.004);
				bodyGain.gain.exponentialRampToValueAtTime(0.0007, t0 + profile.decay);

				overtoneGain.gain.setValueAtTime(0.0005, t0);
				overtoneGain.gain.linearRampToValueAtTime(profile.harmonicGain, t0 + 0.003);
				overtoneGain.gain.exponentialRampToValueAtTime(0.0004, t0 + profile.decay * 0.58);

				bodyOsc.connect(bodyGain);
				overtoneOsc.connect(overtoneGain);
				bodyGain.connect(filter);
				overtoneGain.connect(filter);
				filter.connect(masterOut);

				bodyOsc.start(t0);
				overtoneOsc.start(t0);
				bodyOsc.stop(t0 + profile.decay + 0.02);
				overtoneOsc.stop(t0 + profile.decay + 0.02);
			});
		},
		[getMasterDestination, getOrUnlockAudioContext, getRunningContext, runWithContext]
	);

	const playPreset = useCallback(
		(presetId: SoundPresetId, volumeScale = 1) => {
			if (!enabledRef.current) return;
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				const t0 = activeCtx.currentTime;
				const rawOut = getMasterDestination(activeCtx);
				let masterOut: AudioNode = rawOut;
				if (volumeScale !== 1) {
					const scaleGain = activeCtx.createGain();
					scaleGain.gain.setValueAtTime(Math.max(0.05, Math.min(1.5, volumeScale)), t0);
					scaleGain.connect(rawOut);
					masterOut = scaleGain;
				}

				emitUiPreset(activeCtx, masterOut, getNoiseBuffer(activeCtx), t0, presetId);
			});
		},
		[getMasterDestination, getNoiseBuffer, getOrUnlockAudioContext, runWithContext]
	);

	const playChessOutcome = useCallback(
		(outcomeId: ChessOutcomeSoundId) => {
			if (!enabledRef.current) return;
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				const t0 = activeCtx.currentTime + 0.008;
				const masterOut = getMasterDestination(activeCtx);
				emitChessOutcomeStinger(activeCtx, masterOut, t0, outcomeId);
			});
		},
		[getMasterDestination, getOrUnlockAudioContext, runWithContext]
	);

	const playChessMove = useCallback(
		(spec: ChessMoveAudioSpec) => {
			if (!enabledRef.current) return;
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				// 8ms lookahead guarantees audio-quantum boundary never clips short attack transients
				const t0 = activeCtx.currentTime + 0.008;
				const masterOut = getMasterDestination(activeCtx);

				const playSoftTone = (
					at: number,
					freq: number,
					dur: number,
					peakGain: number,
					type: OscillatorType = 'triangle',
					lpCutoff = 2600,
					endFreq?: number
				) => {
					const osc = activeCtx.createOscillator();
					const lp = activeCtx.createBiquadFilter();
					const gain = activeCtx.createGain();
					osc.type = type;
					osc.frequency.setValueAtTime(freq, at);
					if (endFreq && endFreq > 0) {
						osc.frequency.exponentialRampToValueAtTime(endFreq, at + dur * 0.85);
					}
					lp.type = 'lowpass';
					lp.frequency.setValueAtTime(lpCutoff, at);
					gain.gain.setValueAtTime(0.001, at);
					gain.gain.linearRampToValueAtTime(peakGain, at + 0.008);
					gain.gain.exponentialRampToValueAtTime(0.0007, at + dur);
					osc.connect(lp);
					lp.connect(gain);
					gain.connect(masterOut);
					osc.start(at);
					osc.stop(at + dur + 0.015);
				};

				const playWoodStrike = (
					at: number,
					bodyStartHz: number,
					bodyEndHz: number,
					bodyDur: number,
					bodyGain: number,
					noiseHz: number,
					noiseQ: number,
					noiseDur: number,
					noiseGain: number
				) => {
					const bodyOsc = activeCtx.createOscillator();
					const bodyLp = activeCtx.createBiquadFilter();
					const bodyAmp = activeCtx.createGain();
					bodyOsc.type = 'triangle';
					bodyOsc.frequency.setValueAtTime(bodyStartHz, at);
					bodyOsc.frequency.exponentialRampToValueAtTime(bodyEndHz, at + bodyDur * 0.8);
					bodyLp.type = 'lowpass';
					bodyLp.frequency.setValueAtTime(1950, at);
					bodyAmp.gain.setValueAtTime(0.001, at);
					bodyAmp.gain.linearRampToValueAtTime(bodyGain, at + 0.004);
					bodyAmp.gain.exponentialRampToValueAtTime(0.0007, at + bodyDur);
					bodyOsc.connect(bodyLp);
					bodyLp.connect(bodyAmp);
					bodyAmp.connect(masterOut);
					bodyOsc.start(at);
					bodyOsc.stop(at + bodyDur + 0.015);

					const clickSrc = activeCtx.createBufferSource();
					clickSrc.buffer = getNoiseBuffer(activeCtx);
					const bp = activeCtx.createBiquadFilter();
					bp.type = 'bandpass';
					bp.frequency.setValueAtTime(noiseHz, at);
					bp.Q.setValueAtTime(noiseQ, at);
					const clickAmp = activeCtx.createGain();
					clickAmp.gain.setValueAtTime(0.001, at);
					clickAmp.gain.linearRampToValueAtTime(noiseGain, at + 0.003);
					clickAmp.gain.exponentialRampToValueAtTime(0.0007, at + noiseDur);
					clickSrc.connect(bp);
					bp.connect(clickAmp);
					clickAmp.connect(masterOut);
					clickSrc.start(at);
					clickSrc.stop(at + noiseDur + 0.012);
				};

				const playPieceVoice = (at: number, piece: ChessPieceCode, gainScale = 1) => {
					switch (piece) {
						case 'p':
							// Pawn: crisp, light, agile hardwood tap
							playWoodStrike(at, 440, 215, 0.068, 0.15 * gainScale, 1950, 2.0, 0.036, 0.075 * gainScale);
							break;
						case 'n':
							// Knight: playful two-step hoof hop -> firmer landing
							playWoodStrike(at, 395, 255, 0.042, 0.09 * gainScale, 2200, 2.2, 0.026, 0.048 * gainScale);
							playWoodStrike(at + 0.052, 315, 165, 0.082, 0.175 * gainScale, 1540, 1.75, 0.044, 0.085 * gainScale);
							break;
						case 'b':
							// Bishop: smooth diagonal set + delicate marimba wood shimmer
							playWoodStrike(at, 355, 188, 0.075, 0.145 * gainScale, 1760, 1.9, 0.04, 0.068 * gainScale);
							playSoftTone(at + 0.006, 587.33, 0.125, 0.056 * gainScale, 'triangle', 2200);
							break;
						case 'r':
							// Rook: heavy, grounded fortress tower oak thud
							playWoodStrike(at, 232, 118, 0.105, 0.205 * gainScale, 1020, 1.35, 0.052, 0.105 * gainScale);
							playSoftTone(at, 464, 0.075, 0.068 * gainScale, 'sine', 1200, 220);
							break;
						case 'q':
							// Queen: rich royal satin wood set + warm fifth bloom
							playWoodStrike(at, 330, 156, 0.095, 0.17 * gainScale, 1620, 1.7, 0.046, 0.085 * gainScale);
							playSoftTone(at + 0.004, 440.0, 0.135, 0.05 * gainScale, 'sine', 2400);
							playSoftTone(at + 0.012, 659.25, 0.145, 0.036 * gainScale, 'sine', 2400);
							break;
						case 'k':
							// King: calm weighted felt-base oak thunk
							playWoodStrike(at, 210, 108, 0.096, 0.195 * gainScale, 880, 1.5, 0.048, 0.09 * gainScale);
							playSoftTone(at + 0.005, 315, 0.09, 0.05 * gainScale, 'sine', 1100, 165);
							break;
					}
				};

				const playPromotionFanfare = (at: number, promoPiece: ChessPromotionCode) => {
					const profiles: Record<
						ChessPromotionCode,
						{ notes: readonly number[]; step: number; sustainTail: number; lp: number; tailChord: readonly number[] }
					> = {
						q: {
							// Queen: lush bright ascending celebratory arpeggio + royal shimmer
							notes: [523.25, 659.25, 783.99, 987.77, 1046.5],
							step: 0.046,
							sustainTail: 0.36,
							lp: 3000,
							tailChord: [523.25, 659.25, 1046.5],
						},
						r: {
							// Rook: strong heroic fourth-fifth victory fanfare + grounded lock-in
							notes: [392.0, 523.25, 783.99, 1046.5],
							step: 0.056,
							sustainTail: 0.34,
							lp: 2200,
							tailChord: [392.0, 523.25, 1046.5],
						},
						b: {
							// Bishop: radiant luminous diagonal triumph
							notes: [587.33, 739.99, 880.0, 1174.66],
							step: 0.05,
							sustainTail: 0.32,
							lp: 2800,
							tailChord: [587.33, 880.0],
						},
						n: {
							// Knight underpromotion: sprightly clever celebration
							notes: [659.25, 830.61, 987.77, 1318.51],
							step: 0.044,
							sustainTail: 0.28,
							lp: 2600,
							tailChord: [659.25, 987.77],
						},
					};
					const cfg = profiles[promoPiece];
					cfg.notes.forEach((freq, idx) => {
						const nt = at + idx * cfg.step;
						const isLast = idx === cfg.notes.length - 1;
						playSoftTone(
							nt,
							freq,
							isLast ? cfg.sustainTail : 0.135,
							isLast ? 0.095 : 0.072,
							'triangle',
							cfg.lp
						);
					});
					const settleAt = at + (cfg.notes.length - 1) * cfg.step;
					cfg.tailChord.forEach((freq) => {
						playSoftTone(settleAt, freq, cfg.sustainTail, 0.036, 'sine', cfg.lp);
					});
					if (promoPiece === 'r') {
						playWoodStrike(settleAt + 0.01, 240, 125, 0.09, 0.14, 1100, 1.5, 0.04, 0.07);
					} else if (promoPiece === 'n') {
						playWoodStrike(settleAt + 0.025, 360, 210, 0.05, 0.095, 1850, 1.8, 0.03, 0.05);
					}
				};

				// 1. Primary move / special placement layer
				if (spec.castleSide === 'k' || spec.castleSide === 'q') {
					playPieceVoice(t0, 'k', 0.96);
					const rookDelay = spec.castleSide === 'k' ? 0.092 : 0.125;
					playPieceVoice(t0 + rookDelay, 'r', 0.92);
					const glowNotes =
						spec.castleSide === 'k' ? [523.25, 783.99] : [392.0, 523.25, 783.99];
					glowNotes.forEach((freq, idx) => {
						playSoftTone(
							t0 + rookDelay + 0.025 + idx * 0.032,
							freq,
							0.17,
							0.042,
							'sine',
							1850
						);
					});
				} else if (spec.isEnPassant) {
					playPieceVoice(t0, 'p', 0.92);
					// Distinct diagonal sweep + crisp side-snatch knock
					playSoftTone(t0 + 0.034, 523.25, 0.065, 0.068, 'sine', 2400, 783.99);
					playWoodStrike(t0 + 0.052, 330, 145, 0.07, 0.145, 2050, 1.65, 0.042, 0.095);
				} else {
					playPieceVoice(t0, spec.piece, spec.isCapture ? 1.04 : 1);
					if (spec.isCapture) {
						const capAt = t0 + (spec.piece === 'n' ? 0.062 : 0.026);
						playWoodStrike(capAt, 285, 130, 0.068, 0.135, 1420, 1.4, 0.044, 0.105);
					}
				}

				// 2. Celebratory per-piece promotion fanfare (smooth & distinct)
				if (spec.promotion) {
					const promoDelay = spec.isCapture ? 0.075 : 0.055;
					playPromotionFanfare(t0 + promoDelay, spec.promotion);
				}

				// 3. Check alert or Game Outcome tail (always plays cleanly AFTER piece settles)
				if (spec.terminal) {
					const endDelay = spec.promotion
						? 0.38
						: spec.castleSide
							? 0.22
							: spec.isEnPassant
								? 0.17
								: 0.14;
					emitChessOutcomeStinger(activeCtx, masterOut, t0 + endDelay, spec.terminal);
				} else if (spec.isCheck) {
					const checkDelay = spec.promotion
						? 0.31
						: spec.castleSide
							? 0.18
							: spec.isEnPassant
								? 0.125
								: spec.isCapture
									? 0.088
									: 0.075;
					[880.0, 1174.66].forEach((freq, idx) => {
						playSoftTone(t0 + checkDelay + idx * 0.048, freq, 0.145, 0.078, 'triangle', 2600);
					});
				}
			});
		},
		[getMasterDestination, getNoiseBuffer, getOrUnlockAudioContext, runWithContext]
	);

	const fetchMemeBytes = useCallback((memeId: MemePadId): Promise<ArrayBuffer | null> => {
		if (typeof window === 'undefined') return Promise.resolve(null);
		const existing = memeBytesPromiseMapRef.current.get(memeId);
		if (existing) return existing;

		const pending = window
			.fetch(MEME_SFX_FILES[memeId])
			.then((res) => {
				if (!res.ok) {
					memeBytesPromiseMapRef.current.delete(memeId);
					return null;
				}
				return res.arrayBuffer();
			})
			.catch(() => {
				memeBytesPromiseMapRef.current.delete(memeId);
				return null;
			});

		memeBytesPromiseMapRef.current.set(memeId, pending);
		return pending;
	}, []);

	const ensureMemeDecoded = useCallback(
		async (ctx: AudioContext, memeId: MemePadId): Promise<AudioBuffer | null> => {
			const cached = memeBufferMapRef.current.get(memeId);
			if (cached) return cached;

			const inflight = memeDecodePromiseMapRef.current.get(memeId);
			if (inflight) return inflight;

			const decoding = (async () => {
				const raw = await fetchMemeBytes(memeId);
				if (!raw) return null;
				try {
					const decoded = await ctx.decodeAudioData(raw.slice(0));
					memeBufferMapRef.current.set(memeId, decoded);
					return decoded;
				} catch {
					return null;
				} finally {
					memeDecodePromiseMapRef.current.delete(memeId);
				}
			})();

			memeDecodePromiseMapRef.current.set(memeId, decoding);
			return decoding;
		},
		[fetchMemeBytes]
	);

	const stopVoiceInstance = useCallback(
		(voice: { source: AudioBufferSourceNode; gain: GainNode }, fadeMs: number) => {
			const ctx = ctxRef.current;
			if (ctx && fadeMs > 0 && ctx.state === 'running') {
				const t0 = ctx.currentTime;
				const fadeSec = fadeMs / 1000;
				voice.gain.gain.cancelScheduledValues(t0);
				voice.gain.gain.setValueAtTime(voice.gain.gain.value, t0);
				voice.gain.gain.linearRampToValueAtTime(0, t0 + fadeSec);
				try {
					voice.source.stop(t0 + fadeSec + 0.012);
				} catch {
					// Ignore already stopped voice
				}
				return;
			}

			try {
				voice.source.stop();
			} catch {
				// Ignore already stopped voice
			}
			try {
				voice.source.disconnect();
				voice.gain.disconnect();
			} catch {
				// Ignore disconnect errors
			}
		},
		[]
	);

	const stopMemeVoiceForPad = useCallback(
		(memeId: MemePadId, fadeMs = 12) => {
			const voice = activeMemeVoicesMapRef.current.get(memeId);
			if (!voice) return;
			activeMemeVoicesMapRef.current.delete(memeId);
			stopVoiceInstance(voice, fadeMs);
		},
		[stopVoiceInstance]
	);

	const stopAllMemeVoices = useCallback(
		(fadeMs = 0) => {
			(Object.keys(MEME_SFX_FILES) as MemePadId[]).forEach((id) => {
				memeRequestEpochMapRef.current.set(
					id,
					(memeRequestEpochMapRef.current.get(id) ?? 0) + 1
				);
			});
			activeMemeVoicesMapRef.current.forEach((voice) => {
				stopVoiceInstance(voice, fadeMs);
			});
			activeMemeVoicesMapRef.current.clear();
		},
		[stopVoiceInstance]
	);

	const triggerDecodedMemeVoice = useCallback(
		(activeCtx: AudioContext, memeId: MemePadId, buffer: AudioBuffer) => {
			if (activeCtx.state !== 'running') return;
			// Only interrupt an active instance of the exact same pad; other pads finish freely
			stopMemeVoiceForPad(memeId, 12);

			const t0 = activeCtx.currentTime;
			const masterOut = getMasterDestination(activeCtx);
			const src = activeCtx.createBufferSource();
			const gain = activeCtx.createGain();
			src.buffer = buffer;
			gain.gain.setValueAtTime(0.68, t0);

			src.connect(gain);
			gain.connect(masterOut);
			activeMemeVoicesMapRef.current.set(memeId, { source: src, gain });
			src.onended = () => {
				try {
					src.disconnect();
					gain.disconnect();
				} catch {
					// Ignore disconnect errors
				}
				if (activeMemeVoicesMapRef.current.get(memeId)?.source === src) {
					activeMemeVoicesMapRef.current.delete(memeId);
				}
			};
			src.start(t0);
		},
		[getMasterDestination, stopMemeVoiceForPad]
	);

	const preloadMemes = useCallback(() => {
		if (typeof window === 'undefined') return;
		const ids = Object.keys(MEME_SFX_FILES) as MemePadId[];
		const ctx = ctxRef.current;
		ids.forEach((memeId) => {
			if (ctx) {
				void ensureMemeDecoded(ctx, memeId);
			} else {
				void fetchMemeBytes(memeId);
			}
		});
	}, [ensureMemeDecoded, fetchMemeBytes]);

	const playMeme = useCallback(
		(memeId: MemePadId) => {
			const epoch = (memeRequestEpochMapRef.current.get(memeId) ?? 0) + 1;
			memeRequestEpochMapRef.current.set(memeId, epoch);
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				if (memeRequestEpochMapRef.current.get(memeId) !== epoch) return;

				const cached = memeBufferMapRef.current.get(memeId);
				if (cached) {
					triggerDecodedMemeVoice(activeCtx, memeId, cached);
				} else {
					void ensureMemeDecoded(activeCtx, memeId).then((decoded) => {
						if (!decoded || memeRequestEpochMapRef.current.get(memeId) !== epoch) return;
						triggerDecodedMemeVoice(activeCtx, memeId, decoded);
					});
				}

				if (memeBufferMapRef.current.size < Object.keys(MEME_SFX_FILES).length) {
					(Object.keys(MEME_SFX_FILES) as MemePadId[]).forEach((id) => {
						if (id !== memeId) {
							void ensureMemeDecoded(activeCtx, id);
						}
					});
				}
			});
		},
		[ensureMemeDecoded, getOrUnlockAudioContext, runWithContext, triggerDecodedMemeVoice]
	);

	const playCountdownCue = useCallback(
		(isGo = false) => {
			if (!enabledRef.current) return;
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				const t0 = activeCtx.currentTime;
				const masterOut = getMasterDestination(activeCtx);
				if (isGo) {
					[783.99, 1046.5].forEach((freq, idx) => {
						const st = t0 + idx * 0.055;
						const osc = activeCtx.createOscillator();
						const gain = activeCtx.createGain();
						osc.type = 'triangle';
						osc.frequency.setValueAtTime(freq, st);
						gain.gain.setValueAtTime(0.001, st);
						gain.gain.linearRampToValueAtTime(0.135, st + 0.005);
						gain.gain.exponentialRampToValueAtTime(0.0008, st + 0.14);
						osc.connect(gain);
						gain.connect(masterOut);
						osc.start(st);
						osc.stop(st + 0.15);
					});
				} else {
					const osc = activeCtx.createOscillator();
					const gain = activeCtx.createGain();
					osc.type = 'sine';
					osc.frequency.setValueAtTime(523.25, t0);
					gain.gain.setValueAtTime(0.001, t0);
					gain.gain.linearRampToValueAtTime(0.125, t0 + 0.005);
					gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.1);
					osc.connect(gain);
					gain.connect(masterOut);
					osc.start(t0);
					osc.stop(t0 + 0.11);
				}
			});
		},
		[getMasterDestination, getOrUnlockAudioContext, runWithContext]
	);

	const playToggleCue = useCallback(
		(notes: readonly number[], wave: OscillatorType, gainPeak: number, stepSec: number) => {
			const ctx = getOrUnlockAudioContext();
			runWithContext(ctx, true, (activeCtx) => {
				const t0 = activeCtx.currentTime;
				const { cueInput } = ensureMasterChain(activeCtx);
				const lp = activeCtx.createBiquadFilter();
				lp.type = 'lowpass';
				lp.frequency.setValueAtTime(2100, t0);
				lp.connect(cueInput);

				notes.forEach((freq, idx) => {
					const st = t0 + idx * stepSec;
					const osc = activeCtx.createOscillator();
					const gain = activeCtx.createGain();
					osc.type = wave;
					osc.frequency.setValueAtTime(freq, st);
					gain.gain.setValueAtTime(0.001, st);
					gain.gain.linearRampToValueAtTime(gainPeak, st + 0.005);
					gain.gain.exponentialRampToValueAtTime(0.0008, st + stepSec + 0.075);
					osc.connect(gain);
					gain.connect(lp);
					osc.start(st);
					osc.stop(st + stepSec + 0.085);
				});
			});
		},
		[ensureMasterChain, getOrUnlockAudioContext, runWithContext]
	);

	const setSfxLevel = useCallback(
		(next: SfxLevel) => {
			sfxLevelRef.current = next;
			enabledRef.current = next !== 'off';
			setSfxLevelState(next);
			applySfxTargetGain(next, 0.06);
			const cue = SFX_LEVEL_CUE[next];
			playToggleCue(cue.notes, cue.wave, cue.gain, cue.step);
		},
		[applySfxTargetGain, playToggleCue]
	);

	const setSoundEnabled = useCallback(
		(next: boolean) => {
			setSfxLevel(next ? 'full' : 'off');
		},
		[setSfxLevel]
	);

	const toggleSound = useCallback(() => {
		setSfxLevel(NEXT_AUDIO_LEVEL[sfxLevelRef.current]);
	}, [setSfxLevel]);

	// Attempt foreground AudioContext unlock on load (works immediately when Chrome MEI / Sound Allow permits)
	// and fall back cleanly to first real user interaction when blocked by browser autoplay policy.
	useEffect(() => {
		if (enabledRef.current && isPageActiveForeground()) {
			getOrUnlockAudioContext();
		}

		const unlockOnce = (e: Event) => {
			if (!enabledRef.current || isNavigationShortcutKey(e)) return;
			getOrUnlockAudioContext();
		};

		let hoverTimerId: number | null = null;
		let pendingHoverTarget: HTMLElement | null = null;

		const clearPendingHover = () => {
			if (hoverTimerId !== null) {
				window.clearTimeout(hoverTimerId);
				hoverTimerId = null;
			}
			pendingHoverTarget = null;
		};

		const handleMouseOver = (e: MouseEvent) => {
			if (!enabledRef.current) return;
			// Do not trigger hover ticks while dragging sliders, chess pieces, or cords
			if (e.buttons !== 0) {
				clearPendingHover();
				return;
			}
			// Suppress synthetic mouseover events synthesized immediately after touch taps
			if (performance.now() - lastTouchAtRef.current < TOUCH_SUPPRESS_WINDOW_MS) {
				return;
			}

			const target = (e.target as HTMLElement | null)?.closest(
				'button, a, select, input[type="range"], [role="button"]'
			) as HTMLElement | null;
			if (!target) {
				clearPendingHover();
				return;
			}
			if (target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
				clearPendingHover();
				return;
			}
			// Ignore intra-element child transitions so dwell timer is not restarted or re-triggered
			if (
				target === pendingHoverTarget ||
				(e.relatedTarget instanceof Node && target.contains(e.relatedTarget))
			) {
				return;
			}

			clearPendingHover();
			const meta = resolveHoverTargetMeta(target);
			if (!meta) return;

			pendingHoverTarget = target;
			hoverTimerId = window.setTimeout(() => {
				hoverTimerId = null;
				if (!pendingHoverTarget || pendingHoverTarget !== target) return;
				if (!target.isConnected) {
					pendingHoverTarget = null;
					return;
				}
				// Re-resolve at fire time in case piece / state changed cleanly before dwell expired
				const freshMeta = resolveHoverTargetMeta(target);
				pendingHoverTarget = null;
				if (freshMeta) {
					playHoverForMeta(freshMeta, target);
				}
			}, HOVER_DWELL_MS);
		};

		const handleMouseOut = (e: MouseEvent) => {
			if (!pendingHoverTarget) return;
			const target = pendingHoverTarget;
			if (e.relatedTarget instanceof Node && target.contains(e.relatedTarget)) {
				return;
			}
			clearPendingHover();
		};

		const handleTouchMarker = () => {
			lastTouchAtRef.current = performance.now();
			clearPendingHover();
		};

		const handlePointerInteraction = (e: PointerEvent) => {
			if (e.pointerType && e.pointerType !== 'mouse') {
				lastTouchAtRef.current = performance.now();
			}
			clearPendingHover();
		};

		const handleDocumentClick = (e: MouseEvent) => {
			clearPendingHover();
			if (!enabledRef.current) return;
			const target = (e.target as HTMLElement | null)?.closest(
				'button, a, [role="button"]'
			) as HTMLElement | null;
			if (!target) return;
			if (target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
				return;
			}
			const sfxTag = target.closest('[data-sfx]')?.getAttribute('data-sfx');
			if (sfxTag === 'custom') return;
			const rawGain = target.closest('[data-sfx-gain]')?.getAttribute('data-sfx-gain');
			const gainScale = rawGain ? Number(rawGain) || 1 : 1;
			if (sfxTag && sfxTag in DATA_SFX_PRESETS) {
				playPreset(DATA_SFX_PRESETS[sfxTag], gainScale);
				return;
			}
			if (target.tagName === 'A') {
				const href = target.getAttribute('href') ?? '';
				playPreset(href.startsWith('http') ? 'portal' : 'nav', gainScale);
				return;
			}
			playClick();
		};

		window.addEventListener('pointerdown', unlockOnce, { passive: true, capture: true });
		window.addEventListener('pointerdown', handlePointerInteraction, { passive: true, capture: true });
		window.addEventListener('mousedown', unlockOnce, { passive: true, capture: true });
		window.addEventListener('click', unlockOnce, { passive: true, capture: true });
		window.addEventListener('touchend', unlockOnce, { passive: true, capture: true });
		window.addEventListener('touchstart', handleTouchMarker, { passive: true, capture: true });
		window.addEventListener('keydown', unlockOnce, { passive: true, capture: true });
		window.addEventListener('scroll', clearPendingHover, { passive: true, capture: true });
		window.addEventListener('wheel', clearPendingHover, { passive: true, capture: true });
		window.addEventListener('blur', clearPendingHover);
		document.addEventListener('visibilitychange', clearPendingHover);
		document.addEventListener('mouseover', handleMouseOver, true);
		document.addEventListener('mouseout', handleMouseOut, true);
		document.addEventListener('click', handleDocumentClick, true);

		return () => {
			clearPendingHover();
			window.removeEventListener('pointerdown', unlockOnce, { capture: true });
			window.removeEventListener('pointerdown', handlePointerInteraction, { capture: true });
			window.removeEventListener('mousedown', unlockOnce, { capture: true });
			window.removeEventListener('click', unlockOnce, { capture: true });
			window.removeEventListener('touchend', unlockOnce, { capture: true });
			window.removeEventListener('touchstart', handleTouchMarker, { capture: true });
			window.removeEventListener('keydown', unlockOnce, { capture: true });
			window.removeEventListener('scroll', clearPendingHover, { capture: true });
			window.removeEventListener('wheel', clearPendingHover, { capture: true });
			window.removeEventListener('blur', clearPendingHover);
			document.removeEventListener('visibilitychange', clearPendingHover);
			document.removeEventListener('mouseover', handleMouseOver, true);
			document.removeEventListener('mouseout', handleMouseOut, true);
			document.removeEventListener('click', handleDocumentClick, true);
		};
	}, [getOrUnlockAudioContext, playClick, playHoverForMeta, playPreset]);

	const fetchBgmBytes = useCallback((): Promise<ArrayBuffer | null> => {
		if (typeof window === 'undefined') return Promise.resolve(null);
		if (!bgmBytesPromiseRef.current) {
			bgmBytesPromiseRef.current = window
				.fetch(BGM_AUDIO_SRC)
				.then((res) => {
					if (!res.ok) {
						bgmBytesPromiseRef.current = null;
						return null;
					}
					return res.arrayBuffer();
				})
				.catch(() => {
					bgmBytesPromiseRef.current = null;
					return null;
				});
		}
		return bgmBytesPromiseRef.current;
	}, []);

	const ensureBgmDecoded = useCallback(
		async (ctx: AudioContext): Promise<AudioBuffer | null> => {
			if (bgmBufferRef.current) return bgmBufferRef.current;
			if (!bgmDecodePromiseRef.current) {
				bgmDecodePromiseRef.current = (async () => {
					const raw = await fetchBgmBytes();
					if (!raw) return null;
					try {
						// Copy buffer before decodeAudioData in case the browser detaches the source ArrayBuffer
						const decoded = await ctx.decodeAudioData(raw.slice(0));
						// Trim MP3 encoder delay & trailing padding frames for seamless Web Audio looping
						const ch0 = decoded.getChannelData(0);
						const sr = decoded.sampleRate || 48000;
						let firstActive = 0;
						while (firstActive < ch0.length - 1 && Math.abs(ch0[firstActive]) < 0.0005) {
							firstActive += 1;
						}
						let lastActive = ch0.length - 1;
						while (lastActive > firstActive && Math.abs(ch0[lastActive]) < 0.0005) {
							lastActive -= 1;
						}
						const loopStart = Math.max(0, (firstActive - 64) / sr);
						const loopEnd = Math.min(decoded.duration, (lastActive + 128) / sr);
						bgmLoopBoundsRef.current = {
							start: loopStart,
							end: Math.max(Math.min(decoded.duration, loopStart + 1), loopEnd),
						};
						bgmBufferRef.current = decoded;
						return decoded;
					} catch {
						return null;
					} finally {
						bgmDecodePromiseRef.current = null;
					}
				})();
			}
			return bgmDecodePromiseRef.current;
		},
		[fetchBgmBytes]
	);

	const getBgmLevelGainNode = useCallback((ctx: AudioContext): GainNode => {
		if (bgmLevelGainRef.current?.ctx === ctx) {
			return bgmLevelGainRef.current.gain;
		}
		// Dedicated static ceiling GainNode guarantees BGM signal never spikes past active ceiling
		const levelGain = ctx.createGain();
		levelGain.gain.value = getBgmTargetVolume(
			bgmLevelRef.current,
			bgmFocusAttenuatedRef.current
		);
		levelGain.connect(ctx.destination);
		bgmLevelGainRef.current = { ctx, gain: levelGain };
		return levelGain;
	}, []);

	const applyBgmTargetGain = useCallback(
		(level: BgmLevel, focusAttenuated: boolean, rampSec = 0.24) => {
			const ctx = ctxRef.current;
			const levelNode = bgmLevelGainRef.current;
			if (!ctx || !levelNode || levelNode.ctx !== ctx) return;

			const target = getBgmTargetVolume(level, focusAttenuated);
			const gainParam = levelNode.gain.gain;
			if (ctx.state === 'running') {
				const t0 = ctx.currentTime;
				gainParam.cancelScheduledValues(t0);
				gainParam.setValueAtTime(gainParam.value, t0);
				gainParam.linearRampToValueAtTime(target, t0 + rampSec);
			} else {
				gainParam.value = target;
			}
		},
		[]
	);

	const stopBgmNow = useCallback((suspendContext: boolean, fadeMs = 160) => {
		bgmEpochRef.current += 1;

		if (bgmStopTimerRef.current !== null) {
			window.clearTimeout(bgmStopTimerRef.current);
			bgmStopTimerRef.current = null;
		}

		const ctx = ctxRef.current;
		const source = bgmSourceRef.current;
		const fadeGain = bgmFadeGainRef.current;
		const duration = bgmBufferRef.current?.duration ?? 0;

		if (source && ctx && duration > 0) {
			const { start: loopStart, end: loopEnd } = bgmLoopBoundsRef.current;
			const span = loopEnd > loopStart ? loopEnd - loopStart : duration;
			const elapsed = Math.max(0, ctx.currentTime - bgmStartedCtxTimeRef.current);
			const rel = ((bgmStartOffsetRef.current - loopStart) + elapsed) % span;
			bgmPausedAtOffsetRef.current = loopStart + rel;
		}

		bgmSourceRef.current = null;
		bgmFadeGainRef.current = null;

		if (source) {
			if (ctx && fadeGain && !suspendContext && fadeMs > 0) {
				const t0 = ctx.currentTime;
				const fadeSec = fadeMs / 1000;
				fadeGain.gain.cancelScheduledValues(t0);
				fadeGain.gain.setValueAtTime(fadeGain.gain.value, t0);
				fadeGain.gain.linearRampToValueAtTime(0, t0 + fadeSec);
				try {
					source.stop(t0 + fadeSec + 0.015);
				} catch {
					// Ignore already stopped source
				}
				bgmStopTimerRef.current = window.setTimeout(() => {
					bgmStopTimerRef.current = null;
					try {
						source.disconnect();
						fadeGain.disconnect();
					} catch {
						// Ignore disconnect errors
					}
				}, fadeMs + 35);
			} else {
				if (ctx && fadeGain) {
					const t0 = ctx.currentTime;
					fadeGain.gain.cancelScheduledValues(t0);
					fadeGain.gain.setValueAtTime(0, t0);
				}
				try {
					source.stop();
				} catch {
					// Ignore already stopped source
				}
				try {
					source.disconnect();
					fadeGain?.disconnect();
				} catch {
					// Ignore disconnect errors
				}
			}
		}

		if (suspendContext) {
			stopAllMemeVoices(0);
			if (ctx && ctx.state === 'running') {
				ctx.suspend().catch(() => {});
			}
		}
	}, [stopAllMemeVoices]);

	const startBgmPlayback = useCallback(
		(fadeMs = 450, existingCtx?: AudioContext | null) => {
			if (bgmLevelRef.current === 'off' || bgmDuckedRef.current || !isPageActiveForeground()) {
				return;
			}
			const ctx = existingCtx ?? ctxRef.current;
			if (!ctx) return;

			if (bgmSourceRef.current) {
				return;
			}

			const epoch = ++bgmEpochRef.current;

			const launchSource = (activeCtx: AudioContext, buffer: AudioBuffer) => {
				if (
					epoch !== bgmEpochRef.current ||
					bgmLevelRef.current === 'off' ||
					bgmDuckedRef.current ||
					!isPageActiveForeground() ||
					activeCtx.state !== 'running' ||
					bgmSourceRef.current
				) {
					return;
				}

				const levelGain = getBgmLevelGainNode(activeCtx);
				const fadeGain = activeCtx.createGain();
				// Initialize fade gain at exact 0 before connecting so zero audio leaks prior to ramp
				fadeGain.gain.value = 0;
				fadeGain.connect(levelGain);

				const now = activeCtx.currentTime;
				// 45ms lookahead prevents reload / WASAPI wake-up audio-quantum catch-up bursts
				const startAt = now + 0.045;
				const fadeSec = Math.max(0.15, fadeMs / 1000);
				const { start: loopStart, end: loopEnd } = bgmLoopBoundsRef.current;
				const activeEnd = loopEnd > loopStart ? loopEnd : buffer.duration;
				const rawOffset = bgmPausedAtOffsetRef.current;
				const offset =
					rawOffset < loopStart || rawOffset >= activeEnd ? loopStart : rawOffset;

				fadeGain.gain.setValueAtTime(0, now);
				fadeGain.gain.setValueAtTime(0, startAt);
				fadeGain.gain.linearRampToValueAtTime(1, startAt + fadeSec);

				const src = activeCtx.createBufferSource();
				src.buffer = buffer;
				src.loop = true;
				if (activeEnd > loopStart) {
					src.loopStart = loopStart;
					src.loopEnd = activeEnd;
				}
				src.connect(fadeGain);

				bgmStartedCtxTimeRef.current = startAt;
				bgmStartOffsetRef.current = offset;
				bgmSourceRef.current = src;
				bgmFadeGainRef.current = fadeGain;
				src.start(startAt, offset);
			};

			const runWhenRunning = (activeCtx: AudioContext) => {
				if (epoch !== bgmEpochRef.current) return;
				if (bgmBufferRef.current) {
					launchSource(activeCtx, bgmBufferRef.current);
					return;
				}
				void ensureBgmDecoded(activeCtx).then((buffer) => {
					if (buffer) {
						launchSource(activeCtx, buffer);
					}
				});
			};

			if (ctx.state === 'running') {
				runWhenRunning(ctx);
			} else if (ctx.state === 'suspended') {
				ctx.resume()
					.then(() => {
						if (epoch === bgmEpochRef.current && ctx.state === 'running') {
							runWhenRunning(ctx);
						}
					})
					.catch(() => {});
			}
		},
		[ensureBgmDecoded, getBgmLevelGainNode]
	);

	const setBgmLevel = useCallback(
		(next: BgmLevel) => {
			bgmLevelRef.current = next;
			setBgmLevelState(next);
			if (enabledRef.current) {
				const cue = BGM_LEVEL_SFX[next];
				playToggleCue(
					cue.notes,
					'sine',
					cue.gain * getSfxGainForLevel(sfxLevelRef.current),
					cue.step
				);
			}
			if (next !== 'off') {
				applyBgmTargetGain(next, bgmFocusAttenuatedRef.current, 0.22);
				const ctx = getOrUnlockAudioContext();
				if (ctx && !bgmDuckedRef.current && isPageActiveForeground()) {
					startBgmPlayback(450, ctx);
				}
			} else {
				stopBgmNow(false, 180);
			}
		},
		[applyBgmTargetGain, getOrUnlockAudioContext, playToggleCue, startBgmPlayback, stopBgmNow]
	);

	const setBgmEnabled = useCallback(
		(next: boolean) => {
			setBgmLevel(next ? 'full' : 'off');
		},
		[setBgmLevel]
	);

	const toggleBgm = useCallback(() => {
		setBgmLevel(NEXT_AUDIO_LEVEL[bgmLevelRef.current]);
	}, [setBgmLevel]);

	const setBgmDuckForVideo = useCallback((ducked: boolean) => {
		bgmDuckedRef.current = ducked;
		setBgmDuckedState(ducked);
	}, []);

	const setBgmFocusAttenuated = useCallback(
		(attenuated: boolean) => {
			if (bgmFocusAttenuatedRef.current === attenuated) return;
			bgmFocusAttenuatedRef.current = attenuated;
			applyBgmTargetGain(bgmLevelRef.current, attenuated, 0.32);
		},
		[applyBgmTargetGain]
	);

	// Sync BGM strictly via Web Audio API (no OS media notification) and ONLY while page is visible & focused
	useEffect(() => {
		if (!bgmEnabled || bgmDucked) {
			stopBgmNow(false, 180);
			return;
		}

		// Warm HTTP cache for MP3 bytes without touching HTMLAudioElement or OS MediaSession
		void fetchBgmBytes();

		const syncForegroundState = (knownFocused = false) => {
			const activeNow = !document.hidden && (knownFocused || isPageActiveForeground());
			if (!activeNow) {
				stopBgmNow(true, 0);
				return;
			}
			if (bgmLevelRef.current !== 'off' && !bgmDuckedRef.current && isPageActiveForeground()) {
				const ctx = ctxRef.current ?? getOrUnlockAudioContext();
				if (ctx) {
					startBgmPlayback(450, ctx);
				}
			}
		};

		const handleVisibilityChange = () => {
			syncForegroundState(false);
		};

		const handleWindowFocus = () => {
			syncForegroundState(true);
		};

		const handleWindowBlur = () => {
			// Window lost focus (switched window, app, minimized, or closed) -> suspend Web Audio immediately
			stopBgmNow(true, 0);
		};

		const handlePageHide = () => {
			stopBgmNow(true, 0);
		};

		const unlockBgmOnGesture = (e: Event) => {
			if (isNavigationShortcutKey(e)) return;
			if (e.target instanceof Element && e.target.closest('[data-bgm-toggle="true"]')) {
				return;
			}
			if (bgmLevelRef.current === 'off' || bgmDuckedRef.current || document.hidden) return;
			const ctx = getOrUnlockAudioContext();
			if (ctx && !document.hidden) {
				startBgmPlayback(450, ctx);
			}
		};

		if (isPageActiveForeground()) {
			const ctx = ctxRef.current ?? getOrUnlockAudioContext();
			if (ctx) {
				startBgmPlayback(450, ctx);
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		document.addEventListener('freeze', handlePageHide);
		window.addEventListener('focus', handleWindowFocus);
		window.addEventListener('blur', handleWindowBlur);
		window.addEventListener('pagehide', handlePageHide);
		window.addEventListener('beforeunload', handlePageHide);
		window.addEventListener('pointerdown', unlockBgmOnGesture, { capture: true, passive: true });
		window.addEventListener('click', unlockBgmOnGesture, { capture: true, passive: true });
		window.addEventListener('touchend', unlockBgmOnGesture, { capture: true, passive: true });
		window.addEventListener('keydown', unlockBgmOnGesture, { capture: true, passive: true });

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			document.removeEventListener('freeze', handlePageHide);
			window.removeEventListener('focus', handleWindowFocus);
			window.removeEventListener('blur', handleWindowBlur);
			window.removeEventListener('pagehide', handlePageHide);
			window.removeEventListener('beforeunload', handlePageHide);
			window.removeEventListener('pointerdown', unlockBgmOnGesture, { capture: true });
			window.removeEventListener('click', unlockBgmOnGesture, { capture: true });
			window.removeEventListener('touchend', unlockBgmOnGesture, { capture: true });
			window.removeEventListener('keydown', unlockBgmOnGesture, { capture: true });
		};
	}, [bgmEnabled, bgmDucked, fetchBgmBytes, getOrUnlockAudioContext, startBgmPlayback, stopBgmNow]);

	useEffect(() => {
		return () => {
			stopBgmNow(true, 0);
			if (ctxRef.current) {
				ctxRef.current.close().catch(() => {});
				ctxRef.current = null;
			}
		};
	}, [stopBgmNow]);

	return (
		<SoundContext.Provider
			value={{
				sfxLevel,
				setSfxLevel,
				soundEnabled,
				setSoundEnabled,
				toggleSound,
				bgmLevel,
				setBgmLevel,
				bgmEnabled,
				setBgmEnabled,
				toggleBgm,
				setBgmDuckForVideo,
				setBgmFocusAttenuated,
				playHover,
				playClick,
				playPluck,
				playPreset,
				playChessMove,
				playChessOutcome,
				playMeme,
				preloadMemes,
				playCountdownCue,
			}}
		>
			{children}
		</SoundContext.Provider>
	);
}
