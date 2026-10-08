const Timeline = require('../models/Timeline');

const logTimelineEvent = async ({
  action,
  entityType,
  entityId,
  performedBy,
  previousValue = null,
  newValue = null,
  description = '',
  session = null
}) => {
  try {
    const options = session ? { session } : {};
    const timelineEntry = new Timeline({
      action,
      entityType,
      entityId,
      performedBy,
      previousValue,
      newValue,
      description
    });
    await timelineEntry.save(options);
    return timelineEntry;
  } catch (error) {
    console.error(`[Timeline Log Error]: ${error.message}`);
    // Non-blocking in non-transactional contexts if needed, but logging error
  }
};

module.exports = {
  logTimelineEvent
};
