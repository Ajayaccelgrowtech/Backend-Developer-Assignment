const mongoose = require('mongoose');
const { ALL_DEAL_STAGES, DEAL_STAGES } = require('../constants/dealEnums');

const dealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Deal name is required'],
      trim: true
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: [0.01, 'Deal value must be greater than 0']
    },
    probability: {
      type: Number,
      required: [true, 'Probability is required'],
      min: [0, 'Probability cannot be less than 0'],
      max: [100, 'Probability cannot exceed 100'],
      default: 50
    },
    expectedRevenue: {
      type: Number,
      default: 0
    },
    expectedClosingDate: {
      type: Date,
      required: [true, 'Expected closing date is required']
    },
    stage: {
      type: String,
      enum: ALL_DEAL_STAGES,
      default: DEAL_STAGES.QUALIFICATION,
      index: true
    },
    lossReason: {
      type: String,
      trim: true,
      default: ''
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
dealSchema.index({ name: 'text' });
dealSchema.index({ stage: 1, assignedTo: 1 });
dealSchema.index({ createdAt: -1 });

// Pre-save calculate expected revenue
dealSchema.pre('save', function () {
  if (this.value !== undefined && this.probability !== undefined) {
    this.expectedRevenue = (this.value * this.probability) / 100;
  }
});

module.exports = mongoose.model('Deal', dealSchema);
