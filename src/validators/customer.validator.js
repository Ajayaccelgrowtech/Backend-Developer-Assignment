const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    originalLeadId: z.string().regex(objectIdRegex, 'Invalid Lead ID'),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid User ID').optional(),
    status: z.enum(['Active', 'Inactive']).optional()
  })
});

const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Customer ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    status: z.enum(['Active', 'Inactive']).optional()
  })
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema
};
