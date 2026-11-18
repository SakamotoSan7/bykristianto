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

const FIG_LETTERS = ['Fig.A', 'Fig.B', 'Fig.C', 'Fig.D'];
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
	},
	{
		id: 'oof',
		keyNum: '02',
		faceHex: '#FFD426',
		wallHex: '#B38800',
		glowRgb: '255, 212, 38',
		title: 'OOF!',
		sub: { en: 'Classic Roblox', id: 'Roblox Oof' },
	},
	{
		id: 'wow',
		keyNum: '03',
		faceHex: '#5CE62E',
		wallHex: '#209008',
		glowRgb: '92, 230, 46',
		title: 'WOOOW!',
		sub: { en: 'Anime Sparkle', id: 'Anime Wow' },
	},
	{
		id: 'bruh',
		keyNum: '04',
		faceHex: '#FCF0D3',
		wallHex: '#ABA082',
		glowRgb: '252, 240, 211',
		title: 'BRUH!',
		sub: { en: 'Deadpan Meme', id: 'Reaksi Datar' },
	},
	{
		id: 'omg',
		keyNum: '05',
		faceHex: '#4D9DE0',
		wallHex: '#1B5E99',
		glowRgb: '77, 157, 224',
		title: 'OH MY GOD!',
		sub: { en: 'Shock Hype', id: 'Kaget Viral' },
	},
	{
		id: 'yay',
		keyNum: '06',
		faceHex: '#FCAE1F',
		wallHex: '#AB6800',
		glowRgb: '252, 174, 31',
		title: 'YAY!',
		sub: { en: 'Kids Cheer', id: 'Sorak Hore' },
	},
	{
		id: 'okay',
		keyNum: '07',
		faceHex: '#FCF0D3',
		wallHex: '#ABA082',
		glowRgb: '252, 240, 211',
		title: 'OKAY',
		sub: { en: 'Awkward Okay', id: 'Reaksi Okay' },
	},
	{
		id: 'god',
		keyNum: '08',
		faceHex: '#C91878',
		wallHex: '#730641',
		glowRgb: '201, 24, 120',
		isDarkFace: true,
		title: 'GOD!!',
		sub: { en: 'Dramatic Fail', id: 'Teriakan Gagal' },
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

		const initialDelay = 280;
		const stepInterval = 860;
		nextSeq.forEach((padId, idx) => {
			scheduleTimeout(() => {
				playMeme(padId);
				setDemoLitPadId(padId);
				setPressedPadId(padId);
				scheduleTimeout(() => {
					setDemoLitPadId((curr) => (curr === padId ? null : curr));
					setPressedPadId((curr) => (curr === padId ? null : curr));
				}, 520);
			}, initialDelay + idx * stepInterval);
		});

		scheduleTimeout(() => {
			setDemoLitPadId(null);
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
						en: 'PRODUCTION PIPELINE',
						id: 'ALUR PRODUKSI',
					})}
					title={t({
						en: 'Where Film Craft Meets Editing, Code & Sound',
						id: 'Perpaduan Seni Film, Editing, Kode & Tata Suara',
					})}
					badgeColor='yellow'
					description={t({
						en: 'Each video combines fact-checked storytelling, code-driven animation (Video-as-Code), Premiere/AE editing, and clear narration & SFX mixing.',
						id: 'Tiap karya memadukan riset naskah terverifikasi, animasi berbasis kode (Video-as-Code), editing Premiere/AE, serta mixing narasi & SFX yang jernih.',
					})}
				/>

				{/* 4 Style A Ligne-Claire Assembly Cards with Canary Drafting Tape */}
				<div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{WORKFLOW_STEPS.map((item, idx) => (
						<article
							key={item.step}
							className='relative ds-panel-paper rounded-sm p-6 pt-8 flex flex-col justify-between gap-4'
						>
							<div
								className='absolute -top-3 left-6 px-2.5 py-0.5 bg-[#FFD426] border-2 border-[#050505] font-mono text-[11px] font-black text-[#050505] -rotate-2 shadow-[2px_2px_0_#050505]'
								aria-hidden='true'
							>
								{FIG_LETTERS[idx] ?? `Fig.${item.step}`}
							</div>

							<div className='space-y-3'>
								<div className='flex items-center justify-between gap-2'>
									<span className='font-mono text-2xl font-black text-[#FD6141]'>
										{item.step}
									</span>
									<span className='px-2 py-0.5 rounded-sm bg-[#FCF0D3] border border-dashed border-[#050505]/50 font-mono text-[10px] font-black uppercase text-[#3886C0] select-none'>
										{t(item.tag)}
									</span>
								</div>
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

				{/* Style D Retro OS Interactive Craft Lab Window */}
				<div id='craft-lab' className='mt-14 ds-os-window rounded-sm overflow-hidden scroll-mt-24'>
					{/* Title Bar */}
					<div className='flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-3 bg-[#FFD426] border-b-[3px] border-[#050505]'>
						<div className='flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0'>
							<span className='size-5 border-2 border-[#050505] bg-[#FD6141] inline-flex items-center justify-center font-mono text-[10px] font-black text-[#050505] shrink-0'>
								⚙
							</span>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-mono text-xs font-bold shrink-0'>
								CRAFT_LAB.EXE
							</span>
							<p className='font-display font-black text-sm sm:text-base text-[#050505] leading-snug'>
								{t({
									en: 'Before / After Studio, Chess vs Kristianto & Meme SFX',
									id: 'Komparasi Before / After, Catur vs Kristianto & Meme SFX',
								})}
							</p>
						</div>

						<span className='px-2.5 py-0.5 rounded-sm bg-[#FCF0D3] border-2 border-[#050505] font-mono text-[10px] font-black text-[#050505] uppercase tracking-wider shrink-0 select-none'>
							{t({ en: '3 INTERACTIVE MODES', id: '3 MODE INTERAKTIF' })}
						</span>
					</div>

					{/* Distinct Content-Styled Interactive Mode Switcher Deck */}
					<div
						role='tablist'
						aria-label={t({ en: 'Craft Lab Interactive Modes', id: 'Pilihan Mode Craft Lab' })}
						className='grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#EFE3C4] border-b-[3.5px] border-[#050505]'
					>
						{/* Mode 1: Visual Before / After (Split-Screen Studio Style) */}
						<button
							type='button'
							role='tab'
							data-sfx='paper'
							aria-selected={activeTab === 'compare'}
							aria-pressed={activeTab === 'compare'}
							onClick={() => switchCraftTab('compare')}
							className={`group text-left rounded-md border-[2.5px] border-[#050505] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
								activeTab === 'compare'
									? 'bg-[#3886C0] text-white shadow-[4px_4px_0_#050505] -translate-y-0.5'
									: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#E7F4FD] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className='size-10 rounded border-2 border-[#050505] shadow-[2px_2px_0_#050505] flex items-center justify-center shrink-0'
									style={{
										background: 'linear-gradient(90deg, #161B26 50%, #4D9DE0 50%)',
									}}
									aria-hidden='true'
								>
									<LayersIcon className='size-4.5 text-[#FCF0D3] drop-shadow-[0_1px_1px_#050505]' />
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Visual Before / After', id: 'Before / After Studio' })}
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
								className={`px-2 py-0.5 rounded-[3px] border border-[#050505] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'compare'
										? 'bg-[#FFD426] text-[#050505]'
										: 'bg-[#E7F4FD] text-[#204275]'
								}`}
							>
								{activeTab === 'compare'
									? t({ en: 'OPEN', id: 'AKTIF' })
									: 'SPLIT'}
							</span>
						</button>

						{/* Mode 2: Chess vs Kris (Emerald Chessboard Motif + Clear PLAY Hint) */}
						<button
							type='button'
							role='tab'
							data-sfx='chess-tab'
							aria-selected={activeTab === 'chess'}
							aria-pressed={activeTab === 'chess'}
							onClick={() => switchCraftTab('chess')}
							className={`group text-left rounded-md border-[2.5px] border-[#050505] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
								activeTab === 'chess'
									? 'bg-[#5CE62E] text-[#050505] shadow-[4px_4px_0_#050505] -translate-y-0.5'
									: 'bg-[#F2FCEB] text-[#050505] hover:bg-[#DCF9C8] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className='size-10 rounded border-2 border-[#050505] shadow-[2px_2px_0_#050505] flex items-center justify-center shrink-0'
									style={{
										backgroundImage:
											'conic-gradient(#39754F 90deg, #F6EDD6 90deg 180deg, #39754F 180deg 270deg, #F6EDD6 270deg)',
									}}
									aria-hidden='true'
								>
									<span className='size-6 rounded-[3px] bg-[#FCF0D3]/95 border border-[#050505] flex items-center justify-center'>
										<ChessIcon className='size-4 text-[#163824]' />
									</span>
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Chess vs Kris (1000–1900)', id: 'Catur vs Kris (1000–1900)' })}
									</p>
									<p className='font-mono text-[10px] font-bold text-[#1D3E2B] leading-snug mt-0.5'>
										{t({ en: 'Playable AI Match · 3 ELO', id: 'Lawan Stockfish AI · 3 Level' })}
									</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-[3px] border border-[#050505] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'chess'
										? 'bg-[#050505] text-[#5CE62E]'
										: 'bg-[#5CE62E] text-[#050505] group-hover:bg-[#FFD426]'
								}`}
							>
								{activeTab === 'chess'
									? t({ en: 'PLAYING', id: 'AKTIF' })
									: t({ en: 'PLAY ♟', id: 'MAIN ♟' })}
							</span>
						</button>

						{/* Mode 3: Meme SFX Game (3D Tactile Drum-Pad Keycap Style) */}
						<button
							type='button'
							role='tab'
							data-sfx='sfx-tab'
							aria-selected={activeTab === 'sfx'}
							aria-pressed={activeTab === 'sfx'}
							onClick={() => switchCraftTab('sfx')}
							className={`group text-left rounded-md border-[2.5px] border-[#050505] border-b-[4.5px] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
								activeTab === 'sfx'
									? 'bg-[#FD6141] text-[#050505] shadow-[4px_4px_0_#050505] -translate-y-0.5'
									: 'bg-[#FFF3EF] text-[#050505] hover:bg-[#FFE1D8] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className={`size-10 rounded-md border-2 border-[#050505] border-b-[3.5px] flex items-center justify-center shrink-0 ${
										activeTab === 'sfx' ? 'bg-[#FCF0D3]' : 'bg-[#FD6141]'
									}`}
									aria-hidden='true'
								>
									<AudioIcon className='size-4.5 text-[#050505]' />
								</span>
								<div className='min-w-0'>
									<p className='font-display font-black text-sm leading-tight'>
										{t({ en: 'Meme SFX Game', id: 'Game Meme SFX' })}
									</p>
									<p
										className={`font-mono text-[10px] font-bold leading-snug mt-0.5 ${
											activeTab === 'sfx' ? 'text-[#050505]/85' : 'text-[#3B404C]'
										}`}
									>
										{t({ en: '8 Foley Pads · Memory Game', id: '8 Pad Suara · Game Memori' })}
									</p>
								</div>
							</div>

							<span
								className={`px-2 py-0.5 rounded-[3px] border border-[#050505] font-mono text-[9.5px] font-black shrink-0 whitespace-nowrap select-none ${
									activeTab === 'sfx'
										? 'bg-[#050505] text-[#FFD426]'
										: 'bg-[#FFD426] text-[#050505]'
								}`}
							>
								{activeTab === 'sfx'
									? t({ en: 'OPEN', id: 'AKTIF' })
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

					{/* TAB 3: Compact Meme SFX Board + Ready-Cued Memory Game */}
					{activeTab === 'sfx' && (
						<div className='p-3.5 sm:p-5 lg:p-6 bg-[#121212] text-[#FCF0D3] space-y-3 sm:space-y-3.5'>
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
								const expectedPad = SOUND_PADS.find((p) => p.id === expectedPadId);
								const targetKeyNum = expectedPad?.keyNum ?? '??';
								const targetLabel = expectedPad?.title ?? '';

								return (
									<>
										{/* Fixed-Track Header & Score Telemetry (never wraps or shifts height across phases) */}
										<div className='space-y-2.5'>
											<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
												<h3 className='font-display font-black text-base sm:text-xl text-white leading-tight whitespace-nowrap'>
													{t({
														en: 'Meme SFX Game',
														id: 'Game Meme SFX',
													})}
												</h3>

												{/* Always-mounted fixed telemetry bar (LVL slot stays reserved so width/height never jump) */}
												<div className='flex items-center gap-1.5 sm:gap-2 select-none shrink-0 h-6 sm:h-7 whitespace-nowrap tabular-nums'>
													<span
														className={`inline-flex items-center justify-center min-w-[4.25rem] h-6 px-2 rounded-sm font-mono text-[11px] sm:text-xs font-black leading-none transition-colors ${
															isGameRunning
																? 'bg-[#FFD426] text-[#050505]'
																: 'bg-[#0B0D12] text-[#FCF0D3]/45 border border-dashed border-[#FCF0D3]/25'
														}`}
													>
														{isGameRunning ? `LVL ${level}` : 'LVL --'}
													</span>
													<span className='inline-flex items-center h-6 px-2 rounded-sm bg-[#0B0D12] text-[#FFD426] border border-dashed border-[#FFD426]/45 font-mono text-[11px] sm:text-xs font-bold leading-none'>
														BEST: {bestLevel}
													</span>
													<span className='inline-flex items-center h-6 px-2 rounded-sm bg-[#0B0D12] text-[#5CE62E] border border-dashed border-[#5CE62E]/45 font-mono text-[11px] sm:text-xs font-bold leading-none'>
														TAP: {tapCount}
													</span>
												</div>
											</div>

											{/* Locked-Height Action Control Strip (exact 42px across idle/active states & all viewports) */}
											<div className='grid grid-cols-2 gap-2 w-full sm:w-[320px] h-[42px]'>
												{isGameRunning ? (
													<button
														type='button'
														data-sfx='close'
														onClick={exitToFreeMode}
														className='col-span-2 h-[42px] px-4 rounded-xl bg-[#FCF0D3] hover:bg-[#FD6141] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
													>
														{t({ en: '✕ STOP · FREE PAD', id: '✕ STOP · MODE BEBAS' })}
													</button>
												) : (
													<>
														<button
															type='button'
															data-sfx='sfx-tab'
															onClick={playMiniSequence}
															className='h-[42px] px-3 rounded-xl bg-[#FCF0D3] hover:bg-[#FFD426] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
														>
															♪ DEMO
														</button>
														<button
															type='button'
															data-sfx='keycap'
															onClick={startFoleyGame}
															className='h-[42px] px-3 rounded-xl bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] border-[2.5px] border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[0_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
														>
															{gamePhase === 'gameover'
																? t({ en: '↻ PLAY AGAIN', id: '↻ MAIN LAGI' })
																: t({ en: '▶ PLAY GAME', id: '▶ MAIN GAME' })}
														</button>
													</>
												)}
											</div>
										</div>

										{/* Locked-Height Single-Row Status Banner (exact 48px/50px, zero bounce across all phases & widths) */}
										<div
											className={`h-[48px] sm:h-[50px] rounded-lg border-2 px-2.5 sm:px-3 flex flex-nowrap items-center justify-between gap-2 overflow-hidden font-mono text-xs transition-colors ${
												gamePhase === 'ready'
													? 'border-[#FFD426] bg-[#2B2005]'
													: gamePhase === 'level_clear'
														? 'border-[#5CE62E] bg-[#0E2611]'
														: gamePhase === 'gameover'
															? 'border-[#FD6141] bg-[#29100D]'
															: 'border-[#2D333F] bg-[#0B0D12]'
											}`}
										>
											<div className='flex items-center gap-2 min-w-0 flex-1 overflow-hidden'>
												{gamePhase === 'free' && (
													<>
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#1D2430] text-[#5CE62E] border border-[#5CE62E]/60 font-black leading-none shrink-0 whitespace-nowrap'>
															{t({ en: '● FREE', id: '● BEBAS' })}
														</span>
														<span className='text-[#FCF0D3]/85 text-[11px] sm:text-xs truncate min-w-0'>
															{t({
																en: 'Tap any meme pad or press Play Game',
																id: 'Tap pad meme atau tekan Main Game',
															})}
														</span>
													</>
												)}

												{gamePhase === 'ready' && (
													<>
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#FFD426] text-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
															{t({
																en: `READY · LVL ${level}`,
																id: `SIAP · LVL ${level}`,
															})}
														</span>
														<span className='text-[#FFD426] font-bold text-[11px] sm:text-xs truncate min-w-0'>
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
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#FFD426] text-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
															{t({ en: 'WATCH', id: 'SIMAK' })}
														</span>
														<span className='text-[#FFD426] font-bold text-[11px] sm:text-xs truncate min-w-0'>
															{t({
																en: `Lvl ${level} · Memorize ${sequence.length} sounds`,
																id: `Lvl ${level} · Hafalkan ${sequence.length} suara`,
															})}
														</span>
													</>
												)}

												{gamePhase === 'awaiting_input' && (
													<>
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#5CE62E] text-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
															{t({ en: 'YOUR TURN', id: 'GILIRANMU' })}
														</span>
														<span className='text-white font-bold text-[11px] sm:text-xs tabular-nums truncate min-w-0'>
															{playerIndex}/{sequence.length}
															{level >= 4 ? ' · STREAK!' : ''}
														</span>
													</>
												)}

												{gamePhase === 'level_clear' && (
													<>
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#5CE62E] text-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
															★ LVL {level} CLEAR!
														</span>
														<span className='text-[#5CE62E] font-bold text-[11px] sm:text-xs truncate min-w-0'>
															{t({
																en: `Awesome! Level ${level + 1} next...`,
																id: `Mantap! Lanjut Level ${level + 1}...`,
															})}
														</span>
													</>
												)}

												{gamePhase === 'gameover' && (
													<>
														<span className='inline-flex items-center h-6 px-2 rounded bg-[#FD6141] text-[#050505] font-black leading-none shrink-0 whitespace-nowrap'>
															{t({ en: 'MISSED', id: 'SALAH' })}
														</span>
														<span className='text-[#FD6141] font-bold text-[11px] sm:text-xs truncate min-w-0'>
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
													<span className='inline-flex items-center justify-center h-7 min-w-[3.25rem] px-2 rounded-md bg-[#FFD426] text-[#050505] border-2 border-[#050505] font-display text-xs sm:text-sm font-black leading-none whitespace-nowrap animate-pulse'>
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
																	className={`rounded-full border border-white/40 transition-colors shrink-0 ${
																		sequence.length > 7
																			? 'size-1.5 sm:size-2'
																			: 'size-2 sm:size-2.5'
																	} ${
																		dotIdx < playerIndex
																			? 'bg-[#5CE62E] border-[#5CE62E]'
																			: gamePhase === 'gameover' && dotIdx === playerIndex
																				? 'bg-[#FD6141] border-[#FD6141]'
																				: 'bg-white/15'
																	}`}
																/>
															))}
														</div>
													)
												)}
											</div>
										</div>

										{/* Compact Tactile 3D 8-Pad Matrix (2x4 Phone, 4x2 Tablet/Desktop) */}
										<div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5'>
											{SOUND_PADS.map((pad) => {
												const isPressed = pressedPadId === pad.id;
												const isDemoLit = demoLitPadId === pad.id;
												const isLit = isDemoLit || isPressed;
												const isWrong = wrongPadId === pad.id;
												const isExpectedTarget =
													gamePhase === 'gameover' && expectedPadId === pad.id;
												const isDimmedBySeq =
													Boolean(demoLitPadId) && !isLit && !isWrong && !isExpectedTarget;

												return (
													<div
														key={pad.id}
														className={`rounded-[16px] p-[3px] pb-[7px] sm:p-[4px] sm:pb-[9px] border-2 transition-all duration-75 ${
															isLit
																? 'bg-[#171B26] border-white ring-[3px] ring-white'
																: isWrong
																	? 'bg-[#261110] border-[#FD6141] ring-[3px] ring-[#FD6141]'
																	: isExpectedTarget
																		? 'bg-[#221B0A] border-[#FFD426] ring-[3px] ring-[#FFD426]'
																		: 'bg-[#07080C] border-[#2A303D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]'
														}`}
														style={
															isLit
																? {
																		boxShadow: `0 0 22px rgba(255,255,255,0.75), 0 0 32px rgba(${pad.glowRgb},0.7)`,
																	}
																: isWrong
																	? { boxShadow: '0 0 18px rgba(253,97,65,0.65)' }
																	: isExpectedTarget
																		? { boxShadow: '0 0 18px rgba(255,212,38,0.6)' }
																		: undefined
														}
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
															className={`w-full text-left rounded-[11px] border-2 border-[#050505] p-2.5 sm:p-3 h-[68px] sm:h-[82px] overflow-hidden transition-all duration-75 select-none flex flex-col justify-between gap-1 ${
																pad.isDarkFace ? 'text-white' : 'text-[#050505]'
															} ${
																isLockedInput ? 'cursor-wait' : 'cursor-pointer'
															} ${
																isLit
																	? 'translate-y-[3px] brightness-110'
																	: isWrong
																		? 'translate-y-[2px]'
																		: isLockedInput
																			? `translate-y-0 ${
																					isDimmedBySeq
																						? 'opacity-45 brightness-75 saturate-75'
																						: ''
																				}`
																			: 'translate-y-0 hover:-translate-y-[1px] hover:brightness-[1.04] active:translate-y-[3px]'
															}`}
															style={{
																backgroundColor: pad.faceHex,
																backgroundImage: isLit
																	? 'linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.08) 55%, rgba(0,0,0,0.04) 100%)'
																	: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.02) 48%, rgba(0,0,0,0.09) 100%)',
																boxShadow: isLit
																	? `inset 0 0 0 2px rgba(255,255,255,0.92), inset 0 2px 5px rgba(255,255,255,0.42), 0 2px 0 ${pad.wallHex}, 0 3px 0 #050505`
																	: isWrong
																		? `inset 0 2px 0 rgba(255,255,255,0.4), 0 3px 0 ${pad.wallHex}, 0 4.5px 0 #050505`
																		: `inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(0,0,0,0.14), 0 4.5px 0 ${pad.wallHex}, 0 6px 0 #050505, 0 8px 10px rgba(0,0,0,0.42)`,
															}}
														>
															<div className='flex items-center justify-between gap-1.5 w-full h-[20px] shrink-0'>
																<span
																	className={`inline-flex items-center h-[18px] px-1.5 rounded font-mono text-[9px] sm:text-[10px] font-black leading-none ${
																		isLit
																			? 'bg-[#050505] text-white ring-1 ring-white/80'
																			: 'bg-[#050505] text-[#FFD426]'
																	}`}
																>
																	{pad.keyNum}
																</span>
																{isExpectedTarget ? (
																	<span className='inline-flex items-center h-[18px] px-1.5 rounded border border-[#050505] bg-[#FD6141] text-[#050505] font-mono text-[9px] font-black leading-none'>
																		TARGET
																	</span>
																) : null}
															</div>

															<div className='min-w-0'>
																<h4 className='font-display font-black text-sm sm:text-base leading-tight truncate'>
																	{pad.title}
																</h4>
																<p className='font-mono text-[9px] sm:text-[10px] font-bold opacity-85 truncate'>
																	{t(pad.sub)}
																</p>
															</div>
														</button>
													</div>
												);
											})}
										</div>
									</>
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
