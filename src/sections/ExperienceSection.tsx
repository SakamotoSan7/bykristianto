import { useState } from 'react';
import {
	ArrowUpRightIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '../components/Icons';
import TitleHeader from '../components/TitleHeader';
import { useLanguage } from '../context/useLanguage';
import {
	CERTIFICATES,
	EXPERIENCE_CARDS,
	FIELD_ARCHIVE_PHOTOS,
	FILM_CREDITS,
	PUBLIC_CONTACT,
} from '../data/portfolioData';

const ExperienceSection = () => {
	const { t } = useLanguage();
	const [archiveIdx, setArchiveIdx] = useState(0);

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
			className='substrate-rust-mat relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
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
						id: 'Pengalaman Industri, Kredit & Sertifikat',
					})}
					badgeColor='yellow'
					onDarkMat
					description={t({
						en: 'Film & TV education, label post-production experience, and verified certifications.',
						id: 'Pendidikan film, pengalaman pascaproduksi label musik, dan sertifikasi resmi.',
					})}
				/>

				{/* Top Retro OS Profile + Interactive Field Archive Row */}
				<div className='mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch'>
					{/* Left Window: Creator Profile Dossier */}
					<div className='lg:col-span-7 ds-os-window rounded-sm overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2.5 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-4 bg-[#FCF0D3] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									CREATOR_ID.JPG
								</span>
								<div className='hidden sm:block flex-1 h-3 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#5CE62E] font-mono text-[10px] font-black shrink-0 select-none'>
								ID / EN
							</span>
						</div>

						<div className='p-5 sm:p-6 bg-[#FCF0D3] flex-1 flex items-center'>
							<div className='grid grid-cols-1 sm:grid-cols-12 gap-5 items-center w-full'>
								<figure className='sm:col-span-5 rounded-sm border-[3px] border-[#050505] bg-[#14171D] shadow-[4px_4px_0_#050505] overflow-hidden'>
									<div className='aspect-[4/5] w-full overflow-hidden'>
										<img
											src='/images/me/studio/profile-afe-desk.webp'
											alt={t({
												en: 'Kristianto at the video editing desk at AFE Records',
												id: 'Kristianto di meja kerja video editing AFE Records',
											})}
											loading='lazy'
											className='w-full h-full object-cover object-top'
										/>
									</div>
									<figcaption className='px-2.5 py-1.5 border-t-2 border-[#050505] bg-[#050505] font-mono text-[10px] font-bold flex items-center justify-between gap-2'>
										<span className='text-[#FCF0D3] truncate'>KRISTIANTO, S.SN</span>
										<span className='text-[#FFD426] shrink-0'>AFE DESK</span>
									</figcaption>
								</figure>

								<div className='sm:col-span-7 space-y-3.5'>
									<span className='inline-block px-2 py-0.5 rounded-sm bg-[#4D9DE0]/20 border border-[#050505] font-mono text-[11px] font-black text-[#050505]'>
										{t({
											en: 'FILM & TV GRADUATE · CREATIVE TECHNOLOGIST',
											id: 'S.SN TELEVISI & FILM · CREATIVE VIDEO PRODUCER',
										})}
									</span>

									<div>
										<h3 className='font-display font-black text-2xl sm:text-[26px] leading-tight text-[#050505]'>
											Kristianto
										</h3>
										<p className='font-mono text-xs font-bold text-[#FD6141] mt-0.5'>
											{t({
												en: 'Video Editor & AI-Assisted Visual Storyteller',
												id: 'Video Editor & Motion Content Creator',
											})}
										</p>
									</div>

									<p className='text-sm text-[#3B404C] leading-relaxed'>
										{t({
											en: 'Television & Film graduate (Cum Laude 3.76, ISI Padang Panjang) and former Video Editor Intern at AFE Records Jakarta. I combine cinematic pacing, verified research, clear narration audio (voice-first), and custom motion graphics built in Canvas 2D / WebGL2.',
											id: 'Lulusan S-1 Televisi & Film (Cum Laude 3,76, ISI Padang Panjang) serta mantan Video Editor Intern di AFE Records Jakarta. Saya memadukan alur edit sinematik, riset fakta, tata suara narasi yang jernih (voice-first), serta animasi berbasis kode (Canvas 2D / WebGL2).',
										})}
									</p>

									<div className='flex flex-wrap gap-1.5'>
										{[
											{ en: 'Cum Laude 3.76', id: 'Cum Laude 3.76' },
											{ en: 'Ex-AFE Records', id: 'Eks AFE Records' },
											{ en: 'TOEFL 610', id: 'TOEFL 610' },
											{ en: 'Clear Audio + SFX', id: 'Audio Jernih + SFX' },
										].map((chip) => (
											<span
												key={chip.en}
												className='px-2 py-0.5 rounded-sm border border-[#050505]/70 bg-[#F6EDD6] font-mono text-[10px] font-black text-[#050505]'
											>
												{t(chip)}
											</span>
										))}
									</div>

									<div className='flex flex-wrap items-center gap-2.5 pt-1'>
										<a
											href='#contact'
											data-sfx='click'
											className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border-2 border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] font-display font-black text-xs text-[#050505] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
										>
											{t({ en: 'Discuss a Project', id: 'Diskusi Proyek' })}
										</a>
										<a
											href={PUBLIC_CONTACT.linkedin}
											target='_blank'
											rel='noopener noreferrer'
											data-sfx='click'
											className='inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border-2 border-[#050505] bg-[#F6EDD6] hover:bg-[#4D9DE0]/25 font-mono font-bold text-xs text-[#050505] transition-colors'
										>
											<span>LinkedIn</span>
											<ArrowUpRightIcon className='size-3.5' />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Window: Interactive Behind-The-Scenes & Milestone Photo Switcher */}
					<div className='lg:col-span-5 ds-os-window rounded-sm overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2.5 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-4 bg-[#FFD426] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									FIELD_ARCHIVE.APP
								</span>
								<div className='hidden sm:block flex-1 h-3 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FCF0D3] font-mono text-[10px] font-black shrink-0 select-none'>
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
								<span className='absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-sm bg-[#FFD426] border-[1.5px] border-[#050505] font-mono text-[10px] font-black text-[#050505] shadow-[2px_2px_0_#050505]'>
									{t(activePhoto.tag)}
								</span>
							</div>

							<div className='space-y-3'>
								<div className='rounded-sm border-2 border-[#050505]/75 bg-[#F6EDD6] p-3 space-y-1'>
									<h3 className='font-display font-black text-sm sm:text-base text-[#050505] leading-snug'>
										{t(activePhoto.title)}
									</h3>
									<p className='text-xs text-[#3B404C] leading-relaxed'>
										{t(activePhoto.caption)}
									</p>
								</div>

								<div className='flex items-center justify-between gap-2'>
									<button
										type='button'
										onClick={handlePrevPhoto}
										data-sfx='click'
										aria-label={t({ en: 'Previous archive photo', id: 'Foto arsip sebelumnya' })}
										className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm border-2 border-[#050505] bg-[#F6EDD6] hover:bg-[#FFD426] font-mono text-[11px] font-black text-[#050505] shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
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
												data-sfx='click'
												aria-label={`${t(photo.title)} (${idx + 1}/${totalPhotos})`}
												aria-current={idx === archiveIdx ? 'true' : undefined}
												className={`h-2.5 rounded-sm border border-[#050505] transition-all cursor-pointer ${
													idx === archiveIdx
														? 'w-6 bg-[#FD6141]'
														: 'w-2.5 bg-[#F6EDD6] hover:bg-[#FFD426]'
												}`}
											/>
										))}
									</div>

									<button
										type='button'
										onClick={handleNextPhoto}
										data-sfx='click'
										aria-label={t({ en: 'Next archive photo', id: 'Foto arsip berikutnya' })}
										className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm border-2 border-[#050505] bg-[#F6EDD6] hover:bg-[#FFD426] font-mono text-[11px] font-black text-[#050505] shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
									>
										<span>NEXT</span>
										<ChevronRightIcon className='size-3.5' />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main 3 Experience & Education Ligne-Claire Dossiers */}
				<div className='mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{EXPERIENCE_CARDS.map((card) => (
						<article
							key={card.id}
							className='ds-panel rounded-sm p-5 sm:p-6 flex flex-col justify-between gap-5'
						>
							<div className='space-y-4'>
								<div className='flex items-start justify-between gap-3'>
									<span className='px-2 py-0.5 rounded-sm bg-[#FFD426]/80 border border-[#050505]/60 font-mono text-[11px] font-black text-[#050505] select-none'>
										{t(card.badgeLabel)}
									</span>
									<span className='font-mono text-xs font-extrabold text-[#204275]'>
										{card.date}
									</span>
								</div>

								{card.cardImagePath && (
									<figure className='rounded-sm border-2 border-[#050505] overflow-hidden bg-[#F6EDD6] shadow-[3px_3px_0_#050505]'>
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
											<figcaption className='px-2.5 py-1.5 border-t-2 border-[#050505] bg-[#050505] text-[#FCF0D3] font-mono text-[10px] font-bold tracking-wide truncate'>
												{t(card.cardImageLabel)}
											</figcaption>
										)}
									</figure>
								)}

								<div>
									<h3 className='font-display font-black text-xl text-[#050505]'>
										{t(card.role)}
									</h3>
									<p className='text-sm font-black text-[#FD6141] mt-0.5'>
										{card.organization}
									</p>
								</div>

								<p className='text-sm text-[#3B404C] italic leading-relaxed border-l-4 border-[#3886C0] pl-3'>
									&ldquo;{t(card.review)}&rdquo;
								</p>

								<ul className='space-y-2 pt-3 border-t-2 border-dashed border-[#050505]/25'>
									{card.responsibilities.map((item) => (
										<li
											key={item.en}
											className='flex items-start gap-2 text-xs sm:text-sm text-[#050505]'
										>
											<span className='text-[#3886C0] font-black'>◆</span>
											<span>{t(item)}</span>
										</li>
									))}
								</ul>
							</div>

							<div className='pt-3 border-t-2 border-[#050505]/20 font-mono text-[11px] font-bold text-[#3B404C]'>
								{card.location}
							</div>
						</article>
					))}
				</div>

				{/* Dual Style D Retro OS Archival Windows: Film Credits + Verified Certificates */}
				<div className='mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch'>
					{/* Left Window: Film & TV Credits (Larger 7-col showcase for production thumbnails & poster) */}
					<div className='lg:col-span-7 ds-os-window rounded-sm overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2.5 bg-[#FD6141] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-4 bg-[#FCF0D3] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									CREDITS_LOG.TXT
								</span>
								<div className='hidden sm:block flex-1 h-3 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-mono text-[10px] font-bold shrink-0'>
								{t({
									en: `${FILM_CREDITS.length} CREDITS`,
									id: `${FILM_CREDITS.length} KREDIT`,
								})}
							</span>
						</div>

						<div className='p-5 sm:p-6 bg-[#FCF0D3] space-y-4 flex-1'>
							<h3 className='font-display font-black text-lg text-[#050505]'>
								{t({ en: 'Film & Production Credits', id: 'Kredit Film & Produksi' })}
							</h3>

							<div className='space-y-3.5'>
								{FILM_CREDITS.map((credit) => {
									const isContained = credit.thumbFit === 'contain';
									return (
										<div
											key={credit.title}
											className='rounded-sm border-2 border-[#050505]/75 bg-[#F6EDD6] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start gap-4'
										>
											{credit.thumbPath && (
												<a
													href={credit.url}
													target='_blank'
													rel='noopener noreferrer'
													data-sfx='click'
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
														className='font-display font-black text-sm sm:text-base text-[#050505] hover:text-[#FD6141] underline decoration-2 underline-offset-4 transition-colors inline-flex items-center gap-1'
													>
														<span>{credit.title}</span>
														<span className='text-xs'>↗</span>
													</a>
													<span className='shrink-0 px-2 py-0.5 rounded-sm bg-[#FFD426]/70 border border-[#050505]/50 font-mono text-[11px] font-black text-[#050505] select-none'>
														{credit.year}
													</span>
												</div>
												<p className='font-mono text-[11px] text-[#3886C0] font-bold'>
													{t(credit.role)}
												</p>
												<p className='text-xs sm:text-[13px] text-[#3B404C] leading-relaxed'>
													{t(credit.desc)}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* Right Window: Verified Certifications (Compact 5-col single-column list on lg) */}
					<div className='lg:col-span-5 ds-os-window rounded-sm overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between gap-2 px-4 py-2.5 bg-[#3886C0] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-4 bg-[#5CE62E] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-xs font-black text-[#050505] truncate'>
									VERIFIED_CERTS.DB
								</span>
								<div className='hidden sm:block flex-1 h-3 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-none bg-[#050505] text-[#5CE62E] font-mono text-[10px] font-black shrink-0 select-none'>
								{t({
									en: `${CERTIFICATES.length} CERTS`,
									id: `${CERTIFICATES.length} SERTIFIKAT`,
								})}
							</span>
						</div>

						<div className='p-5 sm:p-6 bg-[#FCF0D3] flex-1 flex flex-col justify-between gap-4'>
							<div className='space-y-4'>
								<h3 className='font-display font-black text-lg text-[#050505]'>
									{t({ en: 'Verified Cloud & Language Credentials', id: 'Sertifikasi Resmi & Bahasa' })}
								</h3>

								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3'>
									{CERTIFICATES.map((cert) => (
										<div
											key={cert.title.en}
											className='rounded-sm border-2 border-[#050505]/75 bg-[#F6EDD6] p-3.5 flex flex-col justify-between gap-1.5'
										>
											<div className='flex items-center justify-between gap-2'>
												<span className='font-mono text-[11px] font-black text-[#204275] uppercase'>
													{cert.issuer}
												</span>
												<span className='px-2 py-0.5 rounded-sm bg-[#FFD426]/70 border border-[#050505]/50 font-mono text-[10px] font-black text-[#050505] select-none shrink-0'>
													{t(cert.meta)}
												</span>
											</div>
											<p className='font-display font-bold text-sm text-[#050505] leading-snug'>
												{t(cert.title)}
											</p>
										</div>
									))}
								</div>
							</div>

							<p className='pt-3 border-t-2 border-dashed border-[#050505]/25 font-mono text-[11px] font-bold text-[#3B404C]'>
								{t({
									en: 'ALIBABA CLOUD · BRIGHTEN ENGLISH (TOEFL 610) · CODEPOLITAN · GPA 3.76/4.00',
									id: 'ALIBABA CLOUD · BRIGHTEN ENGLISH (TOEFL 610) · CODEPOLITAN · IPK 3,76/4,00',
								})}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ExperienceSection;
