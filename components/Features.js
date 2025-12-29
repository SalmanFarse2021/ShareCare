"use client";
import styles from './Features.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function Features() {
    const { t } = useLanguage();

    const features = [
        {
            title: t('features.socialFeed'),
            description: t('features.socialFeedDesc'),
            icon: "📰"
        },
        {
            title: t('features.aiMatching'),
            description: t('features.aiMatchingDesc'),
            icon: "🤖"
        },
        {
            title: t('features.privacy'),
            description: t('features.privacyDesc'),
            icon: "🔐"
        },
        {
            title: t('features.fixedPoints'),
            description: t('features.fixedPointsDesc'),
            icon: "📍"
        }
    ];

    return (
        <section id="features" className={`section ${styles.features}`}>
            <div className="container">
                <div className={styles.heading}>
                    <h2>{t('features.title')} <span className="text-gradient">{t('features.titleGradient')}</span></h2>
                    <p>{t('features.subtitle')}</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
