import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	SoundContext,
	type BgmLevel,
	type ChessMoveAudioSpec,
	type ChessPieceCode,
	type ChessPromotionCode,
	type MemePadId,
	type SoundPresetId,
} from './useSound';

const DATA_SFX_PRESETS: Record<string, SoundPresetId> = {
	keycap: 'keycap',
	bubble: 'bubble',
	paper: 'paper',
	switch: 'switch',
	bell: 'bell',
	cassette: 'cassette',
	chime: 'chime',
	twang: 'twang',
	coin: 'coin',
	'vhs-glitch': 'vhsGlitch',
};

const BGM_AUDIO_SRC = '/audio/studio-bgm.mp3';
const BGM_SUBTLE_VOLUME = 0.18;
const BGM_LOW_VOLUME = 0.06;
const BGM_FOCUS_ATTENUATED_VOLUME = 0.055;
const BGM_FOCUS_LOW_VOLUME = 0.032;

const NEXT_BGM_LEVEL: Record<BgmLevel, BgmLevel> = {
	full: 'low',
	low: 'off',
	off: 'full',
};

const BGM_LEVEL_SFX: Record<BgmLevel, { notes: readonly number[]; gain: number; step: number }> = {
	full: { notes: [523.25, 659.25, 783.99], gain: 0.1, step: 0.048 },
	low: { notes: [587.33, 440.0], gain: 0.088, step: 0.058 },
	off: { notes: [523.25, 392.0, 261.63], gain: 0.095, step: 0.055 },
};

const parseSavedBgmLevel = (): BgmLevel => {
	if (typeof window === 'undefined') return 'full';
	const saved = window.localStorage.getItem('kristianto-bgm');
	if (saved === 'low') return 'low';
	if (saved === 'false' || saved === 'off') return 'off';
	return 'full';
};

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
	const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
		if (typeof window === 'undefined') return true;
		const saved = window.localStorage.getItem('kristianto-sfx');
		return saved === null ? true : saved === 'true';
	});
	const [bgmLevel, setBgmLevelState] = useState<BgmLevel>(parseSavedBgmLevel);
	const bgmEnabled = bgmLevel !== 'off';
	const [bgmDucked, setBgmDuckedState] = useState<boolean>(false);

	const enabledRef = useRef(soundEnabled);
	const bgmLevelRef = useRef<BgmLevel>(bgmLevel);
	const bgmDuckedRef = useRef(bgmDucked);
	const ctxRef = useRef<AudioContext | null>(null);
	const masterChainRef = useRef<{ ctx: AudioContext; input: AudioNode } | null>(null);
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
		enabledRef.current = soundEnabled;
		window.localStorage.setItem('kristianto-sfx', String(soundEnabled));
	}, [soundEnabled]);

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
	const getMasterDestination = useCallback((ctx: AudioContext): AudioNode => {
		if (masterChainRef.current?.ctx === ctx) {
			return masterChainRef.current.input;
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
		presence.frequency.value = isCompactSpeaker ? 1050 : 1280;
		presence.Q.value = 0.8;
		presence.gain.value = isCompactSpeaker ? 3.4 : 1.2;

		const warmthCap = ctx.createBiquadFilter();
		warmthCap.type = 'lowpass';
		warmthCap.frequency.value = isCompactSpeaker ? 4800 : 6800;
		warmthCap.Q.value = 0.6;

		const makeup = ctx.createGain();
		makeup.gain.value = isCompactSpeaker ? 1.52 : 1.0;

		const compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = isCompactSpeaker ? -15 : -14;
		compressor.knee.value = 14;
		compressor.ratio.value = isCompactSpeaker ? 3.2 : 3.0;
		compressor.attack.value = 0.002;
		compressor.release.value = 0.1;

		highpass.connect(presence);
		presence.connect(warmthCap);
		warmthCap.connect(makeup);
		makeup.connect(compressor);
		compressor.connect(ctx.destination);

		masterChainRef.current = { ctx, input: highpass };
		return highpass;
	}, []);

	const playHover = useCallback(() => {
		if (!enabledRef.current) return;
		const now = performance.now();
		if (now - lastHoverAtRef.current < 90) return;

		const ctx = getRunningContext();
		if (!ctx) return;
		lastHoverAtRef.current = now;

		const t0 = ctx.currentTime;
		const masterOut = getMasterDestination(ctx);
		const osc = ctx.createOscillator();
		const filter = ctx.createBiquadFilter();
		const gain = ctx.createGain();

		const baseFreq = 510 + Math.random() * 95;
		osc.type = 'sine';
		osc.frequency.setValueAtTime(baseFreq, t0);
		osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, t0 + 0.036);

		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(1450, t0);

		gain.gain.setValueAtTime(0.001, t0);
		gain.gain.linearRampToValueAtTime(0.03, t0 + 0.006);
		gain.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.045);

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(masterOut);
		osc.start(t0);
		osc.stop(t0 + 0.05);
	}, [getMasterDestination, getRunningContext]);

	const playClick = useCallback(() => {
		if (!enabledRef.current) return;
		const now = performance.now();
		if (now - lastClickAtRef.current < 45) return;
		lastClickAtRef.current = now;

		const ctx = getOrUnlockAudioContext();
		runWithContext(ctx, true, (activeCtx) => {
			const t0 = activeCtx.currentTime;
			const masterOut = getMasterDestination(activeCtx);

			// Crisp tactile switch click + light harmonic presence for both laptop & mobile speakers
			const osc = activeCtx.createOscillator();
			const filter = activeCtx.createBiquadFilter();
			const gain = activeCtx.createGain();

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(340, t0);
			osc.frequency.exponentialRampToValueAtTime(520, t0 + 0.045);

			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(2600, t0);

			gain.gain.setValueAtTime(0.001, t0);
			gain.gain.linearRampToValueAtTime(0.095, t0 + 0.005);
			gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.075);

			osc.connect(filter);
			filter.connect(gain);
			gain.connect(masterOut);
			osc.start(t0);
			osc.stop(t0 + 0.085);
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
				{ bodyGain: 0.148, harmonicGain: 0.026, cutoffStart: 2100, cutoffEnd: 780, decay: 0.24 },
				{ bodyGain: 0.138, harmonicGain: 0.028, cutoffStart: 2400, cutoffEnd: 860, decay: 0.21 },
				{ bodyGain: 0.132, harmonicGain: 0.032, cutoffStart: 2700, cutoffEnd: 940, decay: 0.19 },
				{ bodyGain: 0.118, harmonicGain: 0.034, cutoffStart: 3000, cutoffEnd: 1080, decay: 0.17 },
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

				if (presetId === 'keycap') {
					// Satisfying mechanical switch two-stage click + woody thock (+ missing-fundamental octave layer for phone speakers)
					const bodyOsc = activeCtx.createOscillator();
					const bodyGain = activeCtx.createGain();
					bodyOsc.type = 'sine';
					bodyOsc.frequency.setValueAtTime(165, t0);
					bodyOsc.frequency.exponentialRampToValueAtTime(72, t0 + 0.06);
					bodyGain.gain.setValueAtTime(0.25, t0);
					bodyGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.065);
					bodyOsc.connect(bodyGain);
					bodyGain.connect(masterOut);
					bodyOsc.start(t0);
					bodyOsc.stop(t0 + 0.07);

					const overtoneOsc = activeCtx.createOscillator();
					const overtoneGain = activeCtx.createGain();
					overtoneOsc.type = 'triangle';
					overtoneOsc.frequency.setValueAtTime(330, t0);
					overtoneOsc.frequency.exponentialRampToValueAtTime(144, t0 + 0.055);
					overtoneGain.gain.setValueAtTime(0.085, t0);
					overtoneGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
					overtoneOsc.connect(overtoneGain);
					overtoneGain.connect(masterOut);
					overtoneOsc.start(t0);
					overtoneOsc.stop(t0 + 0.065);

					const clickOsc = activeCtx.createOscillator();
					const clickGain = activeCtx.createGain();
					clickOsc.type = 'triangle';
					clickOsc.frequency.setValueAtTime(1450, t0);
					clickOsc.frequency.exponentialRampToValueAtTime(620, t0 + 0.025);
					clickGain.gain.setValueAtTime(0.16, t0);
					clickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03);
					clickOsc.connect(clickGain);
					clickGain.connect(masterOut);
					clickOsc.start(t0);
					clickOsc.stop(t0 + 0.035);
				} else if (presetId === 'bubble') {
					const osc = activeCtx.createOscillator();
					const gain = activeCtx.createGain();
					osc.type = 'sine';
					osc.frequency.setValueAtTime(260, t0);
					osc.frequency.exponentialRampToValueAtTime(760, t0 + 0.085);
					gain.gain.setValueAtTime(0.001, t0);
					gain.gain.linearRampToValueAtTime(0.24, t0 + 0.015);
					gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11);
					osc.connect(gain);
					gain.connect(masterOut);
					osc.start(t0);
					osc.stop(t0 + 0.12);
				} else if (presetId === 'paper') {
					// Audible, warm tactile card/dropdown tap tuned balanced for desktop & mobile speakers
					const tapFilter = activeCtx.createBiquadFilter();
					tapFilter.type = 'lowpass';
					tapFilter.frequency.setValueAtTime(1750, t0);

					const clickOsc = activeCtx.createOscillator();
					const clickGain = activeCtx.createGain();
					clickOsc.type = 'triangle';
					clickOsc.frequency.setValueAtTime(620, t0);
					clickOsc.frequency.exponentialRampToValueAtTime(350, t0 + 0.036);
					clickGain.gain.setValueAtTime(0.001, t0);
					clickGain.gain.linearRampToValueAtTime(0.20, t0 + 0.003);
					clickGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.044);
					clickOsc.connect(clickGain);
					clickGain.connect(tapFilter);

					const bodyOsc = activeCtx.createOscillator();
					const bodyGain = activeCtx.createGain();
					bodyOsc.type = 'sine';
					bodyOsc.frequency.setValueAtTime(320, t0);
					bodyOsc.frequency.exponentialRampToValueAtTime(190, t0 + 0.04);
					bodyGain.gain.setValueAtTime(0.001, t0);
					bodyGain.gain.linearRampToValueAtTime(0.145, t0 + 0.004);
					bodyGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.048);
					bodyOsc.connect(bodyGain);
					bodyGain.connect(tapFilter);

					tapFilter.connect(masterOut);
					clickOsc.start(t0);
					bodyOsc.start(t0);
					clickOsc.stop(t0 + 0.05);
					bodyOsc.stop(t0 + 0.054);

					const brush = activeCtx.createBufferSource();
					brush.buffer = getNoiseBuffer(activeCtx);
					const bp = activeCtx.createBiquadFilter();
					bp.type = 'bandpass';
					bp.frequency.setValueAtTime(1050, t0);
					bp.Q.setValueAtTime(1.0, t0);
					const brushGain = activeCtx.createGain();
					brushGain.gain.setValueAtTime(0.06, t0);
					brushGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.034);
					brush.connect(bp);
					bp.connect(brushGain);
					brushGain.connect(masterOut);
					brush.start(t0);
					brush.stop(t0 + 0.04);
				} else if (presetId === 'bell') {
					// Warm reception desk brass ding (two harmonics)
					[880, 1760].forEach((freq, idx) => {
						const osc = activeCtx.createOscillator();
						const gain = activeCtx.createGain();
						osc.type = 'sine';
						osc.frequency.setValueAtTime(freq, t0);
						gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.065, t0);
						gain.gain.exponentialRampToValueAtTime(0.0008, t0 + (idx === 0 ? 0.45 : 0.25));
						osc.connect(gain);
						gain.connect(masterOut);
						osc.start(t0);
						osc.stop(t0 + 0.48);
					});
				} else if (presetId === 'cassette') {
					// Chunky tape deck latch thunk (+ 2x warm triangle harmonic so low thud reads on mobile speakers)
					const low = activeCtx.createOscillator();
					const lowGain = activeCtx.createGain();
					low.type = 'sine';
					low.frequency.setValueAtTime(125, t0);
					low.frequency.exponentialRampToValueAtTime(48, t0 + 0.09);
					lowGain.gain.setValueAtTime(0.27, t0);
					lowGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
					low.connect(lowGain);
					lowGain.connect(masterOut);
					low.start(t0);
					low.stop(t0 + 0.11);

					const punch = activeCtx.createOscillator();
					const punchGain = activeCtx.createGain();
					punch.type = 'triangle';
					punch.frequency.setValueAtTime(250, t0);
					punch.frequency.exponentialRampToValueAtTime(105, t0 + 0.085);
					punchGain.gain.setValueAtTime(0.11, t0);
					punchGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.095);
					punch.connect(punchGain);
					punchGain.connect(masterOut);
					punch.start(t0);
					punch.stop(t0 + 0.1);

					const snap = activeCtx.createOscillator();
					const snapGain = activeCtx.createGain();
					snap.type = 'triangle';
					snap.frequency.setValueAtTime(920, t0 + 0.032);
					snap.frequency.exponentialRampToValueAtTime(340, t0 + 0.058);
					snapGain.gain.setValueAtTime(0.085, t0 + 0.032);
					snapGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.068);
					snap.connect(snapGain);
					snapGain.connect(masterOut);
					snap.start(t0 + 0.032);
					snap.stop(t0 + 0.072);
				} else if (presetId === 'chime') {
					// Warm Kalimba triad sparkle (C5 -> E5 -> G5)
					[523.25, 659.25, 783.99].forEach((freq, i) => {
						const start = t0 + i * 0.055;
						const osc = activeCtx.createOscillator();
						const gain = activeCtx.createGain();
						osc.type = 'sine';
						osc.frequency.setValueAtTime(freq, start);
						gain.gain.setValueAtTime(0.145, start);
						gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.28);
						osc.connect(gain);
						gain.connect(masterOut);
						osc.start(start);
						osc.stop(start + 0.3);
					});
				} else if (presetId === 'twang') {
					// Elastic spaghetti noodle boing
					const osc = activeCtx.createOscillator();
					const lfo = activeCtx.createOscillator();
					const lfoGain = activeCtx.createGain();
					const gain = activeCtx.createGain();

					osc.type = 'triangle';
					osc.frequency.setValueAtTime(165, t0);
					osc.frequency.exponentialRampToValueAtTime(240, t0 + 0.08);
					osc.frequency.exponentialRampToValueAtTime(175, t0 + 0.26);

					lfo.type = 'sine';
					lfo.frequency.setValueAtTime(22, t0);
					lfoGain.gain.setValueAtTime(14, t0);
					lfo.connect(lfoGain);
					lfoGain.connect(osc.frequency);

					gain.gain.setValueAtTime(0.21, t0);
					gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.28);

					osc.connect(gain);
					gain.connect(masterOut);
					lfo.start(t0);
					osc.start(t0);
					lfo.stop(t0 + 0.29);
					osc.stop(t0 + 0.29);
				} else if (presetId === 'switch') {
					// Warm tactile toggle pop, comfortably audible on desktop & mobile without being loud
					const popFilter = activeCtx.createBiquadFilter();
					popFilter.type = 'lowpass';
					popFilter.frequency.setValueAtTime(1850, t0);
					popFilter.connect(masterOut);

					const lead = activeCtx.createOscillator();
					const leadGain = activeCtx.createGain();
					lead.type = 'sine';
					lead.frequency.setValueAtTime(440, t0);
					lead.frequency.exponentialRampToValueAtTime(650, t0 + 0.038);
					leadGain.gain.setValueAtTime(0.001, t0);
					leadGain.gain.linearRampToValueAtTime(0.195, t0 + 0.004);
					leadGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.05);
					lead.connect(leadGain);
					leadGain.connect(popFilter);
					lead.start(t0);
					lead.stop(t0 + 0.056);

					const chimeOver = activeCtx.createOscillator();
					const chimeGain = activeCtx.createGain();
					chimeOver.type = 'sine';
					chimeOver.frequency.setValueAtTime(880, t0);
					chimeOver.frequency.exponentialRampToValueAtTime(980, t0 + 0.028);
					chimeGain.gain.setValueAtTime(0.001, t0);
					chimeGain.gain.linearRampToValueAtTime(0.065, t0 + 0.003);
					chimeGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.035);
					chimeOver.connect(chimeGain);
					chimeGain.connect(popFilter);
					chimeOver.start(t0);
					chimeOver.stop(t0 + 0.04);

					const subTick = activeCtx.createOscillator();
					const subGain = activeCtx.createGain();
					subTick.type = 'sine';
					subTick.frequency.setValueAtTime(220, t0);
					subTick.frequency.exponentialRampToValueAtTime(140, t0 + 0.026);
					subGain.gain.setValueAtTime(0.125, t0);
					subGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.034);
					subTick.connect(subGain);
					subGain.connect(popFilter);
					subTick.start(t0);
					subTick.stop(t0 + 0.038);
				} else if (presetId === 'vhsGlitch') {
					// Authentic 8-frame VHS tracking tear (~350ms): head snap + stuttering tape static + pitch-warble buzz
					const noiseSrc = activeCtx.createBufferSource();
					noiseSrc.buffer = getNoiseBuffer(activeCtx);
					const snowFilter = activeCtx.createBiquadFilter();
					snowFilter.type = 'bandpass';
					snowFilter.Q.setValueAtTime(1.5, t0);
					snowFilter.frequency.setValueAtTime(2400, t0);
					snowFilter.frequency.linearRampToValueAtTime(980, t0 + 0.09);
					snowFilter.frequency.linearRampToValueAtTime(3100, t0 + 0.18);
					snowFilter.frequency.linearRampToValueAtTime(1250, t0 + 0.31);

					// 8-frame stutter gating mimics physical tape dropout bands
					const snowGain = activeCtx.createGain();
					snowGain.gain.setValueAtTime(0.001, t0);
					snowGain.gain.linearRampToValueAtTime(0.24, t0 + 0.008);
					snowGain.gain.linearRampToValueAtTime(0.05, t0 + 0.055);
					snowGain.gain.linearRampToValueAtTime(0.23, t0 + 0.095);
					snowGain.gain.linearRampToValueAtTime(0.04, t0 + 0.15);
					snowGain.gain.linearRampToValueAtTime(0.21, t0 + 0.195);
					snowGain.gain.linearRampToValueAtTime(0.07, t0 + 0.25);
					snowGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.34);

					noiseSrc.connect(snowFilter);
					snowFilter.connect(snowGain);
					snowGain.connect(masterOut);
					noiseSrc.start(t0);
					noiseSrc.stop(t0 + 0.36);

					// Gritty analog VHS motor/tracking tear buzz + upper harmonic so smartphone speakers project it clearly
					const motorOsc = activeCtx.createOscillator();
					const harmonicOsc = activeCtx.createOscillator();
					const buzzFilter = activeCtx.createBiquadFilter();
					const buzzGain = activeCtx.createGain();

					motorOsc.type = 'sawtooth';
					motorOsc.frequency.setValueAtTime(126, t0);
					motorOsc.frequency.linearRampToValueAtTime(68, t0 + 0.09);
					motorOsc.frequency.linearRampToValueAtTime(108, t0 + 0.17);
					motorOsc.frequency.exponentialRampToValueAtTime(54, t0 + 0.31);

					harmonicOsc.type = 'square';
					harmonicOsc.frequency.setValueAtTime(340, t0);
					harmonicOsc.frequency.linearRampToValueAtTime(195, t0 + 0.11);
					harmonicOsc.frequency.linearRampToValueAtTime(290, t0 + 0.2);
					harmonicOsc.frequency.exponentialRampToValueAtTime(135, t0 + 0.31);

					buzzFilter.type = 'lowpass';
					buzzFilter.frequency.setValueAtTime(1650, t0);

					buzzGain.gain.setValueAtTime(0.001, t0);
					buzzGain.gain.linearRampToValueAtTime(0.11, t0 + 0.015);
					buzzGain.gain.linearRampToValueAtTime(0.03, t0 + 0.09);
					buzzGain.gain.linearRampToValueAtTime(0.115, t0 + 0.15);
					buzzGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.33);

					motorOsc.connect(buzzFilter);
					harmonicOsc.connect(buzzFilter);
					buzzFilter.connect(buzzGain);
					buzzGain.connect(masterOut);
					motorOsc.start(t0);
					harmonicOsc.start(t0);
					motorOsc.stop(t0 + 0.35);
					harmonicOsc.stop(t0 + 0.35);

					// Clean magnetic tape settle clunk at recovery
					const settle = activeCtx.createOscillator();
					const settleGain = activeCtx.createGain();
					settle.type = 'triangle';
					settle.frequency.setValueAtTime(240, t0 + 0.29);
					settle.frequency.exponentialRampToValueAtTime(92, t0 + 0.34);
					settleGain.gain.setValueAtTime(0.001, t0 + 0.29);
					settleGain.gain.linearRampToValueAtTime(0.13, t0 + 0.296);
					settleGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.355);
					settle.connect(settleGain);
					settleGain.connect(masterOut);
					settle.start(t0 + 0.29);
					settle.stop(t0 + 0.365);
				} else if (
					presetId === 'chessMove' ||
					presetId === 'chessCapture' ||
					presetId === 'chessCastle' ||
					presetId === 'chessCheck'
				) {
					const triggerWoodTap = (at: number, intensity: number, pitchScale = 1) => {
						const safeAt = at + 0.008;
						const body = activeCtx.createOscillator();
						const bodyGain = activeCtx.createGain();
						body.type = 'triangle';
						body.frequency.setValueAtTime(260 * pitchScale, safeAt);
						body.frequency.exponentialRampToValueAtTime(125 * pitchScale, safeAt + 0.068);
						bodyGain.gain.setValueAtTime(0.001, safeAt);
						bodyGain.gain.linearRampToValueAtTime(0.18 * intensity, safeAt + 0.005);
						bodyGain.gain.exponentialRampToValueAtTime(0.0008, safeAt + 0.085);
						body.connect(bodyGain);
						bodyGain.connect(masterOut);
						body.start(safeAt);
						body.stop(safeAt + 0.095);

						const knock = activeCtx.createBufferSource();
						knock.buffer = getNoiseBuffer(activeCtx);
						const bp = activeCtx.createBiquadFilter();
						bp.type = 'bandpass';
						bp.frequency.setValueAtTime(1650 * pitchScale, safeAt);
						bp.Q.setValueAtTime(1.6, safeAt);
						const knockGain = activeCtx.createGain();
						knockGain.gain.setValueAtTime(0.001, safeAt);
						knockGain.gain.linearRampToValueAtTime(0.09 * intensity, safeAt + 0.003);
						knockGain.gain.exponentialRampToValueAtTime(0.0008, safeAt + 0.042);
						knock.connect(bp);
						bp.connect(knockGain);
						knockGain.connect(masterOut);
						knock.start(safeAt);
						knock.stop(safeAt + 0.048);
					};

					if (presetId === 'chessMove') {
						triggerWoodTap(t0, 0.95, 1);
					} else if (presetId === 'chessCapture') {
						triggerWoodTap(t0, 1.15, 1.15);
						const snap = activeCtx.createBufferSource();
						snap.buffer = getNoiseBuffer(activeCtx);
						const bp = activeCtx.createBiquadFilter();
						bp.type = 'bandpass';
						bp.frequency.setValueAtTime(1650, t0);
						bp.Q.setValueAtTime(1.4, t0);
						const snapGain = activeCtx.createGain();
						snapGain.gain.setValueAtTime(0.11, t0);
						snapGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.036);
						snap.connect(bp);
						bp.connect(snapGain);
						snapGain.connect(masterOut);
						snap.start(t0);
						snap.stop(t0 + 0.042);
					} else if (presetId === 'chessCastle') {
						triggerWoodTap(t0, 0.9, 1.05);
						triggerWoodTap(t0 + 0.085, 0.95, 0.94);
					} else {
						triggerWoodTap(t0, 1.05, 1.08);
						[880, 1174.66].forEach((freq, idx) => {
							const st = t0 + idx * 0.045;
							const ping = activeCtx.createOscillator();
							const pingGain = activeCtx.createGain();
							ping.type = 'triangle';
							ping.frequency.setValueAtTime(freq, st);
							pingGain.gain.setValueAtTime(0.001, st);
							pingGain.gain.linearRampToValueAtTime(0.125, st + 0.004);
							pingGain.gain.exponentialRampToValueAtTime(0.0008, st + 0.14);
							ping.connect(pingGain);
							pingGain.connect(masterOut);
							ping.start(st);
							ping.stop(st + 0.15);
						});
					}
				} else if (presetId === 'chessWin' || presetId === 'chessLose' || presetId === 'chessDraw') {
					const seq =
						presetId === 'chessWin'
							? [523.25, 659.25, 783.99, 1046.5]
							: presetId === 'chessLose'
								? [392.0, 349.23, 293.66, 220.0]
								: [523.25, 493.88];
					seq.forEach((freq, idx) => {
						const st = t0 + idx * 0.085;
						const osc = activeCtx.createOscillator();
						const gain = activeCtx.createGain();
						osc.type = presetId === 'chessLose' ? 'sine' : 'triangle';
						osc.frequency.setValueAtTime(freq, st);
						gain.gain.setValueAtTime(0.001, st);
						gain.gain.linearRampToValueAtTime(0.14, st + 0.006);
						gain.gain.exponentialRampToValueAtTime(0.0008, st + (idx === seq.length - 1 ? 0.34 : 0.14));
						osc.connect(gain);
						gain.connect(masterOut);
						osc.start(st);
						osc.stop(st + 0.36);
					});
				} else {
					// Crisp retro coin / level sparkle (B5 -> E6)
					[987.77, 1318.51].forEach((freq, idx) => {
						const start = t0 + idx * 0.068;
						const osc = activeCtx.createOscillator();
						const gain = activeCtx.createGain();
						osc.type = 'triangle';
						osc.frequency.setValueAtTime(freq, start);
						gain.gain.setValueAtTime(0.145, start);
						gain.gain.exponentialRampToValueAtTime(0.0008, start + (idx === 0 ? 0.09 : 0.24));
						osc.connect(gain);
						gain.connect(masterOut);
						osc.start(start);
						osc.stop(start + 0.25);
					});
				}
			});
		},
		[getMasterDestination, getNoiseBuffer, getOrUnlockAudioContext, runWithContext]
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
						? 0.34
						: spec.castleSide
							? 0.19
							: spec.isEnPassant
								? 0.14
								: 0.11;
					const endNotes =
						spec.terminal === 'win'
							? [523.25, 659.25, 783.99, 1046.5]
							: spec.terminal === 'lose'
								? [392.0, 349.23, 293.66, 220.0]
								: [523.25, 493.88];
					endNotes.forEach((freq, idx) => {
						const isLast = idx === endNotes.length - 1;
						playSoftTone(
							t0 + endDelay + idx * 0.085,
							freq,
							isLast ? 0.34 : 0.14,
							0.115,
							spec.terminal === 'lose' ? 'sine' : 'triangle',
							2400
						);
					});
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
				const masterOut = getMasterDestination(activeCtx);
				const lp = activeCtx.createBiquadFilter();
				lp.type = 'lowpass';
				lp.frequency.setValueAtTime(2100, t0);
				lp.connect(masterOut);

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
		[getMasterDestination, getOrUnlockAudioContext, runWithContext]
	);

	const setSoundEnabled = useCallback(
		(next: boolean) => {
			enabledRef.current = next;
			setSoundEnabledState(next);
			if (next) {
				// Crisp 2-step ascending chime = SFX enabled
				playToggleCue([523.25, 783.99], 'triangle', 0.145, 0.05);
			} else {
				// Soft 2-step descending mute drop = SFX muted
				playToggleCue([440.0, 261.63], 'sine', 0.14, 0.055);
			}
		},
		[playToggleCue]
	);

	const toggleSound = useCallback(() => {
		setSoundEnabled(!enabledRef.current);
	}, [setSoundEnabled]);

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

		const handleMouseOver = (e: MouseEvent) => {
			if (!enabledRef.current) return;
			const target = (e.target as HTMLElement | null)?.closest(
				'button, a, select, input[type="range"], [role="button"]'
			) as HTMLElement | null;
			if (!target) return;
			if (target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') {
				return;
			}
			if (e.relatedTarget instanceof Node && target.contains(e.relatedTarget)) {
				return;
			}
			playHover();
		};

		const handleDocumentClick = (e: MouseEvent) => {
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
			playClick();
		};

		window.addEventListener('pointerdown', unlockOnce, { passive: true, capture: true });
		window.addEventListener('mousedown', unlockOnce, { passive: true, capture: true });
		window.addEventListener('click', unlockOnce, { passive: true, capture: true });
		window.addEventListener('touchend', unlockOnce, { passive: true, capture: true });
		window.addEventListener('keydown', unlockOnce, { passive: true, capture: true });
		document.addEventListener('mouseover', handleMouseOver, true);
		document.addEventListener('click', handleDocumentClick, true);

		return () => {
			window.removeEventListener('pointerdown', unlockOnce, { capture: true });
			window.removeEventListener('mousedown', unlockOnce, { capture: true });
			window.removeEventListener('click', unlockOnce, { capture: true });
			window.removeEventListener('touchend', unlockOnce, { capture: true });
			window.removeEventListener('keydown', unlockOnce, { capture: true });
			document.removeEventListener('mouseover', handleMouseOver, true);
			document.removeEventListener('click', handleDocumentClick, true);
		};
	}, [getOrUnlockAudioContext, playClick, playHover, playPreset]);

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
				playToggleCue(cue.notes, 'sine', cue.gain, cue.step);
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
		setBgmLevel(NEXT_BGM_LEVEL[bgmLevelRef.current]);
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
				playMeme,
				preloadMemes,
				playCountdownCue,
			}}
		>
			{children}
		</SoundContext.Provider>
	);
}
