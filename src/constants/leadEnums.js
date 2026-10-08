const LEAD_SOURCES = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  SOCIAL_MEDIA: 'Social Media',
  EMAIL: 'Email',
  PHONE: 'Phone',
  OTHER: 'Other'
};

const LEAD_STATUSES = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  UNQUALIFIED: 'Unqualified',
  CONVERTED: 'Converted',
  LOST: 'Lost'
};

const LEAD_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

module.exports = {
  LEAD_SOURCES,
  ALL_LEAD_SOURCES: Object.values(LEAD_SOURCES),
  LEAD_STATUSES,
  ALL_LEAD_STATUSES: Object.values(LEAD_STATUSES),
  LEAD_PRIORITIES,
  ALL_LEAD_PRIORITIES: Object.values(LEAD_PRIORITIES)
};
