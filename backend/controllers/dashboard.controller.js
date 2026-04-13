const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

function calculateProfileCompletion(profile) {
  const fields = [
    profile.gpa,
    profile.preferred_city,
    profile.preferred_country,
    profile.preferred_program,
    profile.preferred_language,
    profile.max_tuition,
  ];

  const filled = fields.filter(
    (value) => value !== null && value !== undefined && String(value).trim() !== ""
  ).length;

  return Math.round((filled / fields.length) * 100);
}

function calculateApplicationProgress(application) {
  let checklist = application.checklist;

  if (typeof checklist === "string") {
    try {
      checklist = JSON.parse(checklist);
    } catch {
      checklist = [];
    }
  }

  if (!Array.isArray(checklist) || checklist.length === 0) {
    if (application.status === "Submitted") return 100;
    if (application.status === "In Progress") return 50;
    return 20;
  }

  const completed = checklist.filter((item) => item.completed).length;
  return Math.round((completed / checklist.length) * 100);
}

function buildRecommendedActions(applications) {
  const actions = [];

  for (const app of applications) {
    const progress = calculateApplicationProgress(app);

    if (app.status === "Not Started") {
      actions.push({
        title: `Review ${app.name} requirements`,
        subtitle: "Application not yet started",
        cta: "Start",
        href: `/universities/${app.university_id}`,
      });
    }

    if (app.status === "In Progress" && progress < 50) {
      actions.push({
        title: "Complete your personal statement",
        subtitle: `${app.name} application is still in progress`,
        cta: "Start",
        href: `/tracker?app=${app.application_id}&focus=statement`,
      });
    }

    if (app.status === "In Progress" && progress >= 50 && progress < 100) {
      actions.push({
        title: "Finish remaining checklist items",
        subtitle: `${app.name} is ${progress}% ready`,
        cta: "Continue",
        href: "/tracker",
      });
    }

    const checklist =
      typeof app.checklist === "string"
        ? JSON.parse(app.checklist || "[]")
        : Array.isArray(app.checklist)
        ? app.checklist
        : [];

    const recommendationLetters = checklist.find((item) =>
      item.label?.toLowerCase().includes("recommendation")
    );

    if (recommendationLetters && !recommendationLetters.completed) {
      actions.push({
        title: "Request recommendation letters",
        subtitle: `Still needed for ${app.name}`,
        cta: "Start",
        href: `/tracker?app=${app.application_id}&focus=recommendation`,
      });
    }
  }

  return actions.slice(0, 3);
}

async function getDashboardData(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    const profileResult = await pool.query(
      `SELECT full_name, email, gpa, preferred_city, preferred_country, preferred_program,
              preferred_language, max_tuition
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    const profile = profileResult.rows[0] || {};
    const fullName = profile.full_name?.trim();
    const firstName = fullName ? fullName.split(" ")[0] : null;

    const applicationsResult = await pool.query(
      `SELECT
         a.id AS application_id,
         a.status,
         a.user_id,
         a.checklist,
         u.id AS university_id,
         u.name,
         u.city,
         u.country,
         u.program,
         u.deadline,
         u.image_url
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.user_id = $1
       ORDER BY a.id DESC`,
      [user_id]
    );

    const activityResult = await pool.query(
      `SELECT id, action, entity_type AS entity, entity_name, created_at
       FROM activity_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 8`,
      [user_id]
    );

    const applications = applicationsResult.rows.map((app) => ({
      ...app,
      progress: calculateApplicationProgress(app),
    }));

    const upcomingDeadlines = applications.filter((app) => {
      if (!app.deadline) return false;
      const deadline = new Date(app.deadline);
      const now = new Date();
      return deadline >= now;
    }).length;

    const stats = {
      savedUniversities: applications.length,
      trackedApplications: applications.length,
      upcomingDeadlines,
      profileCompletion: calculateProfileCompletion(profile),
    };

    const recommendedActions = buildRecommendedActions(applications);

    return res.json({
      user: {
        name:
          firstName ||
          req.auth?.sessionClaims?.first_name ||
          req.auth?.sessionClaims?.given_name ||
          profile.email?.split("@")[0] ||
          "Student",
      },
      stats,
      activeApplications: applications.slice(0, 3),
      recentActivity: activityResult.rows,
      recommendedActions,
      quickActions: [
        { label: "Get New Recommendations", href: "/recommendations" },
        { label: "Ask AI Advisor", href: "/chat" },
        { label: "Compare Universities", href: "/compare" },
        { label: "Update Profile", href: "/profile" },
      ],
    });
  } catch (err) {
    throw err;
  }
}

module.exports = { getDashboardData };