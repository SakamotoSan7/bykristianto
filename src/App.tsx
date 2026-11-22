import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { SoundProvider } from './context/SoundContext';
import { SpaghettiSvgDefs } from './components/SpaghettiArt';
import NavBar from './components/NavBar';
import Hero from './sections/Hero';
import StudioDeskSection from './sections/StudioDeskSection';
import VideoPortfolioSection from './sections/VideoPortfolioSection';
import BlueprintProcessSection from './sections/BlueprintProcessSection';
import ServicesSection, { type ServiceTrack } from './sections/ServicesSection';
import ExperienceSection from './sections/ExperienceSection';
import ShowcaseSection from './sections/ShowcaseSection';
import Contact, { type ContactPreselection } from './sections/Contact';
import Footer from './sections/Footer';
import AudioUnlockBar from './components/AudioUnlockBar';
import type { CraftLabTab, LocalizedText } from './data/portfolioData';

const App = () => {
	const [preselectedTopic, setPreselectedTopic] = useState<ContactPreselection | null>(null);
	const [activeCraftTab, setActiveCraftTab] = useState<CraftLabTab>('compare');
	const [activeServiceTrack, setActiveServiceTrack] = useState<ServiceTrack>('video');

	const handleSelectPackageForContact = (label: LocalizedText) => {
		setPreselectedTopic((prev) => ({
			label,
			seq: (prev?.seq ?? 0) + 1,
		}));
		const contactEl = document.getElementById('contact');
		if (contactEl) {
			contactEl.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const handleSelectCraftTab = (tab: CraftLabTab) => {
		setActiveCraftTab(tab);
	};

	return (
		<LanguageProvider>
			<SoundProvider>
				<div className='min-h-screen overflow-x-clip bg-[#F6EDD6] text-[#050505] selection:bg-[#FFD426] selection:text-[#050505]'>
					<SpaghettiSvgDefs />
					<NavBar onSelectCraftTab={handleSelectCraftTab} />
					<main>
						<Hero />
						<VideoPortfolioSection onSelectStyleForContact={handleSelectPackageForContact} />
						<StudioDeskSection onSelectServiceTrack={setActiveServiceTrack} />
						<BlueprintProcessSection
							activeTab={activeCraftTab}
							onTabChange={setActiveCraftTab}
						/>
						<ServicesSection
							activeTrack={activeServiceTrack}
							onTrackChange={setActiveServiceTrack}
							onSelectPackageForContact={handleSelectPackageForContact}
						/>
						<ExperienceSection />
						<ShowcaseSection />
						<Contact preselectedSelection={preselectedTopic} />
					</main>
					<Footer />
					<AudioUnlockBar />
				</div>
			</SoundProvider>
		</LanguageProvider>
	);
};

export default App;
