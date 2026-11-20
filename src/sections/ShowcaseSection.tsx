import TitleHeader from '../components/TitleHeader';
import { ArrowUpRightIcon } from '../components/Icons';
import { StackLogoIcon } from '../components/StackLogos';
import { PortfolioSiteArtwork } from '../components/SpaghettiArt';
import { useLanguage } from '../context/useLanguage';
import {
	CREATIVE_TOOLS,
	WEB_PROJECTS,
	WEB_TECH_STACK,
} from '../data/portfolioData';

const WINDOW_BAR_COLORS = ['#FFD426', '#4D9DE0', '#5CE62E'];

const ShowcaseSection = () => {
	const { t } = useLanguage();

	return (
		<section
			id='web-builds'
			className='substrate-grid-paper relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<TitleHeader
					figCode='FIG.05'
					sub={t({
						en: 'WEB BUILDS & TOOLS',
						id: 'PROYEK WEB & TOOLS',
					})}
					title={t({
						en: 'Web Builds & Production Stack',
						id: 'Proyek Web & Daftar Tools Produksi',
					})}
					badgeColor='green'
					description={t({
						en: 'Interactive web builds alongside the video editing, motion, and audio tools I use daily.',
						id: 'Proyek aplikasi web yang telah dibangun beserta daftar perangkat editing, animasi, dan pemrograman yang digunakan sehari-hari.',
					})}
				/>

				{/* 3 Web Builds framed inside Color-Coded Retro OS Browser Windows */}
				<div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7'>
					{WEB_PROJECTS.map((project, idx) => {
						const barBg = WINDOW_BAR_COLORS[idx % WINDOW_BAR_COLORS.length];
						return (
							<article
								key={project.id}
								className='ds-os-window rounded-md overflow-hidden flex flex-col justify-between bg-[#FCF0D3] transition-transform duration-200 hover:-translate-y-1'
							>
								<div>
									{/* Iconic Color-Coded OS Browser Chrome */}
									<div
										className='flex items-center justify-between gap-2 px-3.5 py-2 border-b-[3px] border-[#050505]'
										style={{ backgroundColor: barBg }}
									>
										<div className='flex items-center gap-1.5 min-w-0 flex-1'>
											<span className='size-3.5 rounded-xs border-2 border-[#050505] bg-[#FD6141] inline-block shrink-0' />
											<span className='font-mono text-[11px] font-black text-[#050505] truncate'>
												{project.id.toUpperCase()}.APP
											</span>
											<div className='flex-1 h-2.5 ds-titlebar-grips ml-1' aria-hidden='true' />
										</div>
										<span
											className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold shrink-0 select-none ${
												project.isCurrentSite
													? 'bg-[#050505] text-[#5CE62E]'
													: 'bg-[#050505] text-[#FCF0D3]'
											}`}
										>
											{project.isCurrentSite
												? t({ en: 'THIS SITE', id: 'WEB INI' })
												: project.url
													? t({ en: 'LIVE', id: 'ONLINE' })
													: t({ en: 'CASE STUDY', id: 'STUDI KASUS' })}
										</span>
									</div>

									{/* Exact aspect-[19/17] Preview Screenshot or Custom Website Artwork */}
									<div className='relative aspect-[19/17] w-full overflow-hidden border-b-[2.5px] border-[#050505] bg-[#121212]'>
										{project.customArtwork === 'portfolio-site' ? (
											<PortfolioSiteArtwork className='w-full h-full block transition-transform duration-500 hover:scale-[1.03]' />
										) : (
											<img
												src={project.imagePath}
												alt={project.name}
												loading='lazy'
												className='w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]'
											/>
										)}
									</div>

									{/* Body Info */}
									<div className='p-5 space-y-3'>
										<div>
											<p className='font-mono text-[11px] font-black text-[#3886C0] uppercase'>
												{t(project.subtitle)}
											</p>
											<h3 className='font-display font-black text-2xl text-[#050505] mt-0.5'>
												{project.name}
											</h3>
										</div>

										<p className='text-xs sm:text-sm text-[#3B404C] leading-relaxed'>
											{t(project.description)}
										</p>

										<div className='flex flex-wrap gap-1.5 pt-1'>
											{project.tags.map((tag) => (
												<span
													key={tag}
													className='px-2 py-0.5 rounded-[2px] bg-[#F6EDD6] border border-[#050505]/20 font-mono text-[10px] font-bold text-[#3B404C] select-none'
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								</div>

								<div className='px-5 pb-5 pt-2'>
									{project.isCurrentSite ? (
										<a
											href='#hero'
											data-sfx='nav'
											className='w-full py-2.5 px-4 rounded-lg border-2 border-[#050505]/80 bg-[#FFFFFF] hover:bg-[#EFE5CA] text-[#050505] font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors'
										>
											<span>{t({ en: 'You Are Here · Back to Top ↑', id: 'Sedang Dibuka · Ke Atas ↑' })}</span>
										</a>
									) : project.url ? (
										<a
											href={project.url}
											target='_blank'
											rel='noopener noreferrer'
											data-sfx='portal'
											className='w-full py-2.5 px-4 rounded-lg border-[2.5px] border-[#050505] bg-[#FFD426] hover:bg-[#FD6141] text-[#050505] font-display font-black text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
										>
											<span>{t({ en: 'Launch Live Preview', id: 'Buka Live App' })}</span>
											<ArrowUpRightIcon className='size-4' />
										</a>
									) : (
										<div className='w-full py-2.5 px-4 rounded-lg border border-dashed border-[#050505]/45 bg-[#F6EDD6] text-[#3B404C] font-mono font-bold text-xs text-center'>
											{t({
												en: 'Mobile App Case Study',
												id: 'Studi Kasus Aplikasi Mobile',
											})}
										</div>
									)}
								</div>
							</article>
						);
					})}
				</div>

				{/* Studio Config Windows: De-Boxed Tool Lists with Iconic OS Chrome Headers */}
				<div className='mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6'>
					{/* Creative & Motion Suite */}
					<div className='lg:col-span-7 ds-os-window rounded-md overflow-hidden bg-[#FCF0D3]'>
						<div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-3 rounded-full bg-[#FD6141] border border-[#050505] shrink-0' />
								<span className='font-mono text-[11px] font-black text-[#050505] truncate'>
									CREATIVE_TOOLS.CFG
								</span>
								<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] shrink-0 select-none'>
								{t({
									en: `${CREATIVE_TOOLS.length} CORE TOOLS`,
									id: `${CREATIVE_TOOLS.length} ALAT UTAMA`,
								})}
							</span>
						</div>

						<div className='p-5 sm:p-6'>
							<h3 className='font-display font-black text-xl text-[#050505] pb-3 mb-3 border-b border-dashed border-[#050505]/20'>
								{t({ en: 'Video, Motion & Audio Tools', id: 'Tools Video, Motion & Audio' })}
							</h3>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
								{CREATIVE_TOOLS.map((tool) => (
									<div
										key={tool.name}
										className='rounded px-2.5 py-2 flex items-center gap-3 hover:bg-[#EFE5CA]/70 transition-colors select-none'
									>
										<StackLogoIcon id={tool.logoKey} className='size-8 shrink-0' />
										<div className='min-w-0'>
											<p className='font-display font-black text-sm text-[#050505] leading-tight'>
												{tool.name}
											</p>
											<p className='font-mono text-[11px] font-bold text-[#3B404C] leading-snug mt-0.5'>
												{t(tool.category)}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Engineering Stack Icons */}
					<div className='lg:col-span-5 ds-os-window rounded-md overflow-hidden bg-[#FFFFFF] flex flex-col justify-between'>
						<div>
							<div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
								<div className='flex items-center gap-2 min-w-0 flex-1'>
									<span className='size-3 rounded-full bg-[#FFD426] border border-[#050505] shrink-0' />
									<span className='font-mono text-[11px] font-black text-[#050505] truncate'>
										WEB_STACK.CFG
									</span>
									<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
								</div>
								<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FCF0D3] shrink-0 select-none'>
									{t({
										en: `${WEB_TECH_STACK.length} TECH ITEMS`,
										id: `${WEB_TECH_STACK.length} TEKNOLOGI`,
									})}
								</span>
							</div>

							<div className='p-5 sm:p-6'>
								<h3 className='font-display font-black text-xl text-[#050505] pb-3 mb-3 border-b border-dashed border-[#050505]/20'>
									{t({ en: 'Web Development Stack', id: 'Teknologi Pengembangan Web' })}
								</h3>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
									{WEB_TECH_STACK.map((stack) => (
										<div
											key={stack.name}
											className='rounded px-2.5 py-2 flex items-center gap-2.5 min-w-0 hover:bg-[#FCF0D3] transition-colors select-none'
										>
											<StackLogoIcon id={stack.logoKey} className='size-8 shrink-0' />
											<div className='min-w-0'>
												<p className='font-display font-black text-xs sm:text-[13px] text-[#050505] leading-tight'>
													{stack.name}
												</p>
												<p className='font-mono text-[10px] font-bold text-[#3B404C] leading-snug mt-0.5'>
													{t(stack.sub)}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ShowcaseSection;
