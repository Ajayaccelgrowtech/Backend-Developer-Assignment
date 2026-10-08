const { z } = require('zod');
const { ALL_DEAL_STAGES } = require('../constants/dealEnums');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createDealSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Deal name is required'),
    leadId: z.string().regex(objectIdRegex, 'Invalid Lead ID'),
    customerId: z.string().regex(objectIdRegex, 'Invalid Customer ID'),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid User ID').optional(),
    value: z.number().positive('Value must be greater than 0'),
    probability: z.number().min(0).max(100).optional().default(50),
    expectedClosingDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid closing date required'),
    stage: z.enum(ALL_DEAL_STAGES).optional(),
    description: z.string().optional()
  })
});

const updateDealSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Deal ID')
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    value: z.number().positive().optional(),
    probability: z.number().min(0).max(100).optional(),
    expectedClosingDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date required').optional(),
    stage: z.enum(ALL_DEAL_STAGES).optional(),
    lossReason: z.string().optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    description: z.string().optional()
  })
});

const updateDealStageSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Deal ID')
  }),
  body: z.object({
    stage: z.enum(ALL_DEAL_STAGES, { required_error: 'Stage is required' }),
    lossReason: z.string().optional()
  })
});

module.exports = {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema
};
