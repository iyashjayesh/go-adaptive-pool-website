// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
// https://astro.build/config
export default defineConfig({
	site: 'https://iyashjayesh.github.io',
	base: '/go-adaptive-pool-website',
	integrations: [
		starlight({
			title: 'go-adaptive-pool',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/iyashjayesh/go-adaptive-pool',
				},
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'guides/introduction' },
						{ label: 'Installation & Quick Start', slug: 'guides/getting-started' },
					],
				},
				{
					label: 'Usage',
					items: [
						{ label: 'Configuration', slug: 'guides/configuration' },
						{ label: 'Core Concepts', slug: 'guides/core-concepts' },
						{ label: 'Examples', slug: 'guides/examples' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Benchmarks', slug: 'reference/benchmarks' },
						{ label: 'Comparison', slug: 'reference/comparison' },
						{ label: 'Design Principles', slug: 'reference/design-principles' },
					],
				},
				{
					label: 'Blog',
					items: [
						{ label: 'Scaling to 1M RPS', slug: 'blog/scaling-to-1m-rps' },
						{ label: 'Sizing Your Worker Pool Queue', slug: 'blog/how-to-size-your-worker-pool-queue' },
					],
				},
			],
		}),
	],
});
