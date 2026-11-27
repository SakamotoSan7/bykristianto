import { useState, useEffect, type ReactNode } from 'react';
import { LanguageContext, type SiteLanguage } from './useLanguage';

const SEO_HEAD_META: Record<
	SiteLanguage,
	{
		title: string;
		description: string;
		canonical: string;
	}
> = {
	en: {
		title: 'Kristianto | Video Editor, Motion Producer & Creative Technologist',
		description:
			'Kristianto: Video Editor, Motion Explainer Producer & Creative Technologist. Film & TV storytelling paired with Premiere/AE editing, code-driven animation (Remotion, Canvas 2D, Three.js), crisp sound design, and interactive websites.',
		canonical: 'https://bykristianto.my.id/',
	},
	id: {
		title: 'Kristianto | Video Editor, Motion Explainer Producer & Creative Web Builder',
		description:
			'Kristianto: Video Editor, Produser Motion Explainer & Creative Web Builder. Menggabungkan teknik Film & TV dengan editing Premiere/AE, animasi berbasis kode (Remotion, Canvas 2D, Three.js), tata suara jernih, dan website interaktif.',
		canonical: 'https://bykristianto.my.id/id',
	},
};

function getLangFromPath(pathname: string): SiteLanguage {
	return pathname === '/id' || pathname.startsWith('/id/') ? 'id' : 'en';
}

function getPathForLang(targetLang: SiteLanguage): string {
	return targetLang === 'id' ? '/id' : '/';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [lang, setLangState] = useState<SiteLanguage>(() => {
		if (typeof window === 'undefined') return 'en';
		return getLangFromPath(window.location.pathname);
	});

	useEffect(() => {
		const handlePopState = () => {
			setLangState(getLangFromPath(window.location.pathname));
		};
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	useEffect(() => {
		window.localStorage.setItem('kristianto-lang', lang);
		document.documentElement.lang = lang;

		const meta = SEO_HEAD_META[lang];
		document.title = meta.title;

		const descEl = document.querySelector('meta[name="description"]');
		if (descEl) {
			descEl.setAttribute('content', meta.description);
		}

		const canonicalEl = document.querySelector('link[rel="canonical"]');
		if (canonicalEl) {
			canonicalEl.setAttribute('href', meta.canonical);
		}
	}, [lang]);

	const setLang = (nextLang: SiteLanguage) => {
		setLangState(nextLang);
		if (typeof window !== 'undefined') {
			const nextPath = getPathForLang(nextLang);
			if (window.location.pathname !== nextPath) {
				window.history.replaceState(null, '', nextPath + window.location.search + window.location.hash);
			}
		}
	};

	const toggleLang = () => setLang(lang === 'en' ? 'id' : 'en');
	const t = (text: { en: string; id: string }) => text[lang];

	return (
		<LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
			{children}
		</LanguageContext.Provider>
	);
}
