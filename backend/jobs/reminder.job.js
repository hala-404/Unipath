require("dotenv").config();
const cron = require("node-cron");
const pool = require("../db/pool");
const { sendReminderEmail } = require("../services/email.service");

async function runReminderCheck() {
  try {
    const result = await pool.query(`
      SELECT
        a.id AS application_id,
        a.status,
        a.last_reminder_type,
        a.last_reminder_sent_at,
        u.email,
        u.reminders_enabled,
        uni.name,
        uni.program,
        uni.deadline
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN universities uni ON a.university_id = uni.id
      WHERE
        u.reminders_enabled = true
        AND a.status NOT IN ('Accepted', 'Rejected', 'Submitted')
        AND uni.deadline IS NOT NULL
    `);

    const now = new Date();


    for (const row of result.rows) {
      const deadline = new Date(row.deadline);
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let reminderType = null;

      if (diffDays === 7) reminderType = "7_day";
      if (diffDays === 3) reminderType = "3_day";
      if (diffDays === 1) reminderType = "1_day";

      if (!reminderType) continue;

      // Prevent duplicate reminders
      if (row.last_reminder_type === reminderType) continue;

      // Send email
      await sendReminderEmail(
        row.email,
        row.name,
        row.program,
        row.status,
        row.deadline,
        reminderType
      );

      // Save reminder state
      await pool.query(
        `
        UPDATE applications
        SET last_reminder_type = $1,
            last_reminder_sent_at = NOW()
        WHERE id = $2
        `,
        [reminderType, row.application_id]
      );

      console.log(
        `Sent ${reminderType} reminder to ${row.email} for ${row.name}`
      );
    }

    console.log("Reminder check completed.");
  } catch (error) {
    console.error("Reminder job error:", error);
  }
}

// every day at 9:00 AM
cron.schedule("0 9 * * *", () => {
  console.log("Running scheduled reminder check...");
  runReminderCheck();
});

module.exports = { runReminderCheck };