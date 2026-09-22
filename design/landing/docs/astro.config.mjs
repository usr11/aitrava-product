// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Big Shoulders',
			cssVariable: '--font-display',
			weights: [800, 900],
			subsets: ['latin'],
			fallbacks: ['Impact', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Familjen Grotesk',
			cssVariable: '--font-body',
			weights: [400, 500, 600, 700],
			subsets: ['latin'],
			fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			weights: [400, 600],
			subsets: ['latin'],
			fallbacks: ['monospace'],
		},
	],
});
