const ar = {
  // ── Direction ──
  dir: "rtl",

  // ── Navbar ──
  nav: {
    brand: "يوني باث",
    home: "الرئيسية",
    compare: "المقارنة",
    recommendations: "التوصيات",
    tracker: "المتابعة",
    profile: "الملف الشخصي",
    chat: "المحادثة",
    register: "تسجيل جديد",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
  },

  // ── Home page ──
  home: {
    badge: "يوني باث",
    title: "نظام دعم التقديم الجامعي القائم على الذكاء الاصطناعي",
    subtitle:
      "منصة ذكية للبحث عن الجامعات والحصول على توصيات مخصصة وتتبع تقدم التقديمات في مكان واحد.",
    getStarted: "ابدأ الآن",
    viewFeatures: "عرض الميزات",
    featuresLabel: "الميزات",
    featuresTitle: "كل ما يحتاجه الطلاب في مكان واحد",
    featuresSubtitle:
      "يوني باث يساعد الطلاب في إدارة البحث عن الجامعات والتوصيات والتقديمات من خلال واجهة واحدة.",
    feature1Title: "تفضيلات الملف الشخصي",
    feature1Desc:
      "تخزين المعدل التراكمي والمدينة والبرنامج واللغة المفضلة للحصول على توصيات مخصصة.",
    feature2Title: "توصيات ذكية",
    feature2Desc:
      "اكتشف تطابقات دقيقة وتوصيات بديلة بناءً على ملفك الشخصي.",
    feature3Title: "متتبع التقديمات",
    feature3Desc:
      "احفظ الجامعات وحدّث الحالات وأدر رحلة التقديم بوضوح.",
  },

  // ── Login page ──
  login: {
    title: "تسجيل الدخول",
    subtitle: "قم بتسجيل الدخول للوصول إلى لوحة تحكم يوني باث.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "test@unipath.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    registerLink: "سجّل الآن",
  },

  // ── Register page ──
  register: {
    title: "إنشاء حساب",
    subtitle: "سجّل لبدء رحلتك مع يوني باث.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أنشئ كلمة مرور",
    submit: "تسجيل",
    submitting: "جارٍ إنشاء الحساب...",
    hasAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
  },

  // ── Profile page ──
  profile: {
    title: "تفضيلات الملف الشخصي",
    subtitle: "إدارة المعدل التراكمي والمدينة والبرنامج واللغة المفضلة.",
    loading: "جارٍ تحميل الملف الشخصي...",
    gpaLabel: "المعدل التراكمي",
    gpaPlaceholder: "أدخل معدلك التراكمي",
    cityLabel: "المدينة المفضلة",
    cityPlaceholder: "مثال: بكين",
    programLabel: "البرنامج المفضل",
    programPlaceholder: "مثال: علوم البيانات",
    languageLabel: "اللغة المفضلة",
    languagePlaceholder: "مثال: الإنجليزية",
    remindersTitle: "تفعيل التذكيرات",
    remindersDesc: "عرض دعم التذكيرات للمواعيد النهائية المهمة.",
    submit: "حفظ التغييرات",
    submitting: "جارٍ الحفظ...",
  },

  // ── Recommendations page ──
  recommendations: {
    title: "توصيات الجامعات",
    subtitle: "الجامعات المطابقة لتفضيلات ملفك الشخصي.",
    loading: "جارٍ البحث عن أفضل الجامعات لك...",
    noProfile: "يرجى إكمال ملفك الشخصي أولاً للحصول على التوصيات.",
    goToProfile: "الذهاب إلى الملف الشخصي",
    exactTitle: "تطابقات دقيقة",
    altTitle: "توصيات بديلة",
    noExact: "لم يتم العثور على تطابقات دقيقة. حاول تعديل تفضيلات ملفك.",
    noAlt: "لا توجد توصيات بديلة متاحة.",
    score: "النتيجة",
    program: "البرنامج",
    language: "اللغة",
    minGpa: "الحد الأدنى للمعدل",
    deadline: "الموعد النهائي",
    applyNow: "تقدّم الآن",
    addToTracker: "أضف للمتابعة",
    addedAlert: "تمت إضافة الجامعة إلى المتابعة",
  },

  // ── Tracker page ──
  tracker: {
    title: "متتبع التقديمات",
    subtitle: "تابع تقديماتك الجامعية والمواعيد النهائية.",
    loading: "جارٍ تحميل تقديماتك...",
    empty: "لا توجد تقديمات بعد. أضف جامعات من توصياتك.",
    browseBtn: "تصفح التوصيات",
    deadlinePassed: "انتهى الموعد النهائي",
    dueToday: "مستحق اليوم",
    daysLeft: "يوم متبقي {count} | {count} أيام متبقية",
    statusLabel: "الحالة",
    deadlineLabel: "الموعد النهائي",
    deleteBtn: "إزالة",
    deleteConfirm: "هل أنت متأكد أنك تريد إزالة هذا التقديم؟",
    remindersOn: "التذكيرات مفعّلة",
    remindersOff: "التذكيرات معطّلة",
    statuses: {
      "Not Started": "لم يبدأ",
      "In Progress": "قيد التنفيذ",
      Submitted: "تم التقديم",
      Accepted: "مقبول",
      Rejected: "مرفوض",
    },
  },

  // ── Chat page ──
  chat: {
    title: "مساعد يوني باث",
    subtitle:
      "اسأل عن الجامعات ومتطلبات المعدل والمواعيد النهائية وإرشادات التقديم.",
    welcome:
      "مرحباً، أنا مساعد يوني باث. اسألني عن الجامعات والمعدل التراكمي والمواعيد النهائية أو إرشادات التقديم.",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    error: "عذراً، حدث خطأ أثناء الاتصال بالمساعد.",
  },

  // ── Language switcher ──
  langSwitcher: {
    en: "English",
    ar: "العربية",
    zh: "中文",
  },
};

export default ar;
