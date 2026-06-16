import { MessageCircle } from 'lucide-react';
import { Container } from '../components/Layout.jsx';
import { Button, Card } from '../components/UI.jsx';

const submitTips = [
  '作品名称和访问链接',
  '使用的 AI Coding 工具',
  '你希望别人学习到的构建经验',
  '1-3 张作品截图或页面链接',
];

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <Container>
        <div className="submit-shell submit-shell-simple">
          <div className="submit-copy">
            <h1>提交你的 AI 编程作品</h1>
            <p>
              提交功能正在开发中。现阶段如果你有作品想展示，可以先加我的微信，我会手动帮你整理并发布到 Uicoding.ai。
            </p>
          </div>

          <Card className="submit-card submit-dev-card">
            <div className="submit-status">
              <span>正在开发中</span>
              <h2>先通过微信手动提交</h2>
              <p>
                后续会开放正式提交页面，支持填写作品信息、上传截图和补充构建过程。当前阶段我会先人工收集作品，保证内容质量和展示效果。
              </p>
            </div>

            <div className="submit-contact-card">
              <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
              <div>
                <strong>微信：AI_ChuanQing</strong>
                <p>也可以邮件联系：chuanqingdai@gmail.com</p>
              </div>
            </div>

            <div className="submit-tips">
              <h3>发送时可以附上</h3>
              <ul>
                {submitTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="submit-actions">
              <Button href="/cases">浏览案例</Button>
              <Button href="/" variant="ghost">返回首页</Button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
