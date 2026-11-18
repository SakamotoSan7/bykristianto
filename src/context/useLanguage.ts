import { createContext, useContext } from 'react';

export type SiteLanguage = 'en' | 'id';

export interface LocalizedText {
	en: string;
	id: string;
}

export interface LanguageContextValue {
	lang: SiteLanguage;
	setLang: (lang: SiteLanguage) => void;
	toggleLang: () => void;
	t: (text: LocalizedText) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function useLanguage() {
	const ctx = useContext(LanguageContext);
	if (!ctx) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return ctx;
}
