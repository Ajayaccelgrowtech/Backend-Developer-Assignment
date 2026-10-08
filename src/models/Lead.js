const mongoose = require('mongoose');
const { ALL_LEAD_SOURCES, ALL_LEAD_STATUSES, ALL_LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } = require('../constants/leadEnums');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ALL_LEAD_SOURCES,
      default: LEAD_SOURCES.WEBSITE,
      index: true
    },
    status: {
      type: String,
      enum: ALL_LEAD_STATUSES,
      default: LEAD_STATUSES.NEW,
      index: true
    },
    priority: {
      type: String,
      enum: ALL_LEAD_PRIORITIES,
      default: LEAD_PRIORITIES.MEDIUM,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isConverted: {
      type: Boolean,
      default: false,
      index: true
    },
    convertedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Search & Compound Indexes
leadSchema.index({ name: 'text', email: 'text', company: 'text' });
leadSchema.index({ status: 1, priority: 1, assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
