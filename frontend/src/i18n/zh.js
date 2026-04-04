const zh = {
  // ── Direction ──
  dir: "ltr",

  // ── Navbar ──
  nav: {
    brand: "UniPath",
    home: "首页",
    compare: "对比",
    recommendations: "推荐",
    tracker: "进度追踪",
    profile: "个人资料",
    chat: "智能助手",
    register: "注册",
    login: "登录",
    logout: "退出登录",
  },

  // ── Home page ──
  home: {
    badge: "UniPath",
    title: "基于人工智能的大学申请支持系统",
    subtitle:
      "一个智能平台，帮助您搜索大学、获取个性化推荐，并在一处跟踪申请进度。",
    getStarted: "立即开始",
    viewFeatures: "查看功能",
    featuresLabel: "功能特色",
    featuresTitle: "学生所需，一应俱全",
    featuresSubtitle:
      "UniPath 通过简洁的界面帮助学生管理大学搜索、推荐和申请。",
    feature1Title: "个人偏好设置",
    feature1Desc: "保存 GPA、城市、专业和语言偏好，获取个性化推荐。",
    feature2Title: "智能推荐",
    feature2Desc: "根据您的个人资料发现精确匹配和替代推荐。",
    feature3Title: "申请追踪器",
    feature3Desc: "保存大学、更新状态，清晰管理您的申请旅程。",
  },

  // ── Login page ──
  login: {
    title: "登录",
    subtitle: "登录以访问您的 UniPath 控制面板。",
    emailLabel: "邮箱",
    emailPlaceholder: "test@unipath.com",
    passwordLabel: "密码",
    passwordPlaceholder: "请输入密码",
    submit: "登录",
    submitting: "正在登录...",
    noAccount: "还没有账户？",
    registerLink: "注册",
  },

  // ── Register page ──
  register: {
    title: "创建账户",
    subtitle: "注册以开始您的 UniPath 之旅。",
    emailLabel: "邮箱",
    emailPlaceholder: "you@example.com",
    passwordLabel: "密码",
    passwordPlaceholder: "创建密码",
    submit: "注册",
    submitting: "正在创建账户...",
    hasAccount: "已有账户？",
    loginLink: "登录",
  },

  // ── Profile page ──
  profile: {
    title: "个人偏好设置",
    subtitle: "管理 GPA、首选城市、首选专业和首选语言。",
    loading: "正在加载个人资料...",
    gpaLabel: "GPA",
    gpaPlaceholder: "请输入您的 GPA",
    cityLabel: "首选城市",
    cityPlaceholder: "例如：北京",
    programLabel: "首选专业",
    programPlaceholder: "例如：数据科学",
    languageLabel: "首选语言",
    languagePlaceholder: "例如：英语",
    remindersTitle: "启用提醒",
    remindersDesc: "为重要截止日期显示提醒支持。",
    submit: "保存更改",
    submitting: "正在保存...",
  },

  // ── Recommendations page ──
  recommendations: {
    title: "大学推荐",
    subtitle: "与您个人资料偏好匹配的大学。",
    loading: "正在为您寻找最佳大学...",
    noProfile: "请先完成您的个人资料以获取推荐。",
    goToProfile: "前往个人资料",
    exactTitle: "精确匹配",
    altTitle: "替代推荐",
    noExact: "未找到精确匹配。请尝试调整您的个人资料偏好。",
    noAlt: "暂无替代推荐。",
    score: "评分",
    program: "专业",
    language: "语言",
    minGpa: "最低 GPA",
    deadline: "截止日期",
    applyNow: "立即申请",
    addToTracker: "添加到追踪器",
    addedAlert: "大学已添加到追踪器",
  },

  // ── Tracker page ──
  tracker: {
    title: "申请追踪器",
    subtitle: "跟踪您的大学申请和截止日期。",
    loading: "正在加载您的申请...",
    empty: "暂无申请。从推荐中添加大学。",
    browseBtn: "浏览推荐",
    deadlinePassed: "已过截止日期",
    dueToday: "今天截止",
    daysLeft: "剩余 {count} 天",
    statusLabel: "状态",
    deadlineLabel: "截止日期",
    deleteBtn: "移除",
    deleteConfirm: "确定要移除此申请吗？",
    remindersOn: "提醒已开启",
    remindersOff: "提醒已关闭",
    statuses: {
      "Not Started": "未开始",
      "In Progress": "进行中",
      Submitted: "已提交",
      Accepted: "已录取",
      Rejected: "已拒绝",
    },
  },

  // ── Chat page ──
  chat: {
    title: "UniPath 智能助手",
    subtitle: "询问关于大学、GPA 要求、截止日期和申请指导的问题。",
    welcome:
      "你好，我是 UniPath 助手。你可以问我关于大学、GPA、截止日期或申请指导的问题。",
    placeholder: "输入您的消息...",
    send: "发送",
    error: "抱歉，联系助手时出了点问题。",
  },

  // ── Language switcher ──
  langSwitcher: {
    en: "English",
    ar: "العربية",
    zh: "中文",
  },
};

export default zh;
