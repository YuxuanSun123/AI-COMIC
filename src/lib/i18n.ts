// 国际化配置 - 中英文双语支持

export type Language = 'zh' | 'en';

export interface I18nTexts {
  // 应用标题
  appTitle: string;
  appSubtitle: string;
  
  // 导航菜单
  home: string;
  news: string;
  studio: string;
  tools: string;
  scriptGenerator: string;
  storyboardGenerator: string;
  videoCards: string;
  editing: string;
  links: string;
  pricing: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  
  // 用户相关
  login: string;
  register: string;
  logout: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  membershipTier: string;
  free: string;
  pro: string;
  studioTier: string;
  
  // 语言切换
  language: string;
  chinese: string;
  english: string;
  
  // 通用操作
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  submit: string;
  back: string;
  search: string;
  filter: string;
  generate: string;
  loading: string;
  confirm: string;
  
  // 作品相关
  myWorks: string;
  workTitle: string;
  workType: string;
  createdAt: string;
  updatedAt: string;
  openWork: string;
  deleteWork: string;
  deleteConfirm: string;
  deleteWarning: string;
  
  // 新闻相关
  newsTitle: string;
  newsSummary: string;
  newsContent: string;
  newsTags: string;
  author: string;
  publishedAt: string;
  readMore: string;
  
  // 链接相关
  linkName: string;
  linkUrl: string;
  linkDesc: string;
  linkTags: string;
  
  // 工具页面
  toolsIntro: string;
  selectGenre: string;
  selectLanguage: string;
  inputPrompt: string;
  storyPrompt: string;
  characters: string;
  worldview: string;
  parameters: string;
  length: string;
  pace: string;
  temperature: string;
  generateScript: string;
  generateStoryboard: string;
  scriptInput: string;
  shotNumber: string;
  imageDescription: string;
  action: string;
  cameraPosition: string;
  dialogue: string;
  lighting: string;
  narration: string;
  prompt: string;
  materialRequirement: string;
  audioEffect: string;
  transition: string;
  duration: string;
  notes: string;
  addItem: string;
  moveUp: string;
  moveDown: string;
  
  // 题材类型
  romance: string;
  scifi: string;
  mystery: string;
  campus: string;
  family: string;
  thriller: string;
  
  // 会员方案
  pricingTitle: string;
  pricingDesc: string;
  freeTier: string;
  freeDesc: string;
  proTier: string;
  proDesc: string;
  studioTierTitle: string;
  studioDesc: string;
  selectPlan: string;
  currentPlan: string;
  upgradedSuccess: string;
  
  // 提示信息
  pleaseLogin: string;
  loginSuccess: string;
  registerSuccess: string;
  logoutSuccess: string;
  saveSuccess: string;
  deleteSuccess: string;
  operationFailed: string;
  emailInvalid: string;
  passwordTooShort: string;
  passwordNotMatch: string;
  fieldRequired: string;
  
  // 页面标题
  industryNews: string;
  creativeWorkshop: string;
  friendLinks: string;
  membershipPlans: string;
  aboutUs: string;
  contactUs: string;
  privacyPolicy: string;
  termsOfService: string;
}

export const i18n: Record<Language, I18nTexts> = {
  zh: {
    appTitle: 'AI漫剧工作坊',
    appSubtitle: '从剧本到剪辑的全流程创作工具',
    
    home: '首页',
    news: '行业动态',
    studio: '创作工坊',
    tools: '工具',
    scriptGenerator: '剧本生成器',
    storyboardGenerator: '分镜生成器',
    videoCards: '镜头卡',
    editing: '剪辑合成',
    links: '友情链接',
    pricing: '会员方案',
    about: '关于我们',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '使用条款',
    
    login: '登录',
    register: '注册',
    logout: '退出',
    nickname: '昵称',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    membershipTier: '会员等级',
    free: '免费版',
    pro: '专业版',
    studioTier: '工作室版',
    
    language: '语言',
    chinese: '中文',
    english: 'English',
    
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    create: '新建',
    submit: '提交',
    back: '返回',
    search: '搜索',
    filter: '筛选',
    generate: '生成',
    loading: '加载中...',
    confirm: '确认',
    
    myWorks: '我的作品',
    workTitle: '作品标题',
    workType: '作品类型',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    openWork: '打开',
    deleteWork: '删除',
    deleteConfirm: '确认删除',
    deleteWarning: '确定要删除该作品吗？此操作不可逆。',
    
    newsTitle: '新闻标题',
    newsSummary: '新闻摘要',
    newsContent: '新闻内容',
    newsTags: '标签',
    author: '作者',
    publishedAt: '发布时间',
    readMore: '阅读更多',
    
    linkName: '链接名称',
    linkUrl: '链接地址',
    linkDesc: '链接描述',
    linkTags: '标签',
    
    toolsIntro: '选择工具开始创作',
    selectGenre: '选择题材',
    selectLanguage: '选择语言',
    inputPrompt: '输入提示',
    storyPrompt: '故事提示',
    characters: '角色设定',
    worldview: '世界观',
    parameters: '参数设置',
    length: '长度',
    pace: '节奏',
    temperature: '创意度',
    generateScript: '生成剧本',
    generateStoryboard: '生成分镜',
    scriptInput: '剧本输入',
    shotNumber: '镜头号',
    imageDescription: '画面描述',
    action: '动作',
    cameraPosition: '机位',
    dialogue: '对白',
    lighting: '光影氛围',
    narration: '旁白台词',
    prompt: 'Prompt',
    materialRequirement: '素材需求',
    audioEffect: '音效配音',
    transition: '转场',
    duration: '时长',
    notes: '备注',
    addItem: '添加',
    moveUp: '上移',
    moveDown: '下移',
    
    romance: '爱情',
    scifi: '科幻',
    mystery: '悬疑',
    campus: '校园',
    family: '家庭',
    thriller: '惊悚',
    
    pricingTitle: '选择适合您的会员方案',
    pricingDesc: '解锁更多创作功能',
    freeTier: '免费版',
    freeDesc: '基础功能，适合个人创作者',
    proTier: '专业版',
    proDesc: '高级功能，适合专业创作者',
    studioTierTitle: '工作室版',
    studioDesc: '完整功能，适合团队协作',
    selectPlan: '选择方案',
    currentPlan: '当前方案',
    upgradedSuccess: '会员升级成功',
    
    pleaseLogin: '请先登录',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    logoutSuccess: '退出成功',
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    operationFailed: '操作失败',
    emailInvalid: '邮箱格式不正确',
    passwordTooShort: '密码长度至少6位',
    passwordNotMatch: '两次密码不一致',
    fieldRequired: '此字段为必填项',
    
    industryNews: '行业动态',
    creativeWorkshop: '创作工坊',
    friendLinks: '友情链接',
    membershipPlans: '会员方案',
    aboutUs: '关于我们',
    contactUs: '联系我们',
    privacyPolicy: '隐私政策',
    termsOfService: '使用条款'
  },
  
  en: {
    appTitle: 'AICM Workshop',
    appSubtitle: 'Full-process creation tools from script to editing',
    
    home: 'Home',
    news: 'Industry News',
    studio: 'Workshop',
    tools: 'Tools',
    scriptGenerator: 'Script Generator',
    storyboardGenerator: 'Storyboard Generator',
    videoCards: 'Video Cards',
    editing: 'Editing',
    links: 'Friend Links',
    pricing: 'Pricing',
    about: 'About Us',
    contact: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    nickname: 'Nickname',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    membershipTier: 'Membership Tier',
    free: 'Free',
    pro: 'Pro',
    studioTier: 'Studio',
    
    language: 'Language',
    chinese: '中文',
    english: 'English',
    
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    submit: 'Submit',
    back: 'Back',
    search: 'Search',
    filter: 'Filter',
    generate: 'Generate',
    loading: 'Loading...',
    confirm: 'Confirm',
    
    myWorks: 'My Works',
    workTitle: 'Work Title',
    workType: 'Work Type',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    openWork: 'Open',
    deleteWork: 'Delete',
    deleteConfirm: 'Confirm Delete',
    deleteWarning: 'Are you sure you want to delete this work? This action cannot be undone.',
    
    newsTitle: 'News Title',
    newsSummary: 'News Summary',
    newsContent: 'News Content',
    newsTags: 'Tags',
    author: 'Author',
    publishedAt: 'Published At',
    readMore: 'Read More',
    
    linkName: 'Link Name',
    linkUrl: 'Link URL',
    linkDesc: 'Link Description',
    linkTags: 'Tags',
    
    toolsIntro: 'Select a tool to start creating',
    selectGenre: 'Select Genre',
    selectLanguage: 'Select Language',
    inputPrompt: 'Input Prompt',
    storyPrompt: 'Story Prompt',
    characters: 'Characters',
    worldview: 'Worldview',
    parameters: 'Parameters',
    length: 'Length',
    pace: 'Pace',
    temperature: 'Temperature',
    generateScript: 'Generate Script',
    generateStoryboard: 'Generate Storyboard',
    scriptInput: 'Script Input',
    shotNumber: 'Shot Number',
    imageDescription: 'Image Description',
    action: 'Action',
    cameraPosition: 'Camera Position',
    dialogue: 'Dialogue',
    lighting: 'Lighting',
    narration: 'Narration',
    prompt: 'Prompt',
    materialRequirement: 'Material Requirement',
    audioEffect: 'Audio Effect',
    transition: 'Transition',
    duration: 'Duration',
    notes: 'Notes',
    addItem: 'Add',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    
    romance: 'Romance',
    scifi: 'Sci-Fi',
    mystery: 'Mystery',
    campus: 'Campus',
    family: 'Family',
    thriller: 'Thriller',
    
    pricingTitle: 'Choose Your Plan',
    pricingDesc: 'Unlock more creative features',
    freeTier: 'Free',
    freeDesc: 'Basic features for individual creators',
    proTier: 'Pro',
    proDesc: 'Advanced features for professional creators',
    studioTierTitle: 'Studio',
    studioDesc: 'Full features for team collaboration',
    selectPlan: 'Select Plan',
    currentPlan: 'Current Plan',
    upgradedSuccess: 'Membership upgraded successfully',
    
    pleaseLogin: 'Please login first',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    logoutSuccess: 'Logout successful',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    operationFailed: 'Operation failed',
    emailInvalid: 'Invalid email format',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordNotMatch: 'Passwords do not match',
    fieldRequired: 'This field is required',
    
    industryNews: 'Industry News',
    creativeWorkshop: 'Creative Workshop',
    friendLinks: 'Friend Links',
    membershipPlans: 'Membership Plans',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service'
  }
};

export default i18n;
