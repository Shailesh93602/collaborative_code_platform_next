import * as yup from 'yup';
import { emailSchema, nameSchema } from '@/lib/inputValidation';

export const settingsSchema = yup.object({
  name: nameSchema,
  email: emailSchema,
  bio: yup.string().max(160, 'Bio must be 160 characters or less').optional(),
  githubProfile: yup.string().optional(),
  twitterHandle: yup.string().optional(),
  websiteUrl: yup.string().url('Invalid URL').optional(),
});
