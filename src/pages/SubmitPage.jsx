import { Container } from '../components/Layout.jsx';
import Comments from '../components/Comments.jsx';

export default function SubmitPage() {
  return (
    <div className="submit-page">
      <Container>
        <div className="submit-shell submit-shell-simple">
          <div className="submit-copy">
            <h1>提交你的 AI 编程作品</h1>
            <p>只需要把作品链接发给我。其他信息都可以后面再补。</p>
          </div>

          <section className="submit-dev-card">
            <div className="submit-status">
              <h2>把链接发到微信</h2>
              <p>微信：<strong>AI_ChuanQing</strong></p>
              <p>也可以发邮件到 chuanqingdai@gmail.com。</p>
              <p>如果方便，可以顺手补充使用的 AI Coding 工具，或一句话说明作品解决的问题。访问量、收入或增长数据都不是必须。</p>
            </div>

            <div className="submit-community" aria-label="交流社群二维码">
              <img
                src="/community-qr.jpg"
                alt="Uicoding.ai 交流社群二维码"
                loading="lazy"
              />
              <div>
                <strong>交流社群</strong>
                <p>一起交流 AI Coding 和一人公司的经验，也可以把作品链接发到群里。</p>
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
