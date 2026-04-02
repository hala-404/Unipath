require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


function getReminderEmailContent(reminderType, universityName, program, status, deadline) {
  const formattedDate = new Date(deadline).toDateString();

  if (reminderType === "7_day") {
    return {
      subject: `Reminder: 7 days left for ${universityName}`,
      html: `
        <h2>Application Reminder</h2>
        <p>You have <strong>7 days left</strong> to complete your application.</p>
        <p><strong>University:</strong> ${universityName}</p>
        <p><strong>Program:</strong> ${program}</p>
        <p><strong>Current status:</strong> ${status}</p>
        <p><strong>Deadline:</strong> ${formattedDate}</p>
        <p>This is a good time to review your documents and make sure everything is ready.</p>
        <hr />
        <p>UniPath Assistant</p>
      `,
    };
  }

  if (reminderType === "3_day") {
    return {
      subject: `Important Reminder: 3 days left for ${universityName}`,
      html: `
        <h2>Important Application Reminder</h2>
        <p>You have <strong>3 days left</strong> to complete your application.</p>
        <p><strong>University:</strong> ${universityName}</p>
        <p><strong>Program:</strong> ${program}</p>
        <p><strong>Current status:</strong> ${status}</p>
        <p><strong>Deadline:</strong> ${formattedDate}</p>
        <p>Please make sure your application is completed as soon as possible.</p>
        <hr />
        <p>UniPath Assistant</p>
      `,
    };
  }

  return {
    subject: `Urgent Reminder: 1 day left for ${universityName}`,
    html: `
      <h2>Urgent Application Reminder</h2>
      <p>You have <strong>1 day left</strong> to complete your application.</p>
      <p><strong>University:</strong> ${universityName}</p>
      <p><strong>Program:</strong> ${program}</p>
      <p><strong>Current status:</strong> ${status}</p>
      <p><strong>Deadline:</strong> ${formattedDate}</p>
      <p>This is your final reminder before the deadline.</p>
      <hr />
      <p>UniPath Assistant</p>
    `,
  };
}

async function sendReminderEmail(to, universityName, program, status, deadline, reminderType) {
  try {
    const content = getReminderEmailContent(
      reminderType,
      universityName,
      program,
      status,
      deadline
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: content.subject,
      html: content.html,
    });

    console.log(`Reminder email sent to ${to}`);
  } catch (error) {
    console.error("Email error:", error);
  }
}

module.exports = { sendReminderEmail };