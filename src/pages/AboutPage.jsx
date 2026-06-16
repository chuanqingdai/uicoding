import { Container } from '../components/Layout.jsx';

const aboutItems = [
  {
    title: '关于我',
    text: '我是传庆，设计师 / 独立开发者。曾任爱奇艺设计负责人、快手总监和快影部门负责人，江南大学设计艺术学硕士。最近我正在系统学习 AI Coding，希望把设计经验和真实的编程实践结合起来。',
  },
  {
    title: '为什么创建 Uicoding.ai',
    text: '在学习 Coding 的过程中，我看到了很多非常优秀的 AI Coding 作品，也发现很多工具使用技巧、提示词方法、界面规范和上线经验值得被整理出来。这个网站希望收集这些作品和经验，供更多设计师、产品经理和零基础学习者参考、交流，并向优秀开发者学习。',
  },
  {
    title: '这个网站如何完成',
    text: 'Uicoding.ai 目前是我使用 Codex 花了大约 2 天时间完成的前端项目。它还在早期阶段，很多内容、交互和视觉细节都会继续迭代。如果你有好的作品、工具经验或改进建议，非常欢迎告诉我。',
  },
  {
    title: '联系我',
    text: '微信：AI_ChuanQing。邮箱：chuanqingdai@gmail.com。',
  },
];

export default function AboutPage() {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>关于 Uicoding.ai</h1>
          <p>
            这是一个面向设计师、产品经理和代码零基础人群的 AI Coding 学习与交流网站。
          </p>
        </div>
        <div className="info-list">
          {aboutItems.map((item) => (
            <section className="info-block" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
