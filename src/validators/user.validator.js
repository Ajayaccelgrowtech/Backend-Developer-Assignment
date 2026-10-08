const { z } = require('zod');
const { ALL_ROLES } = require('../constants/roles');

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(ALL_ROLES, { errorMap: () => ({ message: 'Invalid role' }) }),
    isActive: z.boolean().optional()
  })
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ObjectId')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(ALL_ROLES).optional(),
    isActive: z.boolean().optional()
  })
});

const toggleStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ObjectId')
  }),
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive boolean status is required' })
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  toggleStatusSchema
};
