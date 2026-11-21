import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import TitleHeader from '../components/TitleHeader';
import { AudioIcon, ChessIcon, LayersIcon } from '../components/Icons';
import { useLanguage } from '../context/useLanguage';
import { useSound, type MemePadId } from '../context/useSound';
import { WORKFLOW_STEPS, type CraftLabTab } from '../data/portfolioData';

const VisualDiffStudio = lazy(() => import('../components/VisualDiffStudio'));
const ChessGame = lazy(() => import('../components/chess/ChessGame'));

type GamePhase = 'free' | 'ready' | 'playing_seq' | 'awaiting_input' | 'level_clear' | 'gameover';

interface BlueprintProcessSectionProps {
	activeTab?: CraftLabTab;
	onTabChange?: (tab: CraftLabTab) => void;
}

const BEST_LEVEL_STORAGE_KEY = 'kris_foley_memory_best_lvl';

function loadBestLevel(): number {
	try {
		const raw = window.localStorage.getItem(BEST_LEVEL_STORAGE_KEY);
		const parsed = raw ? Number.parseInt(raw, 10) : 0;
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
	} catch {
		return 0;
	}
}

interface SoundPad {
	id: MemePadId;
	keyNum: string;
	faceHex: string;
	wallHex: string;
	glowRgb: string;
	isDarkFace?: boolean;
	title: string;
	sub: { en: string; id: string };
	memeImg: string;
}

const SOUND_PADS: SoundPad[] = [
	{
		id: 'faah',
		keyNum: '01',
		faceHex: '#FD6141',
		wallHex: '#A6270E',
		glowRgb: '253, 97, 65',
		title: 'FAAAH!',
		sub: { en: 'Viral Scream', id: 'Teriakan Viral' },
		memeImg: '/images/memes/faah.webp',
	},
	{
		id: 'oof',
		keyNum: '02',
		faceHex: '#FFD426',
		wallHex: '#B38800',
		glowRgb: '255, 212, 38',
		title: 'OOF!',
		sub: { en: 'Roblox Oof', id: 'Roblox Oof' },
		memeImg: '/images/memes/oof.webp',
	},
	{
		id: 'wow',
		keyNum: '03',
		faceHex: '#5CE62E',
		wallHex: '#209008',
		glowRgb: '92, 230, 46',
		title: 'WOOOW!',
		sub: { en: 'Anime Wow', id: 'Anime Wow' },
		memeImg: '/images/memes/wow.webp',
	},
	{
		id: 'bruh',
		keyNum: '04',
		faceHex: '#F6EDD6',
		wallHex: '#9C8F70',
		glowRgb: '252, 240, 211',
		title: 'BRUH!',
		sub: { en: 'Deadpan Meme', id: 'Reaksi Datar' },
		memeImg: '/images/memes/bruh.webp',
	},
	{
		id: 'omg',
		keyNum: '05',
		faceHex: '#56ACEE',
		wallHex: '#1B5E99',
		glowRgb: '77, 157, 224',
		title: 'OH MY GOD!',
		sub: { en: 'Shock Hype', id: 'Kaget Viral' },
		memeImg: '/images/memes/omg.webp',
	},
	{
		id: 'yay',
		keyNum: '06',
		faceHex: '#FCAE1F',
		wallHex: '#AB6800',
		glowRgb: '252, 174, 31',
		title: 'YAY!',
		sub: { en: 'Kids Cheer', id: 'Sorak Hore' },
		memeImg: '/images/memes/yay.webp',
	},
	{
		id: 'okay',
		keyNum: '07',
		faceHex: '#FFE7BF',
		wallHex: '#AD8E5E',
		glowRgb: '252, 240, 211',
		title: 'OKAY',
		sub: { en: 'Awkward Okay', id: 'Reaksi Okay' },
		memeImg: '/images/memes/okay.webp',
	},
	{
		id: 'god',
		keyNum: '08',
		faceHex: '#C91878',
		wallHex: '#730641',
		glowRgb: '201, 24, 120',
		isDarkFace: true,
		title: 'GOD!!',
		sub: { en: 'Dramatic Scream', id: 'Teriakan Dramatis' },
		memeImg: '/images/memes/god.webp',
	},
];

function pickRandomPadId(): MemePadId {
	const index = Math.floor(Math.random() * SOUND_PADS.length);
	return SOUND_PADS[index].id;
}

const BlueprintProcessSection = ({
	activeTab: controlledTab,
	onTabChange,
}: BlueprintProcessSectionProps = {}) => {
	const { t } = useLanguage();
	const { playPreset, playMeme, preloadMemes, playCountdownCue } = useSound();
	const [internalTab, setInternalTab] = useState<CraftLabTab>('compare');
	const activeTab = controlledTab ?? internalTab;
	const [hasOpenedChess, setHasOpenedChess] = useState<boolean>(activeTab === 'chess');
	const [pressedPadId, setPressedPadId] = useState<MemePadId | null>(null);
	const [tapCount, setTapCount] = useState<number>(0);

	// Meme SFX Memory Challenge state
	const [gamePhase, setGamePhase] = useState<GamePhase>('free');
	const [sequence, setSequence] = useState<MemePadId[]>([]);
	const [playerIndex, setPlayerIndex] = useState<number>(0);
	const [level, setLevel] = useState<number>(1);
	const [bestLevel, setBestLevel] = useState<number>(() => loadBestLevel());
	const [readyCount, setReadyCount] = useState<number>(3);
	const [readyIsNextLevel, setReadyIsNextLevel] = useState<boolean>(false);
	const [demoLitPadId, setDemoLitPadId] = useState<MemePadId | null>(null);
	const [demoStepNum, setDemoStepNum] = useState<number | null>(null);
	const [wrongPadId, setWrongPadId] = useState<MemePadId | null>(null);
	const [expectedPadId, setExpectedPadId] = useState<MemePadId | null>(null);

	const timeoutsRef = useRef<number[]>([]);
	const pressTokenRef = useRef(0);

	const clearAllTimers = () => {
		timeoutsRef.current.forEach((id) => window.clearTimeout(id));
		timeoutsRef.current = [];
	};

	const switchCraftTab = (nextTab: CraftLabTab) => {
		if (nextTab !== 'sfx') {
			clearAllTimers();
			setDemoLitPadId(null);
			setDemoStepNum(null);
			setGamePhase('free');
		}
		if (nextTab === 'chess') {
			setHasOpenedChess(true);
		}
		if (onTabChange) {
			onTabChange(nextTab);
		} else {
			setInternalTab(nextTab);
		}
	};

	useEffect(() => {
		if (activeTab === 'sfx') {
			preloadMemes();
			return;
		}
		if (activeTab === 'chess') {
			setHasOpenedChess(true);
		}
		clearAllTimers();
		setDemoLitPadId(null);
		setDemoStepNum(null);
		setGamePhase('free');
	}, [activeTab, preloadMemes]);

	const scheduleTimeout = (fn: () => void, ms: number) => {
		const id = window.setTimeout(() => {
			timeoutsRef.current = timeoutsRef.current.filter((item) => item !== id);
			fn();
		}, ms);
		timeoutsRef.current.push(id);
	};

	useEffect(() => {
		return () => {
			timeoutsRef.current.forEach((id) => window.clearTimeout(id));
			timeoutsRef.current = [];
		};
	}, []);

	const playSequenceStepByStep = (nextSeq: MemePadId[]) => {
		clearAllTimers();
		setGamePhase('playing_seq');
		setPlayerIndex(0);
		setWrongPadId(null);
		setExpectedPadId(null);
		setDemoLitPadId(null);
		setDemoStepNum(null);

		const initialDelay = 280;
		const stepInterval = 860;
		nextSeq.forEach((padId, idx) => {
			const stepNum = idx + 1;
			scheduleTimeout(() => {
				playMeme(padId);
				setDemoLitPadId(padId);
				setDemoStepNum(stepNum);
				setPressedPadId(padId);
				scheduleTimeout(() => {
					setDemoLitPadId((curr) => (curr === padId ? null : curr));
					setDemoStepNum((curr) => (curr === stepNum ? null : curr));
					setPressedPadId((curr) => (curr === padId ? null : curr));
				}, 520);
			}, initialDelay + idx * stepInterval);
		});

		scheduleTimeout(() => {
			setDemoLitPadId(null);
			setDemoStepNum(null);
			setPressedPadId(null);
			setGamePhase('awaiting_input');
		}, initialDelay + nextSeq.length * stepInterval);
	};

	const beginRoundWithCountdown = (
		targetLevel: number,
		nextSeq: MemePadId[],
		isNextLevel: boolean
	) => {
		clearAllTimers();
		setLevel(targetLevel);
		setSequence(nextSeq);
		setPlayerIndex(0);
		setWrongPadId(null);
		setExpectedPadId(null);
		setDemoLitPadId(null);
		setDemoStepNum(null);
		setPressedPadId(null);
		setReadyIsNextLevel(isNextLevel);
		setGamePhase('ready');
		setReadyCount(3);
		playCountdownCue(false);

		scheduleTimeout(() => {
			setReadyCount(2);
			playCountdownCue(false);
		}, 520);

		scheduleTimeout(() => {
			setReadyCount(1);
			playCountdownCue(false);
		}, 1040);

		scheduleTimeout(() => {
			setReadyCount(0);
			playCountdownCue(true);
		}, 1560);

		scheduleTimeout(() => {
			playSequenceStepByStep(nextSeq);
		}, 1960);
	};

	const startFoleyGame = () => {
		const starterSeq: MemePadId[] = [pickRandomPadId(), pickRandomPadId()];
		beginRoundWithCountdown(1, starterSeq, false);
	};

	const exitToFreeMode = () => {
		clearAllTimers();
		setDemoLitPadId(null);
		setDemoStepNum(null);
		setPressedPadId(null);
		setWrongPadId(null);
		setExpectedPadId(null);
		setGamePhase('free');
	};

	const triggerPad = (padId: MemePadId) => {
		if (gamePhase === 'ready' || gamePhase === 'playing_seq' || gamePhase === 'level_clear') {
			return;
		}

		playMeme(padId);
		const token = pressTokenRef.current + 1;
		pressTokenRef.current = token;
		setPressedPadId(padId);
		setTapCount((c) => c + 1);
		scheduleTimeout(() => {
			if (pressTokenRef.current === token) {
				setPressedPadId(null);
			}
		}, 220);

		if (gamePhase !== 'awaiting_input') {
			return;
		}

		const expected = sequence[playerIndex];
		if (padId !== expected) {
			setWrongPadId(padId);
			setExpectedPadId(expected);
			setGamePhase('gameover');
			scheduleTimeout(() => {
				playPreset('retroFail');
			}, 160);
			return;
		}

		const nextIdx = playerIndex + 1;
		setPlayerIndex(nextIdx);

		if (nextIdx >= sequence.length) {
			setGamePhase('level_clear');
			if (level > bestLevel) {
				setBestLevel(level);
				try {
					window.localStorage.setItem(BEST_LEVEL_STORAGE_KEY, String(level));
				} catch {
					// Ignore storage errors in restricted browsing contexts
				}
			}

			scheduleTimeout(() => {
				playPreset('coin');
			}, 220);

			const nextLevel = level + 1;
			const nextSequence = [...sequence, pickRandomPadId()];
			scheduleTimeout(() => {
				beginRoundWithCountdown(nextLevel, nextSequence, true);
			}, 950);
		}
	};

	const playMiniSequence = () => {
		clearAllTimers();
		setGamePhase('free');
		const seq: MemePadId[] = ['oof', 'bruh', 'omg', 'faah'];
		seq.forEach((id, i) => {
			scheduleTimeout(() => {
				playMeme(id);
				setDemoLitPadId(id);
				setPressedPadId(id);
				setTapCount((c) => c + 1);
				scheduleTimeout(() => {
					setDemoLitPadId((curr) => (curr === id ? null : curr));
					setPressedPadId((curr) => (curr === id ? null : curr));
				}, 420);
			}, i * 740);
		});
	};

	return (
		<section
			id='blueprint'
			className='substrate-legal-pad relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-24'
		>
			<div className='max-w-7xl mx-auto px-5 sm:pl-16 md:px-14'>
				<TitleHeader
					figCode='FIG.02'
					sub={t({
						en: 'PRODUCTION PROCESS',
						id: 'PROSES PRODUKSI',
					})}
					title={t({
						en: 'Where Film Craft Meets Editing, Code & Sound',
						id: 'Perpaduan Seni Film, Editing, Kode & Tata Suara',
					})}
					badgeColor='yellow'
					description={t({
						en: 'From fact-checked storytelling and code-based animation (Video-as-Code) to Premiere/AE editing and clean voice-first mixing.',
						id: 'Dari riset naskah terverifikasi dan animasi berbasis kode (Video-as-Code) hingga editing Premiere/AE dan mixing audio jernih.',
					})}
				/>

				{/* 4 Signature Ligne-Claire Workflow Cards with Tilted Canary Drafting Tape */}
				<div className='mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{WORKFLOW_STEPS.map((item) => (
						<article
							key={item.step}
							className='relative ds-panel-paper rounded-md p-6 pt-8 flex flex-col justify-between gap-4'
						>
							<div
								className='absolute -top-3 left-5 px-2.5 py-0.5 bg-[#FFD426] border-2 border-[#050505] font-mono text-[11px] font-black text-[#050505] -rotate-2 shadow-[2px_2px_0_#050505] select-none'
								aria-hidden='true'
							>
								STEP {item.step}
							</div>

							<div className='space-y-2.5'>
								<p className='font-mono text-[10px] font-black uppercase tracking-wider text-[#3886C0] select-none'>
									{t(item.tag)}
								</p>
								<h3 className='font-display font-black text-lg text-[#050505] leading-snug'>
									{t(item.title)}
								</h3>
								<p className='text-sm text-[#3B404C] leading-relaxed'>
									{t(item.desc)}
								</p>
							</div>
						</article>
					))}
				</div>

				{/* Style D Retro OS Interactive Craft Lab Window with Iconic Canary Chrome */}
				<div id='craft-lab' className='mt-14 ds-os-window rounded-md overflow-hidden scroll-mt-24'>
					<div className='flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 bg-[#FFD426] border-b-[3px] border-[#050505]'>
						<div className='flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1'>
							<span className='size-5 rounded-[3px] border-2 border-[#050505] bg-[#FD6141] inline-flex items-center justify-center font-mono text-[10px] font-black text-[#050505] shrink-0'>
								⚙
							</span>
							<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] text-[#FFD426] font-mono text-xs font-bold shrink-0'>
								CRAFT_LAB.EXE
							</span>
							<p className='font-display font-black text-sm sm:text-base text-[#050505] leading-snug truncate'>
								{t({
									en: 'Craft Lab — Inspect Code, Visuals & Play',
									id: 'Lab Kreatif — Uji Kode, Visual & Main',
								})}
							</p>
							<div className='hidden xl:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
						</div>

						<span className='px-2.5 py-0.5 rounded-[2px] bg-[#FCF0D3] border-[1.5px] border-[#050505] font-mono text-[10px] font-black text-[#050505] uppercase tracking-wider shrink-0 select-none'>
							{t({ en: '3 INTERACTIVE MODES', id: '3 MODE INTERAKTIF' })}
						</span>
					</div>

					{/* Unified Calm Inactive Tabs (Tactile Shadow) + Bold Signature Active State */}
					<div
						role='tablist'
						aria-label={t({ en: 'Craft Lab Interactive Modes', id: 'Pilihan Mode Lab Kreatif' })}
						className='grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#F6EDD6] border-b-[3px] border-[#050505]'
					>
						{/* Mode 1: Visual Before / After */}
						<button
							type='button'
							role='tab'
							data-sfx='paper'
							aria-selected={activeTab === 'compare'}
							aria-pressed={activeTab === 'compare'}
							onClick={() => switchCraftTab('compare')}
							className={`group text-left rounded-md border-2 border-[#050505] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
								activeTab === 'compare'
									? 'bg-[#3886C0] text-white shadow-[4px_4px_0_#050505]'
									: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FCF0D3]'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className='size-9 rounded border-[1.5px] border-[#050505] flex items-center justify-center shrink-0'
									style={{
										background: 'linear-gradient(90deg, #161B26 50%, #4D9DE0 50%)',
									}}
									aria-hidden='true'
								>
									<LayersIcon className='size-4 text-[#FCF0D3] drop-shadow-[0_1px_1px_#050505]' />
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Before / After Studio', id: 'Before / After Studio' })}
									</p>
									<p
										className={`font-mono text-[10px] font-bold leading-snug mt-0.5 ${
											activeTab === 'compare' ? 'text-white/90' : 'text-[#3B404C]'
										}`}
									>
										{t({ en: 'Split Inspector · 3 Demos', id: 'Geser Layar · 3 Demo' })}
									</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-[3px] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'compare'
										? 'border border-[#050505] bg-[#FFD426] text-[#050505]'
										: 'bg-[#F6EDD6] text-[#3B404C]'
								}`}
							>
								{activeTab === 'compare'
									? t({ en: 'ACTIVE', id: 'AKTIF' })
									: 'SPLIT'}
							</span>
						</button>

						{/* Mode 2: Chess vs Kris */}
						<button
							type='button'
							role='tab'
							data-sfx='chess-tab'
							aria-selected={activeTab === 'chess'}
							aria-pressed={activeTab === 'chess'}
							onClick={() => switchCraftTab('chess')}
							className={`group text-left rounded-md border-2 border-[#050505] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
								activeTab === 'chess'
									? 'bg-[#5CE62E] text-[#050505] shadow-[4px_4px_0_#050505]'
									: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FCF0D3]'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className='size-9 rounded border-[1.5px] border-[#050505] flex items-center justify-center shrink-0'
									style={{
										backgroundImage:
											'conic-gradient(#39754F 90deg, #F6EDD6 90deg 180deg, #39754F 180deg 270deg, #F6EDD6 270deg)',
									}}
									aria-hidden='true'
								>
									<span className='size-5 rounded-[2px] bg-[#FCF0D3]/95 border border-[#050505] flex items-center justify-center'>
										<ChessIcon className='size-3.5 text-[#163824]' />
									</span>
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Chess vs Kris (1000–1900)', id: 'Catur vs Kris (1000–1900)' })}
									</p>
									<p className='font-mono text-[10px] font-bold text-[#3B404C] leading-snug mt-0.5'>
										{t({ en: 'Playable AI · 3 Elo Tiers', id: 'Lawan AI · 3 Level Elo' })}
									</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-[3px] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'chess'
										? 'border border-[#050505] bg-[#050505] text-[#5CE62E]'
										: 'bg-[#F6EDD6] text-[#1D3E2B]'
								}`}
							>
								{activeTab === 'chess'
									? t({ en: 'ACTIVE', id: 'AKTIF' })
									: t({ en: 'PLAY ♟', id: 'MAIN ♟' })}
							</span>
						</button>

						{/* Mode 3: Meme SFX Game */}
						<button
							type='button'
							role='tab'
							data-sfx='sfx-tab'
							aria-selected={activeTab === 'sfx'}
							aria-pressed={activeTab === 'sfx'}
							onClick={() => switchCraftTab('sfx')}
							className={`group text-left rounded-md border-2 border-[#050505] border-b-[4px] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
								activeTab === 'sfx'
									? 'bg-[#FD6141] text-[#050505] shadow-[4px_4px_0_#050505]'
									: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FCF0D3]'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className={`size-9 rounded border-[1.5px] border-[#050505] flex items-center justify-center shrink-0 ${
										activeTab === 'sfx' ? 'bg-[#FCF0D3]' : 'bg-[#FD6141]'
									}`}
									aria-hidden='true'
								>
									<AudioIcon className='size-4 text-[#050505]' />
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Meme SFX Game', id: 'Game Meme SFX' })}
									</p>
									<p
										className={`font-mono text-[10px] font-bold leading-snug mt-0.5 ${
											activeTab === 'sfx' ? 'text-[#050505]/90' : 'text-[#3B404C]'
										}`}
									>
										{t({ en: '8 Sound Pads · Memory Game', id: '8 Pad Suara · Game Memori' })}
									</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-[3px] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'sfx'
										? 'border border-[#050505] bg-[#050505] text-[#FFD426]'
										: 'bg-[#F6EDD6] text-[#3B404C]'
								}`}
							>
								{activeTab === 'sfx'
									? t({ en: 'ACTIVE', id: 'AKTIF' })
									: t({ en: '8 PADS', id: '8 PAD' })}
							</span>
						</button>
					</div>

					{/* TAB 1: Interactive Multi-Scene Before / After Studio Inspector */}
					{activeTab === 'compare' && (
						<Suspense
							fallback={
								<div className='bg-[#FCF0D3] p-10 sm:p-14 flex flex-col items-center justify-center gap-2 font-mono text-xs min-h-[360px]'>
									<span className='inline-block px-2.5 py-0.5 bg-[#050505] text-[#FFD426] font-black'>
										CRAFT_LAB.EXE
									</span>
									<p className='font-bold text-[#050505]'>
										{t({
											en: 'Loading Before / After Studio inspector...',
											id: 'Memuat inspektor Before / After Studio...',
										})}
									</p>
								</div>
							}
						>
							<VisualDiffStudio />
						</Suspense>
					)}

					{/* TAB 2: Lazy-Loaded 15:00 Rapid Chess vs Unc Kris (1900), Teen Kris (1500) & Lil' Kris (1000) */}
					{hasOpenedChess && (
						<div className={activeTab === 'chess' ? '' : 'hidden'}>
							<Suspense
								fallback={
									<div className='substrate-blue-mat p-10 sm:p-14 flex flex-col items-center justify-center gap-2.5 font-mono text-xs'>
										<div className='ds-os-window rounded-sm px-5 py-4 bg-[#FCF0D3] text-[#050505] text-center space-y-2'>
											<span className='inline-block px-2.5 py-0.5 bg-[#050505] text-[#FFD426] font-black'>
												KRIS_CHESS.EXE
											</span>
											<p className='font-bold text-[#050505]'>
												{t({
													en: 'Loading chessboard & 1900/1500/1000 Elo engine...',
													id: 'Memuat papan catur & engine 1900/1500/1000 Elo...',
												})}
											</p>
										</div>
									</div>
								}
							>
								<ChessGame isActive={activeTab === 'chess'} />
							</Suspense>
						</div>
					)}

					{/* TAB 3: High-Contrast Digital Spaghetti Sampler Deck (MEME-808) */}
					{activeTab === 'sfx' && (
						<div className='substrate-studio-slate p-2.5 sm:p-5 lg:p-6 text-[#050505]'>
							{(() => {
								const isGameRunning =
									gamePhase === 'ready' ||
									gamePhase === 'playing_seq' ||
									gamePhase === 'awaiting_input' ||
									gamePhase === 'level_clear';
								const isLockedInput =
									gamePhase === 'ready' ||
									gamePhase === 'playing_seq' ||
									gamePhase === 'level_clear';
								const isAnyPadActive = Boolean(pressedPadId || demoLitPadId);
								const expectedPad = SOUND_PADS.find((p) => p.id === expectedPadId);
								const targetKeyNum = expectedPad?.keyNum ?? '??';
								const targetLabel = expectedPad?.title ?? '';

								const vuBars = [
									{ idle: 'h-1.5', peak: 'h-3.5', color: '#5CE62E' },
									{ idle: 'h-2.5', peak: 'h-4', color: '#5CE62E' },
									{ idle: 'h-2', peak: 'h-5', color: '#FFD426' },
									{ idle: 'h-1.5', peak: 'h-4.5', color: '#FCAE1F' },
									{ idle: 'h-1', peak: 'h-3.5', color: '#FD6141' },
								] as const;

								const lcdPhaseClass =
									gamePhase === 'ready' || gamePhase === 'playing_seq'
										? 'bg-[#FFD426] text-[#050505]'
										: gamePhase === 'level_clear'
											? 'bg-[#5CE62E] text-[#050505]'
											: gamePhase === 'gameover'
												? 'bg-[#FD6141] text-[#050505]'
												: gamePhase === 'awaiting_input'
													? 'bg-[#1A2636] text-[#FFFFFF]'
													: 'bg-[#1A2636] text-[#FCF0D3]';

								const deckStripClass =
									gamePhase === 'ready' || gamePhase === 'playing_seq'
										? 'bg-[#FFD426] text-[#050505]'
										: gamePhase === 'awaiting_input' || gamePhase === 'level_clear'
											? 'bg-[#5CE62E] text-[#050505]'
											: gamePhase === 'gameover'
												? 'bg-[#FD6141] text-[#050505]'
												: 'bg-[#202736] text-[#FCF0D3]';

								const padWellRingClass =
									gamePhase === 'playing_seq'
										? 'ring-inset ring-[3px] ring-[#FFD426]'
										: gamePhase === 'awaiting_input'
											? 'ring-inset ring-[3px] ring-[#5CE62E]'
											: gamePhase === 'gameover'
												? 'ring-inset ring-[3px] ring-[#FD6141]'
												: '';

								return (
									<div className='relative rounded-xl border-[3px] border-[#050505] bg-[#FCF0D3] shadow-[7px_7px_0_#050505] overflow-hidden'>
										{/* Top Hardware Control Faceplate */}
										<div className='relative bg-[#FFE7BF] border-b-[3px] border-[#050505] p-3 sm:p-4 space-y-3'>
											{/* Top Corner Screw Rivets (hidden on narrow mobile) */}
											<span
												aria-hidden='true'
												className='hidden sm:flex items-center justify-center absolute top-2 left-2 size-2.5 rounded-full bg-[#F6EDD6] border-[1.5px] border-[#050505]'
											>
												<span className='w-1.5 h-[1.5px] bg-[#050505] rotate-45' />
											</span>
											<span
												aria-hidden='true'
												className='hidden sm:flex items-center justify-center absolute top-2 right-2 size-2.5 rounded-full bg-[#F6EDD6] border-[1.5px] border-[#050505]'
											>
												<span className='w-1.5 h-[1.5px] bg-[#050505] -rotate-45' />
											</span>

											{/* Row 1: Model Badge + Title + 5-Bar Analog VU Meter | Recessed 3-Bay Mechanical Counter */}
											<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:px-3'>
												<div className='flex items-center gap-2 sm:gap-2.5 min-w-0'>
													<span className='inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-[#050505] text-[#FFD426] font-mono text-[9.5px] sm:text-[10px] font-black tracking-wider shrink-0'>
														MEME-808
													</span>
													<h3 className='font-display font-black text-base sm:text-xl text-[#050505] leading-tight whitespace-nowrap'>
														{t({
															en: 'Meme SFX Game',
															id: 'Game Meme SFX',
														})}
													</h3>

													{/* 5-Bar Stepped Analog VU Meter */}
													<div
														aria-hidden='true'
														className='inline-flex items-end gap-[2px] h-5 px-1.5 py-0.5 rounded-[4px] border-[1.5px] border-[#050505] bg-[#121212] shrink-0'
													>
														{vuBars.map((bar, idx) => (
															<span
																key={idx}
																className={`w-1.5 rounded-[1px] border border-[#050505] transition-all duration-100 ${
																	isAnyPadActive ? bar.peak : bar.idle
																}`}
																style={{ backgroundColor: bar.color }}
															/>
														))}
													</div>
												</div>

												{/* Unified Recessed 3-Bay Mechanical Counter Housing */}
												<div className='inline-flex items-stretch rounded-md border-[2.5px] border-[#050505] bg-[#121212] shadow-[3px_3px_0_#050505] overflow-hidden divide-x-2 divide-[#050505] select-none shrink-0 self-start sm:self-auto tabular-nums font-mono text-[10.5px] sm:text-xs font-black'>
													<span
														className={`min-w-[4.6rem] h-7 px-2 flex items-center justify-center transition-colors ${
															isGameRunning
																? 'bg-[#FFD426] text-[#050505]'
																: 'bg-[#181D27] text-[#FCF0D3]/65'
														}`}
													>
														{isGameRunning ? `LVL ${level}` : 'LVL --'}
													</span>
													<span className='h-7 px-2.5 flex items-center justify-center bg-[#181D27] text-[#FFD426]'>
														BEST: {bestLevel}
													</span>
													<span className='h-7 px-2.5 flex items-center justify-center bg-[#181D27] text-[#5CE62E]'>
														TAP: {tapCount}
													</span>
												</div>
											</div>

											{/* Row 2: Mechanical Transport Keys + Recessed Retro LCD Monitor */}
											<div className='flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3 sm:px-3'>
												<div className='grid grid-cols-2 gap-2 w-full md:w-[270px] lg:w-[290px] h-[44px] shrink-0'>
													{isGameRunning ? (
														<button
															type='button'
															data-sfx='close'
															onClick={exitToFreeMode}
															className='col-span-2 h-[44px] px-4 rounded-lg bg-[#FD6141] hover:bg-[#FFD426] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_4px_0_#050505] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none transition-all'
														>
															{t({ en: '✕ STOP · FREE PAD', id: '✕ STOP · MODE BEBAS' })}
														</button>
													) : (
														<>
															<button
																type='button'
																data-sfx='sfx-tab'
																onClick={playMiniSequence}
																className='h-[44px] px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#FFD426] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_4px_0_#050505] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none transition-all'
															>
																♪ DEMO
															</button>
															<button
																type='button'
																data-sfx='keycap'
																onClick={startFoleyGame}
																className='h-[44px] px-3 rounded-lg bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_4px_0_#050505] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none transition-all'
															>
																{gamePhase === 'gameover'
																	? t({ en: '↻ PLAY AGAIN', id: '↻ MAIN LAGI' })
																	: t({ en: '▶ PLAY GAME', id: '▶ MAIN GAME' })}
															</button>
														</>
													)}
												</div>

												{/* Recessed Retro LCD Monitor */}
												<div
													className={`flex-1 min-w-0 h-[44px] sm:h-[46px] rounded-lg border-[2.5px] border-[#050505] px-2.5 sm:px-3 flex flex-nowrap items-center justify-between gap-2 overflow-hidden font-mono text-xs shadow-[inset_0_3px_0_rgba(0,0,0,0.22)] ${lcdPhaseClass}`}
													style={{
														backgroundImage:
															'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(5,5,5,0.06) 3px, rgba(5,5,5,0.06) 4px)',
													}}
												>
													<div className='flex items-center gap-2 min-w-0 flex-1 overflow-hidden'>
														{gamePhase === 'free' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#5CE62E] text-[#050505] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	{t({ en: '● FREE', id: '● BEBAS' })}
																</span>
																<span className='font-bold text-[11px] sm:text-xs truncate min-w-0'>
																	{t({
																		en: 'Tap any meme pad or press Play Game',
																		id: 'Tap pad meme atau tekan Main Game',
																	})}
																</span>
															</>
														)}

														{gamePhase === 'ready' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#050505] text-[#FFD426] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	{t({
																		en: `READY · LVL ${level}`,
																		id: `SIAP · LVL ${level}`,
																	})}
																</span>
																<span className='font-black text-[11px] sm:text-xs truncate min-w-0'>
																	{readyIsNextLevel
																		? t({
																				en: 'Next level starting soon...',
																				id: 'Naik level! Bersiap...',
																			})
																		: t({
																				en: 'Watch sequence after countdown...',
																				id: 'Perhatikan urutan setelah hitungan...',
																			})}
																</span>
															</>
														)}

														{gamePhase === 'playing_seq' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#050505] text-[#FFD426] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	{t({ en: 'WATCH', id: 'SIMAK' })}
																</span>
																<span className='font-black text-[11px] sm:text-xs truncate min-w-0'>
																	{t({
																		en: `Lvl ${level} · Memorize ${sequence.length} sounds`,
																		id: `Lvl ${level} · Hafalkan ${sequence.length} suara`,
																	})}
																</span>
															</>
														)}

														{gamePhase === 'awaiting_input' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#5CE62E] text-[#050505] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	{t({ en: 'YOUR TURN', id: 'GILIRANMU' })}
																</span>
																<span className='font-bold text-[11px] sm:text-xs tabular-nums truncate min-w-0'>
																	{playerIndex}/{sequence.length}
																	{level >= 4 ? ' · STREAK!' : ''}
																</span>
															</>
														)}

														{gamePhase === 'level_clear' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#050505] text-[#5CE62E] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	★ LVL {level} CLEAR!
																</span>
																<span className='font-black text-[11px] sm:text-xs truncate min-w-0'>
																	{t({
																		en: `Awesome! Level ${level + 1} next...`,
																		id: `Mantap! Lanjut Level ${level + 1}...`,
																	})}
																</span>
															</>
														)}

														{gamePhase === 'gameover' && (
															<>
																<span className='inline-flex items-center h-6 px-2 rounded-[4px] bg-[#050505] text-[#FFD426] border border-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
																	{t({ en: 'MISSED', id: 'SALAH' })}
																</span>
																<span className='font-black text-[11px] sm:text-xs truncate min-w-0'>
																	{t({
																		en: `Target: ${targetKeyNum} (${targetLabel})`,
																		id: `Harusnya: ${targetKeyNum} (${targetLabel})`,
																	})}
																</span>
															</>
														)}
													</div>

													<div className='h-7 flex items-center justify-end shrink-0'>
														{gamePhase === 'ready' ? (
															<span className='inline-flex items-center justify-center h-7 min-w-[3.25rem] px-2 rounded-[4px] bg-[#FFFFFF] text-[#050505] border-2 border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap animate-pulse'>
																{readyCount === 0
																	? t({ en: 'GO!', id: 'MULAI!' })
																	: readyCount}
															</span>
														) : (
															sequence.length > 0 &&
															gamePhase !== 'free' && (
																<div
																	className={`flex flex-nowrap items-center justify-end ${
																		sequence.length > 7 ? 'gap-[3px]' : 'gap-1'
																	}`}
																	aria-hidden='true'
																>
																	{sequence.map((_, dotIdx) => (
																		<span
																			key={dotIdx}
																			className={`rounded-[2px] border shrink-0 ${
																				gamePhase === 'awaiting_input'
																					? 'border-[#FCF0D3]/60'
																					: 'border-[#050505]'
																			} ${
																				sequence.length > 7
																					? 'size-2 sm:size-2.5'
																					: 'size-2.5 sm:size-3'
																			} ${
																				dotIdx < playerIndex
																					? 'bg-[#5CE62E]'
																					: gamePhase === 'gameover' && dotIdx === playerIndex
																						? 'bg-[#FFD426]'
																						: 'bg-[#FCF0D3]/25'
																			}`}
																		/>
																	))}
																</div>
															)
														)}
													</div>
												</div>
											</div>
										</div>

										{/* Dedicated High-Contrast Phase Status Strip */}
										<div
											className={`px-3 py-2 border-b-2 border-[#050505] flex items-center justify-between gap-2 font-mono text-[10.5px] sm:text-xs font-black tracking-wide ${deckStripClass}`}
										>
											{gamePhase === 'free' && (
												<>
													<span className='truncate'>
														{t({
															en: '● FREE PAD MODE · TAP ANY BUTTON',
															id: '● MODE BEBAS · TEKAN TOMBOL MANA SAJA',
														})}
													</span>
													<span className='hidden sm:inline shrink-0 text-[#FCF0D3]/75 text-[10px]'>
														{t({
															en: 'PRESS PLAY GAME FOR CHALLENGE',
															id: 'TEKAN MAIN GAME UNTUK TANTANGAN',
														})}
													</span>
												</>
											)}

											{gamePhase === 'ready' && (
												<span className='truncate'>
													{t({
														en: `★ GAME STARTING · LEVEL ${level}`,
														id: `★ GAME DIMULAI · LEVEL ${level}`,
													})}
												</span>
											)}

											{gamePhase === 'playing_seq' && (
												<span className='truncate'>
													{t({
														en: `🔒 WATCH SEQUENCE · STEP ${demoStepNum ?? '…'}/${sequence.length}`,
														id: `🔒 SIMAK URUTAN · LANGKAH ${demoStepNum ?? '…'}/${sequence.length}`,
													})}
												</span>
											)}

											{gamePhase === 'awaiting_input' && (
												<span className='truncate'>
													{t({
														en: `▶ YOUR TURN! REPEAT PAD ${playerIndex + 1} OF ${sequence.length}`,
														id: `▶ GILIRANMU! TEKAN PAD KE-${playerIndex + 1} DARI ${sequence.length}`,
													})}
												</span>
											)}

											{gamePhase === 'level_clear' && (
												<span className='truncate'>
													{t({
														en: `★ LEVEL ${level} CLEAR! PREPARING LEVEL ${level + 1}...`,
														id: `★ LEVEL ${level} SELESAI! SIAP KE LEVEL ${level + 1}...`,
													})}
												</span>
											)}

											{gamePhase === 'gameover' && (
												<span className='truncate'>
													{t({
														en: `✕ MISSED! TARGET WAS ${targetKeyNum} (${targetLabel})`,
														id: `✕ SALAH! HARUSNYA ${targetKeyNum} (${targetLabel})`,
													})}
												</span>
											)}
										</div>

										{/* Recessed Dark Graphite Pad Well + Tactile 3D Mechanical Switch Cavities */}
										<div
											className={`relative p-2.5 sm:p-4 bg-[#161B24] ${padWellRingClass}`}
											style={{
												backgroundImage:
													'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
												backgroundSize: '24px 24px',
											}}
										>
											{/* Centered Arcade Countdown Overlay (Ready Phase) */}
											{gamePhase === 'ready' && (
												<div className='absolute inset-0 z-20 flex items-center justify-center bg-[#050505]/65 p-4'>
													<div className='bg-[#FFD426] text-[#050505] border-[3px] border-[#050505] rounded-xl shadow-[6px_6px_0_#050505] px-6 py-4 text-center max-w-[300px] w-full'>
														<span className='inline-block px-2 py-0.5 rounded-[4px] bg-[#050505] text-[#FFD426] font-mono text-[10px] font-black tracking-wider'>
															{readyIsNextLevel
																? t({
																		en: `LEVEL ${level} · NEXT ROUND`,
																		id: `LEVEL ${level} · RONDE BARU`,
																	})
																: t({
																		en: `LEVEL ${level} · GAME STARTED`,
																		id: `LEVEL ${level} · GAME DIMULAI`,
																	})}
														</span>
														<div className='font-display font-black text-4xl sm:text-5xl leading-none my-2.5'>
															{readyCount === 0
																? t({ en: 'GO!', id: 'MULAI!' })
																: readyCount}
														</div>
														<p className='font-mono text-[11px] font-black'>
															{t({
																en: 'Watch & memorize the pads!',
																id: 'Perhatikan & hafalkan urutan pad!',
															})}
														</p>
													</div>
												</div>
											)}

											{/* Centered Arcade Level-Clear Overlay */}
											{gamePhase === 'level_clear' && (
												<div className='absolute inset-0 z-20 flex items-center justify-center bg-[#050505]/55 p-4'>
													<div className='bg-[#5CE62E] text-[#050505] border-[3px] border-[#050505] rounded-xl shadow-[6px_6px_0_#050505] px-6 py-4 text-center max-w-[300px] w-full'>
														<div className='font-display font-black text-2xl sm:text-3xl leading-tight mb-1'>
															★ LVL {level} CLEAR!
														</div>
														<p className='font-mono text-[11px] font-black'>
															{t({
																en: `Get ready for Level ${level + 1}...`,
																id: `Bersiap untuk Level ${level + 1}...`,
															})}
														</p>
													</div>
												</div>
											)}

											<div className='grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3'>
												{SOUND_PADS.map((pad) => {
													const isPressed = pressedPadId === pad.id;
													const isDemoLit = demoLitPadId === pad.id;
													const isLit = isDemoLit || isPressed;
													const isWrong = wrongPadId === pad.id;
													const isExpectedTarget =
														gamePhase === 'gameover' && expectedPadId === pad.id;
													const isDimmedBySeq =
														Boolean(demoLitPadId) && !isLit && !isWrong && !isExpectedTarget;

													const isLightCreamFace =
														pad.faceHex === '#F6EDD6' || pad.faceHex === '#FFE7BF';

													const socketClass = isLit
														? 'border-[#FFFFFF]'
														: isWrong
															? 'border-[#FD6141]'
															: isExpectedTarget
																? 'border-[#FFD426]'
																: 'border-[#2B3344]';

													const lightbarClass = isLit
														? isLightCreamFace
															? 'bg-[#5CE62E]'
															: 'bg-[#FFFFFF]'
														: isWrong
															? 'bg-[#FD6141]'
															: isExpectedTarget
																? 'bg-[#FFD426]'
																: 'bg-[#050505]/25';

													const buttonStateClass = isLit
														? 'translate-y-[4px] ring-[3px] ring-[#FFFFFF] brightness-110'
														: isWrong
															? 'translate-y-[3px] ring-[3px] ring-[#FD6141]'
															: isLockedInput
																? isDimmedBySeq
																	? 'opacity-35 grayscale-[40%]'
																	: ''
																: 'hover:-translate-y-[1px] active:translate-y-[4px]';

													const buttonBoxShadow = isLit
														? `inset 0 2px 0 rgba(255,255,255,0.65), 0 1px 0 ${pad.wallHex}, 0 2px 0 #050505`
														: isWrong
															? `inset 0 2px 0 rgba(255,255,255,0.45), 0 2px 0 ${pad.wallHex}, 0 3px 0 #050505`
															: `inset 0 2px 0 rgba(255,255,255,0.45), 0 5px 0 ${pad.wallHex}, 0 7px 0 #050505`;

													return (
														<div
															key={pad.id}
															className={`rounded-[14px] bg-[#090B10] p-[4px] pb-[9px] border-2 transition-all duration-75 ${socketClass}`}
														>
															<button
																type='button'
																data-sfx='custom'
																data-hover-sfx='none'
																aria-disabled={isLockedInput}
																onPointerDown={() => triggerPad(pad.id)}
																onKeyDown={(e) => {
																	if (e.key === 'Enter' || e.key === ' ') {
																		e.preventDefault();
																		triggerPad(pad.id);
																	}
																}}
																className={`group/pad w-full text-left rounded-[9px] border-2 border-[#050505] p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-75 select-none ${
																	pad.isDarkFace ? 'text-[#FFFFFF]' : 'text-[#050505]'
																} ${
																	isLockedInput ? 'cursor-wait' : 'cursor-pointer'
																} ${buttonStateClass}`}
																style={{
																	backgroundColor: pad.faceHex,
																	boxShadow: buttonBoxShadow,
																}}
															>
																{/* Top Physical Mechanical LED Lightbar */}
																<div
																	aria-hidden='true'
																	className={`h-[5px] w-full rounded-full border border-[#050505] mb-1.5 sm:mb-2 transition-colors ${lightbarClass}`}
																/>

																{/* Adaptive Button Body: Key Badges + Compact Real-Meme Sticker + Bold Button Text */}
																<div className='grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] sm:grid-rows-[auto_auto] items-start sm:items-center gap-x-1.5 gap-y-1.5 sm:gap-x-2 sm:gap-y-0.5 lg:gap-x-1.5 xl:gap-x-2.5'>
																	<div className='col-start-1 row-start-1 self-start flex items-center gap-1 flex-wrap'>
																		<span
																			className={`inline-flex items-center h-[18px] px-1.5 rounded-[4px] font-mono text-[9.5px] font-black leading-none ${
																				isLit
																					? 'bg-[#FFFFFF] text-[#050505] border border-[#050505]'
																					: 'bg-[#050505] text-[#FFD426]'
																			}`}
																		>
																			{pad.keyNum}
																		</span>
																		{isDemoLit && demoStepNum !== null ? (
																			<span className='inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-[#FFD426] text-[#050505] border border-[#050505] font-mono text-[8.5px] font-black leading-none'>
																				STEP {demoStepNum}
																			</span>
																		) : isWrong ? (
																			<span className='inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-[#050505] text-[#FD6141] font-mono text-[8.5px] font-black leading-none'>
																				✕ WRONG
																			</span>
																		) : isExpectedTarget ? (
																			<span className='inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-[#FD6141] text-[#050505] border border-[#050505] font-mono text-[8.5px] font-black leading-none'>
																				★ TARGET
																			</span>
																		) : null}
																	</div>

																	{/* Compact Real-Meme Sticker Badge */}
																	<div className='col-start-2 row-start-1 sm:row-span-2 justify-self-end sm:self-center relative shrink-0 w-[52px] h-[38px] min-[390px]:w-[58px] min-[390px]:h-[42px] sm:w-[70px] sm:h-[52px] lg:w-[56px] lg:h-[44px] xl:w-[74px] xl:h-[56px] rounded-[6px] border-2 border-[#050505] bg-[#0B0E14] overflow-hidden shadow-[2px_2px_0_#050505]'>
																		<img
																			src={pad.memeImg}
																			alt={pad.title}
																			loading='lazy'
																			draggable={false}
																			className={`w-full h-full object-cover object-center block pointer-events-none transition-transform duration-150 ${
																				isLit ? 'scale-110' : 'group-hover/pad:scale-105'
																			}`}
																		/>
																	</div>

																	{/* Bold High-Contrast Button Typography */}
																	<div className='col-span-2 sm:col-span-1 sm:col-start-1 row-start-2 self-end min-w-0 w-full'>
																		<h4 className='font-display font-black text-[13px] min-[390px]:text-[14px] sm:text-[15.5px] lg:text-[13px] xl:text-[15.5px] leading-tight truncate'>
																			{pad.title}
																		</h4>
																		<p className='font-mono text-[8.5px] min-[390px]:text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] tracking-tight xl:tracking-normal font-extrabold leading-tight truncate mt-0.5'>
																			{t(pad.sub)}
																		</p>
																	</div>
																</div>
															</button>
														</div>
													);
												})}
											</div>
										</div>

										{/* Bottom Hardware Spec Strip */}
										<div className='relative bg-[#FFE7BF] border-t-2 border-[#050505] px-3 sm:px-7 py-1.5 flex items-center justify-between gap-2 font-mono text-[9px] sm:text-[10px] font-bold text-[#3B404C]'>
											<span
												aria-hidden='true'
												className='hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 size-2.5 rounded-full bg-[#F6EDD6] border-[1.5px] border-[#050505]'
											>
												<span className='w-1.5 h-[1.5px] bg-[#050505] -rotate-45' />
											</span>
											<span
												aria-hidden='true'
												className='hidden sm:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 size-2.5 rounded-full bg-[#F6EDD6] border-[1.5px] border-[#050505]'
											>
												<span className='w-1.5 h-[1.5px] bg-[#050505] rotate-45' />
											</span>

											<span className='truncate'>
												{t({
													en: 'KRIS-SFX-08 · REAL MEME SOUNDBOARD',
													id: 'KRIS-SFX-08 · PAPAN SUARA MEME',
												})}
											</span>

											<div className='flex items-center gap-1.5 shrink-0'>
												<span className='inline-flex items-center gap-1' aria-hidden='true'>
													<span className='size-2 rounded-full bg-[#FD6141] border border-[#050505]' />
													<span className='size-2 rounded-full bg-[#FFD426] border border-[#050505]' />
													<span className='size-2 rounded-full bg-[#3886C0] border border-[#050505]' />
												</span>
												<span className='whitespace-nowrap'>8 PADS · 48KHZ</span>
											</div>
										</div>
									</div>
								);
							})()}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default BlueprintProcessSection;
