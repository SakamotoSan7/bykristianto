import { useState } from 'react';
import {
	ArrowUpRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
} from '../components/Icons';
import TitleHeader from '../components/TitleHeader';
import { useLanguage } from '../context/useLanguage';
import {
	CERTIFICATES,
	EXPERIENCE_CARDS,
	FIELD_ARCHIVE_PHOTOS,
	FILM_CREDITS,
	getLocalizedCvLink,
	PUBLIC_CONTACT,
} from '../data/portfolioData';

const ExperienceSection = () => {
	const { lang, t } = useLanguage();
	const [archiveIdx, setArchiveIdx] = useState(0);
	const [archiveTab, setArchiveTab] = useState<'credits' | 'certs'>('credits');

	const totalPhotos = FIELD_ARCHIVE_PHOTOS.length;
	const activePhoto = FIELD_ARCHIVE_PHOTOS[archiveIdx] ?? FIELD_ARCHIVE_PHOTOS[0];

	const handlePrevPhoto = () => {
		setArchiveIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos);
	};

	const handleNextPhoto = () => {
		setArchiveIdx((prev) => (prev + 1) % totalPhotos);
	};

	return (
		<section
			id='experience'
			className='substrate-studio-slate relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<TitleHeader
					figCode='FIG.04'
					sub={t({
						en: 'CREDITS & CREDENTIALS',
						id: 'REKAM JEJAK & SERTIFIKAT',
					})}
					title={t({
						en: 'Experience, Film Credits & Credentials',
						id: 'Pengalaman, Kredit Film & Sertifikat',
					})}
					badgeColor='yellow'
					onDarkMat
					description={t({
						en: 'Film & TV education, studio post-production experience, and verified certifications.',
						id: 'Pendidikan film, pengalaman pascaproduksi studio, dan sertifikasi resmi.',
					})}
				/>

				{/* Top Retro OS Profile + Interactive Field Archive Row */}
				<div className='mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch'>
					{/* Left Window: Creator Profile Dossier (Canary Retro Chrome) */}
					<div className='lg:col-span-7 ds-os-window rounded-md overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-3.5 rounded-full bg-[#FD6141] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									CREATOR_ID.JPG
								</span>
								<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] text-[#5CE62E] font-mono text-[10px] font-black shrink-0 select-none'>
								ID / EN
							</span>
						</div>

						<div className='p-5 sm:p-6 bg-[#FCF0D3] flex-1 flex items-center'>
							<div className='grid grid-cols-1 sm:grid-cols-12 gap-5 items-center w-full'>
								<figure className='sm:col-span-5 rounded-sm border-[2.5px] border-[#050505] bg-[#14171D] shadow-[4px_4px_0_#050505] overflow-hidden'>
									<div className='aspect-[4/5] w-full overflow-hidden'>
										<img
											src='/images/me/studio/profile-afe-desk.webp'
											alt={t({
												en: 'Kristianto at a video editing workstation',
												id: 'Kristianto di meja kerja video editing',
											})}
											loading='lazy'
											className='w-full h-full object-cover object-top'
										/>
									</div>
									<figcaption className='px-2.5 py-1.5 border-t-2 border-[#050505] bg-[#050505] font-mono text-[10px] font-bold flex items-center justify-between gap-2'>
										<span className='text-[#FCF0D3] truncate'>KRISTIANTO, S.SN</span>
										<span className='text-[#FFD426] shrink-0'>EDITING DESK</span>
									</figcaption>
								</figure>

								<div className='sm:col-span-7 space-y-3.5'>
									<p className='font-mono text-[10.5px] font-black uppercase tracking-wider text-[#204275]'>
										{t({
											en: 'FILM & TV GRADUATE · CREATIVE TECHNOLOGIST',
											id: 'S.SN TELEVISI & FILM · CREATIVE VIDEO PRODUCER',
										})}
									</p>

									<div>
										<h3 className='font-display font-black text-2xl sm:text-[28px] leading-tight text-[#050505]'>
											Kristianto
										</h3>
										<p className='font-mono text-xs font-bold text-[#C5432F] mt-0.5'>
											{t({
												en: 'Video Editor & AI-Assisted Visual Storyteller',
												id: 'Video Editor & Motion Content Creator',
											})}
										</p>
									</div>

									<p className='text-sm text-[#3B404C] leading-relaxed'>
										{t({
											en: 'Television & Film graduate (Cum Laude, GPA 3.76 at ISI Padang Panjang) with hands-on studio post-production experience across music videos, TV, and digital content. I combine cinematic pacing, verified research, clear narration mixing, and custom motion graphics in Canvas 2D / WebGL2.',
											id: 'Lulusan S-1 Televisi & Film (Cum Laude, IPK 3,76 di ISI Padang Panjang) dengan pengalaman pascaproduksi video musik, program TV, dan konten digital. Saya memadukan ritme editing sinematik, riset terverifikasi, tata suara narasi yang jernih, serta animasi berbasis kode (Canvas 2D / WebGL2).',
										})}
									</p>

									{/* Clean Inline Credential Strip (zero bordered chip clutter) */}
									<p className='pt-2 border-t border-dashed border-[#050505]/20 font-mono text-[11px] font-bold text-[#050505] select-none'>
										{t({
											en: 'Cum Laude 3.76 · ISI Padang Panjang · TOEFL 610 · Video & Web',
											id: 'Cum Laude 3,76 · ISI Padang Panjang · TOEFL 610 · Video & Web',
										})}
									</p>

									{/* Focused CTA Hierarchy + Subtle Text Links */}
									<div className='flex flex-wrap items-center gap-3 pt-1'>
										<a
											href='#contact'
											data-sfx='keycap'
											className='inline-flex items-center gap-1.5 px-4 py-2 rounded border-2 border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] font-display font-black text-xs text-[#050505] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
										>
											{t({ en: 'Discuss a Project', id: 'Diskusi Proyek' })}
										</a>
										{(() => {
											const cv = getLocalizedCvLink(lang);
											return (
												<a
													href={cv.href}
													target='_blank'
													rel='noopener noreferrer'
													data-sfx='keycap'
													className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#FFD426] font-mono font-black text-xs text-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
												>
													<DownloadIcon className='size-3.5 shrink-0' />
													<span>{cv.label}</span>
												</a>
											);
										})()}
										<a
											href={PUBLIC_CONTACT.linkedin}
											target='_blank'
											rel='noopener noreferrer'
											data-sfx='portal'
											className='inline-flex items-center gap-1 font-mono font-bold text-xs text-[#204275] hover:text-[#FD6141] underline underline-offset-4 transition-colors'
										>
											<span>LinkedIn</span>
											<ArrowUpRightIcon className='size-3.5' />
										</a>
										<a
											href={PUBLIC_CONTACT.instagram}
											target='_blank'
											rel='noopener noreferrer'
											data-sfx='portal'
											className='inline-flex items-center gap-1 font-mono font-bold text-xs text-[#204275] hover:text-[#FD6141] underline underline-offset-4 transition-colors'
										>
											<span>Instagram</span>
											<ArrowUpRightIcon className='size-3.5' />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Window: Interactive Behind-The-Scenes & Milestone Photo Switcher (Cerulean Chrome) */}
					<div className='lg:col-span-5 ds-os-window rounded-md overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-3.5 rounded-full bg-[#FFD426] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									FIELD_ARCHIVE.APP
								</span>
								<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] text-[#FCF0D3] font-mono text-[10px] font-black shrink-0 select-none'>
								{String(archiveIdx + 1).padStart(2, '0')} / {String(totalPhotos).padStart(2, '0')}
							</span>
						</div>

						<div className='p-4 sm:p-5 bg-[#FCF0D3] flex-1 flex flex-col justify-between gap-3.5'>
							<div className='relative aspect-[4/3] w-full rounded-sm border-[2.5px] border-[#050505] substrate-carbon overflow-hidden shadow-[3px_3px_0_#050505]'>
								<img
									src={activePhoto.imagePath}
									alt=''
									aria-hidden='true'
									className='absolute inset-0 w-full h-full object-cover scale-110 opacity-25 blur-md pointer-events-none select-none'
								/>
								<img
									src={activePhoto.imagePath}
									alt={t(activePhoto.title)}
									loading='lazy'
									className='relative z-10 w-full h-full object-contain p-2'
								/>
								<span className='absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-[2px] bg-[#FFD426] border border-[#050505] font-mono text-[10px] font-black text-[#050505] shadow-[2px_2px_0_#050505]'>
									{t(activePhoto.tag)}
								</span>
							</div>

							<div className='space-y-3'>
								<div className='pt-1 space-y-1'>
									<h3 className='font-display font-black text-sm sm:text-base text-[#050505] leading-snug'>
										{t(activePhoto.title)}
									</h3>
									<p className='text-xs text-[#3B404C] leading-relaxed'>
										{t(activePhoto.caption)}
									</p>
								</div>

								<div className='flex items-center justify-between gap-2 pt-2 border-t border-dashed border-[#050505]/20'>
									<button
										type='button'
										onClick={handlePrevPhoto}
										data-sfx='shutter'
										aria-label={t({ en: 'Previous archive photo', id: 'Foto arsip sebelumnya' })}
										className='inline-flex items-center gap-1 px-2.5 py-1 rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#FFD426] font-mono text-[11px] font-black text-[#050505] shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
									>
										<ChevronLeftIcon className='size-3.5' />
										<span>PREV</span>
									</button>

									<div className='flex items-center gap-1.5' role='tablist' aria-label='Archive photos'>
										{FIELD_ARCHIVE_PHOTOS.map((photo, idx) => (
											<button
												key={photo.id}
												type='button'
												onClick={() => setArchiveIdx(idx)}
												data-sfx='shutter'
												aria-label={`${t(photo.title)} (${idx + 1}/${totalPhotos})`}
												aria-current={idx === archiveIdx ? 'true' : undefined}
												className={`h-2.5 rounded-sm border border-[#050505] transition-all cursor-pointer ${
													idx === archiveIdx
														? 'w-6 bg-[#FD6141]'
														: 'w-2.5 bg-[#FFFFFF] hover:bg-[#FFD426]'
												}`}
											/>
										))}
									</div>

									<button
										type='button'
										onClick={handleNextPhoto}
										data-sfx='shutter'
										aria-label={t({ en: 'Next archive photo', id: 'Foto arsip berikutnya' })}
										className='inline-flex items-center gap-1 px-2.5 py-1 rounded border-2 border-[#050505] bg-[#FFFFFF] hover:bg-[#FFD426] font-mono text-[11px] font-black text-[#050505] shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
									>
										<span>NEXT</span>
										<ChevronRightIcon className='size-3.5' />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main 3 Experience & Education Cards (Signature Canary Badge + Grip Header + Flush-Top Plate) */}
				<div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{EXPERIENCE_CARDS.map((card) => (
						<article
							key={card.id}
							className='ds-panel rounded-md overflow-hidden flex flex-col justify-between bg-[#FCF0D3]'
						>
							<div>
								<div className='flex items-center justify-between gap-2 px-3.5 py-2 bg-[#F6EDD6] border-b-[2.5px] border-[#050505]'>
									<span className='px-2 py-0.5 rounded-[2px] bg-[#FFD426] border border-[#050505] font-mono text-[10px] font-black text-[#050505] uppercase truncate select-none'>
										{t(card.badgeLabel)}
									</span>
									<div className='hidden sm:block flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
									<span className='font-mono text-[11px] font-black text-[#204275] shrink-0'>
										{card.date}
									</span>
								</div>

								{card.cardImagePath && (
									<figure className='border-b-[2.5px] border-[#050505] overflow-hidden bg-[#14171D]'>
										<div
											className={`aspect-[3/2] w-full overflow-hidden ${
												card.cardImageFit === 'contain' ? 'bg-white p-4' : 'bg-[#14171D]'
											}`}
										>
											<img
												src={card.cardImagePath}
												alt={card.cardImageLabel ? t(card.cardImageLabel) : t(card.role)}
												loading='lazy'
												className={`w-full h-full ${
													card.cardImageFit === 'contain' ? 'object-contain' : 'object-cover'
												}`}
											/>
										</div>
										{card.cardImageLabel && (
											<figcaption className='px-3 py-1 border-t border-[#050505] bg-[#050505] text-[#FCF0D3] font-mono text-[10px] font-bold tracking-wide truncate'>
												{t(card.cardImageLabel)}
											</figcaption>
										)}
									</figure>
								)}

								<div className='p-5 sm:p-6 space-y-3.5'>
									<div>
										<h3 className='font-display font-black text-xl text-[#050505]'>
											{t(card.role)}
										</h3>
										<p className='text-sm font-black text-[#C5432F] mt-0.5'>
											{card.organization}
										</p>
									</div>

									<p className='text-[13.5px] text-[#3B404C] italic leading-relaxed border-l-[3px] border-[#3886C0] pl-3'>
										&ldquo;{t(card.review)}&rdquo;
									</p>

									<ul className='space-y-2 pt-3 border-t border-dashed border-[#050505]/20'>
										{card.responsibilities.map((item) => (
											<li
												key={item.en}
												className='flex items-start gap-2 text-xs sm:text-[13px] text-[#050505] leading-snug'
											>
												<span className='text-[#3886C0] font-black'>◆</span>
												<span>{t(item)}</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className='px-5 sm:px-6 pb-4 pt-3 border-t border-dashed border-[#050505]/15 font-mono text-[11px] font-bold text-[#3B404C]'>
								{card.location}
							</div>
						</article>
					))}
				</div>

				{/* Unified Tabbed Archival Window: Vermilion Chrome + Film Credits & Verified Certs */}
				<div className='mt-8 ds-os-window rounded-md overflow-hidden bg-[#FCF0D3]'>
					<div className='flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 bg-[#FD6141] border-b-[3px] border-[#050505]'>
						<div className='flex items-center gap-2 min-w-0 flex-1'>
							<span className='size-3.5 rounded-full bg-[#FCF0D3] border-2 border-[#050505] inline-block shrink-0' />
							<span className='font-mono text-xs font-black text-[#050505] truncate'>
								ARCHIVE_LOG.DB
							</span>
							<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
						</div>

						<div
							role='tablist'
							aria-label={t({ en: 'Credits and Certifications', id: 'Kredit Film & Sertifikasi' })}
							className='flex flex-wrap items-center gap-1.5'
						>
							<button
								type='button'
								role='tab'
								data-sfx='paper'
								aria-selected={archiveTab === 'credits'}
								aria-pressed={archiveTab === 'credits'}
								onClick={() => setArchiveTab('credits')}
								className={`px-3 py-1 rounded font-mono text-[11px] font-black border-[1.5px] border-[#050505] transition-all cursor-pointer ${
									archiveTab === 'credits'
										? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FCF0D3]'
										: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#FFD426]'
								}`}
							>
								{t({
									en: `Film Credits (${FILM_CREDITS.length})`,
									id: `Kredit Film (${FILM_CREDITS.length})`,
								})}
							</button>

							<button
								type='button'
								role='tab'
								data-sfx='paper'
								aria-selected={archiveTab === 'certs'}
								aria-pressed={archiveTab === 'certs'}
								onClick={() => setArchiveTab('certs')}
								className={`px-3 py-1 rounded font-mono text-[11px] font-black border-[1.5px] border-[#050505] transition-all cursor-pointer ${
									archiveTab === 'certs'
										? 'bg-[#050505] text-[#5CE62E] shadow-[2px_2px_0_#FCF0D3]'
										: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#5CE62E]'
								}`}
							>
								{t({
									en: `Verified Certs (${CERTIFICATES.length})`,
									id: `Sertifikat Resmi (${CERTIFICATES.length})`,
								})}
							</button>
						</div>
					</div>

					<div className='p-5 sm:p-6 bg-[#FCF0D3]'>
						{archiveTab === 'credits' ? (
							<div className='divide-y divide-dashed divide-[#050505]/20'>
								{FILM_CREDITS.map((credit) => {
									const isContained = credit.thumbFit === 'contain';
									return (
										<div
											key={credit.title}
											className='py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start gap-4'
										>
											{credit.thumbPath && (
												<a
													href={credit.url}
													target='_blank'
													rel='noopener noreferrer'
													data-sfx='portal'
													aria-label={credit.title}
													className={`group relative shrink-0 w-full sm:w-48 md:w-52 ${
														isContained ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-video sm:aspect-[16/10]'
													} rounded-sm border-2 border-[#050505] overflow-hidden bg-[#14171D] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 transition-transform`}
												>
													{isContained && (
														<img
															src={credit.thumbPath}
															alt=''
															aria-hidden='true'
															className='absolute inset-0 w-full h-full object-cover scale-110 opacity-25 blur-sm pointer-events-none select-none'
														/>
													)}
													<img
														src={credit.thumbPath}
														alt={credit.title}
														loading='lazy'
														className={`relative z-10 w-full h-full ${
															isContained ? 'object-contain p-1' : 'object-cover'
														} group-hover:scale-[1.03] transition-transform duration-200`}
													/>
												</a>
											)}

											<div className='min-w-0 flex-1 w-full space-y-1.5'>
												<div className='flex items-start justify-between gap-2'>
													<a
														href={credit.url}
														target='_blank'
														rel='noopener noreferrer'
														data-sfx='portal'
														className='font-display font-black text-base text-[#050505] hover:text-[#C5432F] underline decoration-2 underline-offset-4 transition-colors inline-flex items-center gap-1'
													>
														<span>{credit.title}</span>
														<span className='text-xs'>↗</span>
													</a>
													<span className='shrink-0 font-mono text-xs font-black text-[#204275] select-none'>
														{credit.year}
													</span>
												</div>
												<p className='font-mono text-[11px] text-[#3886C0] font-bold'>
													{t(credit.role)}
												</p>
												<p className='text-xs sm:text-[13px] text-[#3B404C] leading-relaxed max-w-2xl'>
													{t(credit.desc)}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3.5'>
								{CERTIFICATES.map((cert) => (
									<div
										key={cert.title.en}
										className='rounded bg-[#F6EDD6] p-4 flex flex-col justify-between gap-1.5'
									>
										<div className='flex items-center justify-between gap-2'>
											<span className='font-mono text-[11px] font-black text-[#204275] uppercase'>
												{cert.issuer}
											</span>
											<span className='font-mono text-[10px] font-black text-[#C5432F] select-none shrink-0'>
												{t(cert.meta)}
											</span>
										</div>
										<p className='font-display font-bold text-sm text-[#050505] leading-snug'>
											{t(cert.title)}
										</p>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='px-5 sm:px-6 py-3 bg-[#F6EDD6] border-t-2 border-[#050505]/20 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] font-bold text-[#3B404C]'>
						<span>
							{t({
								en: 'ALIBABA CLOUD · BRIGHTEN ENGLISH (TOEFL 610) · CODEPOLITAN · CITRA FILM SCHOOL',
								id: 'ALIBABA CLOUD · BRIGHTEN ENGLISH (TOEFL 610) · CODEPOLITAN · CITRA FILM SCHOOL',
							})}
						</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ExperienceSection;
