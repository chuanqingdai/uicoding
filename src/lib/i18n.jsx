import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'uicoding_language';

export const languages = {
  zh: '中文',
  en: 'English',
};

const supportedLanguages = Object.keys(languages);

const translations = {
  zh: {
    'common.more': '更多',
    'common.submit': '提交作品',
    'common.view': '查看',
    'common.viewCase': '查看案例',
    'common.viewLesson': '查看资料',
    'common.visitWebsite': '访问官网',
    'common.keepBrowsing': '继续向下浏览',
    'common.allCasesShown': '已显示全部案例',
    'common.allLessonsShown': '已显示全部资料',
    'common.allToolsShown': '已显示全部工具',
    'nav.cases': '案例',
    'nav.learn': '学习',
    'nav.tools': '工具',
    'home.hero.title': '从真实作品学习 AI 编程',
    'home.hero.description': '代码零基础人群的交流社区，一起学习工具使用技巧、界面设计和上线经验。',
    'home.hero.browse': '浏览案例',
    'home.hero.submit': '提交作品',
    'home.recommend.today': '今日推荐',
    'home.cases.title': '案例',
    'home.cases.description': '拆解真实作品的构建思路、提示词和界面设计方法。',
    'home.learn.title': '学习',
    'home.learn.description': '为设计师、产品经理和独立开发者准备的学习资料。',
    'home.tools.title': '工具',
    'home.tools.description': '了解不同工具适合什么场景。',
    'home.submit.title': '分享你的AI编程作品',
    'home.submit.description': '如果你用 AI 做出了一个真实项目，欢迎提交给更多人学习和拆解。',
    'cases.title': '案例',
    'cases.description': '浏览真实 AI 编程作品，学习它们的构建思路、提示词、工具组合、界面设计和上线过程。',
    'cases.sortLabel': '排序方式',
    'cases.latest': '最新',
    'cases.hot': '最热',
    'cases.type': '类型',
    'cases.emptyTitle': '暂时没有匹配的案例',
    'cases.emptyDescription': '试试切换类型，回到全部案例继续浏览。',
    'cases.viewAll': '查看全部',
    'cases.filters.allTypes': '全部类型',
    'learn.title': '学会 AI Coding',
    'learn.description': '从真实案例、可复制提示词和产品拆解开始，尽快把想法做成能上线的网页和工具。',
    'learn.categoryLabel': '学习资料分类',
    'learn.topics.all': '全部',
    'learn.topics.codex': 'Codex',
    'learn.topics.claude': 'Claude',
    'learn.topics.monetization': '商业变现',
    'learn.topics.prompts': '提示词',
    'learn.topics.workflow': '工作流',
    'learn.topics.team': '团队落地',
    'tools.title': '工具',
    'tools.description': '了解常用 AI Coding 工具的定位、适合场景和使用方式，快速找到适合自己的开发工作流。',
    'submit.title': '提交你的 AI 编程作品',
    'submit.description': '只需要把作品链接发给我。其他信息都可以后面再补。',
    'submit.heading': '把链接发到微信',
    'submit.wechat': '微信：',
    'submit.email': '也可以发邮件到 chuanqingdai@gmail.com。',
    'submit.note': '如果方便，可以顺手补充使用的 AI Coding 工具，或一句话说明作品解决的问题。访问量、收入或增长数据都不是必须。',
    'submit.community': '交流社群',
    'submit.communityDescription': '交流 AI Coding 和一人公司的经验',
    'submit.comments': '评论',
    'detail.visitWebsite': '访问网站',
    'detail.comments': '评论',
    'detail.relatedCases': '类似案例',
    'detail.relatedCasesDescription': '继续查看更多值得拆解的 AI 编程作品。',
    'detail.moreLearning': '更多学习资料',
    'detail.moreLearningDescription': '继续阅读与这个主题相关的 AI 编程学习内容。',
    'detail.caseNotFound': '案例不存在',
    'detail.caseNotFoundDescription': '这个案例可能已被移除，或链接地址不正确。',
    'detail.backToCases': '返回案例列表',
    'detail.lessonNotFound': '学习资料不存在',
    'detail.lessonNotFoundDescription': '这篇资料可能已被移除，或链接地址不正确。',
    'detail.backToLearn': '返回学习资料',
    'detail.email': 'Email',
    'detail.wechat': 'WeChat',
    'detail.copied': '已复制',
    'detail.copyWechat': '复制微信',
    'detail.website': '个人网站',
    'detail.following': '已关注',
    'detail.follow': '关注提交者',
    'detail.defaultSubmitterBio': '分享 AI 编程作品和实践经验。',
    'detail.copy': '复制',
    'detail.copyablePrompt': '可复制提示词',
    'detail.sourceAddress': '原文地址：',
    'detail.viewOriginal': '查看英文原文',
    'comments.emptyName': '点击评论生成昵称',
    'comments.defaultTitle': '评论',
    'comments.countSuffix': '条',
    'comments.shortError': '写一点你的想法再发布。',
    'comments.placeholder': '写下想法或问题。',
    'comments.note': '首次评论会生成昵称。',
    'comments.publish': '发布',
    'footer.description': '代码零基础人群的交流社区，一起学习工具使用技巧、界面设计和上线经验。',
    'footer.explore': '探索',
    'footer.site': '站点',
    'footer.cases': '案例',
    'footer.learn': '学习资料',
    'footer.submit': '提交作品',
    'footer.about': '关于',
    'footer.privacy': '隐私协议',
    'seo.home.description': '代码零基础人群的交流社区，一起学习工具使用技巧、界面设计和上线经验。',
    'seo.cases.title': 'AI 编程案例',
    'seo.cases.description': '浏览真实 AI 编程作品，学习构建思路、提示词、工具组合、界面设计和上线过程。',
    'seo.learn.title': 'AI 编程学习资料',
    'seo.learn.description': '面向零基础用户的 AI 编程教程、工具使用方法、提示词经验和真实项目复盘。',
    'seo.tools.title': 'AI 编程工具',
    'seo.tools.description': '了解常用 AI Coding 工具的定位、适合场景和使用方式。',
    'seo.submit.title': '提交 AI 编程作品',
    'seo.submit.description': '把你的 AI 编程作品链接发给 Uicoding.ai，一起交流 AI Coding 和一人公司的经验。',
  },
  en: {
    'common.more': 'More',
    'common.submit': 'Submit',
    'common.view': 'View',
    'common.viewCase': 'View case',
    'common.viewLesson': 'Read',
    'common.visitWebsite': 'Visit website',
    'common.keepBrowsing': 'Keep browsing',
    'common.allCasesShown': 'All cases loaded',
    'common.allLessonsShown': 'All resources loaded',
    'common.allToolsShown': 'All tools loaded',
    'nav.cases': 'Cases',
    'nav.learn': 'Learn',
    'nav.tools': 'Tools',
    'home.hero.title': 'Learn AI Coding from Real Work',
    'home.hero.description': 'A community for non-coders to learn AI coding tools, interface design, and launch experience.',
    'home.hero.browse': 'Browse cases',
    'home.hero.submit': 'Submit work',
    'home.recommend.today': 'Editor’s Pick',
    'home.cases.title': 'Cases',
    'home.cases.description': 'Study real products, prompts, tool choices, and interface decisions.',
    'home.learn.title': 'Learn',
    'home.learn.description': 'Guides for designers, product managers, and indie builders.',
    'home.tools.title': 'Tools',
    'home.tools.description': 'Understand which AI coding tools fit different workflows.',
    'home.submit.title': 'Share your AI coding work',
    'home.submit.description': 'Built a real project with AI? Submit it so more people can learn from it.',
    'cases.title': 'Cases',
    'cases.description': 'Browse real AI coding projects and learn how they were structured, prompted, designed, and launched.',
    'cases.sortLabel': 'Sort',
    'cases.latest': 'Latest',
    'cases.hot': 'Hot',
    'cases.type': 'Type',
    'cases.emptyTitle': 'No matching cases yet',
    'cases.emptyDescription': 'Try another type, or return to all cases.',
    'cases.viewAll': 'View all',
    'cases.filters.allTypes': 'All types',
    'learn.title': 'Learn AI Coding',
    'learn.description': 'Start with real cases, reusable prompts, and product breakdowns so ideas can become live pages and tools faster.',
    'learn.categoryLabel': 'Learning topics',
    'learn.topics.all': 'All',
    'learn.topics.codex': 'Codex',
    'learn.topics.claude': 'Claude',
    'learn.topics.monetization': 'Monetization',
    'learn.topics.prompts': 'Prompts',
    'learn.topics.workflow': 'Workflow',
    'learn.topics.team': 'Team adoption',
    'tools.title': 'Tools',
    'tools.description': 'Understand common AI coding tools, what they are best at, and how they fit into your workflow.',
    'submit.title': 'Submit your AI coding work',
    'submit.description': 'Just send the project link. Everything else can be added later.',
    'submit.heading': 'Send the project link',
    'submit.wechat': 'WeChat: ',
    'submit.email': 'Email: chuanqingdai@gmail.com',
    'submit.note': 'If convenient, add the tool you used or one sentence about what the product does. Extra metrics are optional.',
    'submit.community': 'Community',
    'submit.communityDescription': 'Discuss AI coding and one-person company experience',
    'submit.comments': 'Comments',
    'detail.visitWebsite': 'Visit website',
    'detail.comments': 'Comments',
    'detail.relatedCases': 'Related cases',
    'detail.relatedCasesDescription': 'Explore more AI coding work worth studying.',
    'detail.moreLearning': 'More learning resources',
    'detail.moreLearningDescription': 'Continue reading related AI coding resources.',
    'detail.caseNotFound': 'Case not found',
    'detail.caseNotFoundDescription': 'This case may have been removed, or the link is incorrect.',
    'detail.backToCases': 'Back to cases',
    'detail.lessonNotFound': 'Resource not found',
    'detail.lessonNotFoundDescription': 'This learning resource may have been removed, or the link is incorrect.',
    'detail.backToLearn': 'Back to learning',
    'detail.email': 'Email',
    'detail.wechat': 'WeChat',
    'detail.copied': 'Copied',
    'detail.copyWechat': 'Copy WeChat',
    'detail.website': 'Website',
    'detail.following': 'Following',
    'detail.follow': 'Follow',
    'detail.defaultSubmitterBio': 'Shares AI coding work and practical experience.',
    'detail.copy': 'Copy',
    'detail.copyablePrompt': 'Copyable prompt',
    'detail.sourceAddress': 'Source: ',
    'detail.viewOriginal': 'Read original',
    'comments.emptyName': 'Comment to get a nickname',
    'comments.defaultTitle': 'Comments',
    'comments.countSuffix': '',
    'comments.shortError': 'Write a little more before publishing.',
    'comments.placeholder': 'Share a thought or question.',
    'comments.note': 'A local nickname will be created when you comment.',
    'comments.publish': 'Post',
    'footer.description': 'A community for non-coders to learn AI coding tools, interface design, and launch experience.',
    'footer.explore': 'Explore',
    'footer.site': 'Site',
    'footer.cases': 'Cases',
    'footer.learn': 'Learning',
    'footer.submit': 'Submit',
    'footer.about': 'About',
    'footer.privacy': 'Privacy',
    'seo.home.description': 'A community for non-coders to learn AI coding tools, interface design, and launch experience.',
    'seo.cases.title': 'AI Coding Cases',
    'seo.cases.description': 'Browse real AI coding projects and learn their structure, prompts, tools, interface design, and launch process.',
    'seo.learn.title': 'AI Coding Learning Resources',
    'seo.learn.description': 'Beginner-friendly AI coding tutorials, tool guides, prompt practices, and real project notes.',
    'seo.tools.title': 'AI Coding Tools',
    'seo.tools.description': 'Understand common AI coding tools, their positioning, use cases, and workflows.',
    'seo.submit.title': 'Submit AI Coding Work',
    'seo.submit.description': 'Send your AI coding project link to Uicoding.ai and join the AI coding community.',
  },
};

const categoryLabels = {
  en: {
    全部类型: 'All types',
    数据看板: 'Dashboard',
    官网: 'Website',
    客户管理: 'CRM',
    提示词工具: 'Prompt tool',
    'SaaS 产品': 'SaaS',
    游戏: 'Game',
    音乐: 'Music',
    教育: 'Education',
    医疗: 'Healthcare',
    安全工具: 'Security',
    电商: 'E-commerce',
    内容工具: 'Content tool',
    其他: 'Other',
  },
};

const I18nContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (supportedLanguages.includes(saved)) {
    return saved;
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language].filter(Boolean);
  const normalizedLanguages = browserLanguages.map((item) => item.toLowerCase());
  const preferredLanguage = normalizedLanguages.find((item) => item.startsWith('zh'))
    ? 'zh'
    : normalizedLanguages.find((item) => item.startsWith('en'))
      ? 'en'
      : 'en';

  return preferredLanguage;
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => {
    const t = (key) => translations[language]?.[key] ?? translations.zh[key] ?? key;
    const categoryLabel = (label) => categoryLabels[language]?.[label] ?? label;

    return {
      categoryLabel,
      language,
      setLanguage: (nextLanguage) => {
        if (supportedLanguages.includes(nextLanguage)) {
          setLanguage(nextLanguage);
        }
      },
      t,
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'zh' : 'en')),
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
