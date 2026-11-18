import { useState, useEffect, type ReactNode } from 'react';
import { LanguageContext, type SiteLanguage } from './useLanguage';

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [lang, setLang] = useState<SiteLanguage>(() => {
		if (typeof window === 'undefined') return 'en';
		const saved = window.localStorage.getItem('kristianto-lang');
		return saved === 'id' || saved === 'en' ? saved : 'en';
	});

	useEffect(() => {
		window.localStorage.setItem('kristianto-lang', lang);
		document.documentElement.lang = lang;
	}, [lang]);

	const toggleLang = () => setLang((prev) => (prev === 'en' ? 'id' : 'en'));
	const t = (text: { en: string; id: string }) => text[lang];

	return (
		<LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
			{children}
		</LanguageContext.Provider>
	);
}
