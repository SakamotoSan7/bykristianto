import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TitleHeader from '../components/TitleHeader';
import { AspectFrameIcon, LanguageFlagIcon, PlayIcon } from '../components/Icons';
import { useLanguage } from '../context/useLanguage';
import { useSound } from '../context/useSound';
import {
	VIDEO_WORKS,
	type LocalizedText,
	type VideoCategory,
	type VideoLanguage,
	type VideoRatio,
	type VideoWork,
} from '../data/portfolioData';

const VideoModal = lazy(() => import('../components/VideoModal'));

type RatioFilter = 'ALL' | VideoRatio;
type LangFilter = 'ALL' | VideoLanguage;
type CategoryFilter = 'ALL' | VideoCategory;

interface VideoPortfolioSectionProps {
	onSelectStyleForContact: (styleSummary: LocalizedText) => void;
}

const CATEGORY_CHROME: Record<VideoCategory, { dot: string; accentBorder: string }> = {
	editorial: { dot: 'bg-[#FD6141]', accentBorder: 'border-l-[#FD6141]' },
	'3d-shader': { dot: 'bg-[#3886C0]', accentBorder: 'border-l-[#3886C0]' },
	'systems-data': { dot: 'bg-[#FFD426]', accentBorder: 'border-l-[#FFD426]' },
	remotion: { dot: 'bg-[#5CE62E]', accentBorder: 'border-l-[#5CE62E]' },
};

const VideoPortfolioSection = ({
	onSelectStyleForContact,
}: VideoPortfolioSectionProps) => {
	const { t } = useLanguage();
	const { soundEnabled, playPreset } = useSound();
	const [ratioFilter, setRatioFilter] = useState<RatioFilter>('ALL');
	const [langFilter, setLangFilter] = useState<LangFilter>('ALL');
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
	const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

	const filteredVideos = useMemo(() => {
		return VIDEO_WORKS.filter((item) => {
			if (ratioFilter !== 'ALL' && item.aspectRatio !== ratioFilter) return false;
			if (langFilter !== 'ALL' && item.language !== langFilter) return false;
			if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
			return true;
		}).sort((a, b) => Number(a.badgeNumber) - Number(b.badgeNumber));
	}, [ratioFilter, langFilter, categoryFilter]);

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);
		ScrollTrigger.refresh();
	}, [filteredVideos.length]);

	const activeIndex = useMemo(
		() => filteredVideos.findIndex((v) => v.id === activeVideoId),
		[filteredVideos, activeVideoId]
	);

	const activeVideo = activeIndex >= 0 ? filteredVideos[activeIndex] : null;

	const handlePrev = useCallback(() => {
		if (activeIndex > 0) setActiveVideoId(filteredVideos[activeIndex - 1].id);
	}, [activeIndex, filteredVideos]);

	const handleNext = useCallback(() => {
		if (activeIndex >= 0 && activeIndex < filteredVideos.length - 1) {
			setActiveVideoId(filteredVideos[activeIndex + 1].id);
		}
	}, [activeIndex, filteredVideos]);

	const categories: { value: CategoryFilter; label: { en: string; id: string } }[] = [
		{ value: 'ALL', label: { en: 'All Styles', id: 'Semua Gaya' } },
		{ value: 'editorial', label: { en: 'Editorial & Collage', id: 'Editorial & Kolase' } },
		{ value: '3d-shader', label: { en: '3D & Shaders', id: '3D & Shader' } },
		{ value: 'systems-data', label: { en: 'Data & Typography', id: 'Data & Tipografi' } },
		{ value: 'remotion', label: { en: 'React Video (Remotion)', id: 'Video React (Remotion)' } },
	];

	const resetFilters = () => {
		setRatioFilter('ALL');
		setLangFilter('ALL');
		setCategoryFilter('ALL');
	};

	return (
		<section
			id='videos'
			className='substrate-blue-mat relative overflow-x-clip border-b-[4px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<TitleHeader
					figCode='FIG.01'
					sub={t({
						en: '14 SELECTED WORKS',
						id: '14 KARYA TERPILIH',
					})}
					title={t({
						en: 'Selected Video & Motion Explainer Works',
						id: 'Karya Video & Motion Explainer Terpilih',
					})}
					badgeColor='yellow'
					onDarkMat
					description={t({
						en: 'Click any video to watch with production notes.',
						id: 'Klik video mana saja untuk menonton lengkap dengan catatan produksi.',
					})}
				/>

				{/* Tactile Risograph Filter Console */}
				<div className='mt-10 mb-10 rounded-md border-[2.5px] border-[#050505] bg-[#FCF0D3] p-4 sm:p-5 shadow-[5px_5px_0_#050505] space-y-3.5'>
					<div className='flex flex-wrap items-center justify-between gap-4'>
						<div className='flex flex-wrap items-center gap-x-6 gap-y-3'>
							{/* Aspect Ratio Group */}
							<div className='flex flex-wrap items-center gap-1.5'>
								<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#3B404C] mr-1'>
									{t({ en: 'Aspect:', id: 'Rasio:' })}
								</span>
								{(
									[
										{ val: 'ALL', label: { en: 'All (14)', id: 'Semua (14)' } },
										{ val: '9:16', label: { en: '9:16 Vertical (8)', id: '9:16 Vertikal (8)' } },
										{ val: '16:9', label: { en: '16:9 Horizontal (6)', id: '16:9 Horizontal (6)' } },
									] as const
								).map((btn) => (
									<button
										key={btn.val}
										type='button'
										data-sfx='paper'
										aria-pressed={ratioFilter === btn.val}
										onClick={() => setRatioFilter(btn.val)}
										className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold border-[1.5px] border-[#050505] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
											ratioFilter === btn.val
												? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FD6141]'
												: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FFD426]'
										}`}
									>
										{btn.val !== 'ALL' && (
											<AspectFrameIcon
												orientation={btn.val}
												className='size-3.5 shrink-0'
											/>
										)}
										{t(btn.label)}
									</button>
								))}
							</div>

							{/* Language Group */}
							<div className='flex flex-wrap items-center gap-1.5'>
								<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#3B404C] mr-1'>
									{t({ en: 'Lang:', id: 'Bahasa:' })}
								</span>
								{(
									[
										{ val: 'ALL', label: { en: 'All', id: 'Semua' } },
										{ val: 'EN', label: { en: 'English (8)', id: 'English (8)' } },
										{ val: 'ID', label: { en: 'Indonesia (6)', id: 'Indonesia (6)' } },
									] as const
								).map((btn) => (
									<button
										key={btn.val}
										type='button'
										data-sfx='paper'
										aria-pressed={langFilter === btn.val}
										onClick={() => setLangFilter(btn.val)}
										className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold border-[1.5px] border-[#050505] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
											langFilter === btn.val
												? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FD6141]'
												: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FFD426]'
										}`}
									>
										{btn.val !== 'ALL' && (
											<LanguageFlagIcon
												lang={btn.val}
												className='w-3.5 h-2.5 shrink-0'
											/>
										)}
										{t(btn.label)}
									</button>
								))}
							</div>
						</div>

						<span className='font-mono text-xs font-black text-[#050505] select-none'>
							{filteredVideos.length} / {VIDEO_WORKS.length}{' '}
							{t({ en: 'VIDEOS', id: 'VIDEO' })}
						</span>
					</div>

					{/* Category Filter Row */}
					<div className='pt-3 border-t border-dashed border-[#050505]/20 flex flex-wrap items-center gap-1.5'>
						<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#3B404C] mr-1'>
							{t({ en: 'Style:', id: 'Gaya:' })}
						</span>
						{categories.map((cat) => (
							<button
								key={cat.value}
								type='button'
								data-sfx='paper'
								aria-pressed={categoryFilter === cat.value}
								onClick={() => setCategoryFilter(cat.value)}
								className={`px-2.5 py-1 rounded text-xs font-bold border-[1.5px] border-[#050505] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
									categoryFilter === cat.value
										? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FD6141]'
										: 'bg-[#FFFFFF] text-[#050505] shadow-[2px_2px_0_#050505] hover:bg-[#FFD426]'
								}`}
							>
								{t(cat.label)}
							</button>
						))}
					</div>
				</div>

				{/* Empty Filter Fallback */}
				{filteredVideos.length === 0 ? (
					<div className='rounded-md border-[3px] border-[#050505] bg-[#FCF0D3] p-12 text-center shadow-[6px_6px_0_#050505] space-y-4'>
						<p className='font-display font-black text-lg text-[#050505]'>
							{t({
								en: 'No works match that exact filter combination.',
								id: 'Tidak ada karya yang cocok dengan kombinasi filter ini.',
							})}
						</p>
						<button
							type='button'
							data-sfx='paper'
							onClick={resetFilters}
							className='rounded border-2 border-[#050505] bg-[#FFD426] px-6 py-2.5 text-sm font-display font-black shadow-[4px_4px_0_#050505] cursor-pointer'
						>
							{t({ en: 'Reset & Show All 14', id: 'Tampilkan Semua 14 Karya' })}
						</button>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7'>
						{filteredVideos.map((video: VideoWork) => {
							const isVertical = video.aspectRatio === '9:16';
							const headerTheme = CATEGORY_CHROME[video.category];

							return (
								<article
									key={video.id}
									data-sfx='cassette'
									onClick={() => setActiveVideoId(video.id)}
									role='button'
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											if (soundEnabled) playPreset('cassette');
											setActiveVideoId(video.id);
										}
									}}
									className='ds-panel-paper rounded-md overflow-hidden flex flex-col cursor-pointer group'
								>
									{/* Crisp Cream OS Header with Category Accent Edge & Dot */}
									<div
										className={`flex items-center gap-2 px-3.5 py-2 bg-[#F6EDD6] border-b-[2.5px] border-[#050505] border-l-[6px] ${headerTheme.accentBorder}`}
									>
										<span
											className={`size-2.5 rounded-full border border-[#050505] shrink-0 ${headerTheme.dot}`}
											aria-hidden='true'
										/>
										<span className='font-mono text-[11px] font-black text-[#050505] truncate'>
											{video.badgeNumber} · {video.style}
										</span>
										<div className='ds-titlebar-grips flex-1 h-2.5' aria-hidden='true' />
										<span className='px-1.5 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] leading-none shrink-0 select-none'>
											{video.durationLabel}
										</span>
									</div>

									{/* Thumbnail Viewport */}
									<div
										className={`relative aspect-[16/10] w-full overflow-hidden border-b-[2.5px] border-[#050505] ${
											isVertical ? 'bg-[#0C1018]' : 'bg-[#121212]'
										}`}
									>
										{isVertical ? (
											<>
												<img
													src={video.thumbnailPath}
													alt=''
													aria-hidden='true'
													loading='lazy'
													decoding='async'
													className='absolute inset-0 w-full h-full object-cover blur-lg opacity-25 scale-110'
												/>
												<div
													className='absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-[#050505]/70 pointer-events-none'
													aria-hidden='true'
												/>
												<div className='relative z-10 h-full w-full flex items-center justify-center py-2.5'>
													<div className='relative h-full aspect-[9/16] rounded-[6px] overflow-hidden border-[2.5px] border-[#FFD426] bg-[#050505] shadow-[0_0_0_2px_#050505]'>
														<span
															className='pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 z-20 w-5 h-1 rounded-full bg-[#FFD426]/90 border border-[#050505]/70'
															aria-hidden='true'
														/>
														<img
															src={video.thumbnailPath}
															alt={`${video.style}: ${t(video.title)}`}
															loading='lazy'
															className='w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300'
														/>
													</div>
												</div>
											</>
										) : (
											<>
												<img
													src={video.thumbnailPath}
													alt={`${video.style}: ${t(video.title)}`}
													loading='lazy'
													className='w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300'
												/>
												<div
													className='pointer-events-none absolute inset-1.5 border border-[#7DD3FC]/35'
													aria-hidden='true'
												/>
											</>
										)}

										{/* Comic Center Play Trigger */}
										<div className='absolute inset-0 z-20 flex items-center justify-center pointer-events-none'>
											<span className='size-12 rounded-full bg-[#FCF0D3] border-[3px] border-[#050505] text-[#050505] flex items-center justify-center shadow-[4px_4px_0_#050505] group-hover:scale-110 group-hover:bg-[#FFD426] transition-transform duration-150'>
												<PlayIcon className='size-5 ml-0.5' />
											</span>
										</div>
									</div>

									{/* Card Details Body */}
									<div className='p-5 flex-1 flex flex-col justify-between gap-4 bg-[#FCF0D3]'>
										<div className='space-y-2'>
											{/* Single Clean Metadata Strip (zero duplicate pills) */}
											<div className='flex items-center justify-between gap-2 font-mono text-[11px] font-bold text-[#3B404C] select-none'>
												<div className='inline-flex items-center gap-2'>
													<span className='inline-flex items-center gap-1'>
														<LanguageFlagIcon
															lang={video.language}
															className='w-3.5 h-2.5 shrink-0'
														/>
														<span>{video.language}</span>
													</span>
													<span className='text-[#050505]/30' aria-hidden='true'>·</span>
													<span className='inline-flex items-center gap-1'>
														<AspectFrameIcon
															orientation={video.aspectRatio}
															className='size-3 shrink-0'
														/>
														<span>{video.aspectRatio}</span>
													</span>
												</div>
												{video.subtitlePath && (
													<span className='px-1.5 py-0.5 rounded-[2px] bg-[#050505]/10 text-[#050505] font-mono text-[10px] font-black leading-none'>
														CC
													</span>
												)}
											</div>

											<h3 className='font-display font-black text-lg text-[#050505] leading-snug line-clamp-2 group-hover:text-[#C5432F] transition-colors'>
												{t(video.title)}
											</h3>

											<p className='text-[13.5px] text-[#3B404C] leading-relaxed line-clamp-2'>
												{t(video.caseStudy.hook)}
											</p>
										</div>

										<div className='pt-3 border-t border-dashed border-[#050505]/20 flex items-center justify-between gap-2'>
											<span className='font-mono text-[11px] font-bold text-[#3B404C]/90 truncate'>
												{video.renderTech}
											</span>
											<span className='shrink-0 px-2.5 py-1 rounded border-[1.5px] border-[#050505] bg-[#FFFFFF] group-hover:bg-[#FFD426] text-[#050505] font-mono font-black text-[11px] shadow-[2px_2px_0_#050505] transition-colors'>
												{t({ en: 'WATCH →', id: 'TONTON →' })}
											</span>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</div>

			{/* Retro OS Screening Room Modal */}
			{activeVideo && (
				<Suspense fallback={null}>
					<VideoModal
						video={activeVideo}
						onClose={() => setActiveVideoId(null)}
						onPrev={handlePrev}
						onNext={handleNext}
						hasPrev={activeIndex > 0}
						hasNext={activeIndex >= 0 && activeIndex < filteredVideos.length - 1}
						onRequestSimilarStyle={(styleLabel) => {
							setActiveVideoId(null);
							// Wait two animation frames so VideoModal unmounts and releases scroll lock cleanly before smooth-scrolling
							window.requestAnimationFrame(() => {
								window.requestAnimationFrame(() => {
									onSelectStyleForContact(styleLabel);
								});
							});
						}}
					/>
				</Suspense>
			)}
		</section>
	);
};

export default VideoPortfolioSection;
