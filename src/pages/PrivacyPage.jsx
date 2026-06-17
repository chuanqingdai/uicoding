import { Container } from '../components/Layout.jsx';
import { useI18n } from '../lib/i18n.jsx';

const privacyContent = {
  zh: {
    title: '隐私协议',
    description: '我们尽量少收集信息，只在必要场景中使用你主动提供的内容，并保持清晰、克制的处理方式。',
    items: [
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
    ],
  },
  en: {
    title: 'Privacy Policy',
    description: 'We collect as little information as possible and only use information you actively provide when it is needed.',
    items: [
      {
        title: 'Information collection',
        text: 'Uicoding.ai is currently a static content site and does not actively collect sensitive personal information. If you submit or contact us, that information is used for communication and review.',
      },
      {
        title: 'Information use',
        text: 'We do not sell personal information. Submitted project information is only used for content organization, display confirmation, and necessary site communication.',
      },
      {
        title: 'Third-party links',
        text: 'The site may include links to tool websites or external resources. When visiting third-party sites, their own privacy policies apply.',
      },
      {
        title: 'Contact',
        text: 'If you want to update or remove related content, contact us at hello@uicoding.ai.',
      },
    ],
  },
};

export default function PrivacyPage() {
  const { language } = useI18n();
  const content = privacyContent[language] ?? privacyContent.zh;

  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        <div className="info-list">
          {content.items.map((item) => (
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
