const pool = require('../config/db');

const logAuditEvent = async ({
  gymId = null,
  userId = null,
  eventType,
  entityType = null,
  entityId = null,
  metadata = null,
  connection = null
}) => {
  if (!eventType) {
    return;
  }

  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  const executor = connection || pool;

  try {
    await executor.query(
      `INSERT INTO audit_logs
       (gym_id, user_id, event_type, entity_type, entity_id, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gymId, userId, eventType, entityType, entityId, metadataJson]
    );
  } catch (error) {
    console.warn('Audit log write failed:', {
      eventType,
      entityType,
      entityId,
      message: error.message
    });
  }
};

module.exports = {
  logAuditEvent
};
