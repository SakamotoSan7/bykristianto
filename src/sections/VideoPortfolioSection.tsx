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

const TITLEBAR_COLORS: Record<VideoCategory, string> = {
	editorial: 'bg-[#FD6141]',
	'3d-shader': 'bg-[#4D9DE0]',
	'systems-data': 'bg-[#FFD426]',
	remotion: 'bg-[#5CE62E]',
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
		{ value: '3d-shader', label: { en: '3D & Shaders', id: '3D & Efek Visual' } },
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
						id: 'Etalase 14 Karya Video & Motion Explainer',
					})}
					bullets={[
						t({ en: '9:16 Vertical Reels', id: 'Reels Vertikal 9:16' }),
						t({ en: '16:9 Widescreen Explainers', id: 'Explainer Layar Lebar 16:9' }),
						t({ en: 'Premiere/AE · Video-as-Code · Clear SFX', id: 'Editing Premiere/AE · Kode Motion · SFX Jernih' }),
					]}
					badgeColor='yellow'
					onDarkMat
					description={t({
						en: 'Click any card to watch the full video (most feature crisp burned-in captions; CC-badged reels include toggleable subtitle tracks) and read behind-the-scenes production notes.',
						id: 'Klik kartu untuk menonton video penuh (sebagian besar sudah dilengkapi teks layar permanen; karya berlabel CC memiliki opsi track subtitle) dan membaca catatan produksinya.',
					})}
				/>

				{/* Archival Index Filter Console */}
				<div className='mt-10 mb-10 rounded-md border-[3px] border-[#050505] bg-[#FCF0D3] p-4 sm:p-5 shadow-[6px_6px_0_#050505] space-y-4'>
					<div className='flex flex-wrap items-center justify-between gap-4'>
						{/* Ratio filters */}
						<div className='flex flex-wrap items-center gap-2'>
							<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] mr-1'>
								{t({ en: 'Aspect:', id: 'Rasio:' })}
							</span>
							{(
								[
									{ val: 'ALL', label: { en: 'All (14)', id: 'Semua (14)' } },
									{ val: '9:16', label: { en: '9:16 Vertical (8)', id: '9:16 Vertikal (8)' } },
									{ val: '16:9', label: { en: '16:9 Widescreen (6)', id: '16:9 Horizontal (6)' } },
								] as const
							).map((btn) => (
								<button
									key={btn.val}
									type='button'
									data-sfx='paper'
									aria-pressed={ratioFilter === btn.val}
									onClick={() => setRatioFilter(btn.val)}
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-extrabold border-2 border-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
										ratioFilter === btn.val
											? 'bg-[#FD6141] text-[#050505]'
											: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#FFD426]'
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

						{/* Language filters */}
						<div className='flex flex-wrap items-center gap-2'>
							<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] mr-1'>
								{t({ en: 'Lang:', id: 'Bahasa:' })}
							</span>
							{(
								[
									{ val: 'ALL', label: { en: 'All Languages', id: 'Semua Bahasa' } },
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
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-extrabold border-2 border-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
										langFilter === btn.val
											? 'bg-[#3886C0] text-[#FFFFFF]'
											: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#FFD426]'
									}`}
								>
									{btn.val !== 'ALL' && (
										<LanguageFlagIcon
											lang={btn.val}
											className='w-4 h-2.5 shrink-0'
										/>
									)}
									{t(btn.label)}
								</button>
							))}
						</div>
					</div>

					{/* Category tags + count */}
					<div className='pt-3 border-t-2 border-dashed border-[#050505]/25 flex flex-wrap items-center justify-between gap-3'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] mr-1'>
								{t({ en: 'Technique:', id: 'Gaya:' })}
							</span>
							{categories.map((cat) => (
								<button
									key={cat.value}
									type='button'
									data-sfx='paper'
									aria-pressed={categoryFilter === cat.value}
									onClick={() => setCategoryFilter(cat.value)}
									className={`px-3 py-1 rounded text-xs font-bold border-2 border-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
										categoryFilter === cat.value
											? 'bg-[#FFD426] text-[#050505]'
											: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#F6EDD6]'
									}`}
								>
									{t(cat.label)}
								</button>
							))}
						</div>

						<span className='font-mono text-xs font-black text-[#050505] bg-[#F6EDD6] px-3 py-1 rounded-sm border-2 border-dashed border-[#050505]/50 select-none'>
							{filteredVideos.length} / {VIDEO_WORKS.length}{' '}
							{t({ en: 'VIDEOS', id: 'VIDEO' })}
						</span>
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
							const barBg = TITLEBAR_COLORS[video.category];

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
									{/* Style D Retro OS Title Bar */}
									<div
										className={`flex items-center gap-2 px-3 py-1.5 border-b-[3px] border-[#050505] ${barBg}`}
									>
										<span className='size-3 rounded-full bg-[#FCF0D3] border-2 border-[#050505] shrink-0' />
										<span className='font-mono text-[11px] font-black text-[#050505] truncate'>
											FIG.{video.badgeNumber.replace('#', '')} · {video.language} ·{' '}
											{video.aspectRatio}
										</span>
										<div
											className='ds-titlebar-grips flex-1 h-3'
											aria-hidden='true'
										/>
										<span className='px-1.5 py-0.5 rounded-sm bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] leading-none shrink-0 select-none'>
											{video.durationLabel}
										</span>
									</div>

									{/* Thumbnail Viewport */}
									<div
										className={`relative aspect-[16/10] w-full overflow-hidden border-b-[3px] border-[#050505] ${
											isVertical ? 'bg-[#0C1018]' : 'bg-[#121212]'
										}`}
									>
										{isVertical ? (
											<>
												<img
													src={video.thumbnailPath}
													alt=''
													aria-hidden='true'
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
									<div className='p-5 flex-1 flex flex-col justify-between gap-4 bg-[#F6EDD6]'>
										<div className='space-y-2'>
											<div className='flex flex-wrap items-center justify-between gap-2 text-xs font-mono'>
												<span className='font-black text-[#C5432F] uppercase'>
													{video.style}
												</span>
												<div className='flex items-center gap-1.5 shrink-0 select-none'>
													<span
														className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none border border-dashed text-[10px] font-black leading-none ${
															video.language === 'EN'
																? 'bg-[#DBEAFE] border-[#1D4ED8]/65 text-[#1E3A8A]'
																: 'bg-[#FEE2E2] border-[#DC2626]/65 text-[#991B1B]'
														}`}
													>
														<LanguageFlagIcon
															lang={video.language}
															className='w-3.5 h-2.5 shrink-0'
														/>
														{video.language}
													</span>
													<span
														className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none border border-dashed text-[10px] font-black leading-none ${
															isVertical
																? 'bg-[#FEF3C7] border-[#B45309]/60 text-[#78350F]'
																: 'bg-[#E0F2FE] border-[#0369A1]/60 text-[#0C4A6E]'
														}`}
													>
														<AspectFrameIcon
															orientation={video.aspectRatio}
															className='size-3 shrink-0'
														/>
														{video.aspectRatio}
													</span>
													{video.subtitlePath && (
														<span className='px-1.5 py-0.5 rounded-none bg-[#050505]/10 border border-dashed border-[#050505]/45 text-[10px] text-[#050505] font-black leading-none'>
															CC
														</span>
													)}
												</div>
											</div>

											<h3 className='font-display font-black text-lg text-[#050505] leading-snug line-clamp-2 group-hover:text-[#204275] transition-colors'>
												{t(video.title)}
											</h3>

											<p className='text-sm text-[#2C313A] leading-relaxed line-clamp-1 font-medium'>
												{t(video.caseStudy.hook)}
											</p>
										</div>

										<div className='pt-3 border-t-2 border-dashed border-[#050505]/25 flex items-center justify-between gap-2'>
											<span className='font-mono text-[11px] font-bold text-[#3B404C] truncate'>
												{video.renderTech}
											</span>
											<span className='shrink-0 px-3 py-1 rounded border-2 border-[#050505] bg-[#FFFFFF] group-hover:bg-[#FFD426] text-[#050505] font-mono font-black text-[11px] shadow-[2px_2px_0_#050505] transition-colors'>
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
