import { MessageCircle } from 'lucide-react';
import { Container } from '../components/Layout.jsx';
import Comments from '../components/Comments.jsx';

const submitTips = [
  '发一个作品链接',
  '简单说下使用的工具',
  '有访问量或收入数据可以顺手补充',
];

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <Container>
        <div className="submit-shell submit-shell-simple">
          <div className="submit-copy">
            <h1>提交你的 AI 编程作品</h1>
          </div>

          <section className="submit-card submit-dev-card">
            <div className="submit-status">
              <h2>把作品链接发给我就行</h2>
              <p>我会人工查看作品，再整理成适合学习和展示的案例。</p>
            </div>

            <div className="submit-contact" aria-label="提交联系方式">
              <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
              <div>
                <strong>微信：AI_ChuanQing</strong>
                <p>也可以邮件联系：chuanqingdai@gmail.com</p>
              </div>
            </div>

            <div className="submit-tips">
              <h3>不用准备太多</h3>
              <ul>
                {submitTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="submit-community" aria-label="交流社群二维码">
              <img
                src="/community-qr.jpg"
                alt="Uicoding.ai 交流社群二维码"
                loading="lazy"
              />
              <div>
                <strong>交流社群</strong>
                <p>交流 AI Coding 和一人公司的经验，也可以直接把作品链接发过来。</p>
              </div>
            </div>
          </section>

          <Comments
            targetId="submit"
            targetType="submit"
            title="评论"
          />
        </div>
      </Container>
    </div>
  );
}
