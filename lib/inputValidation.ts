import * as yup from 'yup';
import DOMPurify from 'isomorphic-dompurify';

export const nameSchema = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters');

export const emailSchema = yup.string().email('Invalid email').required('Email is required');

export const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
  .required('Password is required');

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

export async function validateAndSanitizeInput<T>(
  schema: yup.Schema<T>,
  input: T,
  dictionary?: any
): Promise<T> {
  try {
    const validatedData = await schema.validate(input, { abortEarly: false });
    return Object.entries(validatedData as any).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as T);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw new Error(dictionary?.validationError.replace('{{errors}}', error?.errors?.join(', ')));
    }
    throw error;
  }
}
