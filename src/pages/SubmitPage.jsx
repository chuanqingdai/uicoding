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
          </div>

          <Card className="submit-card submit-dev-card">
            <div className="submit-status">
              <h2>先通过微信手动提交</h2>
              <p>
                把作品链接和简短说明发给我即可。当前阶段不收取提交费用，我会先人工确认内容质量和展示效果。
              </p>
            </div>

            <div className="submit-contact" aria-label="提交联系方式">
              <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
              <div>
                <strong>微信：AI_ChuanQing</strong>
                <p>也可以邮件联系：chuanqingdai@gmail.com</p>
              </div>
            </div>

            <div className="submit-tips">
              <h3>建议附上</h3>
              <ul>
                {submitTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="submit-actions">
              <Button href="/cases">浏览案例</Button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
