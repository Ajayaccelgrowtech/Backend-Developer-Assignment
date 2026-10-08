const mongoose = require('mongoose');
const { ALL_ACTIVITY_TYPES, ALL_ACTIVITY_STATUSES, ACTIVITY_TYPES, ACTIVITY_STATUSES, ALL_ENTITY_TYPES } = require('../constants/activityEnums');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ALL_ACTIVITY_TYPES,
      required: [true, 'Activity type is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    status: {
      type: String,
      enum: ALL_ACTIVITY_STATUSES,
      default: ACTIVITY_STATUSES.PENDING,
      index: true
    },
    relatedModel: {
      type: String,
      enum: ALL_ENTITY_TYPES,
      required: true,
      index: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedModel',
      index: true
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
activitySchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
activitySchema.index({ relatedModel: 1, relatedId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
