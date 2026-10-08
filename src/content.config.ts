import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { projectSchema } from './content/project-schema';

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: projectSchema,
});

const faq = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/faq' }),
  schema: z.object({
    items: z.array(
      z.object({ q: z.string(), a: z.string(), link: z.literal('privacy').optional() }),
    ),
    cta: z.string(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: 'privacy.*.md', base: './src/content/legal' }),
  schema: z.object({}),
});

export const collections = { projects, faq, legal };
