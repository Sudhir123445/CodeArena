require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'online_judge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const makeAdmin = async () => {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('Usage: node make_admin.js <username_or_email>');
    process.exit(1);
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE users SET role = 'admin' WHERE username = $1 OR email = $1`,
      [identifier]
    );

    if (rowCount > 0) {
      console.log(`✅ Successfully promoted '${identifier}' to admin.`);
    } else {
      console.log(`❌ User '${identifier}' not found.`);
    }
  } catch (err) {
    console.error('Error updating user role:', err);
  } finally {
    await pool.end();
  }
};

makeAdmin();
