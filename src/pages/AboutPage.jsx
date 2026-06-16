import { Container } from '../components/Layout.jsx';

const aboutParagraphs = [
  '我是传庆，设计师 / 独立开发者。曾任爱奇艺设计负责人、快手总监和快影部门负责人，江南大学设计艺术学硕士。',
  '最近我正在系统学习 AI Coding，尝试一人开发独立全流程的网站，希望把设计经验和真实的编程实践结合起来。',
  '在学习 Coding 的过程中，我看到了很多非常优秀的 AI Coding 作品，也发现工具使用技巧、提示词方法、界面规范和上线经验都值得被认真整理。Uicoding.ai 希望收集这些作品和经验，供更多设计师、产品经理以及零基础学习者参考和交流，也希望大家一起向优秀开发者学习。',
  '这个网站目前是我使用 Codex 花了大约 2 天时间完成的前端项目。它还在早期阶段，内容、交互和视觉细节都会继续迭代。如果你有好的作品、工具经验或改进建议，非常欢迎告诉我。',
  '微信：AI_ChuanQing。邮箱：chuanqingdai@gmail.com。',
];

export default function AboutPage() {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>关于</h1>
        </div>
        <div className="info-article">
          {aboutParagraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </Container>
    </div>
  );
}
