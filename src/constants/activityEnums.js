const ACTIVITY_TYPES = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  DEMO: 'Demo',
  FOLLOW_UP: 'Follow-up',
  REMINDER: 'Reminder',
  NOTE: 'Note'
};

const ACTIVITY_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
};

const ENTITY_TYPES = {
  LEAD: 'Lead',
  CUSTOMER: 'Customer',
  DEAL: 'Deal'
};

module.exports = {
  ACTIVITY_TYPES,
  ALL_ACTIVITY_TYPES: Object.values(ACTIVITY_TYPES),
  ACTIVITY_STATUSES,
  ALL_ACTIVITY_STATUSES: Object.values(ACTIVITY_STATUSES),
  ENTITY_TYPES,
  ALL_ENTITY_TYPES: Object.values(ENTITY_TYPES)
};
