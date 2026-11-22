import type { LocalizedText } from '../context/useLanguage';
import type { StackLogoId } from '../components/StackLogos';

export type { LocalizedText };
export type CraftLabTab = 'compare' | 'chess' | 'sfx';

export type VideoCategory = 'editorial' | '3d-shader' | 'systems-data' | 'remotion';
export type VideoRatio = '16:9' | '9:16';
export type VideoLanguage = 'EN' | 'ID';

export interface VideoWork {
	id: string;
	badgeNumber: string;
	style: string;
	styleTagline: LocalizedText;
	renderTech: string;
	category: VideoCategory;
	language: VideoLanguage;
	aspectRatio: VideoRatio;
	title: LocalizedText;
	durationSeconds: number;
	durationLabel: string;
	resolution: string;
	fileName: string;
	thumbnailPath: string;
	subtitlePath: string | null;
	featured?: boolean;
	caseStudy: {
		hook: LocalizedText;
		storyAngle: LocalizedText;
		visualCraft: LocalizedText;
		audioDesign: LocalizedText;
		idealFor: LocalizedText;
	};
}

export function getVideoSrc(fileName: string): string {
	const cdnBase = import.meta.env.VITE_VIDEO_BASE_URL?.trim();
	if (cdnBase) {
		return `${cdnBase.replace(/\/+$/, '')}/${fileName}`;
	}
	return `/local-videos/${fileName}`;
}

export const PUBLIC_CONTACT = {
	email: 'kristianto.too@gmail.com',
	whatsappNumber: '6285187166071',
	whatsappDisplay: '+62 851-8716-6071',
	github: 'https://github.com/SakamotoSan7',
	linkedin: 'https://www.linkedin.com/in/kristianto-9117',
	instagram: 'https://www.instagram.com/kristianto.too/',
	portfolioUrl: 'https://bykristianto.my.id/',
	cvUrl: {
		en: 'https://drive.google.com/file/d/1qEmeOfIWh4hec3AuCbJ-0NlrP7ganmqg/view?usp=drivesdk',
		id: 'https://drive.google.com/file/d/1Fub-sEhVfokTNBDWmMZk-RQDRnVElKsr/view?usp=drivesdk',
	},
};

export function getLocalizedCvLink(lang: 'en' | 'id') {
	return lang === 'id'
		? {
				href: PUBLIC_CONTACT.cvUrl.id,
				label: 'Download CV (Indonesia)',
			}
		: {
				href: PUBLIC_CONTACT.cvUrl.en,
				label: 'Download CV (English)',
			};
}

export const NAV_LINKS: { label: LocalizedText; href: string }[] = [
	{ label: { en: 'Portfolio', id: 'Portofolio' }, href: '#videos' },
	{ label: { en: 'Craft Lab', id: 'Lab Kreatif' }, href: '#craft-lab' },
	{ label: { en: 'Services', id: 'Jasa' }, href: '#services' },
	{ label: { en: 'About & CV', id: 'Tentang & CV' }, href: '#experience' },
	{ label: { en: 'Web Builds', id: 'Proyek Web' }, href: '#web-builds' },
];

export const VIDEO_WORKS: VideoWork[] = [
	{
		id: 'remotion-eric-hoffer',
		badgeNumber: '01',
		style: 'Remotion · Editorial Ink',
		styleTagline: { en: 'React-driven mixed-media documentary', id: 'Dokumenter media campuran via Remotion' },
		renderTech: 'Remotion 4.0 · React + Halftone UI',
		category: 'remotion',
		language: 'EN',
		aspectRatio: '9:16',
		title: {
			en: 'Why Working-Class Genius Gets Erased (Eric Hoffer & Cognitive Tax)',
			id: 'Kenapa Pemikir Kelas Pekerja Terlupakan (Eric Hoffer & Beban Kognitif)',
		},
		durationSeconds: 91.01,
		durationLabel: '01:31',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'v08_erichoffer_spaghetti_master_1080x1920_30fps.mp4',
		thumbnailPath: '/thumbnails/v08-eric-hoffer-cognitive-tax.webp',
		subtitlePath: null,
		featured: true,
		caseStudy: {
			hook: {
				en: 'Starts on a 1951 San Francisco cargo pier, pairing archival halftone cutouts with Harvard cognitive bandwidth data (-13 IQ).',
				id: 'Dimulai di dermaga kargo 1951, memadukan foto arsip dengan data kapasitas kognitif (-13 IQ) serta ilustrasi bergaya komik.',
			},
			storyAngle: {
				en: 'Shows how survival stress and academic jargon obscure sharp real-world thinkers like dockworker Eric Hoffer.',
				id: 'Mengungkap dua jebakan tak kasat mata (tekanan finansial & jargon akademik) lewat kisah buruh pelabuhan Eric Hoffer.',
			},
			visualCraft: {
				en: 'Built as a programmable React video composition in Remotion 4.0 with grid notebooks, exploded RAM views, & split panels.',
				id: 'Dibangun sebagai komposisi video React terprogram di Remotion 4.0 lengkap dengan buku catatan grid & diagram terurai.',
			},
			audioDesign: {
				en: 'Crisp documentary VO narration paced seamlessly across scene reveals and illustrative SFX accents.',
				id: 'Narasi dokumenter berbahasa Inggris dengan ritme tenang dan aksen efek suara di tiap pergantian temuan data.',
			},
			idealFor: {
				en: 'Documentary creators, essay channels, & editorial brands',
				id: 'Kreator video esai, kanal dokumenter, & media naratif',
			},
		},
	},
	{
		id: 'remotion-constitutional-3d',
		badgeNumber: '02',
		style: 'Remotion · 3D Cel-Shaded',
		styleTagline: { en: '3D character & environment motion rig', id: 'Animasi 3D cel-shaded dalam Remotion' },
		renderTech: 'Remotion 4.0 · 3D Cel-Shaded Scenes',
		category: 'remotion',
		language: 'EN',
		aspectRatio: '9:16',
		title: {
			en: "How One Court Exception Triggered a Vice-Presidential Exit (Visual Essay)",
			id: 'Bagaimana Satu Celah Hukum Mengguncang Kursi Wakil Presiden (Esai 3D)',
		},
		durationSeconds: 87.07,
		durationLabel: '01:27',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'v10_ricks_master.mp4',
		thumbnailPath: '/thumbnails/v10-constitutional-loophole-3d.webp',
		subtitlePath: null,
		caseStudy: {
			hook: {
				en: 'Drops viewers straight outside parliament 2 hours before an impeachment vote in bold cel-shaded 3D storytelling.',
				id: 'Membuka adegan dua jam sebelum pemakzulan dengan visual diorama gedung parlemen dan karakter 3D bergaya cel-shaded.',
			},
			storyAngle: {
				en: 'Visualizes a dramatic constitutional timeline to demonstrate structured 3D storytelling in a tight vertical format.',
				id: 'Visualisasi alur peristiwa hukum dan ketatanegaraan secara ringkas melalui penceritaan animasi 3D.',
			},
			visualCraft: {
				en: 'Full 3D architectural scenes, character acting, animated clocks, courthouse scales, & sunset epilogue rendered via Remotion.',
				id: 'Lingkungan arsitektur 3D penuh, karakter animasi, jam analog, timbangan pengadilan, & epilog senja dalam Remotion.',
			},
			audioDesign: {
				en: 'Authoritative English commentary pacing synced cleanly with dramatic court & timeline cues.',
				id: 'Narasi berbahasa Inggris yang tegas dan sinkron presisi dengan tiap ketukan pergantian adegan 3D.',
			},
			idealFor: {
				en: 'YouTube Shorts essays, explainer channels, & 3D narrative reels',
				id: 'Kanal YouTube Shorts analitik, esai visual, & konten 3D naratif',
			},
		},
	},
	{
		id: '01-paper-cut-out',
		badgeNumber: '03',
		style: 'Paper Cut-Out',
		styleTagline: { en: 'Handmade collage vertical reel', id: 'Kolase kertas buatan tangan (9:16)' },
		renderTech: 'Canvas 2D · Paper Texture & Shadows',
		category: 'editorial',
		language: 'ID',
		aspectRatio: '9:16',
		title: {
			en: 'Why We Procrastinate: Emotional Alarm, Not Laziness',
			id: 'Kenapa Kamu Menunda Tugas Penting (Alarm Emosi, Bukan Malas)',
		},
		durationSeconds: 66.27,
		durationLabel: '01:06',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-01-paper-cut-out-final.mp4',
		thumbnailPath: '/thumbnails/video-01-paper-cut-out.webp',
		subtitlePath: '/subtitles/video-01-paper-cut-out.vtt',
		featured: true,
		caseStudy: {
			hook: {
				en: 'Opens with a relatable daily habit ("reaching for your phone") backed by Mood-Repair Theory and brain scan findings.',
				id: 'Dibuka dari kebiasaan sehari-hari ("tangan otomatis meraih HP"), lalu menjelaskan alasannya lewat riset psikologi emosi otak.',
			},
			storyAngle: {
				en: 'Cites Pychyl & Sirois (2013) plus amygdala brain scan findings in crisp, easy-to-follow vertical storytelling.',
				id: 'Mengacu riset Pychyl & Sirois (2013) serta studi pemindaian otak amigdala dalam format vertikal yang mudah dipahami.',
			},
			visualCraft: {
				en: 'Stop-motion style paper cutouts with smooth desk camera loop back to frame 0 and UI-safe vertical captions.',
				id: 'Potongan kertas bergaya stop-motion dengan gerakan kamera meja yang berulang (loop) mulus serta posisi subtitle aman di ponsel.',
			},
			audioDesign: {
				en: '42 real paper sound effects / foley (scissors, flips, crumples) paired with soft felt-piano music and crisp narration.',
				id: '42 efek suara kertas nyata / foley (gunting, lipatan, lembar kertas) dipadukan piano lembut dengan narasi tetap jernih.',
			},
			idealFor: {
				en: 'Mental health, edutech, & high-retention Reels/TikTok',
				id: 'Konten edukasi, kesehatan mental, & Reels/TikTok dengan retensi tinggi',
			},
		},
	},
	{
		id: '02-stickman-explainer',
		badgeNumber: '04',
		style: 'Stickman Explainer',
		styleTagline: { en: 'Expressive hand-inked character motion', id: 'Animasi sketsa tinta & karakter' },
		renderTech: 'Canvas 2D · Jointed Ink Sketches',
		category: 'editorial',
		language: 'ID',
		aspectRatio: '9:16',
		title: {
			en: 'The Lifestyle Inflation Trap: Higher Salary, Zero Savings',
			id: 'Jebakan Lifestyle Inflation: Gaji Naik, Saldo Akhir Bulan Tetap Nol',
		},
		durationSeconds: 67.87,
		durationLabel: '01:07',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-02-stickman-explainer-final.mp4',
		thumbnailPath: '/thumbnails/video-02-stickman-explainer.webp',
		subtitlePath: '/subtitles/video-02-stickman-explainer.vtt',
		caseStudy: {
			hook: {
				en: 'Translates the psychology of rising spending habits (Hedonic Treadmill, Brickman & Campbell 1971) into expressive inked humor.',
				id: 'Menerjemahkan jebakan kenaikan gaya hidup (Hedonic Treadmill, Brickman & Campbell 1971) menjadi komedi sketsa tinta yang ekspresif.',
			},
			storyAngle: {
				en: 'Visualizes invisible lifestyle creep via a braking lever metaphor and actionable 50% automatic savings split.',
				id: 'Menggambarkan kebocoran gaji secara visual lewat metafora tuas rem dan solusi praktis pembagian tabungan otomatis.',
			},
			visualCraft: {
				en: 'Hand-inked stickman animation with realistic arm-joint mechanics (2-bone IK) and seamless frame-0 looping.',
				id: 'Animasi stickman bergaya goresan tinta dengan sendi lengan terstruktur (2-bone IK) yang berulang mulus kembali ke frame awal.',
			},
			audioDesign: {
				en: '34 tactile paper, coin, ink stamp, and lever SFX balanced smoothly beneath an intimate narrative voiceover.',
				id: '34 efek suara nyata / SFX (goresan pensil, koin, stempel, tuas) yang ditata seimbang tanpa menutup suara narator.',
			},
			idealFor: {
				en: 'Personal finance apps, fintech creators, & punchy explainers',
				id: 'Aplikasi keuangan pribadi, kreator finansial, & konten edukasi cepat',
			},
		},
	},
	{
		id: '05-kinetic-typography',
		badgeNumber: '05',
		style: 'Kinetic Typography',
		styleTagline: { en: 'High-tempo 125 BPM retention hook', id: 'Tipografi kinetik bertempo cepat' },
		renderTech: 'Canvas 2D · High-Speed Type Engine',
		category: 'systems-data',
		language: 'EN',
		aspectRatio: '9:16',
		title: {
			en: 'Why Pretty Intros Kill Your Watch Time (The 1.3-Second Hook)',
			id: 'Kenapa Intro Cantik Membunuh Watch Time (Mekanisme Hook 1.3 Detik)',
		},
		durationSeconds: 55.9,
		durationLabel: '00:55',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-05-kinetic-typography-final.mp4',
		thumbnailPath: '/thumbnails/video-05-kinetic-typography.webp',
		subtitlePath: null,
		caseStudy: {
			hook: {
				en: 'Opens straight on impact, proving Meta neuro-tracking 1.3s attention windows through its own aggressive pacing.',
				id: 'Langsung dibuka dengan hentakan visual sejak detik pertama, membuktikan riset atensi 1,3 detik lewat ritme cepatnya.',
			},
			storyAngle: {
				en: 'Explains why slow brand logo animations drive 35–55% early viewer drop-off.',
				id: 'Menjelaskan secara konkret mengapa intro logo panjang membuat penonton langsung menggeser layar.',
			},
			visualCraft: {
				en: 'High-contrast obsidian dark canvas with volt-lime (#C8F542) razor cuts and clean wipe-loop transitions.',
				id: 'Kanvas gelap kontras tinggi dengan aksen volt-lime (#C8F542) dan potongan gerak cepat tepat ketukan.',
			},
			audioDesign: {
				en: '32 punchy percussive & kinetic SFX synced on frame hits over sidechain-ducked 125 BPM electronic beat.',
				id: '32 efek suara (SFX) sinkron ketukan di atas musik elektronik 125 BPM yang otomatis melandai saat narasi masuk.',
			},
			idealFor: {
				en: 'Performance ads, creator agencies, & fast product launches',
				id: 'Iklan performa media sosial, agensi kreator, & peluncuran produk',
			},
		},
	},
	{
		id: '07-soft-3d-clay',
		badgeNumber: '06',
		style: 'Soft 3D Clay',
		styleTagline: { en: 'Three.js matte clay dioramas', id: 'Diorama 3D clay matte Three.js' },
		renderTech: 'Three.js · Soft Lighting & Squash',
		category: '3d-shader',
		language: 'ID',
		aspectRatio: '9:16',
		title: {
			en: 'Shrinkflation Psychology: Same Wrapper, Smaller Contents',
			id: 'Fenomena Shrinkflation: Kemasan Terlihat Sama, Isinya Menyusut',
		},
		durationSeconds: 70.67,
		durationLabel: '01:10',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-07-soft-3d-clay-final.mp4',
		thumbnailPath: '/thumbnails/video-07-soft-3d-clay.webp',
		subtitlePath: null,
		caseStudy: {
			hook: {
				en: 'Breaks down Price Sensitivity & shrinking portion tricks using elastic matte 3D clay packages.',
				id: 'Membongkar trik produsen mengecilkan isi produk di kemasan yang sama lewat model kemasan 3D clay elastis.',
			},
			storyAngle: {
				en: 'Turns an abstract economics concept (coined by Pippa Malmgren) into an everyday supermarket observation.',
				id: 'Mengubah istilah ekonomi ("Shrinkflation") menjadi cerita belanja sehari-hari yang dekat dengan audiens.',
			},
			visualCraft: {
				en: '5 bespoke Three.js matte 3D clay scenes on studio turntables with squash-and-stretch physics.',
				id: '5 adegan diorama studio 3D clay lembut di Three.js dengan gerakan lentur (squash-and-stretch) & cahaya hangat.',
			},
			audioDesign: {
				en: '30 playful elastic sound effects / foley tuned against upbeat acoustic music and natural Indonesian female narration.',
				id: '30 efek suara / foley berkarakter lembut dipadukan musik akustik ceria serta suara narator perempuan yang jernih.',
			},
			idealFor: {
				en: 'Consumer brands, FMCG explainers, & friendly 3D SaaS',
				id: 'Brand konsumer, produk FMCG, & explainer 3D ramah audiens',
			},
		},
	},
	{
		id: '14-flat-vector',
		badgeNumber: '07',
		style: 'Flat Vector',
		styleTagline: { en: 'Clean 2D studio science morphing', id: 'Vektor studio bersih & morfo sains' },
		renderTech: 'Canvas 2D · Shape Morphing & Rig',
		category: 'systems-data',
		language: 'EN',
		aspectRatio: '9:16',
		title: {
			en: "Does Deep Sleep Really 'Wash' Your Brain? (Glymphatic Debate)",
			id: 'Benarkah Tidur Lelap "Mencuci" Otak? (Debat Sistem Glimfatik)',
		},
		durationSeconds: 63.07,
		durationLabel: '01:03',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-14-flat-vector-final.mp4',
		thumbnailPath: '/thumbnails/video-14-flat-vector.webp',
		subtitlePath: null,
		caseStudy: {
			hook: {
				en: 'Pits Nedergaard’s classic 2013 glymphatic clearance hypothesis against May 2024 Nature Neuroscience counter-findings.',
				id: 'Mempertemukan riset klasik sistem glimfatik 2013 dengan studi penantang Nature Neuroscience Mei 2024.',
			},
			storyAngle: {
				en: 'Balanced science communication showing how scientific consensus evolves through methodology debate.',
				id: 'Komunikasi sains berimbang yang memvisualisasikan perbandingan dua kubu eksperimen medis.',
			},
			visualCraft: {
				en: 'Dynamic 20-keyframe camera motion (microscope zoom to wide view) with clean 2D vector morphing and crisp transitions.',
				id: 'Gerak kamera 20 keyframe (dari pembesaran mikroskop ke sudut luas) dengan transisi bentuk (morphing) vektor yang mulus.',
			},
			audioDesign: {
				en: '25 curated gentle science SFX paired with calm minimal ambient music so scientific explanations stay easy to follow.',
				id: '25 efek suara sains halus dipadukan musik ambient tenang agar penjelasan medis tetap nyaman disimak.',
			},
			idealFor: {
				en: 'HealthTech, science channels, & educational institutions',
				id: 'HealthTech, kanal sains, & platform edukasi daring',
			},
		},
	},
	{
		id: '17-risograph-print',
		badgeNumber: '08',
		style: 'Risograph Print',
		styleTagline: { en: '4-plate spot ink & wabi-sabi craft', id: 'Cetak stensil 4-plat & tekstur kertas' },
		renderTech: 'Canvas 2D · 4-Plate Multiply Ink',
		category: 'editorial',
		language: 'EN',
		aspectRatio: '9:16',
		title: {
			en: "Why 'Imperfect' Design Beats Sterile AI Art Every Time",
			id: 'Kenapa Desain "Tak Sempurna" Mengalahkan Gambar AI Steril',
		},
		durationSeconds: 55.43,
		durationLabel: '00:55',
		resolution: '1080 × 1920 · 30fps',
		fileName: 'video-17-risograph-print-final.mp4',
		thumbnailPath: '/thumbnails/video-17-risograph-print.webp',
		subtitlePath: '/subtitles/video-17-risograph-print.vtt',
		caseStudy: {
			hook: {
				en: 'Uses 1980s Riso Kagaku thermal stencils and soy-ink off-registration to champion human agency in design.',
				id: 'Mengangkat teknik cetak stensil Riso 1980-an dan tinta kedelai untuk menunjukkan pentingnya sentuhan manusia dalam desain.',
			},
			storyAngle: {
				en: 'Mirrors Kristianto’s own creative philosophy: technology assists speed, human taste and slight imperfection create soul.',
				id: 'Mencerminkan filosofi kerja pribadi: teknologi mempercepat produksi, namun selera manusia menentukan jiwanya.',
			},
			visualCraft: {
				en: 'Simulated 4-plate multiply ink registration, procedural halftone dots, and tactile fiber paper texture.',
				id: 'Simulasi cetak 4 lapisan tinta (4-plate multiply) lengkap dengan titik halftone & tekstur serat kertas retro.',
			},
			audioDesign: {
				en: '31 press mechanical & shutter SFX layered cleanly onto a warm 95 BPM lo-fi jazz organ loop with clear narration.',
				id: '31 efek suara mesin cetak & rana kamera di atas loop jazz organ lo-fi 95 BPM dengan narasi tetap jernih.',
			},
			idealFor: {
				en: 'Creative agencies, indie brands, & design thought-leadership',
				id: 'Agensi kreatif, brand independen, & konten opini desain',
			},
		},
	},
	{
		id: '03-generative-particles',
		badgeNumber: '09',
		style: 'Generative Particles',
		styleTagline: { en: 'Cinematic 3D particle animations', id: 'Animasi partikel kosmos 3D' },
		renderTech: 'WebGL2 · 3D Particle Shader',
		category: '3d-shader',
		language: 'EN',
		aspectRatio: '16:9',
		title: {
			en: "Why AI Doesn't 'Read' Words: Mapping Meaning in 3D Space",
			id: 'Kenapa AI Tidak "Membaca" Kata: Memetakan Makna di Ruang 3D',
		},
		durationSeconds: 78.7,
		durationLabel: '01:18',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-03-generative-particles-final.mp4',
		thumbnailPath: '/thumbnails/video-03-generative-particles.webp',
		subtitlePath: '/subtitles/video-03-generative-particles.vtt',
		featured: true,
		caseStudy: {
			hook: {
				en: 'Explains how AI understands word relationships (King − Man + Woman ≈ Queen) visually in 3D particle geometry.',
				id: 'Menjelaskan cara AI memetakan hubungan kata (King − Man + Woman ≈ Queen) secara visual lewat partikel 3D tanpa jargon rumit.',
			},
			storyAngle: {
				en: 'Built around the insight that language models map meanings as physical directions & distances in 3D space.',
				id: 'Mengambil sudut pandang bagaimana model bahasa memetakan makna layaknya jarak fisik di ruang berdimensi tinggi.',
			},
			visualCraft: {
				en: '6,400 GPU-rendered WebGL2 particles with continuous curved camera glides (PCHIP splines) & zero hard cuts.',
				id: '6.400 partikel 3D WebGL2 dengan gerak kamera melengkung mulus (spline PCHIP) tanpa perpindahan adegan yang patah.',
			},
			audioDesign: {
				en: 'Minimalist crystal & bell sound effects (singing bowl, kalimba, glass chimes) balanced cleanly under ambient music and clear voiceover.',
				id: 'Efek suara kristalin lembut (singing bowl, kalimba, denting kaca) berpadu bersama musik ambient tenang tanpa mengganggu narasi.',
			},
			idealFor: {
				en: 'AI startups, SaaS launches, & technical keynotes',
				id: 'Startup AI, produk SaaS, & video pembuka teknologi',
			},
		},
	},
	{
		id: '08-liquid-glass',
		badgeNumber: '10',
		style: 'Liquid Glass Shader',
		styleTagline: { en: 'UI analysis & WebGL2 optical glass effect', id: 'Analisis UI efek kaca optis (WebGL2)' },
		renderTech: 'WebGL2 · Optical Refraction Shader',
		category: '3d-shader',
		language: 'EN',
		aspectRatio: '16:9',
		title: {
			en: "Apple's Liquid Glass & The 400ms UX Trap",
			id: 'Liquid Glass Apple & Jebakan UX 400ms',
		},
		durationSeconds: 72.93,
		durationLabel: '01:12',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-08-liquid-glass-final.mp4',
		thumbnailPath: '/thumbnails/video-08-liquid-glass.webp',
		subtitlePath: '/subtitles/video-08-liquid-glass.vtt',
		featured: true,
		caseStudy: {
			hook: {
				en: 'Contrasts Apple WWDC 2025 Liquid Glass visuals against IBM 1982 research on human patience limits (400ms response threshold).',
				id: 'Membandingkan estetika Liquid Glass Apple (WWDC 2025) dengan riset batas kesabaran pengguna oleh IBM tahun 1982 (ambang 400 milidetik).',
			},
			storyAngle: {
				en: 'Shows how heavy glass effects can slow down perceived responsiveness even when the UI looks gorgeous.',
				id: 'Mengungkap kenapa efek kaca antarmuka yang terlalu berat bisa terasa lambat saat dipakai sehari-hari.',
			},
			visualCraft: {
				en: 'Custom WebGL2 refraction glass shaders (SDF) with smooth fluid merging & side-by-side Static Blur vs Liquid Glass UI demos.',
				id: 'Efek pembiasan kaca cair WebGL2 (SDF shader) dengan transisi mencair halus & komparasi UI Static Blur vs Liquid Glass langsung.',
			},
			audioDesign: {
				en: 'Clean glass tap sound effects, subtle swells, and balanced mixing so voiceover cuts cleanly through minimalist synth.',
				id: 'Efek suara ketukan kaca studio & musik elektronik minimalis dengan suara narasi terdepan yang nyaman didengar.',
			},
			idealFor: {
				en: 'Design teams, software brands, & UI/UX product showcases',
				id: 'Tim desain, brand software, & presentasi produk UI/UX',
			},
		},
	},
	{
		id: '04-documentary-collage',
		badgeNumber: '11',
		style: 'Documentary Collage',
		styleTagline: { en: 'Investigative documentary collage', id: 'Kolase dokumenter investigatif' },
		renderTech: 'Canvas 2D · OffscreenCanvas Desk',
		category: 'editorial',
		language: 'ID',
		aspectRatio: '16:9',
		title: {
			en: 'Why Indonesian Domestic Flights Cost More Than International Routes',
			id: 'Kenapa Tiket Pesawat Domestik Bisa Lebih Mahal dari ke Luar Negeri?',
		},
		durationSeconds: 92.5,
		durationLabel: '01:32',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-04-documentary-collage-final.mp4',
		thumbnailPath: '/thumbnails/video-04-documentary-collage.webp',
		subtitlePath: null,
		featured: true,
		caseStudy: {
			hook: {
				en: 'Unpacks 11% VAT asymmetry, ~40% avtur share, Kemenhub TBA caps, and USD aircraft leasing costs on one investigative desk.',
				id: 'Mengurai paradoks PPN 11%, komponen avtur ~40%, batas atas TBA Kemenhub, dan sewa armada dalam dolar AS di atas satu meja arsip.',
			},
			storyAngle: {
				en: 'Uses verified regulatory & KPPU supply-chain data so viewers see the structural mechanics behind airfare.',
				id: 'Berbasis data faktual KPPU dan regulasi Kemenhub untuk memetakan struktur biaya di balik mahalnya tiket domestik.',
			},
			visualCraft: {
				en: 'Tactile kraft paper archive, boarding pass cutouts, marker highlights, and red-string corkboard panning across 2,775 GPU frames.',
				id: 'Kolase kertas kraft, pas naik pesawat, sorotan stabilo, dan papan bukti benang merah di Canvas 2D.',
			},
			audioDesign: {
				en: '42 real recorded SFX (ink stamps, sharpie markers, shutter clicks, paper flips) layered over ducked pizzicato strings.',
				id: '42 efek suara nyata (stempel, spidol, rana kamera, kertas) di atas iringan musik pizzicato bertema investigasi.',
			},
			idealFor: {
				en: 'Editorial journalism, public policy, & research explainers',
				id: 'Jurnalisme data, lembaga riset, & video edukasi publik',
			},
		},
	},
	{
		id: '10-data-story',
		badgeNumber: '12',
		style: 'Data Story',
		styleTagline: { en: 'Editorial data journalism', id: 'Jurnalisme data bergerak' },
		renderTech: 'Canvas 2D · D3 Animated Scales',
		category: 'systems-data',
		language: 'ID',
		aspectRatio: '16:9',
		title: {
			en: "The 'Raise' Illusion: Jakarta Minimum Wage +85% vs Housing Reality",
			id: "Ilusi 'Gaji Naik': UMP Jakarta +85% dalam 10 Tahun vs Daya Beli Rumah",
		},
		durationSeconds: 93.6,
		durationLabel: '01:33',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-10-data-story-final.mp4',
		thumbnailPath: '/thumbnails/video-10-data-story.webp',
		subtitlePath: null,
		caseStudy: {
			hook: {
				en: 'Tracks 2016–2026 Jakarta UMP growth against BPS cost-of-living surveys (Rp14.8M/mo) and LPEM FEB UI housing ratios.',
				id: 'Menjajarkan data UMP DKI 2016–2026 dengan Survei Biaya Hidup BPS dan rasio harga rumah LPEM FEB UI (15–20x).',
			},
			storyAngle: {
				en: 'Distinguishes single-worker UMP vs household consumption fairly while keeping the narrative punchy and visual.',
				id: 'Membandingkan standar UMP pekerja lajang dan konsumsi rumah tangga secara adil lewat transisi skala grafik.',
			},
			visualCraft: {
				en: 'Open editorial chart choreography with fluid scale morphing and clean single-line captions without cluttered boxes.',
				id: 'Animasi grafik D3/Canvas terbuka yang bermorfosis mulus dari kurva pertumbuhan ke perbandingan rasio rumah.',
			},
			audioDesign: {
				en: '37 curated data-tick, chime, and air-swish SFX layered cleanly over a laid-back analytical electronic groove.',
				id: '37 efek suara ticker angka & transisi bersih di atas musik elektronik ritmis yang menjaga kejernihan narator.',
			},
			idealFor: {
				en: 'Fintech, economic reports, & SaaS analytics storytelling',
				id: 'Fintech, laporan riset ekonomi, & studi kasus data',
			},
		},
	},
	{
		id: '11-isometric-line-art',
		badgeNumber: '13',
		style: 'Isometric Line Art',
		styleTagline: { en: '30° technical systems view', id: 'Arsitektur sistem isometrik 30°' },
		renderTech: 'Canvas 2D · 30° Technical Spec',
		category: 'systems-data',
		language: 'EN',
		aspectRatio: '16:9',
		title: {
			en: 'The Invisible Architecture Behind One-Click Checkout',
			id: 'Arsitektur Tersembunyi di Balik One-Click Checkout',
		},
		durationSeconds: 68.8,
		durationLabel: '01:08',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-11-isometric-line-art-final.mp4',
		thumbnailPath: '/thumbnails/video-11-isometric-line-art.webp',
		subtitlePath: '/subtitles/video-11-isometric-line-art.vtt',
		caseStudy: {
			hook: {
				en: 'Follows a single checkout tap through Visa/Mastercard tokenization, 200ms ML fraud scoring, and WMS warehouse dispatch.',
				id: 'Menelusuri satu klik checkout melewati tokenisasi kriptografis, skor fraud ML 200–300ms, hingga sistem gudang WMS.',
			},
			storyAngle: {
				en: 'Traces from Amazon expired US Patent 5,960,411 to modern distributed payment orchestration.',
				id: 'Mengulas perjalanan dari berakhirnya paten 1-Click Amazon menuju arsitektur pembayaran digital modern.',
			},
			visualCraft: {
				en: 'Crisp 30° isometric blueprint illustration style on vellum paper texture with smooth panning camera moves across 5 scenes.',
				id: 'Gaya gambar teknik isometrik 30° di atas kanvas vellum dengan pergerakan kamera (pan & zoom) mulus lintas 5 adegan.',
			},
			audioDesign: {
				en: '29 crisp mechanical clicks, subtle pings, and ambient music bed mixed so complex payment steps feel effortless to follow.',
				id: '29 efek suara mekanis presisi & ping data lembut agar penjelasan teknis transaksi terasa ringan diikuti.',
			},
			idealFor: {
				en: 'B2B infrastructure, fintech APIs, & engineering onboarding',
				id: 'Produk infrastruktur B2B, API fintech, & edukasi teknis',
			},
		},
	},
	{
		id: '19-silhouette-story',
		badgeNumber: '14',
		style: 'Silhouette Story',
		styleTagline: { en: 'Cinema shadow-play essay', id: 'Esai film & permainan siluet bayangan' },
		renderTech: 'Canvas 2D · Layered Silhouettes',
		category: 'editorial',
		language: 'ID',
		aspectRatio: '16:9',
		title: {
			en: 'How Directors Make You Root for the Villain Without a Single Word',
			id: 'Rahasia Sutradara Membuat Penonton Simpati ke Tokoh Jahat',
		},
		durationSeconds: 89.17,
		durationLabel: '01:29',
		resolution: '1920 × 1080 · 30fps',
		fileName: 'video-19-silhouette-story-final.mp4',
		thumbnailPath: '/thumbnails/video-19-silhouette-story.webp',
		subtitlePath: '/subtitles/video-19-silhouette-story.vtt',
		caseStudy: {
			hook: {
				en: "Unpacks Hitchcock's visual storytelling tricks (Kuleshov Effect, 3-shot POV editing, & building empathy in Psycho) via shadow play.",
				id: 'Membedah teknik penyutradaraan klasik (Efek Kuleshov, pola editing 3-shot POV, & membangun empati ala Hitchcock) dalam siluet.',
			},
			storyAngle: {
				en: 'Born directly from Kristianto’s Film & TV background: proving how shot sequence alone creates viewer empathy without dialogue.',
				id: 'Lahir dari latar belakang kuliah Televisi & Film: membuktikan bagaimana susunan potongan gambar saja mampu membangkitkan emosi tanpa dialog.',
			},
			visualCraft: {
				en: 'Multi-layered night silhouettes with atmospheric lighting gradients and clean scene dissolves without visual overlap.',
				id: 'Siluet berlapis suasana malam dramatis dengan gradasi cahaya & transisi dissolve bersih antar adegan.',
			},
			audioDesign: {
				en: '27 atmospheric cinema SFX (projector reel, heartbeat tension, ambient cuts) blended with cello/piano bed.',
				id: '27 SFX sinematik (proyektor, detak jantung, jeda hening dramatis) bersama iringan string dan piano bernuansa kelam.',
			},
			idealFor: {
				en: 'Film essays, creative studios, & narrative brand films',
				id: 'Esai film, rumah produksi, & storytelling merek emosional',
			},
		},
	}
];

export const WORKFLOW_STEPS: {
	step: string;
	title: LocalizedText;
	desc: LocalizedText;
	tag: LocalizedText;
}[] = [
	{
		step: '01',
		title: { en: 'Story Hook & Fact Check', id: 'Riset Fakta & Hook Pembuka' },
		desc: {
			en: '3-second opening hooks grounded in verified research and real sources.',
			id: 'Hook 3 detik pertama berbasis riset dan sumber terverifikasi.',
		},
		tag: { en: 'Film & TV', id: 'Film & TV' },
	},
	{
		step: '02',
		title: { en: 'Voice-First Pacing', id: 'Ritme Suara & Timing' },
		desc: {
			en: 'Narration tempo and natural pauses are locked before animation starts.',
			id: 'Tempo narasi dan jeda napas dikunci lebih dulu sebelum animasi dibuat.',
		},
		tag: { en: 'Voice Pacing', id: 'Ritme Suara' },
	},
	{
		step: '03',
		title: { en: 'Code-Driven Motion', id: 'Animasi Berbasis Kode' },
		desc: {
			en: 'Custom charts and motion in Remotion, Canvas 2D, and Three.js without stock templates.',
			id: 'Grafik dan animasi kustom via Remotion, Canvas 2D, dan Three.js tanpa template pasaran.',
		},
		tag: { en: 'Video-as-Code', id: 'Video-as-Code' },
	},
	{
		step: '04',
		title: { en: 'Editing & Sound Mix', id: 'Editing Akhir & Tata Suara' },
		desc: {
			en: 'Premiere Pro, After Effects, or CapCut assembly with safe captions and SFX/foley.',
			id: 'Finishing di Premiere Pro, After Effects, atau CapCut dengan subtitle rapi dan SFX.',
		},
		tag: { en: 'Final Mix', id: 'Final Mix' },
	},
];

export type ServiceArtKey =
	| 'short-form'
	| 'product-promo'
	| 'long-form'
	| 'custom-video'
	| 'landing-page'
	| 'company-profile'
	| 'portfolio-website'
	| 'interactive-microsite'
	| 'website-video-bundle'
	| 'custom-website';

export interface ServicePackage {
	id: string;
	category: 'video' | 'web';
	artKey: ServiceArtKey;
	badge: string;
	stickerTag: LocalizedText;
	accentColor: string;
	title: LocalizedText;
	format: LocalizedText;
	summary: LocalizedText;
	deliverables: LocalizedText[];
	supportsVideoAddon?: boolean;
	isBundleCard?: boolean;
}

export const VIDEO_SERVICE_PACKAGES: ServicePackage[] = [
	{
		id: 'short-form',
		category: 'video',
		artKey: 'short-form',
		badge: 'VIDEO 01',
		stickerTag: { en: '9:16 POPULAR', id: '9:16 POPULER' },
		accentColor: '#FD6141',
		title: {
			en: 'Short-Form Content (High Retention)',
			id: 'Video Short-Form (Retensi Tinggi)',
		},
		format: {
			en: '9:16 Vertical · TikTok / Reels / Shorts',
			id: '9:16 Vertikal · TikTok / Reels / Shorts',
		},
		summary: {
			en: 'Punchy vertical videos built to hook attention early and hold watch time.',
			id: 'Video vertikal bertempo padat yang memikat di detik awal hingga akhir.',
		},
		deliverables: [
			{ en: 'Strong opening hook & structured pacing', id: 'Hook pembuka kuat & ritme padat' },
			{ en: 'Any visual style & EN/ID voiceover', id: 'Bebas pilih gaya visual & narator ID/EN' },
			{ en: 'Safe-zone subtitles + crisp SFX', id: 'Subtitle area aman + efek suara tajam' },
		],
	},
	{
		id: 'product-promo',
		category: 'video',
		artKey: 'product-promo',
		badge: 'VIDEO 02',
		stickerTag: { en: '9:16 OR 16:9', id: 'VERTIKAL / HORIZONTAL' },
		accentColor: '#3886C0',
		title: {
			en: 'Product & Brand Promo Video',
			id: 'Video Promosi Produk / Bisnis',
		},
		format: {
			en: 'Vertical (9:16) or Horizontal (16:9)',
			id: 'Vertikal (9:16) atau Horizontal (16:9)',
		},
		summary: {
			en: 'Promotional clips highlighting your product value visually for ads, socials, or landing pages.',
			id: 'Video promosi yang menonjolkan keunggulan produk untuk iklan, sosmed, atau website.',
		},
		deliverables: [
			{ en: 'Vertical (Reels/Ads) or horizontal (Web) cut', id: 'Pilih format vertikal (iklan) atau horizontal (web)' },
			{ en: 'Clear product benefits & CTA framing', id: 'Menampilkan keunggulan & CTA secara jelas' },
			{ en: 'Custom visual style & voice character', id: 'Gaya visual & narator menyesuaikan brand' },
		],
	},
	{
		id: 'long-form',
		category: 'video',
		artKey: 'long-form',
		badge: 'VIDEO 03',
		stickerTag: { en: '16:9 LONG-FORM', id: 'DURASI PANJANG' },
		accentColor: '#5CE62E',
		title: {
			en: 'Long-Form Video (YouTube & Explainers)',
			id: 'Video Durasi Panjang (YouTube & Explainer)',
		},
		format: {
			en: '16:9 Widescreen · Full-Length Format',
			id: '16:9 Horizontal · Durasi Panjang',
		},
		summary: {
			en: 'In-depth YouTube essays, explainers, and tutorials paced smoothly from intro to finale.',
			id: 'Video YouTube, explainer, dan edukasi dengan alur cerita rapi dari awal sampai akhir.',
		},
		deliverables: [
			{ en: 'Cohesive storytelling arc & pacing', id: 'Alur cerita rapi dari pembuka hingga penutup' },
			{ en: 'Custom charts & explanatory graphics', id: 'Grafik penjelas & animasi sesuai topik' },
			{ en: 'Voice-first mix with music bed & SFX', id: 'Audio vokal jernih, musik latar & SFX seimbang' },
		],
	},
	{
		id: 'custom-video',
		category: 'video',
		artKey: 'custom-video',
		badge: 'VIDEO 04',
		stickerTag: { en: 'CUSTOM IDEA', id: 'BEBAS KONSEP' },
		accentColor: '#FFD426',
		title: {
			en: 'Custom Video Request',
			id: 'Video Kustom / Konsep Khusus',
		},
		format: {
			en: 'Your Own Concept · Any Format & Length',
			id: 'Format, Durasi & Gaya Sesuai Kebutuhanmu',
		},
		summary: {
			en: 'Have a specific format or reference? Share your brief and we will tailor the style and pacing around it.',
			id: 'Punya ide atau referensi khusus? Sampaikan brief agar gaya dan ritmenya dirancang sesuai kebutuhanmu.',
		},
		deliverables: [
			{ en: 'Open concept without rigid package limits', id: 'Konsep bebas tanpa terpaku paket kaku' },
			{ en: 'Flexible aspect ratio & duration', id: 'Rasio layar & durasi menyesuaikan brief' },
			{ en: 'EN/ID voiceover or your own audio track', id: 'Narator EN/ID atau rekaman suaramu sendiri' },
		],
	},
];

export const WEBSITE_VIDEO_BUNDLE_PROMO: ServicePackage = {
	id: 'website-video-bundle',
	category: 'web',
	artKey: 'website-video-bundle',
	badge: 'WEB + VIDEO',
	stickerTag: { en: 'BEST VALUE BUNDLE', id: 'BUNDEL HEMAT' },
	accentColor: '#FFD426',
	isBundleCard: true,
	title: {
		en: 'Website + Add-On Video Promo Bundle',
		id: 'Paket Bundel Website + Video Promo',
	},
	format: {
		en: 'Pair Any Website Below With 1 Custom Promo Video',
		id: 'Padukan Paket Website Apa Saja + 1 Video Promo Kustom',
	},
	summary: {
		en: 'Need a promo video matching your new site? Toggle "+ Add-On Video Promo" inside any website card below.',
		id: 'Butuh video promo yang serasi dengan website baru? Aktifkan "+ Add-On Video Promo" di kartu website di bawah.',
	},
	deliverables: [
		{ en: 'Pairs with any website package below', id: 'Cocok dipadukan dengan semua paket web di bawah' },
		{ en: 'Includes 1 custom 9:16 or 16:9 promo video', id: 'Termasuk 1 video promo kustom (9:16 atau 16:9)' },
		{ en: 'Unified colors & branding across site and video', id: 'Warna & identitas visual serasi di web dan video' },
	],
};

export const WEB_SERVICE_PACKAGES: ServicePackage[] = [
	{
		id: 'landing-page',
		category: 'web',
		artKey: 'landing-page',
		badge: 'WEB 01',
		stickerTag: { en: '1 PAGE FOCUS', id: 'FOKUS PROMO' },
		accentColor: '#FD6141',
		supportsVideoAddon: true,
		title: {
			en: 'Landing Page Website',
			id: 'Website Landing Page',
		},
		format: {
			en: 'Single-Page Offer · Campaign · Product Sales',
			id: '1 Halaman · Khusus Penawaran, Promo, atau Produk',
		},
		summary: {
			en: 'A focused single page built to present one offer clearly and convert visitors into inquiries.',
			id: 'Website satu halaman yang terfokus untuk menjelaskan penawaran dan mendorong kontak langsung.',
		},
		deliverables: [
			{ en: 'Clear offer flow & WhatsApp/form CTAs', id: 'Alur penawaran jelas + tombol WhatsApp & formulir' },
			{ en: 'Responsive layout on mobile & desktop', id: 'Tampilan rapi di ponsel maupun desktop' },
			{ en: 'Optional EN/ID toggle & hero media slot', id: 'Opsi dwibahasa EN/ID & slot media utama' },
		],
	},
	{
		id: 'company-profile',
		category: 'web',
		artKey: 'company-profile',
		badge: 'WEB 02',
		stickerTag: { en: 'BUSINESS PROFILE', id: 'PROFIL USAHA' },
		accentColor: '#3886C0',
		supportsVideoAddon: true,
		title: {
			en: 'Company Profile Website',
			id: 'Website Company Profile',
		},
		format: {
			en: 'Official Website for Business / Studio / Agency',
			id: 'Website Resmi Bisnis, Usaha, atau Instansi',
		},
		summary: {
			en: 'Credible business site presenting your profile, services, highlights, and direct contact.',
			id: 'Website resmi untuk memperkenalkan profil usaha, layanan, portofolio, dan kontak klien.',
		},
		deliverables: [
			{ en: 'About, Services, Gallery & Contact sections', id: 'Halaman Profil, Layanan, Galeri & Kontak lengkap' },
			{ en: 'Custom palette & typography matching brand', id: 'Warna & desain menyesuaikan karakter usaha' },
			{ en: 'Direct inquiry flow to WhatsApp & email', id: 'Alur pertanyaan langsung ke WhatsApp & email' },
		],
	},
	{
		id: 'portfolio-website',
		category: 'web',
		artKey: 'portfolio-website',
		badge: 'WEB 03',
		stickerTag: { en: 'PERSONAL SHOWCASE', id: 'ETALASE KARYA' },
		accentColor: '#5CE62E',
		supportsVideoAddon: true,
		title: {
			en: 'Portfolio Website',
			id: 'Website Portofolio',
		},
		format: {
			en: 'Creator / Freelancer / Personal Career Site',
			id: 'Website Portofolio, Profil Pribadi, & CV Online',
		},
		summary: {
			en: 'Personal showcase built to display your best works, experience, and CV cleanly.',
			id: 'Website pribadi untuk menampilkan karya terbaik, pengalaman kerja, dan CV dengan rapi.',
		},
		deliverables: [
			{ en: 'Work gallery with image/video preview modal', id: 'Galeri karya dengan pratinjau foto atau video' },
			{ en: 'Bio, experience timeline & direct links', id: 'Profil, pengalaman kerja & tautan kontak langsung' },
			{ en: 'Case study breakdown & CV/showreel access', id: 'Ringkasan studi kasus & akses cepat CV/showreel' },
		],
	},
	{
		id: 'interactive-microsite',
		category: 'web',
		artKey: 'interactive-microsite',
		badge: 'WEB 04',
		stickerTag: { en: 'INTERACTIVE', id: 'UNIK & INTERAKTIF' },
		accentColor: '#C91878',
		supportsVideoAddon: true,
		title: {
			en: 'Interactive Microsite / Brand Showcase',
			id: 'Microsite Interaktif / Showcase Brand',
		},
		format: {
			en: 'Custom Animated & Interactive Web Experience',
			id: 'Website Interaktif Penuh Animasi & Eksplorasi',
		},
		summary: {
			en: 'Standout interactive site with custom motion and clickable elements that make your brand memorable.',
			id: 'Website interaktif penuh karakter dengan animasi halus dan elemen yang bisa dijelajahi langsung.',
		},
		deliverables: [
			{ en: 'Custom interactive UI, motion & optional SFX', id: 'Elemen interaktif unik, animasi & SFX opsional' },
			{ en: 'Bespoke personality beyond stock templates', id: 'Tampilan orisinal, jauh dari template pasaran' },
			{ en: 'Tested smooth on mobile & desktop screens', id: 'Performa halus teruji di layar HP dan laptop' },
		],
	},
	{
		id: 'custom-website',
		category: 'web',
		artKey: 'custom-website',
		badge: 'WEB 05',
		stickerTag: { en: 'CUSTOM IDEA', id: 'BEBAS KONSEP' },
		accentColor: '#FFD426',
		supportsVideoAddon: true,
		title: {
			en: 'Custom Website Request',
			id: 'Website Kustom / Konsep Khusus',
		},
		format: {
			en: 'Your Own Request · Flexible Pages & Features',
			id: 'Konsep, Halaman & Fitur Bebas Sesuai Kebutuhan',
		},
		summary: {
			en: 'Have specific pages or features in mind? Share your goals and I will build around your brief.',
			id: 'Butuh struktur halaman atau fitur khusus? Sampaikan kebutuhanmu untuk dirancang sesuai brief.',
		},
		deliverables: [
			{ en: 'Describe what your site needs to accomplish', id: 'Ceritakan tujuan & fitur yang dibutuhkan' },
			{ en: 'Custom layout, fast load & mobile-ready', id: 'Desain kustom, ringan, & rapi di semua layar' },
			{ en: 'Flexible structure & clean code handoff', id: 'Struktur halaman fleksibel & kode siap pakai' },
		],
	},
];

export interface ExperienceItem {
	id: string;
	review: LocalizedText;
	role: LocalizedText;
	organization: string;
	location: string;
	date: string;
	badgeLabel: LocalizedText;
	cardImagePath?: string;
	cardImageFit?: 'cover' | 'contain';
	cardImageLabel?: LocalizedText;
	cardCornerLogoPath?: string;
	cardCornerLogoAlt?: string;
	cardCornerLogoShape?: 'circle' | 'pill';
	responsibilities: LocalizedText[];
}

export const EXPERIENCE_CARDS: ExperienceItem[] = [
	{
		id: 'afe-records',
		role: { en: 'Video Editor Intern', id: 'Magang Video Editor' },
		organization: 'PT Afe Perkasa Abadi (AFE Records)',
		location: 'South Jakarta, Indonesia',
		date: '2025',
		badgeLabel: { en: 'Commercial Music & TV Post-Production', id: 'Pascaproduksi Musik & Program TV' },
		cardImagePath: '/images/me/studio/exp-afe-darkroom.webp',
		cardImageFit: 'cover',
		cardImageLabel: { en: 'POST-PROD SUITE · SOUTH JAKARTA', id: 'RUANG EDITING · JAKARTA SELATAN' },
		cardCornerLogoPath: '/images/me/studio/logo-afe-corps.webp',
		cardCornerLogoAlt: 'AFE Corps logo',
		cardCornerLogoShape: 'circle',
		review: {
			en: 'Contributed to music video editing, TV rough cuts, and multi-cam podcast post-production.',
			id: 'Mengerjakan editing video musik, rough cut program TV, serta pascaproduksi podcast multi-kamera.',
		},
		responsibilities: [
			{
				en: 'Full post-production on "Giantkilling – Dunia Fantasi" MV: editing, lip-sync, & grading.',
				id: 'Pascaproduksi penuh MV "Giantkilling – Dunia Fantasi": editing, lip-sync, & color grading.',
			},
			{
				en: 'Assembled early cuts (rough cuts) for TV ("Di Luar Nurul"), 4-cam podcast ("Kong Nongkrong"), & vertical Reels.',
				id: 'Menyusun potongan awal (rough cut) program TV ("Di Luar Nurul"), podcast 4 kamera ("Kong Nongkrong"), & Reels.',
			},
			{
				en: 'Synced visual pacing tightly to musical rhythm with the director.',
				id: 'Menyelaraskan tempo gambar dengan ritme musik langsung bersama sutradara.',
			},
		],
	},
	{
		id: 'isi-padang-panjang',
		role: { en: 'B.A. Television and Film (Cum Laude)', id: 'Sarjana (S-1) Televisi & Film (Cum Laude)' },
		organization: 'Institut Seni Indonesia (ISI) Padang Panjang',
		location: 'Padang Panjang, Indonesia',
		date: '2022 – 2026',
		badgeLabel: { en: 'GPA 3.76 / 4.00 · Film Craft & Visual Storytelling', id: 'IPK 3,76 / 4,00 · Tata Bahasa Visual & Cerita' },
		cardImagePath: '/images/me/studio/exp-isi-wisuda.webp',
		cardImageFit: 'cover',
		cardImageLabel: { en: 'COMMENCEMENT · ISI PADANG PANJANG', id: 'WISUDA S.SN · ISI PADANG PANJANG' },
		review: {
			en: 'Cum Laude Film & TV graduate pairing cinema craft with code-driven motion & web tools.',
			id: 'Lulusan Cum Laude TV & Film yang memadukan sinematografi dengan motion berbasis kode & web.',
		},
		responsibilities: [
			{
				en: 'Studied montage rhythm, visual framing, cinematography, and multi-draft scripting.',
				id: 'Mendalami teknik montase, framing sinematografi, dan penulisan skenario film.',
			},
			{
				en: 'On-set credits: Screenwriter ("95% Chance to Live") & VT Operator ("HALTE +62").',
				id: 'Kredit produksi nyata: Penulis Naskah ("95% Chance to Live") & VT Operator ("HALTE +62").',
			},
			{
				en: 'Built interactive WebGL, Canvas 2D, and React motion graphics tools.',
				id: 'Mengembangkan animasi grafis (motion graphics) memakai WebGL, Canvas 2D, & React.',
			},
		],
	},
	{
		id: 'ish-telkom',
		role: { en: 'Data Validation Staff (RDS Project)', id: 'Staf Validasi Data (Proyek RDS)' },
		organization: 'PT Infomedia Solusi Humanika (ISH) · ATR/BPN Kota Jambi',
		location: 'Jambi, Indonesia',
		date: '2021',
		badgeLabel: { en: '100% Data Accuracy & Operational Discipline', id: 'Akurasi Data 100% & Disiplin Operasional' },
		cardImagePath: '/images/me/studio/exp-atrbpn-jambi.webp',
		cardImageFit: 'cover',
		cardImageLabel: { en: 'RDS DIGITIZATION · ATR/BPN JAMBI', id: 'PROYEK RDS · ATR/BPN JAMBI' },
		cardCornerLogoPath: '/images/me/exp-1.png',
		cardCornerLogoAlt: 'ISH & Telkom Indonesia logo',
		cardCornerLogoShape: 'pill',
		review: {
			en: 'Audited physical land certificates against digital records with 100% accuracy.',
			id: 'Memvalidasi arsip sertifikat tanah fisik ke sistem digital dengan akurasi 100%.',
		},
		responsibilities: [
			{
				en: 'Audited document completeness for the ATR/BPN Jambi digitization (RDS) project.',
				id: 'Memverifikasi kelengkapan dokumen arsip pada proyek digitalisasi ATR/BPN Kota Jambi.',
			},
			{
				en: 'Reconciled physical records against the central database with zero duplication.',
				id: 'Rekonsiliasi data fisik dan database pusat dengan akurasi 100% tanpa duplikasi.',
			},
			{
				en: 'Delivered daily progress reports and resolved data anomalies directly with the project manager.',
				id: 'Menyusun laporan progres harian serta menyelesaikan temuan anomali data langsung bersama manajer proyek.',
			},
		],
	},
];

export interface FilmCreditItem {
	year: string;
	title: string;
	role: LocalizedText;
	desc: LocalizedText;
	url: string;
	thumbPath?: string;
	thumbFit?: 'cover' | 'contain';
}

export const FILM_CREDITS: FilmCreditItem[] = [
	{
		year: '2025',
		title: 'Sigit Wardana – "Luka Tak Berdarah"',
		role: { en: 'Supporting Talent · Official Music Video (AFE Pictures)', id: 'Talent Pendukung · Video Musik Resmi (AFE Pictures)' },
		desc: {
			en: 'Stepped in front of the camera for Sigit Wardana’s commercial MV at Hotel Oria Jakarta, sharpening on-set camera blocking & shot continuity.',
			id: 'Tampil di depan kamera pada produksi MV resmi Sigit Wardana di Hotel Oria Jakarta, melatih kepekaan blocking kamera & kesinambungan gambar saat editing.',
		},
		url: 'https://www.youtube.com/watch?v=NVlzmhpmyWY',
		thumbPath: '/images/me/studio/credit-luka-tak-berdarah.webp',
		thumbFit: 'cover',
	},
	{
		year: '2024',
		title: '95% Chance to Live',
		role: { en: 'Screenwriter · Short Film (Drama / Thriller)', id: 'Penulis Naskah · Film Pendek (Drama / Thriller)' },
		desc: {
			en: 'Six-draft narrative exploring the psychological tension of a bank employee trapped inside a warehouse.',
			id: 'Naskah film pendek yang dikembangkan dalam 6 draf mengenai tekanan psikologis seorang pegawai bank yang terjebak di dalam gudang.',
		},
		url: 'https://bit.ly/4lstKmC',
		thumbPath: '/images/me/studio/credit-95-chance-poster.webp',
		thumbFit: 'contain',
	},
	{
		year: '2023',
		title: 'HALTE +62: Teka Teki Thukul',
		role: { en: 'Live Video Operator (VT Playback) · TV Talk Show', id: 'Operator Video Siaran (VT Playback) · Program Talkshow TV' },
		desc: {
			en: 'Operated live video cues (VT playback) during the TV show episode highlighting political art & activist-poet Widji Thukul.',
			id: 'Mengoperasikan tayangan video sisipan (VT playback) secara live saat produksi acara TV tentang karya penyair Widji Thukul.',
		},
		url: 'https://www.youtube.com/watch?v=zHv657K9ML8',
		thumbPath: '/images/me/studio/credit-halte62.webp',
		thumbFit: 'cover',
	},
];

export interface FieldArchivePhoto {
	id: string;
	imagePath: string;
	tag: LocalizedText;
	title: LocalizedText;
	caption: LocalizedText;
}

export const FIELD_ARCHIVE_PHOTOS: FieldArchivePhoto[] = [
	{
		id: 'multicam-podcast',
		imagePath: '/images/me/studio/gallery-multicam-podcast.webp',
		tag: { en: 'POST-PROD', id: 'PASCA-PROD' },
		title: { en: '4-Camera Podcast Assembly', id: 'Editing Podcast 4 Kamera' },
		caption: {
			en: 'Syncing & color-matching multi-cam episodes ("Kong Nongkrong") on Premiere Pro at AFE Records.',
			id: 'Menyelaraskan multi-kamera & warna episode podcast ("Kong Nongkrong") di Premiere Pro AFE Records.',
		},
	},
	{
		id: 'control-room-dslr',
		imagePath: '/images/me/studio/gallery-control-room-dslr.webp',
		tag: { en: 'TV STUDIO', id: 'STUDIO TV' },
		title: { en: 'Live Control Room Playback', id: 'Ruang Kendali Siaran TV' },
		caption: {
			en: 'Operating live VT cue playback & audio console coordination during campus TV show production.',
			id: 'Mengoperasikan cue VT playback & koordinasi konsol audio saat produksi program TV studio.',
		},
	},
	{
		id: 'mv-closeup-4k',
		imagePath: '/images/me/studio/gallery-mv-closeup-4k.webp',
		tag: { en: 'MV SET · 4K', id: 'SYUTING MV · 4K' },
		title: { en: 'On-Set Camera Presence', id: 'Pengalaman di Depan Kamera' },
		caption: {
			en: '4K frame from Sigit Wardana’s "Luka Tak Berdarah" MV, experiencing pacing & acting directly on set.',
			id: 'Cuplikan frame 4K dari MV "Luka Tak Berdarah" Sigit Wardana saat merasakan ritme akting & kamera langsung di set.',
		},
	},
	{
		id: 'wisuda-bench',
		imagePath: '/images/me/studio/gallery-wisuda-bench.webp',
		tag: { en: 'B.A. FILM', id: 'S.SN FILM' },
		title: { en: 'ISI Padang Panjang Graduate', id: 'Lulusan ISI Padang Panjang' },
		caption: {
			en: 'B.A. in Television & Film (Cum Laude, GPA 3.76) framed by the campus’s iconic Rumah Gadang roofs.',
			id: 'Sarjana Televisi & Film (Cum Laude, IPK 3,76) di halaman kampus ikonik ISI Padang Panjang.',
		},
	},
	{
		id: 'wisuda-toga',
		imagePath: '/images/me/studio/gallery-wisuda-toga.webp',
		tag: { en: 'GRADUATION', id: 'WISUDA 2026' },
		title: { en: 'Commencement Walk', id: 'Momen Kelulusan Resmi' },
		caption: {
			en: 'Four years of cinema grammar, screenwriting drafts, and production discipline completed in 2026.',
			id: 'Menuntaskan 4 tahun studi tata bahasa sinema, penulisan skenario, dan disiplin produksi film pada 2026.',
		},
	},
	{
		id: 'wisuda-diploma',
		imagePath: '/images/me/studio/gallery-wisuda-diploma.webp',
		tag: { en: 'CUM LAUDE', id: 'CUM LAUDE' },
		title: { en: 'S.Sn Degree Folder & Sash', id: 'Map Ijazah & Selempang S.Sn' },
		caption: {
			en: 'Formal academic foundation backing every storyboard, hook structure, and visual essay I craft.',
			id: 'Fondasi akademis yang menopang setiap penyusunan storyboard, struktur hook, dan esai visual.',
		},
	},
	{
		id: 'wisuda-books',
		imagePath: '/images/me/studio/gallery-wisuda-books.webp',
		tag: { en: 'FILM THEORY', id: 'TEORI VISUAL' },
		title: { en: 'Visual Methodologies & Scriptcraft', id: 'Riset Visual & Penulisan Naskah' },
		caption: {
			en: 'Between Gillian Rose’s Visual Methodologies and Syd Field’s Screenwriting: turning film theory into crisp cuts.',
			id: 'Antara buku Visual Methodologies & Foundations of Screenwriting: teori yang diterjemahkan langsung ke meja editing.',
		},
	},
];

export interface CertificateItem {
	title: LocalizedText;
	meta: LocalizedText;
	issuer: string;
}

export const CERTIFICATES: CertificateItem[] = [
	{
		title: { en: 'English Proficiency (TOEFL)', id: 'Kemampuan Bahasa Inggris (TOEFL)' },
		meta: { en: 'Score: 610', id: 'Skor: 610' },
		issuer: 'Brighten English',
	},
	{
		title: { en: 'Certified Developer: Generative AI', id: 'Certified Developer: Generative AI' },
		meta: { en: 'Cloud AI', id: 'Cloud AI' },
		issuer: 'Alibaba Cloud',
	},
	{
		title: { en: 'Certified Associate: System Operator', id: 'Certified Associate: System Operator' },
		meta: { en: '+ 9 Fundamentals Certs', id: '+ 9 Sertifikat Dasar' },
		issuer: 'Alibaba Cloud',
	},
	{
		title: { en: 'Backend Development Track', id: 'Program Backend Development' },
		meta: { en: '21 Courses Completed', id: '21 Kelas Selesai' },
		issuer: 'Codepolitan',
	},
	{
		title: { en: 'Short Film Screenplay Competition', id: 'Kompetisi Penulisan Skenario Film Pendek' },
		meta: { en: '2021 Participant Award', id: 'Peserta 2021' },
		issuer: 'Citra Film School',
	},
];

export interface WebProject {
	id: string;
	name: string;
	subtitle: LocalizedText;
	description: LocalizedText;
	imagePath: string;
	customArtwork?: 'portfolio-site' | 'pixora-showcase' | 'igniter-showcase';
	isCurrentSite?: boolean;
	url?: string;
	tags: string[];
}

export const WEB_PROJECTS: WebProject[] = [
	{
		id: 'igniter',
		name: 'IGNITER',
		subtitle: {
			en: 'Startup Pitching & Collaboration Platform',
			id: 'Platform Pitching Startup & Kolaborasi',
		},
		description: {
			en: 'Startup pitching platform with Next.js 15, Tailwind CSS, GitHub OAuth, and Sanity CMS curation.',
			id: 'Platform pitching startup berbasis Next.js 15, Tailwind CSS, login GitHub, dan Sanity CMS.',
		},
		imagePath: '/images/me/igniter/igniter-home.webp',
		customArtwork: 'igniter-showcase',
		url: 'https://igniter-theta.vercel.app/',
		tags: ['Next.js 15', 'TypeScript', 'Sanity CMS', 'Tailwind CSS'],
	},
	{
		id: 'kristianto-portfolio',
		name: 'Kristianto Portfolio',
		subtitle: {
			en: 'Interactive Film & Creative Web Studio',
			id: 'Website Portofolio Video & Web Interaktif',
		},
		description: {
			en: 'This very website: built with tactile retro styling, interactive canvas patch cords, custom Web Audio SFX, bilingual switching, and a 14-work video player.',
			id: 'Website yang sedang kamu kunjungi ini: dilengkapi kabel interaktif di bagian atas, lab suara Web Audio, sakelar dwibahasa EN/ID, serta pemutar 14 karya video.',
		},
		imagePath: '',
		customArtwork: 'portfolio-site',
		isCurrentSite: true,
		url: '#hero',
		tags: ['React 19', 'TypeScript', 'Canvas Physics', 'Web Audio SFX'],
	},
	{
		id: 'pixora',
		name: 'Pixora',
		subtitle: {
			en: 'Cross-Platform Movie Discovery App',
			id: 'Aplikasi Eksplorasi Film Lintas Platform',
		},
		description: {
			en: 'Mobile movie browser built with Expo, React Native, NativeWind, and Appwrite trending analytics.',
			id: 'Aplikasi eksplorasi film mobile berbasis Expo, React Native, NativeWind, dan analitik tren Appwrite.',
		},
		imagePath: '/images/me/pixora/pixora-home.webp',
		customArtwork: 'pixora-showcase',
		tags: ['React Native', 'Expo', 'TypeScript', 'Appwrite'],
	},
];

export const CREATIVE_TOOLS: { name: string; category: LocalizedText; logoKey: StackLogoId }[] = [
	{
		name: 'Adobe Premiere Pro',
		category: { en: 'Video Editing & Pacing', id: 'Editing Video & Ritme' },
		logoKey: 'premiere',
	},
	{
		name: 'Adobe After Effects',
		category: { en: 'Motion Graphics & Visual FX', id: 'Motion Graphics & Efek Visual' },
		logoKey: 'after-effects',
	},
	{
		name: 'CapCut',
		category: { en: 'Fast Vertical Edits (9:16)', id: 'Edit Cepat Vertikal (9:16)' },
		logoKey: 'capcut',
	},
	{
		name: 'Adobe Photoshop',
		category: { en: 'Thumbnails & Graphic Design', id: 'Thumbnail & Desain Grafis' },
		logoKey: 'photoshop',
	},
	{
		name: 'Remotion 4.0',
		category: { en: 'Code-Driven Video (React)', id: 'Video Berbasis Kode (React)' },
		logoKey: 'remotion',
	},
	{
		name: 'Canvas 2D & WebGL2',
		category: { en: '2D Animation & Shaders', id: 'Animasi 2D & Shader' },
		logoKey: 'canvas-webgl',
	},
	{
		name: 'Three.js',
		category: { en: '3D Web & Animated Scenes', id: 'Web 3D & Adegan Animasi' },
		logoKey: 'three',
	},
	{
		name: 'FFmpeg Audio/Video',
		category: { en: 'Audio Mixing & Final Export', id: 'Mixing Audio & Ekspor Final' },
		logoKey: 'ffmpeg',
	},
];

export const WEB_TECH_STACK: { name: string; sub: LocalizedText; logoKey: StackLogoId }[] = [
	{
		name: 'React',
		sub: { en: 'Interactive Web UI', id: 'Antarmuka Web Interaktif' },
		logoKey: 'react',
	},
	{
		name: 'Next.js',
		sub: { en: 'Fullstack Web Framework', id: 'Framework Web Fullstack' },
		logoKey: 'nextjs',
	},
	{
		name: 'TypeScript',
		sub: { en: 'Type-Safe JavaScript', id: 'JavaScript dengan Type-Safety' },
		logoKey: 'typescript',
	},
	{
		name: 'Node.js',
		sub: { en: 'Backend JS Runtime', id: 'Runtime Backend JavaScript' },
		logoKey: 'nodejs',
	},
	{
		name: 'Express.js',
		sub: { en: 'REST API Server', id: 'Server REST API' },
		logoKey: 'expressjs',
	},
	{
		name: 'PostgreSQL',
		sub: { en: 'Relational Database', id: 'Database Relasional SQL' },
		logoKey: 'postgresql',
	},
	{
		name: 'MongoDB',
		sub: { en: 'Document Database', id: 'Database Berbasis Dokumen' },
		logoKey: 'mongodb',
	},
	{
		name: 'Three.js',
		sub: { en: '3D Web Experiences', id: 'Pengalaman Web 3D' },
		logoKey: 'three',
	},
	{
		name: 'Python',
		sub: { en: 'Automation & Scripting', id: 'Otomasi & Skrip' },
		logoKey: 'python',
	},
	{
		name: 'Git',
		sub: { en: 'Version Control', id: 'Kontrol Versi Kode' },
		logoKey: 'git',
	},
];
