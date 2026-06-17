import { Container } from '../components/Layout.jsx';
import { useI18n } from '../lib/i18n.jsx';

const aboutContent = {
  zh: {
    title: '关于',
    description: '这里记录我为什么做这个站，以及它希望为正在学习 AI Coding 的人提供什么价值。',
    sections: [
      {
        title: '我是谁',
        paragraphs: [
          '我是传庆，设计师 / 独立开发者。曾任爱奇艺设计负责人、快手总监和快影部门负责人，江南大学设计艺术学硕士。',
          '最近我正在系统学习 AI Coding，尝试一人完成一个网站从设计到开发的完整流程，把设计经验和真实的编程实践放在一起验证。',
        ],
      },
      {
        title: '为什么做 Uicoding.ai',
        paragraphs: [
          '在学习 Coding 的过程中，我看到很多很好的 AI Coding 作品，也发现工具使用技巧、提示词方法、界面规范和上线经验都值得被认真整理。',
          'Uicoding.ai 想做的，是把这些真实作品和经验持续整理出来，供设计师、产品经理以及零基础学习者参考、比较和交流。',
        ],
      },
      {
        title: '当前状态',
        paragraphs: [
          '这个网站目前是我使用 Codex 花了大约 2 天时间完成的前端项目，仍然处在早期阶段。',
          '内容、交互和视觉细节都会继续迭代。如果你有好的作品、工具经验或改进建议，欢迎随时联系我。',
        ],
      },
      {
        title: '联系方式',
        paragraphs: ['微信：AI_ChuanQing', '邮箱：chuanqingdai@gmail.com'],
        compact: true,
      },
    ],
  },
  en: {
    title: 'About',
    description: 'Why this site exists, and what it hopes to offer people learning AI coding.',
    sections: [
      {
        title: 'Who I am',
        paragraphs: [
          'I am Chuanqing, a designer and indie builder. I previously led design at iQIYI, worked as a director at Kuaishou, and led the Kuaiying product design team. I hold a master’s degree in design from Jiangnan University.',
          'I am currently learning AI coding systematically and using it to build complete web products as a solo creator, connecting design experience with real development practice.',
        ],
      },
      {
        title: 'Why Uicoding.ai exists',
        paragraphs: [
          'While learning coding, I found many excellent AI coding projects and realized that tool workflows, prompt methods, interface standards, and launch experience deserve to be collected carefully.',
          'Uicoding.ai is meant to organize these real works and practical notes for designers, product managers, and beginners who want to learn by studying good examples.',
        ],
      },
      {
        title: 'Current status',
        paragraphs: [
          'This site is an early-stage frontend project built with Codex in about two days.',
          'Content, interaction, and visual details will continue to evolve. If you have good work, tool experience, or feedback, feel free to reach out.',
        ],
      },
      {
        title: 'Contact',
        paragraphs: ['Email: chuanqingdai@gmail.com'],
        compact: true,
      },
    ],
  },
};

export default function AboutPage() {
  const { language } = useI18n();
  const content = aboutContent[language] ?? aboutContent.zh;

  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        <div className="info-list">
          {content.sections.map((section) => (
            <section className={`info-block ${section.compact ? 'info-block-compact' : ''}`} key={section.title}>
              <h2>{section.title}</h2>
              <div className="info-block-copy">
                {section.paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
