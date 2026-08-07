import { z } from 'zod';

export const exampleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
});

export type ExampleSchema = z.infer<typeof exampleSchema>;
