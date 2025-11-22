const fs = require('fs');
const path = require('path');
const db = require('./index');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql')).toString();
  try {
    await db.pool.query(sql);
    console.log('Migration executed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}


migrate();
