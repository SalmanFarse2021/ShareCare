"use client";
import styles from './Hero.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.content}`}>
        <div className={styles.left}>
          <span className={styles.badge}>{t('hero.badge')}</span>
          <h1 className={styles.title}>
            {t('hero.title')} <span className="text-gradient">{t('hero.titleGradient')}</span>
          </h1>
          <p className={styles.description}>
            {t('hero.description')}
          </p>
          <div className={styles.actions}>
            <button className="btn btn-primary">{t('hero.downloadIOS')}</button>
            <button className="btn btn-secondary">{t('hero.downloadAndroid')}</button>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.phoneMockup}>
            <div className={styles.screen}>
              <div className={styles.appHeader}></div>
              <div style={{ padding: '10px' }}>
                <div style={{ width: '60%', height: '20px', background: '#e0e7ff', borderRadius: '4px', marginBottom: '10px' }}></div>
                <div className={styles.feedItem}></div>
                <div className={styles.feedItem}></div>
                <div className={styles.feedItem}></div>
              </div>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✓</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t('hero.donationMatched')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>2 {t('hero.minsAgo')}</div>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>❤</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t('hero.newRequest')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{t('hero.nearby')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
