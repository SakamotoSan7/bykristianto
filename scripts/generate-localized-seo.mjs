import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const enHtmlPath = path.join(distDir, 'index.html');
const idDir = path.join(distDir, 'id');
const idHtmlPath = path.join(idDir, 'index.html');

const JSONLD_START = '<!-- SEO_JSONLD_START -->';
const JSONLD_END = '<!-- SEO_JSONLD_END -->';
const NOSCRIPT_START = '<!-- SEO_NOSCRIPT_START -->';
const NOSCRIPT_END = '<!-- SEO_NOSCRIPT_END -->';

function extractJsonLdPayload(html, label) {
	const startIdx = html.indexOf(JSONLD_START);
	const endIdx = html.indexOf(JSONLD_END);
	if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
		throw new Error(`Missing JSON-LD markers (${JSONLD_START} / ${JSONLD_END}) in ${label}`);
	}
	const block = html.slice(startIdx + JSONLD_START.length, endIdx);
	const match = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i.exec(block);
	if (!match) {
		throw new Error(`Missing <script type="application/ld+json"> inside markers in ${label}`);
	}
	return JSON.parse(match[1].trim());
}

function replaceBetweenMarkers(html, startMarker, endMarker, replacement, label) {
	const startIdx = html.indexOf(startMarker);
	const endIdx = html.indexOf(endMarker);
	if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
		throw new Error(`Missing markers (${startMarker} / ${endMarker}) in ${label}`);
	}
	return (
		html.slice(0, startIdx) +
		startMarker +
		'\n' +
		replacement +
		'\n\t\t' +
		endMarker +
		html.slice(endIdx + endMarker.length)
	);
}

const idTitle = 'Kristianto | Video Editor, Motion Explainer Producer & Creative Web Builder';
const idDescription =
	'Kristianto: Video Editor, Produser Motion Explainer & Creative Web Builder. Menggabungkan teknik Film & TV dengan editing Premiere/AE, animasi berbasis kode (Remotion, Canvas 2D, Three.js), tata suara jernih, dan website interaktif.';

const idJsonLdObject = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Person',
			'@id': 'https://bykristianto.my.id/#person',
			name: 'Kristianto',
			alternateName: ['Kristianto Studio', 'bykristianto'],
			url: 'https://bykristianto.my.id/id',
			image: 'https://bykristianto.my.id/images/me/studio/profile-afe-desk.webp',
			email: 'mailto:kristianto.too@gmail.com',
			jobTitle: 'Video Editor, Produser Motion Explainer & Creative Web Builder',
			description:
				'Lulusan Cum Laude S-1 Televisi & Film yang memproduksi video explainer, reels 9:16, motion berbasis kode, tata suara jernih, serta website interaktif.',
			alumniOf: {
				'@type': 'CollegeOrUniversity',
				name: 'Institut Seni Indonesia Padang Panjang',
			},
			address: {
				'@type': 'PostalAddress',
				addressCountry: 'ID',
			},
			knowsLanguage: ['id', 'en'],
			knowsAbout: [
				'Video Editing',
				'Motion Graphics',
				'Video Explainer',
				'Reels 9:16 & Short-Form',
				'Adobe Premiere Pro',
				'Adobe After Effects',
				'Remotion',
				'Canvas 2D',
				'Three.js',
				'WebGL2',
				'Sound Design',
				'Pembuatan Website Interaktif',
			],
			sameAs: [
				'https://www.linkedin.com/in/kristianto-too',
				'https://github.com/SakamotoSan7',
				'https://www.instagram.com/kristianto.too/',
			],
		},
		{
			'@type': 'WebSite',
			'@id': 'https://bykristianto.my.id/#website',
			url: 'https://bykristianto.my.id/',
			name: 'Kristianto Studio',
			inLanguage: ['id', 'en'],
			publisher: {
				'@id': 'https://bykristianto.my.id/#person',
			},
		},
		{
			'@type': 'ProfilePage',
			'@id': 'https://bykristianto.my.id/id#profilepage',
			url: 'https://bykristianto.my.id/id',
			name: idTitle,
			description: idDescription,
			inLanguage: 'id-ID',
			isPartOf: {
				'@id': 'https://bykristianto.my.id/#website',
			},
			mainEntity: {
				'@id': 'https://bykristianto.my.id/#person',
			},
			primaryImageOfPage: {
				'@type': 'ImageObject',
				url: 'https://bykristianto.my.id/og-preview.jpg',
				width: 1200,
				height: 630,
			},
		},
		{
			'@type': 'Service',
			'@id': 'https://bykristianto.my.id/#services',
			name: 'Jasa Video Editing, Motion Explainer & Pembuatan Website',
			provider: {
				'@id': 'https://bykristianto.my.id/#person',
			},
			areaServed: ['Indonesia', 'Worldwide'],
			hasOfferCatalog: {
				'@type': 'OfferCatalog',
				name: 'Paket Jasa Video & Website',
				itemListElement: [
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Video Short-Form (Retensi Tinggi)',
							description:
								'Video vertikal 9:16 bertempo padat untuk TikTok, Reels, dan Shorts yang memikat di detik awal hingga akhir.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Video Promosi Produk / Bisnis',
							description:
								'Video promosi vertikal (9:16) atau horizontal (16:9) untuk iklan, sosial media, maupun website.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Video Durasi Panjang (YouTube & Explainer)',
							description:
								'Video YouTube, explainer, dan edukasi 16:9 dengan alur cerita rapi dari pembuka hingga penutup.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Video Kustom / Konsep Khusus',
							description:
								'Konsep video bebas dengan rasio layar dan durasi menyesuaikan brief kebutuhanmu.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Website Landing Page',
							description:
								'Website satu halaman terfokus untuk menjelaskan penawaran dan mendorong kontak langsung.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Website Company Profile',
							description:
								'Website resmi untuk memperkenalkan profil usaha, layanan, portofolio, dan kontak klien.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Website Portofolio',
							description:
								'Website pribadi untuk menampilkan karya terbaik, pengalaman kerja, dan CV dengan rapi.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Microsite Interaktif / Showcase Brand',
							description:
								'Website interaktif penuh karakter dengan animasi halus dan elemen yang bisa dijelajahi langsung.',
						},
					},
					{
						'@type': 'Offer',
						itemOffered: {
							'@type': 'Service',
							name: 'Website Kustom / Konsep Khusus',
							description:
								'Struktur halaman, fitur, dan desain kustom sesuai kebutuhan proyek.',
						},
					},
				],
			},
		},
		{
			'@type': 'ItemList',
			'@id': 'https://bykristianto.my.id/id#featured-works',
			name: 'Karya Video & Proyek Web Pilihan Kristianto',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					item: {
						'@type': 'CreativeWork',
						name: 'Kenapa Pemikir Kelas Pekerja Terlupakan (Eric Hoffer & Beban Kognitif)',
						description:
							'Dokumenter media campuran via Remotion 4.0 dalam format vertikal 9:16.',
						creator: { '@id': 'https://bykristianto.my.id/#person' },
					},
				},
				{
					'@type': 'ListItem',
					position: 2,
					item: {
						'@type': 'CreativeWork',
						name: 'Kenapa AI Tidak Membaca Kata — Peta Makna Vector Embeddings',
						description:
							'Video explainer 16:9 berbasis Canvas 2D dan partikel generatif.',
						creator: { '@id': 'https://bykristianto.my.id/#person' },
					},
				},
				{
					'@type': 'ListItem',
					position: 3,
					item: {
						'@type': 'CreativeWork',
						name: 'IGNITER — Platform Pitching Startup & Kolaborasi',
						url: 'https://igniter-theta.vercel.app/',
						description:
							'Platform pitching startup berbasis Next.js 15, TypeScript, Tailwind CSS, login GitHub, dan Sanity CMS.',
						creator: { '@id': 'https://bykristianto.my.id/#person' },
					},
				},
				{
					'@type': 'ListItem',
					position: 4,
					item: {
						'@type': 'CreativeWork',
						name: 'Pixora — Aplikasi Eksplorasi Film Lintas Platform',
						description:
							'Aplikasi eksplorasi film mobile berbasis Expo, React Native, NativeWind, TypeScript, dan Appwrite.',
						creator: { '@id': 'https://bykristianto.my.id/#person' },
					},
				},
			],
		},
	],
};

const idNoscriptHtml = `\t\t<noscript>
			<main>
				<h1>Kristianto — Video Editor, Produser Motion Explainer &amp; Creative Web Builder</h1>
				<p>
					Lulusan Cum Laude S-1 Televisi &amp; Film (IPK 3,76, Institut Seni Indonesia Padang Panjang) berbasis di Indonesia.
					Memproduksi video explainer, reels 9:16, motion berbasis kode (Remotion, Canvas 2D, Three.js, WebGL2),
					tata suara jernih, serta website interaktif.
				</p>
				<section>
					<h2>Layanan Video &amp; Website</h2>
					<ul>
						<li>Video Short-Form (9:16 TikTok, Reels &amp; Shorts)</li>
						<li>Video Promosi Produk / Bisnis (9:16 atau 16:9)</li>
						<li>Video Durasi Panjang (16:9 YouTube &amp; Explainer)</li>
						<li>Video Kustom / Konsep Khusus</li>
						<li>Website Landing Page, Company Profile, Portofolio &amp; Microsite Interaktif</li>
					</ul>
				</section>
				<section>
					<h2>Karya Pilihan &amp; Proyek Web</h2>
					<ul>
						<li>14 Karya Video (Remotion, Editorial Ink, 3D Shader, dan Data Explainer)</li>
						<li><a href="https://igniter-theta.vercel.app/">IGNITER</a> — Platform Pitching Startup &amp; Kolaborasi (Next.js 15, TypeScript, Sanity CMS)</li>
						<li>Pixora — Aplikasi Eksplorasi Film Lintas Platform (React Native, Expo, Appwrite)</li>
					</ul>
				</section>
				<section>
					<h2>Kontak &amp; Profil</h2>
					<ul>
						<li>Email: <a href="mailto:kristianto.too@gmail.com">kristianto.too@gmail.com</a></li>
						<li>LinkedIn: <a href="https://www.linkedin.com/in/kristianto-too">linkedin.com/in/kristianto-too</a></li>
						<li>GitHub: <a href="https://github.com/SakamotoSan7">github.com/SakamotoSan7</a></li>
						<li>Instagram: <a href="https://www.instagram.com/kristianto.too/">instagram.com/kristianto.too</a></li>
						<li>Versi Bahasa Inggris: <a href="https://bykristianto.my.id/">bykristianto.my.id</a></li>
					</ul>
				</section>
			</main>
		</noscript>`;

function buildLocalizedIdHtml(baseHtml) {
	let out = baseHtml;

	out = out.replace('<html lang="en">', '<html lang="id">');
	out = out.replace(
		/<title>[\s\S]*?<\/title>/i,
		`<title>${idTitle}</title>`
	);
	out = out.replace(
		/<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
		`<meta name="description" content="${idDescription}" />`
	);
	out = out.replace(
		/<link\s+rel="canonical"\s+href="https:\/\/bykristianto\.my\.id\/"\s*\/>/i,
		'<link rel="canonical" href="https://bykristianto.my.id/id" />'
	);
	out = out.replace(
		/<meta\s+property="og:url"\s+content="https:\/\/bykristianto\.my\.id\/"\s*\/>/i,
		'<meta property="og:url" content="https://bykristianto.my.id/id" />'
	);
	out = out.replace(
		/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
		`<meta property="og:title" content="${idTitle}" />`
	);
	out = out.replace(
		/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
		`<meta property="og:description" content="${idDescription}" />`
	);
	out = out.replace(
		/<meta\s+property="og:locale"\s+content="en_US"\s*\/>/i,
		'<meta property="og:locale" content="id_ID" />'
	);
	out = out.replace(
		/<meta\s+property="og:locale:alternate"\s+content="id_ID"\s*\/>/i,
		'<meta property="og:locale:alternate" content="en_US" />'
	);
	out = out.replace(
		/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
		`<meta name="twitter:title" content="${idTitle}" />`
	);
	out = out.replace(
		/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
		`<meta name="twitter:description" content="${idDescription}" />`
	);

	const jsonLdScript = `\t\t<script type="application/ld+json">\n${JSON.stringify(idJsonLdObject)}\n\t\t</script>`;
	out = replaceBetweenMarkers(out, JSONLD_START, JSONLD_END, jsonLdScript, 'dist/id/index.html');
	out = replaceBetweenMarkers(out, NOSCRIPT_START, NOSCRIPT_END, idNoscriptHtml, 'dist/id/index.html');

	return out;
}

function main() {
	if (!fs.existsSync(enHtmlPath)) {
		throw new Error(`Built file not found: ${enHtmlPath}. Run vite build first.`);
	}

	const enHtml = fs.readFileSync(enHtmlPath, 'utf8');
	const enJsonLd = extractJsonLdPayload(enHtml, 'dist/index.html');

	const idHtml = buildLocalizedIdHtml(enHtml);
	const idJsonLd = extractJsonLdPayload(idHtml, 'dist/id/index.html');

	fs.mkdirSync(idDir, { recursive: true });
	fs.writeFileSync(idHtmlPath, idHtml, 'utf8');

	console.log(
		`[SEO] Validated dist/index.html (${enJsonLd['@graph']?.length ?? 0} schema nodes) and generated dist/id/index.html (${idJsonLd['@graph']?.length ?? 0} schema nodes).`
	);
}

main();
