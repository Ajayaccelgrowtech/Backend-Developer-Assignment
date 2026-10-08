const { z } = require('zod');
const { ALL_ACTIVITY_TYPES, ALL_ACTIVITY_STATUSES, ALL_ENTITY_TYPES } = require('../constants/activityEnums');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createActivitySchema = z.object({
  body: z.object({
    type: z.enum(ALL_ACTIVITY_TYPES, { required_error: 'Activity type is required' }),
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional(),
    assignedTo: z.string().regex(objectIdRegex, 'Invalid User ID').optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid due date required'),
    status: z.enum(ALL_ACTIVITY_STATUSES).optional(),
    relatedModel: z.enum(ALL_ENTITY_TYPES, { required_error: 'Related model entity type required' }),
    relatedId: z.string().regex(objectIdRegex, 'Invalid related entity ID')
  })
});

const updateActivitySchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid Activity ID')
  }),
  body: z.object({
    type: z.enum(ALL_ACTIVITY_TYPES).optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date required').optional(),
    status: z.enum(ALL_ACTIVITY_STATUSES).optional(),
    relatedModel: z.enum(ALL_ENTITY_TYPES).optional(),
    relatedId: z.string().regex(objectIdRegex).optional()
  })
});

module.exports = {
  createActivitySchema,
  updateActivitySchema
};
