const en = {
  // ── Direction ──
  dir: "ltr",

  // ── Navbar ──
  nav: {
    brand: "UniPath",
    home: "Home",
    recommendations: "Recommendations",
    tracker: "Tracker",
    profile: "Profile",
    chat: "Chat",
    register: "Register",
    login: "Login",
    logout: "Logout",
  },

  // ── Home page ──
  home: {
    badge: "UniPath",
    title: "AI-Based University Application Support System",
    subtitle:
      "A smart platform to search universities, get personalized recommendations, and track application progress in one place.",
    getStarted: "Get Started",
    viewFeatures: "View Features",
    featuresLabel: "Features",
    featuresTitle: "Everything students need in one place",
    featuresSubtitle:
      "UniPath helps students manage university search, recommendations, and applications through one clean interface.",
    feature1Title: "Profile Preferences",
    feature1Desc:
      "Store GPA, city, program, and language preferences for personalized recommendations.",
    feature2Title: "Smart Recommendations",
    feature2Desc:
      "Discover exact matches and alternative recommendations based on your profile.",
    feature3Title: "Application Tracker",
    feature3Desc:
      "Save universities, update statuses, and manage your application journey clearly.",
  },

  // ── Login page ──
  login: {
    title: "Login",
    subtitle: "Sign in to access your UniPath dashboard.",
    emailLabel: "Email",
    emailPlaceholder: "test@unipath.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    submit: "Login",
    submitting: "Signing in...",
    noAccount: "Don't have an account?",
    registerLink: "Register",
  },

  // ── Register page ──
  register: {
    title: "Create Account",
    subtitle: "Sign up to start your UniPath journey.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    submit: "Register",
    submitting: "Creating account...",
    hasAccount: "Already have an account?",
    loginLink: "Login",
  },

  // ── Profile page ──
  profile: {
    title: "Profile Preferences",
    subtitle: "Manage GPA, preferred city, preferred program, and preferred language.",
    loading: "Loading profile...",
    gpaLabel: "GPA",
    gpaPlaceholder: "Enter your GPA",
    cityLabel: "Preferred City",
    cityPlaceholder: "e.g. Beijing",
    programLabel: "Preferred Program",
    programPlaceholder: "e.g. Data Science",
    languageLabel: "Preferred Language",
    languagePlaceholder: "e.g. English",
    remindersTitle: "Enable reminders",
    remindersDesc: "Show reminder support for important deadlines.",
    submit: "Save Changes",
    submitting: "Saving...",
  },

  // ── Recommendations page ──
  recommendations: {
    title: "University Recommendations",
    subtitle: "Universities matching your profile preferences.",
    loading: "Finding the best universities for you...",
    noProfile:
      "Please complete your profile first to get recommendations.",
    goToProfile: "Go to Profile",
    exactTitle: "Exact Matches",
    altTitle: "Alternative Recommendations",
    noExact: "No exact matches found. Try adjusting your profile preferences.",
    noAlt: "No alternative recommendations available.",
    score: "Score",
    program: "Program",
    language: "Language",
    minGpa: "Min GPA",
    deadline: "Deadline",
    applyNow: "Apply Now",
    addToTracker: "Add to Tracker",
    addedAlert: "University added to tracker",
  },

  // ── Tracker page ──
  tracker: {
    title: "Application Tracker",
    subtitle: "Track your university applications and deadlines.",
    loading: "Loading your applications...",
    empty: "No applications yet. Add universities from your recommendations.",
    browseBtn: "Browse Recommendations",
    deadlinePassed: "Deadline passed",
    dueToday: "Due today",
    daysLeft: "{count} day left | {count} days left",
    statusLabel: "Status",
    deadlineLabel: "Deadline",
    deleteBtn: "Remove",
    deleteConfirm: "Are you sure you want to remove this application?",
    remindersOn: "Reminders On",
    remindersOff: "Reminders Off",
    statuses: {
      "Not Started": "Not Started",
      "In Progress": "In Progress",
      Submitted: "Submitted",
      Accepted: "Accepted",
      Rejected: "Rejected",
    },
  },

  // ── Chat page ──
  chat: {
    title: "UniPath Assistant",
    subtitle:
      "Ask questions about universities, GPA requirements, deadlines, and application guidance.",
    welcome:
      "Hi, I'm UniPath Assistant. Ask me about universities, GPA, deadlines, or application guidance.",
    placeholder: "Type your message...",
    send: "Send",
    error: "Sorry, something went wrong while contacting the assistant.",
  },

  // ── Language switcher ──
  langSwitcher: {
    en: "English",
    ar: "العربية",
    zh: "中文",
  },
};

export default en;
