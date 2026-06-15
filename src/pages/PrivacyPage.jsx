import { Container } from '../components/Layout.jsx';

const privacyItems = [
  {
    title: '信息收集',
    text: '当前站点以静态内容展示为主，不主动收集敏感个人信息。若你通过提交或联系入口提供信息，我们仅用于沟通和作品审核。',
  },
  {
    title: '信息使用',
    text: '我们不会出售你的个人信息。提交的作品信息只会用于内容整理、展示确认和必要的站点沟通。',
  },
  {
    title: '第三方链接',
    text: '站点可能包含工具官网或外部资源链接。访问第三方网站时，请以对方的隐私政策为准。',
  },
  {
    title: '联系我们',
    text: '如果你希望修改或移除相关内容，可以通过 hello@uicoding.ai 联系我们。',
  },
];

export default function PrivacyPage() {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>隐私协议</h1>
          <p>
            我们尽量少收集信息，只在必要场景中使用你主动提供的内容，并保持清晰、克制的处理方式。
          </p>
        </div>
        <div className="info-list">
          {privacyItems.map((item) => (
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
