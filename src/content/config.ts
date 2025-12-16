// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const glossaryCollection = defineCollection({
	// Force the type of content to Markdown
	type: 'content',
	schema: z.object({
		// Term Title (e.g., "Bailiffs")
		term: z.string(),
		// Category (e.g., "Core Debt Processes")
		category: z.string(),
		// A concise summary (optional)
		summary: z.string().optional(),
		// Sorting weight (optional, for custom ordering)
		weight: z.number().default(100),
	}),
});

// Export a single object containing all collections
export const collections = {
	glossary: glossaryCollection,
};
