import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^\+?[\d\s\-()]+$/,
  'Invalid phone number format'
).optional().or(z.literal(''));

export const urlSchema = z.string().url('Invalid URL format').or(z.literal(''));

export const createBookmarkSchema = z.object({
  job_id: uuidSchema,
  user_id: uuidSchema.optional(),
});

export const deleteBookmarkSchema = z.object({
  job_id: uuidSchema,
  user_id: uuidSchema.optional(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  phone: phoneSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  birth_date: z.string().datetime('Invalid datetime format').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender must be male, female, or other'
  }).optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional().or(z.literal('')),
  photo_url: urlSchema.optional(),
});

export const jobSearchSchema = z.object({
  page: z.number().int().positive('Page must be a positive integer').optional().default(1),
  limit: z.number().int().positive('Limit must be a positive integer').max(100, 'Limit cannot exceed 100').optional().default(10),
  search: z.string().max(200, 'Search term must be less than 200 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  experience_level: z.string().max(50, 'Experience level must be less than 50 characters').optional(),
  employment_type: z.string().max(50, 'Employment type must be less than 50 characters').optional(),
  salary_min: z.number().nonnegative('Minimum salary must be non-negative').optional(),
  salary_max: z.number().nonnegative('Maximum salary must be non-negative').optional(),
}).refine(
  data => {
    if (data.salary_min && data.salary_max) {
      return data.salary_min <= data.salary_max;
    }
    return true;
  },
  {
    message: 'Minimum salary cannot be greater than maximum salary',
    path: ['salary_min'],
  }
);

export const adminSettingsSchema = z.object({
  cms_endpoint: urlSchema.optional(),
  cms_token: z.string().optional(),
  cms_timeout: z.number().int().positive().optional(),
  site_title: z.string().max(200).optional(),
  site_tagline: z.string().max(500).optional(),
  site_description: z.string().max(1000).optional(),
  site_url: urlSchema.optional(),
  ga_id: z.string().max(50).optional().or(z.literal('')),
  gtm_id: z.string().max(50).optional().or(z.literal('')),
}).partial();

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().fieldErrors,
      formattedError: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
};
