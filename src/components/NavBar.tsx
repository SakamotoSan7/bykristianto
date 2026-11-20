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

interface WorksDropdownItem {
	href: string;
	num: string;
	badge: LocalizedText;
	tileBg: string;
	icon: 'film' | 'layers' | 'chess';
	title: LocalizedText;
	subtitle: LocalizedText;
	hoverBg: string;
	isInteractive?: boolean;
}

const WORKS_DROPDOWN_ITEMS: WorksDropdownItem[] = [
	{
		href: '#videos',
		num: '01',
		badge: { en: '14 VIDEOS', id: '14 VIDEO' },
		tileBg: 'bg-[#FFD426] text-[#050505]',
		icon: 'film',
		title: { en: 'Watch All Video Works', id: 'Tonton Semua Karya Video' },
		subtitle: {
			en: '8 vertical Reels (9:16) & 6 Explainers (16:9)',
			id: '8 Reels vertikal (9:16) & 6 Explainer (16:9)',
		},
		hoverBg: 'hover:bg-[#FFF6D6]',
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
			en: 'Editing, Motion Code, Audio & Collaboration',
			id: 'Editing, Animasi Kode, Audio & Alur Kolaborasi',
		},
		hoverBg: 'hover:bg-[#EBFCE3]',
	},
	{
		href: '#craft-lab',
		num: '03',
		badge: { en: 'MINI GAMES & LAB', id: 'MINI GAME & LAB' },
		tileBg: 'bg-[#4D9DE0] text-[#FFFFFF]',
		icon: 'chess',
		title: {
			en: 'Interactive Craft Lab & Mini Games',
			id: 'Lab Interaktif & Mini Game',
		},
		subtitle: {
			en: 'Choose a mode below to try it out:',
			id: 'Pilih mode interaktif yang ingin dibuka:',
		},
		hoverBg: 'hover:bg-[#E7F4FD]',
		isInteractive: true,
	},
];

interface NavBarProps {
	onSelectCraftTab?: (tab: CraftLabTab) => void;
}

const SCROLL_SHRINK_DISTANCE = 200;

const NavBar = ({ onSelectCraftTab }: NavBarProps = {}) => {
	const { t } = useLanguage();
	const headerRef = useRef<HTMLElement>(null);
	const [shrinkProgress, setShrinkProgress] = useState(0);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [worksOpen, setWorksOpen] = useState(false);
	const [mobileWorksOpen, setMobileWorksOpen] = useState(false);

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
		setMobileWorksOpen(false);
		setWorksOpen(false);
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

	const renderWorksDropdownCards = (compact: boolean) =>
		WORKS_DROPDOWN_ITEMS.map((subItem) => {
			if (subItem.isInteractive) {
				return (
					<div
						key={subItem.href}
						className={`rounded-md border-2 border-[#050505] bg-[#FFFFFF] overflow-hidden ${
							compact ? 'shadow-[2px_2px_0_#050505]' : 'shadow-[2.5px_2.5px_0_#050505]'
						}`}
					>
						<button
							type='button'
							data-sfx='nav'
							onClick={() => jumpToSection(subItem.href)}
							className={`group w-full text-left flex items-center justify-between gap-2.5 ${subItem.hoverBg} transition-colors cursor-pointer ${
								compact ? 'px-2.5 py-2' : 'px-2.5 py-2.5'
							}`}
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span
									className={`size-9 rounded border-2 border-[#050505] shadow-[1.5px_1.5px_0_#050505] flex items-center justify-center shrink-0 ${subItem.tileBg}`}
									aria-hidden='true'
								>
									<ChessIcon className='size-4' />
								</span>

								<div className='min-w-0 space-y-0.5'>
									<div className='flex flex-wrap items-center gap-1.5'>
										<span className='font-mono text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-[#050505] text-[#5CE62E] leading-none uppercase'>
											{subItem.num} · {t(subItem.badge)}
										</span>
										<p className='font-display font-black text-[12.5px] text-[#050505] leading-snug'>
											{t(subItem.title)}
										</p>
									</div>
									<p className='font-mono text-[10px] font-medium text-[#3B404C] leading-snug'>
										{t(subItem.subtitle)}
									</p>
								</div>
							</div>

							<span className='size-6 rounded border-[1.5px] border-[#050505] bg-[#FCF0D3] group-hover:bg-[#FFD426] flex items-center justify-center shrink-0 transition-colors'>
								<ChevronRightIcon className='size-3.5 text-[#050505]' />
							</span>
						</button>

						{/* Direct Styled Launch Shortcuts matching Before/After, Chess vs Kris, and Meme SFX */}
						<div className='px-2.5 pb-2.5 pt-2 border-t-2 border-dashed border-[#050505]/20 bg-[#FAF3CF] grid grid-cols-1 sm:grid-cols-3 gap-1.5'>
							<button
								type='button'
								data-sfx='paper'
								onClick={() => jumpToCraftTab('compare')}
								className='group text-left rounded border-[1.5px] border-[#050505] bg-[#FFFFFF] hover:bg-[#E7F4FD] px-2 py-1.5 flex sm:flex-col items-center sm:items-start justify-between gap-1.5 shadow-[1.5px_1.5px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
							>
								<div className='flex items-center justify-between w-auto sm:w-full gap-1.5'>
									<span
										className='size-5 rounded-[2px] border border-[#050505] flex items-center justify-center shrink-0'
										style={{ background: 'linear-gradient(90deg, #161B26 50%, #3886C0 50%)' }}
										aria-hidden='true'
									>
										<LayersIcon className='size-3 text-white' />
									</span>
									<span className='px-1 py-0.5 rounded-[2px] bg-[#E7F4FD] border border-[#050505]/60 font-mono text-[8px] font-black text-[#204275] leading-none'>
										SPLIT
									</span>
								</div>
								<div className='min-w-0 flex-1 sm:w-full'>
									<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
										{t({ en: 'Before / After', id: 'Before / After' })}
									</p>
									<p className='font-mono text-[9px] font-bold text-[#3B404C] leading-tight'>
										{t({ en: '3 Studio Demos', id: '3 Demo Studio' })}
									</p>
								</div>
							</button>

							<button
								type='button'
								data-sfx='chess-tab'
								onClick={() => jumpToCraftTab('chess')}
								className='group text-left rounded border-[1.5px] border-[#050505] bg-[#F2FCEB] hover:bg-[#5CE62E] px-2 py-1.5 flex sm:flex-col items-center sm:items-start justify-between gap-1.5 shadow-[1.5px_1.5px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
							>
								<div className='flex items-center justify-between w-auto sm:w-full gap-1.5'>
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
									<span className='px-1 py-0.5 rounded-[2px] bg-[#5CE62E] group-hover:bg-[#050505] group-hover:text-[#5CE62E] border border-[#050505] font-mono text-[8px] font-black text-[#050505] leading-none'>
										{t({ en: 'PLAY ♟', id: 'MAIN ♟' })}
									</span>
								</div>
								<div className='min-w-0 flex-1 sm:w-full'>
									<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
										{t({ en: 'Chess vs Kris', id: 'Catur vs Kris' })}
									</p>
									<p className='font-mono text-[9px] font-bold text-[#1D3E2B] leading-tight'>
										1000–1900 Elo AI
									</p>
								</div>
							</button>

							<button
								type='button'
								data-sfx='sfx-tab'
								onClick={() => jumpToCraftTab('sfx')}
								className='group text-left rounded border-[1.5px] border-[#050505] border-b-[3px] bg-[#FFF3EF] hover:bg-[#FD6141] px-2 py-1.5 flex sm:flex-col items-center sm:items-start justify-between gap-1.5 shadow-[1.5px_1.5px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
							>
								<div className='flex items-center justify-between w-auto sm:w-full gap-1.5'>
									<span
										className='size-5 rounded-[2px] border border-[#050505] bg-[#FD6141] group-hover:bg-[#FCF0D3] flex items-center justify-center shrink-0'
										aria-hidden='true'
									>
										<AudioIcon className='size-3 text-[#050505]' />
									</span>
									<span className='px-1 py-0.5 rounded-[2px] bg-[#FFD426] border border-[#050505] font-mono text-[8px] font-black text-[#050505] leading-none'>
										{t({ en: '8 PADS', id: '8 PAD' })}
									</span>
								</div>
								<div className='min-w-0 flex-1 sm:w-full'>
									<p className='font-display font-black text-[11px] text-[#050505] leading-tight'>
										{t({ en: 'Meme SFX', id: 'Game SFX' })}
									</p>
									<p className='font-mono text-[9px] font-bold text-[#3B404C] leading-tight'>
										{t({ en: 'Memory Game', id: 'Memori Suara' })}
									</p>
								</div>
							</button>
						</div>
					</div>
				);
			}

			return (
				<button
					key={subItem.href}
					type='button'
					data-sfx='nav'
					onClick={() => jumpToSection(subItem.href)}
					className={`group w-full text-left flex items-center justify-between gap-2.5 rounded-md border-2 border-[#050505] bg-[#FFFFFF] ${subItem.hoverBg} transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-[1px] ${
						compact
							? 'px-2.5 py-2 shadow-[2px_2px_0_#050505]'
							: 'px-2.5 py-2.5 shadow-[2.5px_2.5px_0_#050505] hover:shadow-[3.5px_3.5px_0_#050505]'
					}`}
				>
					<div className='flex items-center gap-2.5 min-w-0'>
						<span
							className={`size-9 rounded border-2 border-[#050505] shadow-[1.5px_1.5px_0_#050505] flex items-center justify-center shrink-0 ${subItem.tileBg}`}
							aria-hidden='true'
						>
							{subItem.icon === 'film' ? (
								<FilmIcon className='size-4' />
							) : (
								<LayersIcon className='size-4' />
							)}
						</span>

						<div className='min-w-0 space-y-0.5'>
							<div className='flex flex-wrap items-center gap-1.5'>
								<span className='font-mono text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-[#050505] text-[#FFD426] leading-none uppercase'>
									{subItem.num} · {t(subItem.badge)}
								</span>
								<p className='font-display font-black text-[12.5px] text-[#050505] leading-snug'>
									{t(subItem.title)}
								</p>
							</div>
							<p className='font-mono text-[10px] font-medium text-[#3B404C] leading-snug'>
								{t(subItem.subtitle)}
							</p>
						</div>
					</div>

					<span className='size-6 rounded border-[1.5px] border-[#050505] bg-[#FCF0D3] group-hover:bg-[#FFD426] flex items-center justify-center shrink-0 transition-colors'>
						<ChevronRightIcon className='size-3.5 text-[#050505]' />
					</span>
				</button>
			);
		});

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
						if (item.href === '#videos') {
							return (
								<div
									key={item.href}
									className='relative'
									onMouseEnter={() => setWorksOpen(true)}
									onMouseLeave={() => setWorksOpen(false)}
								>
									<button
										type='button'
										data-sfx='nav'
										aria-expanded={worksOpen}
										onClick={() => jumpToSection(item.href)}
										className={`ds-header-link inline-flex items-center gap-1 whitespace-nowrap font-mono font-extrabold text-[11px] uppercase tracking-normal xl:tracking-wider py-1 transition-colors cursor-pointer ${
											worksOpen
												? 'text-[#FD6141]'
												: 'text-[#050505] hover:text-[#FD6141]'
										}`}
									>
										<span>{t(item.label)}</span>
										<span
											className='text-[10px] leading-none opacity-75'
											aria-hidden='true'
										>
											{worksOpen ? '▴' : '▾'}
										</span>
									</button>

									{worksOpen && (
										<div className='absolute left-0 top-full pt-2 w-[392px] max-w-[calc(100vw-2rem)] z-50'>
											<div className='ds-os-window rounded-lg overflow-hidden'>
												<div className='flex items-center justify-between gap-2 px-3 py-1.5 bg-[#EFE5CA] border-b-[2.5px] border-[#050505]'>
													<div className='flex items-center gap-2 min-w-0'>
														<span className='size-2.5 rounded-full bg-[#4D9DE0] border border-[#050505] shrink-0' />
														<span className='font-mono text-[10px] font-black text-[#050505] uppercase truncate'>
															{t({
																en: 'WORKS · VIDEOS, LAB & MINI GAMES',
																id: 'MENU KARYA · VIDEO, LAB & MINI GAME',
															})}
														</span>
													</div>
													<button
														type='button'
														data-sfx='close'
														aria-label={t({ en: 'Close works menu', id: 'Tutup menu karya' })}
														onClick={() => setWorksOpen(false)}
														className='size-4 rounded-sm bg-[#FCF0D3] border border-[#050505] inline-flex items-center justify-center text-[9px] font-black leading-none cursor-pointer shrink-0'
													>
														✕
													</button>
												</div>
												<div className='p-2.5 bg-[#F6EDD6] space-y-2'>
													{renderWorksDropdownCards(false)}
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
						{t({ en: 'Book a Project', id: 'Mulai Proyek' })}
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
					<div className='flex items-center justify-between px-4 py-2 bg-[#EFE5CA] border-b-[2.5px] border-[#050505]'>
						<div className='flex items-center gap-2 min-w-0'>
							<span className='size-2.5 rounded-full bg-[#4D9DE0] border border-[#050505] shrink-0' />
							<span className='font-mono text-xs font-black text-[#050505]'>
								NAVIGATION.MENUBAR
							</span>
						</div>
						<button
							type='button'
							data-sfx='close'
							onClick={() => setMobileOpen(false)}
							aria-label={t({ en: 'Close mobile menu', id: 'Tutup menu mobile' })}
							className='size-6 rounded-sm bg-[#FCF0D3] border-[1.5px] border-[#050505] font-mono text-xs font-black text-[#050505] inline-flex items-center justify-center cursor-pointer'
						>
							✕
						</button>
					</div>
					<nav className='p-3.5 sm:p-4 bg-[#F6EDD6] flex flex-col gap-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain'>
						{NAV_LINKS.map((item) => {
							if (item.href === '#videos') {
								return (
									<div
										key={item.href}
										className='shrink-0 rounded border-2 border-[#050505] bg-white shadow-[2px_2px_0_#050505] overflow-hidden transition-colors'
									>
										<button
											type='button'
											data-sfx='nav'
											aria-expanded={mobileWorksOpen}
											onClick={() => setMobileWorksOpen((prev) => !prev)}
											className='w-full flex items-center justify-between gap-2 px-3 py-2.5 font-display font-black text-sm text-[#050505] hover:text-[#FD6141] transition-colors cursor-pointer'
										>
											<span className='inline-flex items-center gap-2'>
												<span>{t(item.label)}</span>
											</span>
											<span className='inline-flex items-center gap-1.5 font-mono text-[10px] font-black px-2 py-0.5 rounded-[2px] bg-[#E3F5DA] text-[#050505] border border-[#050505]/70 whitespace-nowrap shrink-0'>
												<ChessIcon className='size-3 shrink-0' />
												<span>{t({ en: 'VIDEOS + GAMES', id: 'VIDEO + GAME' })}</span>
												<span aria-hidden='true'>{mobileWorksOpen ? '▴' : '▾'}</span>
											</span>
										</button>

										{mobileWorksOpen && (
											<div className='border-t-2 border-[#050505] bg-[#EFE5CA] p-2.5 space-y-2'>
												<div className='flex items-center justify-between px-1 py-0.5'>
													<span className='font-mono text-[10px] font-black text-[#3B404C] uppercase'>
														{t({ en: 'WORKS · VIDEOS, LAB & MINI GAMES', id: 'ISI KARYA · VIDEO, LAB & MINI GAME' })}
													</span>
												</div>
												{renderWorksDropdownCards(true)}
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
							{t({ en: 'Start a Project Brief', id: 'Kirim Brief Proyek' })}
						</button>
					</nav>
				</div>
			)}
		</header>
	);
};

export default NavBar;
