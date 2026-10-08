import { z } from 'astro/zod';

export const projectSchema = z.object({
  order: z.number(),
  name: z.string(),
  url: z.url(),
  kind: z.enum(['pub', 'priv']),
  wide: z.boolean(),
  tags: z.array(z.string()),
  tech: z.array(z.string()),
  description: z.object({ es: z.string(), en: z.string() }),
});
