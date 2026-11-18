import { useState } from 'react';
import {
	AudioIcon,
	CheckIcon,
	CodeIcon,
	FilmIcon,
	LayersIcon,
} from '../components/Icons';
import TitleHeader from '../components/TitleHeader';
import { ServicePackageArtwork } from '../components/SpaghettiArt';
import { useLanguage } from '../context/useLanguage';
import {
	VIDEO_SERVICE_PACKAGES,
	WEB_SERVICE_PACKAGES,
	WEBSITE_VIDEO_BUNDLE_PROMO,
	type LocalizedText,
	type ServicePackage,
} from '../data/portfolioData';

interface ServicesSectionProps {
	onSelectPackageForContact: (packageName: LocalizedText) => void;
}

const FORMAT_TEXT_INK: Record<string, string> = {
	'#FD6141': '#A82F14',
	'#3886C0': '#1D5885',
	'#C91878': '#9E115E',
	'#5CE62E': '#204275',
	'#FFD426': '#204275',
	'#FCAE1F': '#204275',
};

interface ServiceCardProps {
	pkg: ServicePackage;
	className?: string;
	addonApplied?: boolean;
	onToggleAddon?: () => void;
	onSelect: (packageName: LocalizedText) => void;
}

const ServiceCard = ({
	pkg,
	className = '',
	addonApplied = false,
	onToggleAddon,
	onSelect,
}: ServiceCardProps) => {
	const { t } = useLanguage();
	const packageTitle = t(pkg.title);
	const selectionLabel: LocalizedText = addonApplied
		? {
				en: `${pkg.title.en} + Add-On Video Promo`,
				id: `${pkg.title.id} + Add-On Video Promo`,
			}
		: pkg.title;
	const formatColor = FORMAT_TEXT_INK[pkg.accentColor] ?? '#204275';

	return (
		<article
			className={`rounded-md border-[3px] border-[#050505] bg-[#FCF0D3] shadow-[4px_4px_0_#050505] overflow-hidden flex flex-col justify-between transition-colors ${className}`}
		>
			<div>
				{/* Card Header Strip */}
				<div className='flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-4 sm:px-5 py-2.5 border-b-[3px] border-[#050505] bg-[#F6EDD6]'>
					<div className='flex items-center gap-2 shrink-0'>
						<span
							className='size-3 rounded-full border-2 border-[#050505] shrink-0'
							style={{ backgroundColor: pkg.accentColor }}
							aria-hidden='true'
						/>
						<span className='font-mono text-[11px] font-black tracking-wide text-[#050505] whitespace-nowrap'>
							{pkg.badge}
						</span>
					</div>

					<div className='flex items-center gap-1 sm:gap-1.5 shrink-0'>
						{addonApplied && (
							<span className='px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] font-mono text-[9.5px] sm:text-[10px] font-black text-[#050505] select-none whitespace-nowrap'>
								<span className='sm:hidden'>+ VIDEO</span>
								<span className='hidden sm:inline'>+ VIDEO PROMO</span>
							</span>
						)}
						<span className='px-1.5 sm:px-2 py-0.5 rounded-sm border border-[#050505]/60 bg-[#FFD426]/80 font-mono text-[9.5px] sm:text-[10px] font-black text-[#050505] select-none whitespace-nowrap'>
							{t(pkg.stickerTag)}
						</span>
					</div>
				</div>

				{/* Ligne-Claire Illustration Plate */}
				<div className='p-3.5 sm:p-4 bg-[#FCF0D3] border-b-[3px] border-[#050505]'>
					<div className='w-full max-w-[340px] mx-auto aspect-[18/11] rounded-[3px] border-[2.5px] border-[#050505] shadow-[3px_3px_0_#050505] overflow-hidden bg-[#121212]'>
						<ServicePackageArtwork artKey={pkg.artKey} className='w-full h-full block' />
					</div>
				</div>

				{/* Card Body */}
				<div className='p-5 sm:p-6 space-y-3.5'>
					<div>
						<p
							className='font-mono text-[11px] font-black uppercase tracking-wider'
							style={{ color: formatColor }}
						>
							{t(pkg.format)}
						</p>
						<h4 className='font-display font-black text-xl text-[#050505] leading-snug mt-1'>
							{packageTitle}
						</h4>
					</div>

					<p className='text-sm text-[#3B404C] leading-relaxed'>
						{t(pkg.summary)}
					</p>

					<ul className='space-y-1.5 pt-3 border-t-2 border-dashed border-[#050505]/25'>
						{pkg.deliverables.map((item) => (
							<li
								key={item.en}
								className='flex items-start gap-2 text-[13px] text-[#050505] leading-snug'
							>
								<CheckIcon className='size-4 text-[#2E6B47] shrink-0 mt-0.5' />
								<span>{t(item)}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Per-Card Optional Video Promo Switch + Primary CTA */}
			<div className='px-5 sm:px-6 pb-5 pt-1 space-y-2.5'>
				{pkg.supportsVideoAddon && onToggleAddon && (
					<button
						type='button'
						role='switch'
						aria-checked={addonApplied}
						data-sfx='switch'
						onClick={onToggleAddon}
						className={`w-full py-2 px-2.5 sm:px-3 rounded-lg border-2 border-[#050505] font-mono text-[10px] sm:text-[11.5px] font-black flex items-center justify-between gap-1.5 sm:gap-2 cursor-pointer transition-colors ${
							addonApplied
								? 'bg-[#5CE62E]/35 text-[#050505] shadow-[2px_2px_0_#050505]'
								: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#FFF3C4]'
						}`}
					>
						<span className='flex items-center gap-1.5 sm:gap-2 min-w-0'>
							<span
								className={`size-3.5 sm:size-4 rounded border-2 border-[#050505] flex items-center justify-center shrink-0 ${
									addonApplied ? 'bg-[#050505] text-[#5CE62E]' : 'bg-[#FCF0D3]'
								}`}
							>
								{addonApplied && <CheckIcon className='size-2.5 sm:size-3' />}
							</span>
							<span className='whitespace-nowrap'>
								{t({
									en: '+ Add-On Video Promo',
									id: '+ Add-On Video Promo',
								})}
							</span>
						</span>

						<span
							className={`px-1 sm:px-1.5 py-0.5 rounded-[2px] border border-[#050505] text-[8.5px] sm:text-[9.5px] shrink-0 whitespace-nowrap ${
								addonApplied ? 'bg-[#5CE62E] text-[#050505]' : 'bg-[#EFE3C4] text-[#3B404C]'
							}`}
						>
							{addonApplied
								? t({ en: 'INCLUDED', id: 'AKTIF' })
								: t({ en: 'OPTIONAL', id: 'OPSIONAL' })}
						</span>
					</button>
				)}

				<button
					type='button'
					data-sfx='keycap'
					onClick={() => onSelect(selectionLabel)}
					className={`w-full py-3 px-4 rounded-xl border-[3px] border-[#050505] text-[#050505] text-sm font-display font-black cursor-pointer shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050505] active:translate-y-[2px] active:shadow-[1px_1px_0_#050505] transition-all ${
						addonApplied
							? 'bg-[#5CE62E] hover:bg-[#FFD426]'
							: 'bg-[#FFD426] hover:bg-[#FD6141] hover:text-[#FCF0D3]'
					}`}
				>
					{addonApplied
						? t({
								en: 'Select Web + Video Promo →',
								id: 'Pilih Web + Video Promo →',
							})
						: t({
								en: 'Select This Service →',
								id: 'Pilih Jasa Ini →',
							})}
				</button>
			</div>
		</article>
	);
};

const ServicesSection = ({ onSelectPackageForContact }: ServicesSectionProps) => {
	const { t } = useLanguage();
	const [addonByCard, setAddonByCard] = useState<Record<string, boolean>>({});

	const toggleCardAddon = (pkgId: string) => {
		setAddonByCard((prev) => ({
			...prev,
			[pkgId]: !prev[pkgId],
		}));
	};

	return (
		<section
			id='services'
			className='substrate-yellow-mat relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<TitleHeader
					figCode='FIG.03'
					sub={t({
						en: 'SERVICES',
						id: 'JASA',
					})}
					title={t({
						en: 'Video & Website Services',
						id: 'Jasa Video & Website',
					})}
					badgeColor='cream'
					description={t({
						en: 'Clearly structured into Video and Website services. Choose a package below or share your own custom brief.',
						id: 'Layanan dipisah rapi antara kategori Video dan Website. Pilih paket yang sesuai atau ajukan konsep khusus versimu sendiri.',
					})}
				/>

				{/* TRACK 01: VIDEO PRODUCTION SERVICES */}
				<div className='mt-10 ds-panel rounded-md overflow-hidden bg-[#F7E8C3]'>
					<div className='flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-[#FD6141] border-b-[3px] border-[#050505]'>
						<div className='flex items-center gap-3'>
							<span className='size-9 rounded-lg bg-[#FCF0D3] border-[2.5px] border-[#050505] shadow-[2px_2px_0_#050505] flex items-center justify-center text-[#050505]'>
								<FilmIcon className='size-5' />
							</span>
							<div>
								<p className='font-mono text-[10px] font-black uppercase tracking-widest text-[#050505]'>
									{t({ en: 'TRACK 01 · VIDEO', id: 'KATEGORI 01 · KHUSUS VIDEO' })}
								</p>
								<h3 className='font-display font-black text-xl sm:text-2xl text-[#050505] leading-tight'>
									{t({ en: 'Video Production Services', id: 'Jasa Produksi Video' })}
								</h3>
							</div>
						</div>

						<span className='px-2.5 py-0.5 rounded-sm bg-[#050505] font-mono text-[11px] font-black text-[#FFD426] select-none'>
							{t({ en: '4 OPTIONS', id: '4 PILIHAN' })}
						</span>
					</div>

					<div className='p-5 sm:p-7 space-y-6'>
						{/* Flexibility Callout: Free Style & Voice Selection */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3.5'>
							<div className='flex items-start gap-3 p-3.5 sm:p-4 rounded-md bg-[#FCF0D3]/85 border-2 border-dashed border-[#050505]/50'>
								<span className='size-8 rounded-md bg-[#FFD426] border border-[#050505]/60 flex items-center justify-center shrink-0 text-[#050505]'>
									<LayersIcon className='size-4' />
								</span>
								<div>
									<p className='font-display font-black text-sm text-[#050505]'>
										{t({
											en: 'Free Choice of Visual Style',
											id: 'Bebas Pilih Gaya Visual',
										})}
									</p>
									<p className='text-xs text-[#3B404C] mt-0.5 leading-relaxed'>
										{t({
											en: 'Choose from motion collage, 3D/isometric, clean UI showcase, claymation look, or share your own video reference.',
											id: 'Tersedia gaya kolase, 3D/isometrik, animasi UI produk, clay, atau kirimkan referensi visual yang kamu sukai.',
										})}
									</p>
								</div>
							</div>

							<div className='flex items-start gap-3 p-3.5 sm:p-4 rounded-md bg-[#FCF0D3]/85 border-2 border-dashed border-[#050505]/50'>
								<span className='size-8 rounded-md bg-[#5CE62E] border border-[#050505]/60 flex items-center justify-center shrink-0 text-[#050505]'>
									<AudioIcon className='size-4' />
								</span>
								<div>
									<p className='font-display font-black text-sm text-[#050505]'>
										{t({
											en: 'Flexible Voiceover & Language',
											id: 'Bebas Pilih Suara & Bahasa',
										})}
									</p>
									<p className='text-xs text-[#3B404C] mt-0.5 leading-relaxed'>
										{t({
											en: 'Available in Indonesian or English: choose the voice character you want, or supply your own audio recording.',
											id: 'Tersedia dalam Bahasa Indonesia atau Inggris: kamu bebas menentukan karakter narator atau memakai rekaman suaramu sendiri.',
										})}
									</p>
								</div>
							</div>
						</div>

						{/* 4 Video Service Cards */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6'>
							{VIDEO_SERVICE_PACKAGES.map((pkg) => (
								<ServiceCard
									key={pkg.id}
									pkg={pkg}
									onSelect={onSelectPackageForContact}
								/>
							))}
						</div>
					</div>
				</div>

				{/* TRACK 02: WEBSITE DEVELOPMENT SERVICES */}
				<div className='mt-10 ds-panel rounded-md overflow-hidden bg-[#F7E8C3]'>
					<div className='flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-[#3886C0] border-b-[3px] border-[#050505]'>
						<div className='flex items-center gap-3'>
							<span className='size-9 rounded-lg bg-[#FCF0D3] border-[2.5px] border-[#050505] shadow-[2px_2px_0_#050505] flex items-center justify-center text-[#050505]'>
								<CodeIcon className='size-5' />
							</span>
							<div>
								<p className='font-mono text-[10px] font-black uppercase tracking-widest text-[#FCF0D3]'>
									{t({ en: 'TRACK 02 · WEBSITE', id: 'KATEGORI 02 · KHUSUS WEBSITE' })}
								</p>
								<h3 className='font-display font-black text-xl sm:text-2xl text-[#FCF0D3] leading-tight'>
									{t({ en: 'Website Development Services', id: 'Jasa Pembuatan Website' })}
								</h3>
							</div>
						</div>

						<span className='px-2.5 py-0.5 rounded-sm bg-[#050505] font-mono text-[11px] font-black text-[#FFD426] select-none'>
							{t({ en: '5 OPTIONS + ADD-ON', id: '5 PILIHAN + ADD-ON' })}
						</span>
					</div>

					<div className='p-5 sm:p-7 space-y-6'>
						{/* DISTINCT TOP PROMO BANNER: Web + Add-On Video Promo Bundle Info (No Select Button) */}
						<aside
							aria-label={t({
								en: 'Website + Video Promo Bundle Highlight',
								id: 'Info Paket Bundel Website + Video Promo',
							})}
							className='rounded-md border-[3px] border-[#050505] bg-[#121926] shadow-[5px_5px_0_#050505] overflow-hidden'
						>
							<div className='flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-[#FFD426] border-b-[3px] border-[#050505]'>
								<div className='flex items-center gap-2'>
									<span className='px-1.5 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FFD426]'>
										{WEBSITE_VIDEO_BUNDLE_PROMO.badge}
									</span>
									<span className='font-mono text-[11px] font-black text-[#050505] uppercase tracking-wider'>
										{t(WEBSITE_VIDEO_BUNDLE_PROMO.stickerTag)}
									</span>
								</div>
								<span className='font-mono text-[10px] font-black text-[#050505]'>
									{t(WEBSITE_VIDEO_BUNDLE_PROMO.format)}
								</span>
							</div>

							<div className='p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center'>
								<div className='lg:col-span-5'>
									<div className='w-full max-w-[340px] mx-auto aspect-[18/11] rounded-[3px] border-[2.5px] border-[#050505] shadow-[3px_3px_0_#FFD426] overflow-hidden bg-[#121212]'>
										<ServicePackageArtwork
											artKey={WEBSITE_VIDEO_BUNDLE_PROMO.artKey}
											className='w-full h-full block'
										/>
									</div>
								</div>

								<div className='lg:col-span-7 space-y-3 text-[#FCF0D3]'>
									<div>
										<h4 className='font-display font-black text-xl sm:text-2xl text-[#FFD426] leading-snug'>
											{t(WEBSITE_VIDEO_BUNDLE_PROMO.title)}
										</h4>
										<p className='text-sm text-[#FCF0D3]/85 leading-relaxed mt-1'>
											{t(WEBSITE_VIDEO_BUNDLE_PROMO.summary)}
										</p>
									</div>

									<ul className='space-y-1.5 pt-2 border-t border-dashed border-white/25'>
										{WEBSITE_VIDEO_BUNDLE_PROMO.deliverables.map((item) => (
											<li
												key={item.en}
												className='flex items-start gap-2 text-[13px] text-[#FCF0D3] leading-snug'
											>
												<CheckIcon className='size-4 text-[#5CE62E] shrink-0 mt-0.5' />
												<span>{t(item)}</span>
											</li>
										))}
									</ul>

									<div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#1D2B42] border border-dashed border-[#5CE62E]/70 font-mono text-[11px] font-bold text-[#5CE62E]'>
										<span>↓</span>
										<span>
											{t({
												en: 'Toggle "+ Add-On Video Promo" on any website card below to include it.',
												id: 'Aktifkan tombol "+ Add-On Video Promo" pada kartu layanan website pilihanmu di bawah ini.',
											})}
										</span>
									</div>
								</div>
							</div>
						</aside>

						{/* 5 Website Service Cards (Top 3 equal + Bottom 2 symmetric across 6-col desktop grid) */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6'>
							{WEB_SERVICE_PACKAGES.map((pkg, idx) => {
								const spanClass =
									idx < 3
										? 'lg:col-span-2'
										: idx === 4
											? 'md:col-span-2 lg:col-span-3'
											: 'lg:col-span-3';
								return (
									<ServiceCard
										key={pkg.id}
										pkg={pkg}
										className={spanClass}
										addonApplied={Boolean(addonByCard[pkg.id])}
										onToggleAddon={() => toggleCardAddon(pkg.id)}
										onSelect={onSelectPackageForContact}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ServicesSection;
