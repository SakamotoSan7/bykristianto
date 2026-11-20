import { useEffect, useState } from 'react';
import { useLanguage } from '../context/useLanguage';
import { useSound } from '../context/useSound';
import { getVideoSrc, type LocalizedText, type VideoWork } from '../data/portfolioData';
import { useScrollLock } from '../utils/scrollLock';
import {
	ArrowUpRightIcon,
	AspectFrameIcon,
	AudioIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CloseIcon,
	CodeIcon,
	FilmIcon,
	LanguageFlagIcon,
	LayersIcon,
} from './Icons';

interface VideoModalProps {
	video: VideoWork | null;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
	hasPrev: boolean;
	hasNext: boolean;
	onRequestSimilarStyle: (styleSummary: LocalizedText) => void;
}

const VideoModal = ({
	video,
	onClose,
	onPrev,
	onNext,
	hasPrev,
	hasNext,
	onRequestSimilarStyle,
}: VideoModalProps) => {
	const { t } = useLanguage();
	const { setBgmDuckForVideo } = useSound();
	const [loadError, setLoadError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		setBgmDuckForVideo(Boolean(video));
		return () => setBgmDuckForVideo(false);
	}, [video, setBgmDuckForVideo]);

	useEffect(() => {
		setLoadError(false);
		setRetryCount(0);
	}, [video?.id]);

	useScrollLock(Boolean(video));

	useEffect(() => {
		if (!video) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowLeft' && hasPrev) onPrev();
			if (e.key === 'ArrowRight' && hasNext) onNext();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [video, onClose, onPrev, onNext, hasPrev, hasNext]);

	if (!video) return null;

	const isVertical = video.aspectRatio === '9:16';
	const videoUrl = getVideoSrc(video.fileName);

	return (
		<div
			className='fixed inset-0 z-[150] flex items-center justify-center p-2.5 sm:p-6 bg-[#050505]/86 overflow-hidden overscroll-none'
			role='dialog'
			aria-modal='true'
			aria-labelledby='video-modal-title'
			onClick={onClose}
		>
			<div
				className='relative w-full max-w-6xl ds-os-window rounded-sm overflow-hidden max-h-[92dvh] flex flex-col my-auto'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Style D Retro OS Screening Title Bar */}
				<div className='shrink-0 z-20 flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 bg-[#3886C0] border-b-[3.5px] border-[#050505]'>
					<div className='flex flex-wrap items-center gap-2 min-w-0 flex-1'>
						<span className='size-5 border-2 border-[#050505] bg-[#FCF0D3] flex items-center justify-center font-mono text-[10px] font-black text-[#050505] shrink-0'>
							▶
						</span>
						<span className='px-2 py-0.5 rounded-none bg-[#FFD426] border border-[#050505] font-mono text-xs font-black text-[#050505] select-none'>
							FIG.{video.badgeNumber.replace(/^#/, '')} · {video.style}
						</span>
						<div className='hidden md:block flex-1 h-4 ds-titlebar-grips mx-1' aria-hidden='true' />
						<span className='px-2 py-0.5 rounded-sm bg-[#121212] text-[#FCF0D3] font-mono text-[11px] font-bold'>
							{video.durationLabel} · {video.resolution}
						</span>
					</div>

					<div className='flex items-center gap-1.5 shrink-0'>
						<button
							type='button'
							data-sfx='shutter'
							disabled={!hasPrev}
							onClick={onPrev}
							aria-label={t({ en: 'Previous video', id: 'Video sebelumnya' })}
							className='p-1.5 rounded-sm border-2 border-[#050505] bg-[#FCF0D3] hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-[#FCF0D3] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0_#050505]'
						>
							<ChevronLeftIcon className='size-4 text-[#050505]' />
						</button>
						<button
							type='button'
							data-sfx='shutter'
							disabled={!hasNext}
							onClick={onNext}
							aria-label={t({ en: 'Next video', id: 'Video berikutnya' })}
							className='p-1.5 rounded-sm border-2 border-[#050505] bg-[#FCF0D3] hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-[#FCF0D3] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0_#050505]'
						>
							<ChevronRightIcon className='size-4 text-[#050505]' />
						</button>
						<button
							type='button'
							data-sfx='close'
							onClick={onClose}
							aria-label={t({ en: 'Close modal', id: 'Tutup pemutar video' })}
							className='p-1.5 rounded-sm border-2 border-[#050505] bg-[#FD6141] text-[#050505] hover:bg-[#ff785c] transition-colors cursor-pointer ml-1 shadow-[2px_2px_0_#050505]'
						>
							<CloseIcon className='size-4' />
						</button>
					</div>
				</div>

				{/* Screening Booth + Production Spec Sheet Body */}
				<div className='flex flex-col lg:grid lg:grid-cols-12 min-h-0 flex-1 max-lg:overflow-y-auto max-lg:overscroll-contain'>
					{/* Darkroom Screening Monitor */}
					<div className='max-lg:shrink-0 lg:col-span-7 substrate-carbon p-4 sm:p-6 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] lg:min-h-0 border-b-[3.5px] lg:border-b-0 lg:border-r-[3.5px] border-[#050505]'>
						<div className='w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[9.5px] sm:text-[10px] font-mono text-[#FFD426]/85 mb-2 px-0.5'>
							<span className='whitespace-nowrap'>
								SCREENING_ROOM // REEL_{video.badgeNumber} · {video.aspectRatio}
							</span>
							<span className='whitespace-nowrap'>H.264 · 30FPS · VOICE + SFX</span>
						</div>

						<div
							className={`relative w-full shrink-0 overflow-hidden rounded-sm border-[3px] border-[#FCF0D3] bg-black shadow-[6px_6px_0_#050505] ${
								isVertical
									? 'max-w-[min(275px,64vw)] sm:max-w-[300px] lg:max-w-[min(330px,calc((92dvh-165px)*9/16))] aspect-[9/16]'
									: 'aspect-video lg:max-w-[min(100%,calc((92dvh-165px)*16/9))]'
							}`}
						>
							{!loadError ? (
								<video
									key={`${video.id}-${retryCount}`}
									src={videoUrl}
									poster={video.thumbnailPath}
									controls
									playsInline
									preload='metadata'
									onError={() => {
										console.warn('[VideoModal] Unable to stream video:', videoUrl);
										setLoadError(true);
									}}
									className='absolute inset-0 w-full h-full object-contain bg-black'
								>
									{video.subtitlePath && (
										<track
											kind='subtitles'
											src={video.subtitlePath}
											srcLang={video.language.toLowerCase()}
											label={video.language === 'ID' ? 'Bahasa Indonesia' : 'English'}
										/>
									)}
								</video>
							) : (
								<div className='relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center'>
									<img
										src={video.thumbnailPath}
										alt={t(video.title)}
										className='absolute inset-0 w-full h-full object-cover opacity-35 blur-xs'
									/>
									<div className='relative z-10 bg-[#121212]/95 border-2 border-[#FFD426] rounded-sm p-4 sm:p-5 max-w-md space-y-2.5'>
										<p className='text-[#FFD426] font-mono font-bold text-xs sm:text-sm'>
											{t({
												en: 'Video stream is currently unavailable',
												id: 'Video belum dapat diputar saat ini',
											})}
										</p>
										<p className='text-[#FCF0D3]/85 text-xs leading-relaxed'>
											{t({
												en: 'Please try reloading the player, or reach out directly via Contact if you need a private review link.',
												id: 'Silakan muat ulang pemutar video, atau hubungi lewat form Kontak jika membutuhkan tautan pratinjau langsung.',
											})}
										</p>
										<button
											type='button'
											data-sfx='switch'
											onClick={() => {
												setLoadError(false);
												setRetryCount((c) => c + 1);
											}}
											className='inline-flex items-center px-3 py-1.5 rounded-sm border-2 border-[#050505] bg-[#FFD426] hover:bg-[#5CE62E] font-mono text-[11px] font-black text-[#050505] cursor-pointer transition-colors'
										>
											{t({ en: 'Retry Playback', id: 'Coba Putar Ulang' })}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Right Production Spec Sheet + Pinned Action Bar */}
					<div className='max-lg:shrink-0 lg:col-span-5 flex flex-col min-h-0 bg-[#FCF0D3] lg:max-h-[calc(92dvh-58px)]'>
						<div className='flex-1 min-h-0 p-5 sm:p-6 lg:overflow-y-auto lg:overscroll-contain space-y-4'>
							<div className='border-b-2 border-[#050505]/15 pb-4 space-y-2'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<p className='font-mono text-[11px] font-black uppercase tracking-wider text-[#3886C0]'>
										{t(video.styleTagline)}
									</p>
									<span className='inline-flex items-center gap-1.5 font-mono text-[11px] font-extrabold text-[#050505]'>
										<AspectFrameIcon orientation={video.aspectRatio} className='size-3.5 shrink-0' />
										<span>{video.aspectRatio}</span>
										<span className='text-[#050505]/35'>·</span>
										<LanguageFlagIcon lang={video.language} className='w-3.5 h-2.5 shrink-0' />
										<span>{video.language === 'EN' ? 'ENGLISH' : 'INDONESIA'}</span>
										{video.subtitlePath && (
											<span className='ml-0.5 px-1.5 py-0.5 rounded-[2px] bg-[#050505] text-[#FFD426] text-[9.5px] font-black leading-none'>
												CC
											</span>
										)}
									</span>
								</div>
								<h3
									id='video-modal-title'
									className='font-display font-black text-xl sm:text-2xl text-[#050505] leading-snug'
								>
									{t(video.title)}
								</h3>
							</div>

							<div className='divide-y divide-[#050505]/15 text-sm'>
								<div className='pb-3.5 first:pt-0'>
									<div className='flex items-center gap-2 font-display font-black text-[#050505] mb-1.5'>
										<span className='size-6 rounded-[3px] border border-[#050505] bg-[#FD6141] flex items-center justify-center shrink-0'>
											<FilmIcon className='size-3.5 text-[#050505]' />
										</span>
										<span>{t({ en: 'Opening Hook & Research', id: 'Pembuka (Hook) & Riset Cerita' })}</span>
									</div>
									<p className='text-[#050505] leading-relaxed text-xs sm:text-sm font-medium'>
										{t(video.caseStudy.hook)}
									</p>
									<p className='text-[#3B404C] text-xs mt-1.5 leading-relaxed'>
										{t(video.caseStudy.storyAngle)}
									</p>
								</div>

								<div className='py-3.5'>
									<div className='flex items-center gap-2 font-display font-black text-[#050505] mb-1.5'>
										<span className='size-6 rounded-[3px] border border-[#050505] bg-[#3886C0] flex items-center justify-center shrink-0'>
											<CodeIcon className='size-3.5 text-[#FFFFFF]' />
										</span>
										<span>{t({ en: 'Visuals & Motion Technique', id: 'Visual & Teknik Animasi' })}</span>
									</div>
									<p className='text-xs font-mono font-extrabold text-[#204275] mb-1'>
										{video.renderTech}
									</p>
									<p className='text-[#3B404C] text-xs sm:text-sm leading-relaxed'>
										{t(video.caseStudy.visualCraft)}
									</p>
								</div>

								<div className='py-3.5'>
									<div className='flex items-center gap-2 font-display font-black text-[#050505] mb-1.5'>
										<span className='size-6 rounded-[3px] border border-[#050505] bg-[#5CE62E] flex items-center justify-center shrink-0'>
											<AudioIcon className='size-3.5 text-[#050505]' />
										</span>
										<span>{t({ en: 'Sound Design & Effects (SFX)', id: 'Tata Suara & Efek Suara (SFX)' })}</span>
									</div>
									<p className='text-[#3B404C] text-xs sm:text-sm leading-relaxed'>
										{t(video.caseStudy.audioDesign)}
									</p>
								</div>

								<div className='pt-3.5 flex items-start gap-2 text-xs text-[#2C313A]'>
									<LayersIcon className='size-4 shrink-0 text-[#050505] mt-0.5' />
									<span>
										<strong className='text-[#050505]'>
											{t({ en: 'Best suited for:', id: 'Cocok untuk:' })}{' '}
										</strong>
										{t(video.caseStudy.idealFor)}
									</span>
								</div>
							</div>
						</div>

						<div className='shrink-0 px-5 sm:px-6 py-3.5 bg-[#F6EDD6] border-t-[2.5px] border-[#050505]'>
							<button
								type='button'
								data-sfx='keycap'
								onClick={() =>
									onRequestSimilarStyle({
										en: `Similar style: ${video.style} (${video.aspectRatio} · ${video.language})`,
										id: `Gaya visual serupa: ${video.style} (${video.aspectRatio} · ${video.language})`,
									})
								}
								className='w-full py-3 px-5 rounded-full border-[2.5px] border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] text-[#050505] text-sm font-display font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
							>
								<span>
									{t({
										en: 'Request Similar Visual Style →',
										id: 'Pesan Gaya Visual Serupa →',
									})}
								</span>
								<ArrowUpRightIcon className='size-4' />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoModal;
