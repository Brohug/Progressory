const pool = require('../config/db');

let authSchemaSupportPromise = null;

const loadAuthSchemaSupport = async (queryable = pool) => {
  const [rows] = await queryable.query(
    `SELECT TABLE_NAME, COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('users', 'gyms')`
  );

  const support = {
    users: new Set(),
    gyms: new Set()
  };

  rows.forEach((row) => {
    if (row.TABLE_NAME === 'users') {
      support.users.add(row.COLUMN_NAME);
    }

    if (row.TABLE_NAME === 'gyms') {
      support.gyms.add(row.COLUMN_NAME);
    }
  });

  return support;
};

const getAuthSchemaSupport = async (queryable = pool) => {
  if (queryable !== pool) {
    return loadAuthSchemaSupport(queryable);
  }

  if (!authSchemaSupportPromise) {
    authSchemaSupportPromise = loadAuthSchemaSupport(queryable).catch((error) => {
      authSchemaSupportPromise = null;
      throw error;
    });
  }

  return authSchemaSupportPromise;
};

const buildAuthUserSelectSql = (schemaSupport, whereClause, { includePasswordHash = false } = {}) => {
  const userSelectParts = [
    'u.id',
    'u.gym_id',
    'u.first_name',
    'u.last_name',
    'u.email',
    'u.role',
    'u.is_active',
    'u.created_at',
    'u.updated_at'
  ];

  if (includePasswordHash) {
    userSelectParts.push('u.password_hash');
  }

  userSelectParts.push(
    schemaSupport.users.has('can_upload_library_content')
      ? 'u.can_upload_library_content'
      : 'FALSE AS can_upload_library_content',
    'm.id AS member_id',
    'g.name AS gym_name',
    'g.slug'
  );

  if (schemaSupport.gyms.has('is_platform_suspended')) {
    userSelectParts.push(
      'g.is_platform_suspended',
      'g.platform_suspended_at',
      'g.platform_suspension_reason'
    );
  } else {
    userSelectParts.push(
      'FALSE AS is_platform_suspended',
      'NULL AS platform_suspended_at',
      "'' AS platform_suspension_reason"
    );
  }

  return `SELECT ${userSelectParts.join(',\n              ')}
        FROM users u
        JOIN gyms g ON u.gym_id = g.id
        LEFT JOIN members m ON m.user_id = u.id AND m.gym_id = u.gym_id
        ${whereClause}`;
};

const getAuthUserByWhere = async (queryable, whereClause, params, options = {}) => {
  const schemaSupport = await getAuthSchemaSupport(queryable);
  const [rows] = await queryable.query(
    buildAuthUserSelectSql(schemaSupport, whereClause, options),
    params
  );

  return rows[0] || null;
};

module.exports = {
  getAuthSchemaSupport,
  buildAuthUserSelectSql,
  getAuthUserByWhere
};
