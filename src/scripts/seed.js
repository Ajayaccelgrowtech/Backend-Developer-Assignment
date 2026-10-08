const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Timeline = require('../models/Timeline');
const connectDB = require('../config/db');
const { ROLES } = require('../constants/roles');
const { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } = require('../constants/leadEnums');
const { DEAL_STAGES } = require('../constants/dealEnums');
const { ACTIVITY_TYPES, ACTIVITY_STATUSES } = require('../constants/activityEnums');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collection data...');

    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Customer.deleteMany({}),
      Deal.deleteMany({}),
      Activity.deleteMany({}),
      Timeline.deleteMany({})
    ]);

    console.log('[Seed] Creating sample users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@crm.com',
      phone: '+1-555-0100',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
      isActive: true
    });

    const manager = await User.create({
      name: 'Sarah Jenkins (Sales Manager)',
      email: 'manager@crm.com',
      phone: '+1-555-0101',
      password: 'ManagerPassword123!',
      role: ROLES.SALES_MANAGER,
      isActive: true
    });

    const exec1 = await User.create({
      name: 'Alex Rivera (Sales Exec)',
      email: 'alex.exec@crm.com',
      phone: '+1-555-0102',
      password: 'ExecPassword123!',
      role: ROLES.SALES_EXECUTIVE,
      isActive: true
    });

    const exec2 = await User.create({
      name: 'Michael Scott (Sales Exec)',
      email: 'michael.exec@crm.com',
      phone: '+1-555-0103',
      password: 'ExecPassword123!',
      role: ROLES.SALES_EXECUTIVE,
      isActive: true
    });

    console.log('[Seed] Creating sample leads...');
    const lead1 = await Lead.create({
      name: 'Acme Corp Lead',
      email: 'contact@acmecorp.com',
      phone: '+1-415-555-2671',
      company: 'Acme Corporation',
      source: LEAD_SOURCES.WEBSITE,
      status: LEAD_STATUSES.QUALIFIED,
      priority: LEAD_PRIORITIES.HIGH,
      assignedTo: exec1._id,
      description: 'Interested in enterprise cloud package'
    });

    const lead2 = await Lead.create({
      name: 'TechStart Innovations',
      email: 'hello@techstart.io',
      phone: '+1-415-555-9012',
      company: 'TechStart',
      source: LEAD_SOURCES.REFERRAL,
      status: LEAD_STATUSES.CONVERTED,
      priority: LEAD_PRIORITIES.MEDIUM,
      assignedTo: exec1._id,
      isConverted: true,
      convertedAt: new Date()
    });

    const lead3 = await Lead.create({
      name: 'Global Logistics Inc',
      email: 'info@globallogistics.com',
      phone: '+1-212-555-4433',
      company: 'Global Logistics',
      source: LEAD_SOURCES.EMAIL,
      status: LEAD_STATUSES.NEW,
      priority: LEAD_PRIORITIES.LOW,
      assignedTo: exec2._id,
      description: 'Inquired via Q4 email campaign'
    });

    console.log('[Seed] Creating sample customer...');
    const customer1 = await Customer.create({
      name: 'TechStart Innovations',
      email: 'hello@techstart.io',
      phone: '+1-415-555-9012',
      company: 'TechStart',
      address: '100 Silicon Way, San Francisco, CA',
      originalLeadId: lead2._id,
      assignedTo: exec1._id,
      status: 'Active'
    });

    console.log('[Seed] Creating sample deals...');
    const deal1 = await Deal.create({
      name: 'TechStart Annual SaaS Contract',
      leadId: lead2._id,
      customerId: customer1._id,
      assignedTo: exec1._id,
      value: 45000,
      probability: 80,
      expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stage: DEAL_STAGES.PROPOSAL,
      description: 'Enterprise tier license contract'
    });

    const deal2 = await Deal.create({
      name: 'TechStart Pilot Add-on',
      leadId: lead2._id,
      customerId: customer1._id,
      assignedTo: exec1._id,
      value: 12000,
      probability: 100,
      expectedClosingDate: new Date(),
      stage: DEAL_STAGES.WON,
      description: 'Initial pilot module closed successfully'
    });

    console.log('[Seed] Creating sample activities...');
    const activity1 = await Activity.create({
      type: ACTIVITY_TYPES.CALL,
      title: 'Discovery call with Acme Corp CTO',
      description: 'Discuss technical requirements and timeline',
      assignedTo: exec1._id,
      createdBy: manager._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: ACTIVITY_STATUSES.PENDING,
      relatedModel: 'Lead',
      relatedId: lead1._id
    });

    const activity2 = await Activity.create({
      type: ACTIVITY_TYPES.MEETING,
      title: 'Contract negotiation with TechStart',
      description: 'Review SLA terms and discount request',
      assignedTo: exec1._id,
      createdBy: exec1._id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue date
      status: ACTIVITY_STATUSES.PENDING,
      relatedModel: 'Deal',
      relatedId: deal1._id
    });

    console.log('[Seed] Creating timeline records...');
    await Timeline.create({
      action: 'Lead Created',
      entityType: 'Lead',
      entityId: lead1._id,
      performedBy: admin._id,
      newValue: { name: lead1.name, status: lead1.status },
      description: 'Lead created in system'
    });

    await Timeline.create({
      action: 'Lead Converted',
      entityType: 'Lead',
      entityId: lead2._id,
      performedBy: exec1._id,
      newValue: { customerId: customer1._id, dealId: deal1._id },
      description: 'Lead converted to Customer and Deal'
    });

    console.log('==================================================');
    console.log('✅ Database seeded successfully!');
    console.log('==================================================');
    console.log('Sample Accounts Created:');
    console.log('1. Admin: admin@crm.com | Password: AdminPassword123!');
    console.log('2. Sales Manager: manager@crm.com | Password: ManagerPassword123!');
    console.log('3. Sales Exec 1: alex.exec@crm.com | Password: ExecPassword123!');
    console.log('4. Sales Exec 2: michael.exec@crm.com | Password: ExecPassword123!');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
