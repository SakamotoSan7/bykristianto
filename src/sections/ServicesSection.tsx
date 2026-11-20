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

export type ServiceTrack = 'video' | 'website';

interface ServicesSectionProps {
	activeTrack?: ServiceTrack;
	onTrackChange?: (track: ServiceTrack) => void;
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
			className={`rounded-md border-[3px] border-[#050505] bg-[#FCF0D3] shadow-[5px_5px_0_#050505] overflow-hidden flex flex-col justify-between transition-colors ${className}`}
		>
			<div>
				{/* Ligne-Claire Archival Card Header Strip */}
				<div className='flex items-center justify-between gap-2 px-4 py-2 border-b-[2.5px] border-[#050505] bg-[#F6EDD6]'>
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

					<div className='flex-1 h-2 ds-titlebar-grips hidden sm:block' aria-hidden='true' />

					<div className='flex items-center gap-1.5 shrink-0'>
						{addonApplied && (
							<span className='px-1.5 py-0.5 rounded-[2px] bg-[#5CE62E] border border-[#050505] font-mono text-[9.5px] font-black text-[#050505] select-none whitespace-nowrap'>
								+ VIDEO
							</span>
						)}
						<span className='px-1.5 py-0.5 rounded-[2px] bg-[#FFD426]/85 border border-[#050505]/70 font-mono text-[9.5px] font-black text-[#050505] uppercase select-none whitespace-nowrap'>
							{t(pkg.stickerTag)}
						</span>
					</div>
				</div>

				{/* Flush-Top Ligne-Claire Illustration Viewport */}
				<div className='aspect-[18/11] w-full overflow-hidden border-b-[2.5px] border-[#050505] bg-[#121212]'>
					<ServicePackageArtwork artKey={pkg.artKey} className='w-full h-full block' />
				</div>

				{/* Card Body */}
				<div className='p-5 sm:p-6 space-y-3'>
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

					<ul className='space-y-1.5 pt-3 border-t border-dashed border-[#050505]/20'>
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
						className={`w-full py-2 px-3 rounded-lg border-2 font-mono text-[11px] font-black flex items-center justify-between gap-2 cursor-pointer transition-all ${
							addonApplied
								? 'border-[#050505] bg-[#5CE62E] text-[#050505] shadow-[2px_2px_0_#050505]'
								: 'border-[#050505] bg-[#FFFFFF] text-[#050505] hover:bg-[#FCF0D3]'
						}`}
					>
						<span className='flex items-center gap-2 min-w-0'>
							<span
								className={`size-3.5 rounded-[3px] border-[1.5px] border-[#050505] flex items-center justify-center shrink-0 ${
									addonApplied ? 'bg-[#050505] text-[#5CE62E]' : 'bg-[#FCF0D3]'
								}`}
							>
								{addonApplied && <CheckIcon className='size-2.5' />}
							</span>
							<span className='whitespace-nowrap'>
								+ Add-On Video Promo
							</span>
						</span>

						<span
							className={`px-1.5 py-0.5 rounded-[2px] text-[9px] shrink-0 whitespace-nowrap ${
								addonApplied
									? 'bg-[#050505] border border-[#050505] text-[#5CE62E]'
									: 'bg-[#FCF0D3] border border-[#050505]/35 text-[#3B404C]'
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
					className={`w-full py-2.5 px-4 rounded-lg border-[2.5px] border-[#050505] text-[#050505] text-sm font-display font-black cursor-pointer shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050505] active:translate-y-[2px] active:shadow-none transition-all ${
						addonApplied
							? 'bg-[#5CE62E] hover:bg-[#FFD426]'
							: 'bg-[#FFD426] hover:bg-[#FD6141]'
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

const ServicesSection = ({
	activeTrack: controlledTrack,
	onTrackChange,
	onSelectPackageForContact,
}: ServicesSectionProps) => {
	const { t } = useLanguage();
	const [internalTrack, setInternalTrack] = useState<ServiceTrack>('video');
	const activeTrack = controlledTrack ?? internalTrack;
	const [addonByCard, setAddonByCard] = useState<Record<string, boolean>>({});

	const switchTrack = (nextTrack: ServiceTrack) => {
		if (onTrackChange) {
			onTrackChange(nextTrack);
		} else {
			setInternalTrack(nextTrack);
		}
	};

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
					badgeColor='red'
					description={t({
						en: 'Organized cleanly into Video Production and Website Builds. Pick a category below to compare packages.',
						id: 'Dipisahkan rapi antara Produksi Video dan Pembuatan Website. Pilih kategori di bawah untuk melihat paket yang paling sesuai.',
					})}
				/>

				{/* Progressive Disclosure: Signature Risograph 2-Track Switcher */}
				<div
					role='tablist'
					aria-label={t({ en: 'Service Categories', id: 'Kategori Layanan' })}
					className='mt-8 inline-flex flex-wrap sm:flex-nowrap w-full sm:w-auto gap-2 p-1.5 rounded-md border-[3px] border-[#050505] bg-[#FCF0D3] shadow-[5px_5px_0_#050505]'
				>
					<button
						type='button'
						role='tab'
						data-sfx='paper'
						aria-selected={activeTrack === 'video'}
						aria-pressed={activeTrack === 'video'}
						onClick={() => switchTrack('video')}
						className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded font-display font-black text-xs sm:text-sm transition-all cursor-pointer ${
							activeTrack === 'video'
								? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FD6141]'
								: 'bg-[#FFFFFF]/80 text-[#050505] border border-[#050505]/30 hover:bg-[#FFD426]/40'
						}`}
					>
						<FilmIcon className='size-4 shrink-0' />
						<span>{t({ en: 'Video Production', id: 'Produksi Video' })}</span>
						<span
							className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[10px] font-black leading-none whitespace-nowrap shrink-0 ${
								activeTrack === 'video'
									? 'bg-[#FFD426] text-[#050505]'
									: 'bg-[#050505]/10 text-[#3B404C]'
							}`}
						>
							4
						</span>
					</button>

					<button
						type='button'
						role='tab'
						data-sfx='paper'
						aria-selected={activeTrack === 'website'}
						aria-pressed={activeTrack === 'website'}
						onClick={() => switchTrack('website')}
						className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded font-display font-black text-xs sm:text-sm transition-all cursor-pointer ${
							activeTrack === 'website'
								? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#4D9DE0]'
								: 'bg-[#FFFFFF]/80 text-[#050505] border border-[#050505]/30 hover:bg-[#FFD426]/40'
						}`}
					>
						<CodeIcon className='size-4 shrink-0' />
						<span>{t({ en: 'Website Builds', id: 'Pembuatan Website' })}</span>
						<span
							className={`px-1.5 py-0.5 rounded-[2px] font-mono text-[10px] font-black leading-none whitespace-nowrap shrink-0 ${
								activeTrack === 'website'
									? 'bg-[#FFD426] text-[#050505]'
									: 'bg-[#050505]/10 text-[#3B404C]'
							}`}
						>
							5<span className='hidden sm:inline'> + ADD-ON</span>
						</span>
					</button>
				</div>

				{/* TRACK 01: VIDEO PRODUCTION */}
				{activeTrack === 'video' ? (
					<div className='mt-8 space-y-6'>
						{/* Unified Flexibility Strip (Clean Typography, Zero Box-in-Box) */}
						<div className='rounded-md border-2 border-[#050505]/80 bg-[#FCF0D3] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-[#050505]/20'>
							<div className='flex items-start gap-3 p-4 sm:p-5'>
								<span className='size-8 rounded border border-[#050505] bg-[#FFD426] flex items-center justify-center shrink-0 text-[#050505]'>
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

							<div className='flex items-start gap-3 p-4 sm:p-5'>
								<span className='size-8 rounded border border-[#050505] bg-[#4D9DE0] flex items-center justify-center shrink-0 text-[#050505]'>
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
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{VIDEO_SERVICE_PACKAGES.map((pkg) => (
								<ServiceCard
									key={pkg.id}
									pkg={pkg}
									onSelect={onSelectPackageForContact}
								/>
							))}
						</div>
					</div>
				) : (
					/* TRACK 02: WEBSITE BUILDS */
					<div className='mt-8 space-y-6'>
						{/* Sleek Bundle Highlight Banner with Iconic Canary Chrome */}
						<aside
							aria-label={t({
								en: 'Website + Video Promo Bundle Highlight',
								id: 'Info Paket Bundel Website + Video Promo',
							})}
							className='rounded-md border-[3px] border-[#050505] bg-[#1A2636] shadow-[6px_6px_0_#050505] overflow-hidden'
						>
							<div className='flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-[#FFD426] border-b-[3px] border-[#050505]'>
								<div className='flex items-center gap-2 min-w-0 md:flex-1'>
									<span className='px-1.5 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] shrink-0 whitespace-nowrap'>
										{WEBSITE_VIDEO_BUNDLE_PROMO.badge}
									</span>
									<span className='font-mono text-[11px] font-black text-[#050505] uppercase tracking-wider truncate'>
										{t(WEBSITE_VIDEO_BUNDLE_PROMO.stickerTag)}
									</span>
									<div className='hidden lg:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
								</div>
								<span className='hidden md:inline font-mono text-[10px] font-black text-[#050505] shrink-0'>
									{t(WEBSITE_VIDEO_BUNDLE_PROMO.format)}
								</span>
							</div>

							<div className='p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center'>
								<div className='lg:col-span-4'>
									<div className='w-full max-w-[300px] mx-auto aspect-[18/11] rounded-[3px] border-2 border-[#050505] shadow-[3px_3px_0_#FFD426] overflow-hidden bg-[#121212]'>
										<ServicePackageArtwork
											artKey={WEBSITE_VIDEO_BUNDLE_PROMO.artKey}
											className='w-full h-full block'
										/>
									</div>
								</div>

								<div className='lg:col-span-8 space-y-2.5 text-[#FCF0D3]'>
									<div>
										<h4 className='font-display font-black text-xl sm:text-2xl text-[#FFD426] leading-snug'>
											{t(WEBSITE_VIDEO_BUNDLE_PROMO.title)}
										</h4>
										<p className='text-sm text-[#FCF0D3]/85 leading-relaxed mt-1'>
											{t(WEBSITE_VIDEO_BUNDLE_PROMO.summary)}
										</p>
									</div>

									<ul className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-dashed border-white/20'>
										{WEBSITE_VIDEO_BUNDLE_PROMO.deliverables.map((item) => (
											<li
												key={item.en}
												className='flex items-start gap-2 text-xs text-[#FCF0D3]/90 leading-snug'
											>
												<CheckIcon className='size-4 text-[#5CE62E] shrink-0 mt-0.5' />
												<span>{t(item)}</span>
											</li>
										))}
									</ul>

									<p className='font-mono text-[11px] font-bold text-[#5CE62E] pt-1'>
										↓{' '}
										{t({
											en: 'Toggle "+ Add-On Video Promo" on any website card below to include it.',
											id: 'Aktifkan "+ Add-On Video Promo" di kartu website pilihanmu di bawah ini.',
										})}
									</p>
								</div>
							</div>
						</aside>

						{/* 5 Website Service Cards */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'>
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
				)}
			</div>
		</section>
	);
};

export default ServicesSection;
