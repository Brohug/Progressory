const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const pool = require('../src/config/db');

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? '-'
    : parsedDate.toISOString();
};

const run = async () => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT id, request_type, first_name, last_name, email, phone, gym_name,
              demo_slot_start, status, linked_gym_id, linked_owner_user_id,
              owner_contacted_at, provisioned_at, converted_at, created_at
       FROM public_inquiries
       ORDER BY created_at DESC
       LIMIT 50`
    );

    if (rows.length === 0) {
      console.log('No public inquiries found.');
      return;
    }

    console.table(rows.map((row) => ({
      id: row.id,
      type: row.request_type,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      gym: row.gym_name,
      demo_slot_start: formatDateTime(row.demo_slot_start),
      status: row.status,
      linked_gym_id: row.linked_gym_id || '-',
      linked_owner_user_id: row.linked_owner_user_id || '-',
      owner_contacted_at: formatDateTime(row.owner_contacted_at),
      provisioned_at: formatDateTime(row.provisioned_at),
      converted_at: formatDateTime(row.converted_at),
      created_at: formatDateTime(row.created_at)
    })));
  } finally {
    connection.release();
  }
};

run()
  .catch((error) => {
    console.error('Failed to list public inquiries:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
