import { Container } from '../components/Layout.jsx';
import Comments from '../components/Comments.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function SubmitPage() {
  const { language, t } = useI18n();
  const showCommunity = language === 'zh';

  return (
    <div className="submit-page">
      <Container>
        <div className="submit-shell submit-shell-simple">
          <div className="submit-copy">
            <h1>{t('submit.title')}</h1>
            <p>{t('submit.description')}</p>
          </div>

          <section className="submit-dev-card">
            <div className="submit-status">
              <h2>{t('submit.heading')}</h2>
              {showCommunity && <p>{t('submit.wechat')}<strong>AI_ChuanQing</strong></p>}
              <p>{t('submit.email')}</p>
              <p>{t('submit.note')}</p>
            </div>

            {showCommunity && (
              <div className="submit-community" aria-label="交流社群二维码">
                <img
                  src="/community-qr.jpg"
                  alt="Uicoding.ai 交流社群二维码"
                  loading="lazy"
                />
                <div>
                  <strong>{t('submit.community')}</strong>
                  <p>{t('submit.communityDescription')}</p>
                </div>
              </div>
            )}
          </section>

          <Comments
            targetId="submit"
            targetType="submit"
            title={t('submit.comments')}
          />
        </div>
      </Container>
    </div>
  );
}
