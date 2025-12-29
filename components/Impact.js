"use client";
import styles from './Impact.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function Impact() {
    const { t } = useLanguage();

    return (
        <section id="impact" className={styles.impact}>
            <div className="container">
                <h2 className={styles.title}>{t('impact.title')}</h2>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.number}>50k+</span>
                        <span className={styles.label}>{t('impact.mealsShared')}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.number}>12k+</span>
                        <span className={styles.label}>{t('impact.itemsRehomed')}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.number}>150+</span>
                        <span className={styles.label}>{t('impact.donationPoints')}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.number}>24/7</span>
                        <span className={styles.label}>{t('impact.communitySupport')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
