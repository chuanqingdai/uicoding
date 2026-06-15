import { Container } from '../components/Layout.jsx';

const aboutItems = [
  {
    title: '我们做什么',
    text: 'Uicoding.ai 是面向设计师和产品经理等代码零基础人群的交流社区，帮助大家学习工具使用技巧、界面设计和上线经验。',
  },
  {
    title: '适合谁',
    text: '这里适合设计师、产品经理、独立开发者，以及任何希望用 AI 更高效完成产品原型和前端项目的人。',
  },
  {
    title: '内容原则',
    text: '我们优先呈现可学习、可复盘、界面质量较高的作品，让案例和资料保持简洁、真实、可实践。',
  },
];

export default function AboutPage() {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>关于 Uicoding.ai</h1>
          <p>
            面向设计师和产品经理等代码零基础人群的交流社区，一起学习工具使用技巧、界面设计和上线经验。
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
