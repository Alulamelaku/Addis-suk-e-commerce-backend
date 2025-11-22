const db = require('../src/db');

async function logActivity({ user_id, action, description, ip, agent }) {
    console.log("in activitylogger.js file");
     console.log(user_id, action, description, ip, agent);   
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, action, description, ip, agent]
    );
  } catch (err) {
    console.error("Activity log error:", err);
  }
}

module.exports = logActivity;