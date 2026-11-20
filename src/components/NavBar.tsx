import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { NAV_LINKS, type CraftLabTab, type LocalizedText } from '../data/portfolioData';
import { useLanguage } from '../context/useLanguage';
import { isPageScrollLocked, useScrollLock } from '../utils/scrollLock';
import { SpaghettiBrandMark } from './SpaghettiArt';
import {
	BgmToggleButton,
	LanguageSwitchPill,
	SfxToggleButton,
} from './StudioAudioControls';
import {
	AudioIcon,
	ChessIcon,
	ChevronRightIcon,
	CloseIcon,
	FilmIcon,
	LayersIcon,
	MenuIcon,
} from './Icons';

interface DropdownRowItem {
	href: string;
	num: string;
	badge: LocalizedText;
	tileBg: string;
	icon: 'film' | 'layers' | 'chess';
	title: LocalizedText;
	subtitle: LocalizedText;
	hoverBg: string;
}

const PORTFOLIO_DROPDOWN_ITEMS: DropdownRowItem[] = [
	{
		href: '#videos',
		num: '01',
		badge: { en: '14 VIDEOS', id: '14 VIDEO' },
		tileBg: 'bg-[#FFD426] text-[#050505]',
		icon: 'film',
		title: { en: 'Watch All Video Works', id: 'Tonton Semua Karya Video' },
		subtitle: {
			en: '8 vertical Reels (9:16) & 6 horizontal Explainers (16:9)',
			id: '8 Reels vertikal (9:16) & 6 Explainer horizontal (16:9)',
		},
		hoverBg: 'hover:bg-[#F6EDD6]',
	},
	{
		href: '#studio-desk',
		num: '02',
		badge: { en: 'PROFILE', id: 'PROFIL' },
		tileBg: 'bg-[#5CE62E] text-[#050505]',
		icon: 'layers',
		title: {
			en: 'Core Strengths & Client Guide',
			id: 'Keahlian & Panduan Klien',
		},
		subtitle: {
			en: 'Editing, motion code, audio, & collaboration',
			id: 'Editing, motion kode, audio, & kolaborasi',
		},
		hoverBg: 'hover:bg-[#F6EDD6]',
	},
];

const CRAFT_LAB_PROCESS_ITEM: DropdownRowItem = {
	href: '#blueprint',
	num: '01',
	badge: { en: 'PRODUCTION PROCESS', id: 'PROSES PRODUKSI' },
	tileBg: 'bg-[#FFD426] text-[#050505]',
	icon: 'layers',
	title: {
		en: '4-Step Workflow',
		id: '4 Tahap Produksi',
	},
	subtitle: {
		en: 'Story hook, voice pacing, motion code, & final mix',
		id: 'Hook cerita, ritme suara, motion kode, & final mix',
	},
	hoverBg: 'hover:bg-[#F6EDD6]',
};

const CRAFT_LAB_INTERACTIVE_ITEM: DropdownRowItem = {
	href: '#craft-lab',
	num: '02',
	badge: { en: 'INTERACTIVE LAB', id: 'LAB INTERAKTIF' },
	tileBg: 'bg-[#4D9DE0] text-[#FFFFFF]',
	icon: 'chess',
	title: {
		en: 'Craft Lab & Mini Games',
		id: 'Lab Kreatif & Mini Game',
	},
	subtitle: {
		en: 'Visual diff split, Stockfish Chess AI (1000–1900 Elo), & Meme SFX',
		id: 'Komparasi visual, Catur Stockfish AI (1000–1900 Elo), & Meme SFX',
	},
	hoverBg: 'hover:bg-[#F6EDD6]',
};

interface NavBarProps {
	onSelectCraftTab?: (tab: CraftLabTab) => void;
}

const SCROLL_SHRINK_DISTANCE = 200;

const NavBar = ({ onSelectCraftTab }: NavBarProps = {}) => {
	const { t } = useLanguage();
	const headerRef = useRef<HTMLElement>(null);
	const [shrinkProgress, setShrinkProgress] = useState(0);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [openMenu, setOpenMenu] = useState<'portfolio' | 'craft-lab' | null>(null);
	const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
	const [mobileCraftLabOpen, setMobileCraftLabOpen] = useState(false);

	useScrollLock(mobileOpen);

	useEffect(() => {
		let rafId: number | null = null;
		const syncProgress = () => {
			rafId = null;
			if (isPageScrollLocked()) return;
			const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const next = prefersReduced
				? window.scrollY > 24
					? 1
					: 0
				: Math.min(1, Math.max(0, window.scrollY / SCROLL_SHRINK_DISTANCE));
			setShrinkProgress((prev) => (Math.abs(prev - next) < 0.005 ? prev : next));
		};
		const handleScroll = () => {
			if (rafId !== null) return;
			rafId = window.requestAnimationFrame(syncProgress);
		};
		syncProgress();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (rafId !== null) window.cancelAnimationFrame(rafId);
		};
	}, []);

	useEffect(() => {
		if (!openMenu) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpenMenu(null);
		};
		const handlePointerDown = (event: PointerEvent) => {
			if (headerRef.current && event.target instanceof Node && !headerRef.current.contains(event.target)) {
				setOpenMenu(null);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [openMenu]);

	useEffect(() => {
		if (!mobileOpen) return;

		const mq = window.matchMedia('(min-width: 1024px)');
		const handleMediaChange = (event: MediaQueryListEvent) => {
			if (event.matches) setMobileOpen(false);
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMobileOpen(false);
		};
		const handlePointerDown = (event: PointerEvent) => {
			if (headerRef.current && event.target instanceof Node && !headerRef.current.contains(event.target)) {
				setMobileOpen(false);
			}
		};

		mq.addEventListener('change', handleMediaChange);
		window.addEventListener('keydown', handleKeyDown);
		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			mq.removeEventListener('change', handleMediaChange);
			window.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [mobileOpen]);

	const scrolled = shrinkProgress > 0.12;

	const jumpToSection = (href: string) => {
		const wasMobileMenuOpen = mobileOpen;
		setMobileOpen(false);
		setMobilePortfolioOpen(false);
		setMobileCraftLabOpen(false);
		setOpenMenu(null);
		const scrollTarget = () => {
			const id = href.replace('#', '');
			const target = document.getElementById(id);
			if (target) {
				const top = target.getBoundingClientRect().top + window.pageYOffset - 76;
				window.scrollTo({ top, behavior: 'smooth' });
			}
		};
		if (wasMobileMenuOpen) {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(scrollTarget);
			});
			return;
		}
		scrollTarget();
	};

	const jumpToCraftTab = (tab: CraftLabTab) => {
		onSelectCraftTab?.(tab);
		jumpToSection('#craft-lab');
	};

	const renderDropdownRow = (item: DropdownRowItem, compact: boolean) => (
		<button
			key={item.href}
			type='button'
			data-sfx='nav'
			onClick={() => jumpToSection(item.href)}
			className={`group w-full text-left flex items-center justify-between gap-3 ${item.hoverBg} transition-colors cursor-pointer ${
				compact ? 'px-3 py-2.5' : 'px-3.5 py-3'
			}`}
		>
			<div className='flex items-center gap-3 min-w-0'>
				<span
					className={`size-9 rounded border-2 border-[#050505] shadow-[2px_2px_0_#050505] flex items-center justify-center shrink-0 ${item.tileBg}`}
					aria-hidden='true'
				>
					{item.icon === 'film' ? (
						<FilmIcon className='size-4' />
					) : item.icon === 'chess' ? (
						<ChessIcon className='size-4' />
					) : (
						<LayersIcon className='size-4' />
					)}
				</span>

				<div className='min-w-0'>
					<span className='block font-mono text-[9.5px] font-black uppercase tracking-wider text-[#3886C0] leading-none mb-1'>
						{item.num} · {t(item.badge)}
					</span>
					<p className='font-display font-black text-[13px] text-[#050505] leading-tight'>
						{t(item.title)}
					</p>
					<p className='font-mono text-[10px] font-medium text-[#3B404C] leading-snug mt-0.5'>
						{t(item.subtitle)}
					</p>
				</div>
			</div>

			<span className='size-6 rounded border-[1.5px] border-[#050505] bg-[#FFFFFF] group-hover:bg-[#FFD426] flex items-center justify-center shrink-0 transition-colors'>
				<ChevronRightIcon className='size-3.5 text-[#050505]' />
			</span>
		</button>
	);

	const renderPortfolioDropdownItems = (compact: boolean) =>
		PORTFOLIO_DROPDOWN_ITEMS.map((item) => renderDropdownRow(item, compact));

	const renderCraftLabDropdownItems = (compact: boolean) => (
		<>
			{renderDropdownRow(CRAFT_LAB_PROCESS_ITEM, compact)}
			<div className='flex flex-col'>
				{renderDropdownRow(CRAFT_LAB_INTERACTIVE_ITEM, compact)}

				{/* Clean Craft Lab Quick-Launch Trio */}
				<div
					className={`${
						compact ? 'px-3 pb-3 pt-1' : 'px-3.5 pb-3.5 pt-1'
					} grid grid-cols-1 sm:grid-cols-3 gap-2`}
				>
					<button
						type='button'
						data-sfx='paper'
						onClick={() => jumpToCraftTab('compare')}
						className='group text-left rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#FFD426] px-2.5 py-2 flex sm:flex-col items-center sm:items-start gap-2 shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
					>
						<span
							className='size-5 rounded-[2px] border border-[#050505] flex items-center justify-center shrink-0'
							style={{ background: 'linear-gradient(90deg, #161B26 50%, #3886C0 50%)' }}
							aria-hidden='true'
						>
							<LayersIcon className='size-3 text-white' />
						</span>
						<div className='min-w-0 flex-1 sm:w-full'>
							<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
								{t({ en: 'Before / After', id: 'Before / After' })}
							</p>
							<p className='font-mono text-[9.5px] font-bold text-[#3B404C] group-hover:text-[#050505] leading-tight mt-0.5'>
								{t({ en: '3 Studio Demos', id: '3 Demo Studio' })}
							</p>
						</div>
					</button>

					<button
						type='button'
						data-sfx='chess-tab'
						onClick={() => jumpToCraftTab('chess')}
						className='group text-left rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#5CE62E] px-2.5 py-2 flex sm:flex-col items-center sm:items-start gap-2 shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
					>
						<span
							className='size-5 rounded-[2px] border border-[#050505] flex items-center justify-center shrink-0'
							style={{
								backgroundImage:
									'conic-gradient(#39754F 90deg, #F6EDD6 90deg 180deg, #39754F 180deg 270deg, #F6EDD6 270deg)',
							}}
							aria-hidden='true'
						>
							<ChessIcon className='size-3 text-[#050505] drop-shadow-[0_0_2px_#FCF0D3]' />
						</span>
						<div className='min-w-0 flex-1 sm:w-full'>
							<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
								{t({ en: 'Chess vs Kris', id: 'Catur vs Kris' })}
							</p>
							<p className='font-mono text-[9.5px] font-bold text-[#1D3E2B] group-hover:text-[#050505] leading-tight mt-0.5'>
								1000–1900 Elo
							</p>
						</div>
					</button>

					<button
						type='button'
						data-sfx='sfx-tab'
						onClick={() => jumpToCraftTab('sfx')}
						className='group text-left rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#FD6141] px-2.5 py-2 flex sm:flex-col items-center sm:items-start gap-2 shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
					>
						<span
							className='size-5 rounded-[2px] border border-[#050505] bg-[#FD6141] group-hover:bg-[#FCF0D3] flex items-center justify-center shrink-0 transition-colors'
							aria-hidden='true'
						>
							<AudioIcon className='size-3 text-[#050505]' />
						</span>
						<div className='min-w-0 flex-1 sm:w-full'>
							<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
								{t({ en: 'Meme SFX', id: 'Meme SFX' })}
							</p>
							<p className='font-mono text-[9.5px] font-bold text-[#3B404C] group-hover:text-[#050505] leading-tight mt-0.5'>
								{t({ en: '8-Pad Memory', id: 'Memori 8 Pad' })}
							</p>
						</div>
					</button>
				</div>
			</div>
		</>
	);

	return (
		<header
			ref={headerRef}
			style={{ '--nav-p': shrinkProgress } as CSSProperties}
			className={`ds-header-wrap fixed top-0 left-0 right-0 z-[100] px-2 sm:px-4 xl:px-8 ${
				scrolled ? 'py-1.5' : 'py-2.5'
			}`}
		>
			<div
				className={`ds-header-pill w-full max-w-7xl mx-auto rounded-lg border-[2.5px] sm:border-[3px] border-[#050505] bg-[#FCF0D3] px-2.5 lg:px-2.5 xl:px-5 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 xl:gap-3 ${
					scrolled ? 'shadow-[5px_5px_0_#050505]' : 'shadow-[4px_4px_0_#050505]'
				}`}
			>
				{/* Brand Emblem + Wordmark */}
				<a
					href='#hero'
					data-sfx='nav'
					onClick={(e) => {
						e.preventDefault();
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}}
					className='flex items-center gap-1.5 min-[390px]:gap-2 xl:gap-2.5 group shrink-0 min-w-0'
				>
					<SpaghettiBrandMark className='ds-header-mark size-7 min-[390px]:size-8 sm:size-9 shrink-0 transition-transform duration-150 group-hover:-rotate-6 group-hover:scale-105' />
					<div className='leading-none min-w-0'>
						<span className='ds-header-brand block font-display font-black text-[13px] min-[390px]:text-sm sm:text-base tracking-tight text-[#050505] whitespace-nowrap'>
							KRISTIANTO
						</span>
						<span className='ds-header-sub hidden min-[410px]:block font-mono text-[9px] font-extrabold uppercase tracking-wider text-[#C5432F] whitespace-nowrap'>
							{t({ en: 'FILM · MOTION · CODE', id: 'FILM · MOTION · KODE' })}
						</span>
					</div>
				</a>

				{/* Desktop Nav Links */}
				<nav
					className='hidden lg:flex items-center gap-4 xl:gap-6'
					aria-label={t({ en: 'Main Navigation', id: 'Navigasi Utama' })}
				>
					{NAV_LINKS.map((item) => {
						if (item.href === '#videos' || item.href === '#craft-lab') {
							const menuKey = item.href === '#videos' ? 'portfolio' : 'craft-lab';
							const isOpen = openMenu === menuKey;
							const isPortfolio = menuKey === 'portfolio';

							return (
								<div
									key={item.href}
									className='relative'
									onMouseEnter={() => setOpenMenu(menuKey)}
									onMouseLeave={() => setOpenMenu(null)}
								>
									<button
										type='button'
										data-sfx='nav'
										aria-expanded={isOpen}
										onClick={() => jumpToSection(item.href)}
										className={`ds-header-link inline-flex items-center gap-1 whitespace-nowrap font-mono font-extrabold text-[11px] uppercase tracking-normal xl:tracking-wider py-1 transition-colors cursor-pointer ${
											isOpen
												? 'text-[#FD6141]'
												: 'text-[#050505] hover:text-[#FD6141]'
										}`}
									>
										<span>{t(item.label)}</span>
										<span
											className='text-[10px] leading-none opacity-75'
											aria-hidden='true'
										>
											{isOpen ? '▴' : '▾'}
										</span>
									</button>

									{isOpen && (
										<div
											className={`absolute left-0 top-full pt-2 max-w-[calc(100vw-2rem)] z-50 ${
												isPortfolio ? 'w-[360px]' : 'w-[408px]'
											}`}
										>
											<div className='ds-os-window rounded-lg overflow-hidden'>
												<div className='flex items-center justify-between gap-2 px-3 py-1.5 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
													<div className='flex items-center gap-2 min-w-0 flex-1'>
														<span className='size-2.5 rounded-full bg-[#FFD426] border border-[#050505] shrink-0' />
														<span className='font-mono text-[10px] font-black text-[#050505] uppercase truncate'>
															{isPortfolio
																? t({
																		en: 'PORTFOLIO · VIDEOS & PROFILE',
																		id: 'PORTOFOLIO · VIDEO & PROFIL',
																	})
																: t({
																		en: 'CRAFT LAB · PROCESS & MINI GAMES',
																		id: 'LAB KREATIF · PROSES & MINI GAME',
																	})}
														</span>
														<div className='flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
													</div>
													<button
														type='button'
														data-sfx='close'
														aria-label={
															isPortfolio
																? t({ en: 'Close portfolio menu', id: 'Tutup menu portofolio' })
																: t({ en: 'Close craft lab menu', id: 'Tutup menu lab kreatif' })
														}
														onClick={() => setOpenMenu(null)}
														className='size-4 rounded-sm bg-[#FCF0D3] border border-[#050505] inline-flex items-center justify-center text-[9px] font-black leading-none cursor-pointer shrink-0'
													>
														✕
													</button>
												</div>
												<div className='bg-[#FCF0D3] divide-y divide-[#050505]/15'>
													{isPortfolio
														? renderPortfolioDropdownItems(false)
														: renderCraftLabDropdownItems(false)}
												</div>
											</div>
										</div>
									)}
								</div>
							);
						}

						return (
							<a
								key={item.href}
								href={item.href}
								data-sfx='nav'
								onClick={(e) => {
									e.preventDefault();
									jumpToSection(item.href);
								}}
								className='ds-header-link whitespace-nowrap font-mono font-extrabold text-[11px] uppercase tracking-normal xl:tracking-wider text-[#050505] hover:text-[#FD6141] transition-colors py-1'
							>
								{t(item.label)}
							</a>
						);
					})}
				</nav>

				{/* Right Utility Group */}
				<div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
					{/* EN | ID Switcher */}
					<LanguageSwitchPill variant='navbar' />

					<span
						className='hidden sm:inline-block h-4 w-[1.5px] bg-[#050505]/20 mx-0.5'
						aria-hidden='true'
					/>

					{/* 3-Step Background Music & SFX Toggles */}
					<BgmToggleButton variant='navbar' />
					<SfxToggleButton variant='navbar' />

					{/* Primary Contact CTA */}
					<a
						href='#contact'
						data-sfx='keycap'
						onClick={(e) => {
							e.preventDefault();
							jumpToSection('#contact');
						}}
						className='ds-header-cta hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded border-2 border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] text-[#050505] font-display font-black text-xs px-3 py-1.5 ml-0.5 shadow-[3px_3px_0_#050505] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[background-color,transform,box-shadow] duration-150 shrink-0'
					>
						{t({ en: 'Start a Project', id: 'Mulai Proyek' })}
					</a>

					{/* Mobile Menu Trigger */}
					<button
						type='button'
						data-sfx='switch'
						data-sfx-gain='0.66'
						onClick={() => setMobileOpen((prev) => !prev)}
						aria-label={
							mobileOpen
								? t({ en: 'Close navigation menu', id: 'Tutup menu navigasi' })
								: t({ en: 'Open navigation menu', id: 'Buka menu navigasi' })
						}
						aria-expanded={mobileOpen}
						className='ds-header-menu-btn lg:hidden w-8 h-7 min-[360px]:w-9 min-[360px]:h-8 min-[390px]:w-9 min-[390px]:h-9 sm:w-10 sm:h-9 rounded border-[1.5px] border-[#050505] bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] cursor-pointer shrink-0 inline-flex items-center justify-center'
					>
						{mobileOpen ? (
							<CloseIcon className='size-4 min-[360px]:size-5' />
						) : (
							<MenuIcon className='size-4 min-[360px]:size-5' />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation Drawer */}
			{mobileOpen && (
				<div
					data-sfx-gain='0.66'
					className='lg:hidden mt-2 mx-auto w-full max-w-7xl ds-os-window rounded-lg overflow-hidden'
				>
					<div className='flex items-center justify-between px-4 py-2 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
						<div className='flex items-center gap-2 min-w-0 flex-1'>
							<span className='size-2.5 rounded-full bg-[#FFD426] border border-[#050505] shrink-0' />
							<span className='font-mono text-xs font-black text-[#050505]'>
								NAVIGATION.MENUBAR
							</span>
							<div className='flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
						</div>
						<button
							type='button'
							data-sfx='close'
							onClick={() => setMobileOpen(false)}
							aria-label={t({ en: 'Close mobile menu', id: 'Tutup menu mobile' })}
							className='size-6 rounded-sm bg-[#FCF0D3] border-2 border-[#050505] font-mono text-xs font-black text-[#050505] inline-flex items-center justify-center cursor-pointer shrink-0'
						>
							✕
						</button>
					</div>
					<nav className='p-3.5 sm:p-4 bg-[#F6EDD6] flex flex-col gap-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain'>
						{NAV_LINKS.map((item) => {
							if (item.href === '#videos' || item.href === '#craft-lab') {
								const isPortfolio = item.href === '#videos';
								const isExpanded = isPortfolio ? mobilePortfolioOpen : mobileCraftLabOpen;
								const toggleAccordion = () => {
									if (isPortfolio) {
										setMobilePortfolioOpen((prev) => !prev);
									} else {
										setMobileCraftLabOpen((prev) => !prev);
									}
								};

								return (
									<div
										key={item.href}
										className='shrink-0 rounded border-2 border-[#050505] bg-white shadow-[2px_2px_0_#050505] overflow-hidden transition-colors'
									>
										<button
											type='button'
											data-sfx='nav'
											aria-expanded={isExpanded}
											onClick={toggleAccordion}
											className='w-full flex items-center justify-between gap-2 px-3 py-2.5 font-display font-black text-sm text-[#050505] hover:text-[#FD6141] transition-colors cursor-pointer'
										>
											<span className='inline-flex items-center gap-2'>
												<span>{t(item.label)}</span>
											</span>
											<span className='inline-flex items-center gap-1.5 font-mono text-[10px] font-black px-2 py-0.5 rounded-[2px] bg-[#FFD426] text-[#050505] border border-[#050505] whitespace-nowrap shrink-0'>
												{isPortfolio ? (
													<FilmIcon className='size-3 shrink-0' />
												) : (
													<ChessIcon className='size-3 shrink-0' />
												)}
												<span>
													{isPortfolio
														? t({ en: '14 VIDEOS', id: '14 VIDEO' })
														: t({ en: '3 MODES', id: '3 MODE' })}
												</span>
												<span aria-hidden='true'>{isExpanded ? '▴' : '▾'}</span>
											</span>
										</button>

										{isExpanded && (
											<div className='border-t-2 border-[#050505] bg-[#FCF0D3] divide-y divide-[#050505]/15'>
												<div className='px-3 py-2 bg-[#F6EDD6] flex items-center justify-between'>
													<span className='font-mono text-[10px] font-black text-[#3B404C] uppercase'>
														{isPortfolio
															? t({
																	en: 'PORTFOLIO · VIDEOS & PROFILE',
																	id: 'PORTOFOLIO · VIDEO & PROFIL',
																})
															: t({
																	en: 'CRAFT LAB · PROCESS & MINI GAMES',
																	id: 'LAB KREATIF · PROSES & MINI GAME',
																})}
													</span>
												</div>
												{isPortfolio
													? renderPortfolioDropdownItems(true)
													: renderCraftLabDropdownItems(true)}
											</div>
										)}
									</div>
								);
							}

							return (
								<a
									key={item.href}
									href={item.href}
									data-sfx='nav'
									onClick={(e) => {
										e.preventDefault();
										jumpToSection(item.href);
									}}
									className='shrink-0 font-display font-black text-sm text-[#050505] hover:text-[#FD6141] px-3 py-2 rounded border-2 border-[#050505] bg-white shadow-[2px_2px_0_#050505]'
								>
									{t(item.label)}
								</a>
							);
						})}
						<button
							type='button'
							data-sfx='keycap'
							onClick={() => jumpToSection('#contact')}
							className='shrink-0 mt-1 w-full py-2.5 rounded border-2 border-[#050505] bg-[#FD6141] text-[#050505] font-display font-black text-sm shadow-[3px_3px_0_#050505] cursor-pointer'
						>
							{t({ en: 'Send a Project Brief', id: 'Kirim Brief Proyek' })}
						</button>
					</nav>
				</div>
			)}
		</header>
	);
};

export default NavBar;
