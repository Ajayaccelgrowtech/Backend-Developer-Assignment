const { z } = require('zod');
const { ALL_LEAD_SOURCES, ALL_LEAD_STATUSES, ALL_LEAD_PRIORITIES } = require('../constants/leadEnums');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.enum(ALL_LEAD_SOURCES).optional(),
    status: z.enum(ALL_LEAD_STATUSES).optional(),
    priority: z.enum(ALL_LEAD_PRIORITIES).optional(),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid User ID').optional().nullable(),
    description: z.string().optional()
  })
});

const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Lead ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.enum(ALL_LEAD_SOURCES).optional(),
    status: z.enum(ALL_LEAD_STATUSES).optional(),
    priority: z.enum(ALL_LEAD_PRIORITIES).optional(),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid User ID').optional().nullable(),
    description: z.string().optional()
  })
});

const updateLeadStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Lead ID')
  }),
  body: z.object({
    status: z.enum(ALL_LEAD_STATUSES, { required_error: 'Status is required' })
  })
});

const assignLeadSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Lead ID')
  }),
  body: z.object({
    assignedTo: z.string().regex(objectIdRegex, 'Invalid Sales Executive User ID')
  })
});

const convertLeadSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Lead ID')
  }),
  body: z.object({
    dealName: z.string().min(2, 'Deal name is required'),
    dealValue: z.number().positive('Deal value must be greater than 0'),
    probability: z.number().min(0).max(100).optional().default(50),
    expectedClosingDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date required'),
    dealStage: z.string().optional()
  })
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  convertLeadSchema
};
