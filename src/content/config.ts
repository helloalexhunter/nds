// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const glossary = defineCollection({
	schema: z.object({
		term: z.string(),
		category: z.string(),
		weight: z.number().default(0),
		link: z.string().url().optional(), // Ensure this is added
	}),
});

export const collections = { glossary };
