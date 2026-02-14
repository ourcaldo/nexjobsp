import { z } from 'zod';

export const urlSchema = z.string().url('Invalid URL format').or(z.literal(''));

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
