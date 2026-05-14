import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			featured: z.boolean().optional().default(false),
			category: z
				.enum(['项目分享', '技术笔记', '学习总结', '生活随笔', '碎碎念'])
				.default('项目分享'),
			tags: z.array(z.string()).optional().default([]),
		}),
});

export const collections = { blog };
