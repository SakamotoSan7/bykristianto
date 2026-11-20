import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import TitleHeader from '../components/TitleHeader';
import { ArrowUpRightIcon, CheckIcon, DownloadIcon } from '../components/Icons';
import { useLanguage } from '../context/useLanguage';
import {
	getLocalizedCvLink,
	PUBLIC_CONTACT,
	type LocalizedText,
} from '../data/portfolioData';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const EMAIL_COOLDOWN_SECONDS = 15;
const ADDON_SUFFIX = ' + Add-On Video Promo';

export interface ContactPreselection {
	label: LocalizedText;
	seq: number;
}

interface ContactProps {
	preselectedSelection?: ContactPreselection | null;
}

function buildAutoDiscussionMessage(topic: string, targetLang: 'en' | 'id'): string {
	return targetLang === 'id'
		? `Halo Kristianto, saya ingin diskusi proyek terkait: ${topic}.`
		: `Hi Kristianto, I'd like to discuss a project around: ${topic}.`;
}

const DEFAULT_PROJECT_OPTIONS = [
	{
		en: 'Short-Form Content (High Retention)',
		id: 'Video Short-Form (Retensi Tinggi)',
	},
	{
		en: 'Product & Brand Promo Video',
		id: 'Video Promosi Produk / Bisnis',
	},
	{
		en: 'Long-Form Video (YouTube & Explainers)',
		id: 'Video Durasi Panjang (YouTube & Explainer)',
	},
	{
		en: 'Custom Video Request',
		id: 'Video Kustom / Konsep Khusus',
	},
	{
		en: 'Landing Page Website',
		id: 'Website Landing Page',
	},
	{
		en: 'Company Profile Website',
		id: 'Website Company Profile',
	},
	{
		en: 'Portfolio Website',
		id: 'Website Portofolio',
	},
	{
		en: 'Interactive Microsite / Brand Showcase',
		id: 'Microsite Interaktif / Showcase Brand',
	},
	{
		en: 'Website + Add-On Video Promo Bundle',
		id: 'Paket Website + Add-On Video Promo',
	},
	{
		en: 'Custom Website Request',
		id: 'Website Kustom / Konsep Khusus',
	},
	{
		en: 'Full-Time / Contract Creative Role',
		id: 'Posisi Tim Kreatif (Full-Time / Kontrak)',
	},
];

type ContactStatus = {
	type: 'idle' | 'whatsapp' | 'success' | 'fallback';
	text: string;
	waHref?: string;
};

const Contact = ({ preselectedSelection = null }: ContactProps) => {
	const formRef = useRef<HTMLFormElement | null>(null);
	const nameInputRef = useRef<HTMLInputElement | null>(null);
	const emailInputRef = useRef<HTMLInputElement | null>(null);
	const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
	const copyTimerRef = useRef<number | null>(null);
	const lastAutoMessageRef = useRef<string>('');
	const lastAutoTopicRef = useRef<LocalizedText | null>(null);
	const { lang, t } = useLanguage();

	const localizedOptions = DEFAULT_PROJECT_OPTIONS.map((item) => t(item));

	const [loading, setLoading] = useState(false);
	const [botcheck, setBotcheck] = useState(false);
	const [cooldownSeconds, setCooldownSeconds] = useState(0);
	const [emailCopied, setEmailCopied] = useState(false);
	const [status, setStatus] = useState<ContactStatus>({ type: 'idle', text: '' });

	const [form, setForm] = useState({
		name: '',
		email: '',
		projectType: t(DEFAULT_PROJECT_OPTIONS[0]),
		message: '',
	});

	const isCooldown = cooldownSeconds > 0;

	useEffect(() => {
		if (!isCooldown) return;
		const timer = window.setInterval(() => {
			setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
		}, 1000);
		return () => window.clearInterval(timer);
	}, [isCooldown]);

	useEffect(() => {
		return () => {
			if (copyTimerRef.current) {
				window.clearTimeout(copyTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setForm((prev) => {
			let nextType = prev.projectType;
			const hasAddon = prev.projectType.endsWith(ADDON_SUFFIX);
			const baseCandidate = hasAddon
				? prev.projectType.slice(0, -ADDON_SUFFIX.length)
				: prev.projectType;

			const matched = DEFAULT_PROJECT_OPTIONS.find(
				(item) => item.en === baseCandidate || item.id === baseCandidate
			);

			if (matched) {
				const translatedBase = lang === 'id' ? matched.id : matched.en;
				nextType = hasAddon ? `${translatedBase}${ADDON_SUFFIX}` : translatedBase;
			} else if (
				lastAutoTopicRef.current &&
				(prev.projectType === lastAutoTopicRef.current.en ||
					prev.projectType === lastAutoTopicRef.current.id)
			) {
				nextType = lang === 'id' ? lastAutoTopicRef.current.id : lastAutoTopicRef.current.en;
			}

			const shouldSyncAutoMsg =
				lastAutoMessageRef.current !== '' &&
				prev.message.trim() === lastAutoMessageRef.current.trim();
			const nextAutoMsg = shouldSyncAutoMsg
				? buildAutoDiscussionMessage(nextType, lang)
				: prev.message;

			if (shouldSyncAutoMsg) {
				lastAutoMessageRef.current = nextAutoMsg;
			}

			if (nextType === prev.projectType && nextAutoMsg === prev.message) {
				return prev;
			}
			return { ...prev, projectType: nextType, message: nextAutoMsg };
		});
	}, [lang]);

	useEffect(() => {
		if (!preselectedSelection) return;
		const localizedTopic =
			lang === 'id' ? preselectedSelection.label.id : preselectedSelection.label.en;
		lastAutoTopicRef.current = preselectedSelection.label;

		setForm((prev) => {
			const isUntouchedOrAuto =
				prev.message.trim() === '' ||
				(lastAutoMessageRef.current !== '' &&
					prev.message.trim() === lastAutoMessageRef.current.trim());
			const nextAutoMsg = buildAutoDiscussionMessage(localizedTopic, lang);
			if (isUntouchedOrAuto) {
				lastAutoMessageRef.current = nextAutoMsg;
			}
			return {
				...prev,
				projectType: localizedTopic,
				message: isUntouchedOrAuto ? nextAutoMsg : prev.message,
			};
		});
		// Only apply new preselection when user triggers a selection card/modal (`seq` changes)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preselectedSelection?.seq]);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		if ('setCustomValidity' in e.target) {
			e.target.setCustomValidity('');
		}
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const validateTrimmedFields = (requireEmail: boolean): boolean => {
		if (emailInputRef.current) emailInputRef.current.required = requireEmail;
		if (nameInputRef.current) {
			nameInputRef.current.setCustomValidity(
				form.name.trim() === ''
					? t({ en: 'Please enter your name or studio.', id: 'Mohon isi nama atau perusahaanmu.' })
					: ''
			);
		}
		if (messageInputRef.current) {
			messageInputRef.current.setCustomValidity(
				form.message.trim() === ''
					? t({
							en: 'Please add short project details before sending.',
							id: 'Mohon tulis detail singkat proyek sebelum mengirim.',
						})
					: ''
			);
		}
		return formRef.current ? formRef.current.reportValidity() : true;
	};

	const buildWhatsappHref = () => {
		const greeting =
			lang === 'id'
				? 'Halo Kristianto, saya ingin diskusi proyek:'
				: 'Hi Kristianto, I would like to discuss a project:';
		const lines = [
			greeting,
			'',
			`*${t({ en: 'Name / Studio', id: 'Nama / Perusahaan' })}:* ${form.name.trim() || '-'}`,
			...(form.email.trim() ? [`*Email:* ${form.email.trim()}`] : []),
			`*${t({ en: 'Service / Role', id: 'Layanan / Posisi' })}:* ${form.projectType}`,
			'',
			`*${t({ en: 'Project Brief', id: 'Detail Proyek' })}:*`,
			form.message.trim(),
		];
		return `https://wa.me/${PUBLIC_CONTACT.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
	};

	const buildMailtoHref = () => {
		const subject = encodeURIComponent(
			`[Portfolio Inquiry] ${form.projectType} | ${form.name || 'New Client'}`
		);
		const body = encodeURIComponent(
			`Name: ${form.name}\nEmail: ${form.email || '-'}\nProject Type: ${form.projectType}\n\n${form.message}`
		);
		return `mailto:${PUBLIC_CONTACT.email}?subject=${subject}&body=${body}`;
	};

	const handleWhatsappSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validateTrimmedFields(false)) return;

		const waUrl = buildWhatsappHref();
		window.open(waUrl, '_blank', 'noopener,noreferrer');
		setStatus({
			type: 'whatsapp',
			text: t({
				en: 'Your message is pre-filled for WhatsApp. If WhatsApp did not open automatically, click the button below.',
				id: 'Pesan sudah otomatis terisi di WhatsApp dan tinggal klik kirim. Jika halaman WhatsApp belum terbuka otomatis, klik tombol di bawah.',
			}),
			waHref: waUrl,
		});
	};

	const handleCopyEmail = async () => {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(PUBLIC_CONTACT.email);
			} else {
				throw new Error('Clipboard API unavailable');
			}
		} catch {
			const helper = document.createElement('textarea');
			helper.value = PUBLIC_CONTACT.email;
			helper.setAttribute('readonly', '');
			helper.style.position = 'fixed';
			helper.style.opacity = '0';
			document.body.appendChild(helper);
			helper.select();
			document.execCommand('copy');
			document.body.removeChild(helper);
		}

		setEmailCopied(true);
		if (copyTimerRef.current) {
			window.clearTimeout(copyTimerRef.current);
		}
		copyTimerRef.current = window.setTimeout(() => {
			setEmailCopied(false);
		}, 2000);
	};

	const handleEmailSend = async () => {
		if (loading || cooldownSeconds > 0) return;
		if (!validateTrimmedFields(true)) return;

		const cleanEmail = form.email.trim();
		if (!cleanEmail) return;

		const accessKey = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim();

		if (!accessKey) {
			const mailHref = buildMailtoHref();
			window.location.href = mailHref;
			setStatus({
				type: 'fallback',
				text: t({
					en: `Opening your email client to send to ${PUBLIC_CONTACT.email}. You can also click "Open Email Client" below anytime.`,
					id: `Membuka aplikasi email untuk mengirim ke ${PUBLIC_CONTACT.email}. Klik tombol di bawah jika belum terbuka otomatis.`,
				}),
			});
			return;
		}

		setLoading(true);
		setStatus({ type: 'idle', text: '' });

		const cleanName = form.name.trim() || 'New Client';
		const cleanMessage = form.message.trim();

		try {
			const response = await fetch(WEB3FORMS_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					access_key: accessKey,
					subject: `[Portfolio Inquiry] ${form.projectType} · ${cleanName}`,
					from_name: 'Kristianto Portfolio',
					replyto: cleanEmail,
					name: cleanName,
					email: cleanEmail,
					project_type: form.projectType,
					message: cleanMessage,
					botcheck,
				}),
			});

			const result = (await response.json().catch(() => null)) as {
				success?: boolean;
				message?: string;
			} | null;

			if (!response.ok || !result?.success) {
				throw new Error(result?.message || `HTTP ${response.status}`);
			}

			setForm({
				name: '',
				email: '',
				projectType: t(DEFAULT_PROJECT_OPTIONS[0]),
				message: '',
			});
			lastAutoMessageRef.current = '';
			lastAutoTopicRef.current = null;
			setBotcheck(false);
			setCooldownSeconds(EMAIL_COOLDOWN_SECONDS);
			setStatus({
				type: 'success',
				text: t({
					en: 'Email brief dispatched! Thank you, I will reply directly to your email soon.',
					id: 'Email brief terkirim! Terima kasih, saya akan segera membalas langsung ke emailmu.',
				}),
			});
		} catch (error) {
			console.error('Web3Forms Error:', error);
			setStatus({
				type: 'fallback',
				text: t({
					en: `Could not send automatically right now. Click "Open Email Client" below to send your pre-filled message straight to ${PUBLIC_CONTACT.email}.`,
					id: `Pengiriman otomatis sedang terkendala. Klik "Kirim via Aplikasi Email" di bawah untuk langsung mengirim pesanmu ke ${PUBLIC_CONTACT.email}.`,
				}),
			});
		} finally {
			setLoading(false);
		}
	};

	const selectOptions = localizedOptions.includes(form.projectType)
		? localizedOptions
		: [form.projectType, ...localizedOptions];

	return (
		<section
			id='contact'
			className='substrate-legal-pad relative overflow-x-clip border-b-[3.5px] border-[#050505] py-16 sm:py-24 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 sm:pl-16 md:px-14'>
				<TitleHeader
					figCode='FIG.06'
					sub={t({
						en: 'CONTACT & BRIEF',
						id: 'KONTAK & BRIEF',
					})}
					title={t({
						en: 'Send a Brief or Say Hello',
						id: 'Kirim Brief atau Hubungi Langsung',
					})}
					badgeColor='red'
					description={t({
						en: 'Open for freelance video projects, interactive websites, and creative team roles.',
						id: 'Tersedia untuk jasa produksi video, pembuatan website, maupun posisi tim kreatif.',
					})}
				/>

				<div className='mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
					{/* Left: Style D Retro OS Dispatch Brief Form with Canary Chrome */}
					<div className='lg:col-span-7 ds-os-window rounded-md overflow-hidden bg-[#FCF0D3]'>
						<div className='flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-3.5 rounded-xs bg-[#5CE62E] border-2 border-[#050505] inline-block shrink-0' />
								<span className='font-mono text-[11px] sm:text-xs font-black text-[#050505] truncate'>
									<span className='hidden sm:inline'>PRODUCTION_DISPATCH_2026.FORM</span>
									<span className='sm:hidden'>DISPATCH_2026.FORM</span>
								</span>
								<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
							</div>
							<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] text-[#5CE62E] font-mono text-[10px] font-bold shrink-0 whitespace-nowrap'>
								{t({ en: 'WA FIRST · EMAIL READY', id: 'WA CEPAT · EMAIL SIAP' })}
							</span>
						</div>

						<div className='p-6 sm:p-8'>
							<div className='pb-4 mb-5 border-b border-dashed border-[#050505]/25'>
								<h3 className='font-display font-black text-2xl text-[#050505]'>
									{t({ en: 'Project Request Sheet', id: 'Formulir Kebutuhan Proyek' })}
								</h3>
								<p className='text-xs sm:text-sm text-[#3B404C] mt-1'>
									{t({
										en: 'Fill out the form below to open a pre-filled WhatsApp chat ready to send, or use Email as an alternative.',
										id: 'Isi formulir di bawah lalu tekan Kirim via WhatsApp agar pesan otomatis tersusun dan siap dikirim, atau gunakan opsi Email.',
									})}
								</p>
							</div>

							<form ref={formRef} noValidate onSubmit={handleWhatsappSubmit} className='space-y-5'>
								{/* Invisible honeypot trap for automated spam bots */}
								<input
									type='checkbox'
									name='botcheck'
									checked={botcheck}
									onChange={(e) => setBotcheck(e.target.checked)}
									tabIndex={-1}
									autoComplete='off'
									aria-hidden='true'
									className='hidden'
									style={{ display: 'none' }}
								/>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<label
											htmlFor='contact-name'
											className='block font-mono text-xs font-black uppercase text-[#050505] mb-1.5'
										>
											{t({ en: 'Your Name / Studio', id: 'Nama / Perusahaan' })}
										</label>
										<input
											ref={nameInputRef}
											id='contact-name'
											name='name'
											type='text'
											required
											value={form.name}
											onChange={handleChange}
											placeholder={t({ en: 'e.g. Alex / Creative Lead', id: 'Misal: Budi / Tim Brand' })}
											className='w-full rounded-sm border-2 border-[#050505]/75 bg-white px-4 py-3 text-sm font-medium text-[#050505] placeholder:text-[#3B404C]/60 focus:border-[#050505] focus:bg-[#FAF3CF] focus:shadow-[3px_3px_0_#050505] focus:outline-none transition-all'
										/>
									</div>

									<div>
										<label
											htmlFor='contact-email'
											className='block font-mono text-xs font-black uppercase text-[#050505] mb-1.5'
										>
											{t({ en: 'Email (Optional for WA)', id: 'Email (Opsional untuk WA)' })}
										</label>
										<input
											ref={emailInputRef}
											id='contact-email'
											name='email'
											type='email'
											value={form.email}
											onChange={handleChange}
											placeholder='name@company.com'
											className='w-full rounded-sm border-2 border-[#050505]/75 bg-white px-4 py-3 text-sm font-medium text-[#050505] placeholder:text-[#3B404C]/60 focus:border-[#050505] focus:bg-[#FAF3CF] focus:shadow-[3px_3px_0_#050505] focus:outline-none transition-all'
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor='contact-type'
										className='block font-mono text-xs font-black uppercase text-[#050505] mb-1.5'
									>
										{t({ en: 'Service / Project Type', id: 'Jenis Layanan / Proyek' })}
									</label>
									<select
										id='contact-type'
										name='projectType'
										value={form.projectType}
										onChange={handleChange}
										className='w-full rounded-sm border-2 border-[#050505]/75 bg-white px-4 py-3 text-sm font-bold text-[#050505] focus:border-[#050505] focus:bg-[#FAF3CF] focus:shadow-[3px_3px_0_#050505] focus:outline-none cursor-pointer transition-all'
									>
										{selectOptions.map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))}
									</select>
								</div>

								<div>
									<label
										htmlFor='contact-message'
										className='block font-mono text-xs font-black uppercase text-[#050505] mb-1.5'
									>
										{t({ en: 'Project Details & Timeline', id: 'Detail Proyek, Referensi & Tenggat' })}
									</label>
									<textarea
										ref={messageInputRef}
										id='contact-message'
										name='message'
										rows={4}
										required
										value={form.message}
										onChange={handleChange}
										placeholder={t({
											en: 'Share your topic, aspect ratio (9:16 / 16:9), website goals, or hiring role...',
											id: 'Jelaskan topik video, rasio layar (9:16 / 16:9), konsep website, referensi gaya, atau posisi kerja...',
										})}
										className='w-full rounded-sm border-2 border-[#050505]/75 bg-white px-4 py-3 text-sm font-medium text-[#050505] placeholder:text-[#3B404C]/60 focus:border-[#050505] focus:bg-[#FAF3CF] focus:shadow-[3px_3px_0_#050505] focus:outline-none transition-all'
									/>
								</div>

								{status.type !== 'idle' && (
									<div
										className={`rounded-sm border-[2.5px] border-[#050505] p-4 text-sm font-medium shadow-[3px_3px_0_#050505] ${
											status.type === 'success' || status.type === 'whatsapp'
												? 'bg-[#5CE62E]/35 text-[#050505]'
												: 'bg-[#FFD426]/60 text-[#050505]'
										}`}
									>
										<p>{status.text}</p>
										{status.type === 'whatsapp' && status.waHref && (
											<a
												href={status.waHref}
												target='_blank'
												rel='noopener noreferrer'
												data-sfx='bell'
												className='inline-flex items-center gap-1.5 mt-3 rounded-full border-2 border-[#050505] bg-[#5CE62E] text-[#050505] px-4 py-2 text-xs font-mono font-black shadow-[2px_2px_0_#050505]'
											>
												<span>{t({ en: 'Open Pre-Filled WhatsApp', id: 'Buka Chat WhatsApp Sekarang' })}</span>
												<ArrowUpRightIcon className='size-3.5' />
											</a>
										)}
										{status.type === 'fallback' && (
											<a
												href={buildMailtoHref()}
												data-sfx='bell'
												className='inline-flex items-center gap-1.5 mt-3 rounded-full border-2 border-[#050505] bg-[#3886C0] text-white px-4 py-2 text-xs font-mono font-bold shadow-[2px_2px_0_#050505]'
											>
												<span>{t({ en: 'Open Email Client', id: 'Kirim via Aplikasi Email' })}</span>
												<ArrowUpRightIcon className='size-3.5' />
											</a>
										)}
									</div>
								)}

								<div className='flex flex-wrap items-center gap-3 pt-1'>
									{/* Primary Action: Pre-filled WhatsApp Direct */}
									<button
										type='submit'
										data-sfx='bell'
										className='rounded-lg border-[2.5px] border-[#050505] bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] px-6 py-3 text-sm font-display font-black inline-flex items-center gap-1.5 cursor-pointer shadow-[4px_4px_0_#050505] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
									>
										<span>
											{t({
												en: 'Send via WhatsApp →',
												id: 'Kirim via WhatsApp →',
											})}
										</span>
									</button>

									{/* Secondary Option: Send via Email */}
									<button
										type='button'
										data-sfx='bell'
										disabled={loading || cooldownSeconds > 0}
										onClick={handleEmailSend}
										className='rounded-lg border-2 border-[#050505]/80 bg-white hover:bg-[#FFD426] px-5 py-3 text-sm font-display font-bold text-[#050505] inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white transition-colors'
									>
										<span>
											{loading
												? t({ en: 'Sending Email...', id: 'Mengirim Email...' })
												: cooldownSeconds > 0
													? t({
															en: `Sent ✓ (${cooldownSeconds}s)`,
															id: `Terkirim ✓ (${cooldownSeconds}d)`,
														})
													: t({ en: 'Or Send via Email', id: 'Atau Kirim ke Email' })}
										</span>
										{!loading && cooldownSeconds === 0 && <ArrowUpRightIcon className='size-4' />}
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Right: Production Standards & Direct Channels Card */}
					<div className='lg:col-span-5 ds-panel rounded-md p-6 sm:p-8 space-y-5 bg-[#FCF0D3]'>
						<div className='flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] font-bold'>
							<span className='inline-flex items-center gap-1.5 text-[#050505]'>
								<span className='size-2 rounded-full bg-[#5CE62E] border border-[#050505]' />
								<span>{t({ en: 'AVAILABLE FOR PROJECTS', id: 'SIAP UNTUK PROYEK' })}</span>
							</span>
							<span className='font-black text-[#3886C0]'>
								{t({ en: 'INDONESIA · REMOTE READY', id: 'INDONESIA · SIAP REMOTE' })}
							</span>
						</div>

						<div className='flex items-center gap-3.5 pb-4 border-b border-dashed border-[#050505]/20'>
							<img
								src='/images/me/studio/avatar-kristianto.webp'
								alt='Kristianto'
								loading='lazy'
								className='size-14 sm:size-16 shrink-0 rounded-sm border-2 border-[#050505] object-cover object-top bg-[#14171D]'
							/>
							<div className='min-w-0 space-y-0.5'>
								<p className='font-display font-black text-base text-[#050505] leading-tight truncate'>
									Kristianto, S.Sn
								</p>
								<p className='font-mono text-[11px] font-bold text-[#C5432F] leading-snug'>
									{t({
										en: 'Video Editor & Creative Technologist',
										id: 'Video Editor & Creative Producer',
									})}
								</p>
								<p className='text-[11px] text-[#3B404C] leading-snug'>
									{t({
										en: 'Direct reply via WhatsApp or Email · Remote ID / Global',
										id: 'Respons langsung via WhatsApp atau Email · Remote ID / Global',
									})}
								</p>
							</div>
						</div>

						<h3 className='font-display font-black text-xl text-[#050505]'>
							{t({
								en: 'Production Standards',
								id: 'Standar Kerja',
							})}
						</h3>

						<ul className='space-y-2.5 text-sm text-[#050505]'>
							{[
								{
									en: 'Film & TV storytelling structure paired with well-paced editing.',
									id: 'Struktur cerita berlatar Televisi & Film dengan ritme editing yang terukur.',
								},
								{
									en: 'Clean visual composition and responsive mobile-friendly web layouts.',
									id: 'Komposisi visual yang bersih serta tata letak web yang rapi di ponsel maupun desktop.',
								},
								{
									en: 'Clear voice-first mixing paired with real recorded sound effects (SFX & foley).',
									id: 'Mixing narasi voice-first yang jernih bersama efek suara nyata (SFX & foley).',
								},
								{
									en: 'Fluent in both English (TOEFL 610) & Indonesian.',
									id: 'Menangani proyek dwibahasa (Inggris TOEFL 610 & Indonesia).',
								},
							].map((point) => (
								<li key={point.en} className='flex items-start gap-2.5'>
									<CheckIcon className='size-4 text-[#39754F] shrink-0 mt-0.5' />
									<span className='leading-relaxed'>{t(point)}</span>
								</li>
							))}
						</ul>

						<div className='pt-4 border-t border-dashed border-[#050505]/20 space-y-3 font-mono text-xs'>
							<p className='font-black text-[#3B404C] uppercase'>
								{t({ en: 'Direct Channels:', id: 'Kontak Resmi:' })}
							</p>
							<a
								href={`https://wa.me/${PUBLIC_CONTACT.whatsappNumber}`}
								target='_blank'
								rel='noopener noreferrer'
								data-sfx='bell'
								className='inline-flex items-center gap-2 px-3.5 py-2 rounded border-2 border-[#050505] bg-[#5CE62E] hover:bg-[#FFD426] text-xs sm:text-sm font-black text-[#050505] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
							>
								<span>WhatsApp: {PUBLIC_CONTACT.whatsappDisplay}</span>
								<ArrowUpRightIcon className='size-3.5' />
							</a>
							<div className='flex flex-wrap items-center gap-2.5 pt-0.5'>
								<a
									href={`mailto:${PUBLIC_CONTACT.email}`}
									data-sfx='bell'
									className='text-sm font-black text-[#204275] hover:text-[#FD6141] underline underline-offset-4'
								>
									{PUBLIC_CONTACT.email}
								</a>
								<button
									type='button'
									onClick={handleCopyEmail}
									data-sfx='copy'
									aria-label={t({ en: 'Copy email address', id: 'Salin alamat email' })}
									className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[11px] font-black transition-colors cursor-pointer ${
										emailCopied
											? 'border-[#050505] bg-[#5CE62E] text-[#050505]'
											: 'border-[#050505]/45 bg-white hover:bg-[#FFD426] text-[#050505]'
									}`}
								>
									{emailCopied ? (
										<>
											<CheckIcon className='size-3 text-[#050505]' />
											<span>{t({ en: 'Copied', id: 'Tersalin' })}</span>
										</>
									) : (
										<span>{t({ en: 'Copy', id: 'Salin' })}</span>
									)}
								</button>
							</div>
							<div className='flex flex-wrap items-center gap-x-4 gap-y-2 pt-2'>
								{(() => {
									const cv = getLocalizedCvLink(lang);
									return (
										<a
											href={cv.href}
											target='_blank'
											rel='noopener noreferrer'
											data-sfx='keycap'
											className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded border-2 border-[#050505] bg-[#FFD426] hover:bg-[#5CE62E] font-black text-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
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
									className='font-bold text-[#204275] hover:text-[#FD6141] underline underline-offset-4 transition-colors'
								>
									LinkedIn ↗
								</a>
								<a
									href={PUBLIC_CONTACT.github}
									target='_blank'
									rel='noopener noreferrer'
									data-sfx='portal'
									className='font-bold text-[#204275] hover:text-[#FD6141] underline underline-offset-4 transition-colors'
								>
									GitHub ↗
								</a>
								<a
									href={PUBLIC_CONTACT.instagram}
									target='_blank'
									rel='noopener noreferrer'
									data-sfx='portal'
									className='font-bold text-[#204275] hover:text-[#FD6141] underline underline-offset-4 transition-colors'
								>
									Instagram ↗
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Contact;
