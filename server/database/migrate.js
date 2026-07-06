require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'online_judge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id    SERIAL PRIMARY KEY,
        name  VARCHAR(255) NOT NULL UNIQUE,
        ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Get already-run migrations
    const { rows: completed } = await client.query(
      'SELECT name FROM _migrations ORDER BY id'
    );
    const completedNames = new Set(completed.map((r) => r.name));

    // Read and sort migration files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ranCount = 0;

    for (const file of files) {
      if (completedNames.has(file)) {
        console.log(`  ⏭  Skipping ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ Applied ${file}`);
        ranCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed ${file}:`, err.message);
        throw err;
      }
    }

    if (ranCount === 0) {
      console.log('\n  All migrations are up to date.');
    } else {
      console.log(`\n  ${ranCount} migration(s) applied successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('\n🗄️  Running database migrations...\n');
runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
