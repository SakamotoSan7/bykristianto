import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Streams MP4 files from `assets/videos/` during `vite dev` and `vite preview`
 * with full HTTP Byte-Range (`206 Partial Content`) support for instant seeking,
 * without duplicating large (~980 MB) raw video files into `public/` or `dist/`.
 */
function localVideoStreamerPlugin(): Plugin {
	const videosDir = path.resolve(process.cwd(), 'assets', 'videos');
	const routePrefix = '/local-videos/';

	const handleVideoRequest = (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void
	) => {
		const rawUrl = req.url?.split('?')[0] ?? '';
		if (!rawUrl.startsWith(routePrefix)) {
			next();
			return;
		}

		const requestedFile = path.basename(decodeURIComponent(rawUrl.slice(routePrefix.length)));
		if (!requestedFile || !requestedFile.toLowerCase().endsWith('.mp4')) {
			res.statusCode = 404;
			res.end('Video not found');
			return;
		}

		const fullPath = path.join(videosDir, requestedFile);
		const resolvedDir = path.resolve(videosDir);
		if (!path.resolve(fullPath).startsWith(resolvedDir + path.sep) || !fs.existsSync(fullPath)) {
			res.statusCode = 404;
			res.end('Video not found');
			return;
		}

		const stat = fs.statSync(fullPath);
		const fileSize = stat.size;
		const rangeHeader = req.headers.range;

		if (rangeHeader) {
			const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
			if (!match) {
				res.statusCode = 416;
				res.setHeader('Content-Range', `bytes */${fileSize}`);
				res.end();
				return;
			}
			const start = Number(match[1]);
			const requestedEnd = match[2] ? Number(match[2]) : fileSize - 1;
			const end = Math.min(requestedEnd, fileSize - 1);

			if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
				res.statusCode = 416;
				res.setHeader('Content-Range', `bytes */${fileSize}`);
				res.end();
				return;
			}

			const chunkSize = end - start + 1;
			res.statusCode = 206;
			res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
			res.setHeader('Accept-Ranges', 'bytes');
			res.setHeader('Content-Length', String(chunkSize));
			res.setHeader('Content-Type', 'video/mp4');
			res.setHeader('Cache-Control', 'no-cache');

			if (req.method === 'HEAD') {
				res.end();
				return;
			}
			fs.createReadStream(fullPath, { start, end }).pipe(res);
			return;
		}

		res.statusCode = 200;
		res.setHeader('Accept-Ranges', 'bytes');
		res.setHeader('Content-Length', String(fileSize));
		res.setHeader('Content-Type', 'video/mp4');
		res.setHeader('Cache-Control', 'no-cache');

		if (req.method === 'HEAD') {
			res.end();
			return;
		}
		fs.createReadStream(fullPath).pipe(res);
	};

	return {
		name: 'local-video-streamer',
		configureServer(server) {
			server.middlewares.use(handleVideoRequest);
		},
		configurePreviewServer(server) {
			server.middlewares.use(handleVideoRequest);
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), localVideoStreamerPlugin()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('gsap')) return 'vendor-gsap';
						if (id.includes('react')) return 'vendor-react';
					}
				},
			},
		},
	},
});
