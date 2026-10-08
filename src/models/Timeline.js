const mongoose = require('mongoose');
const { ALL_ENTITY_TYPES } = require('../constants/activityEnums');

const timelineSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      enum: [...ALL_ENTITY_TYPES, 'Activity', 'User'],
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
timelineSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('Timeline', timelineSchema);
