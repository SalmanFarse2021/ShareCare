"use client";
import styles from './HowItWorks.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function HowItWorks() {
    const { t } = useLanguage();

    const steps = [
        {
            num: "01",
            title: t('howItWorks.step1'),
            desc: t('howItWorks.step1Desc')
        },
        {
            num: "02",
            title: t('howItWorks.step2'),
            desc: t('howItWorks.step2Desc')
        },
        {
            num: "03",
            title: t('howItWorks.step3'),
            desc: t('howItWorks.step3Desc')
        }
    ];

    return (
        <section id="how-it-works" className={styles.section}>
            <div className="container">
                <div className={styles.heading}>
                    <h2>{t('howItWorks.title')}</h2>
                    <p>{t('howItWorks.subtitle')}</p>
                </div>

                <div className={styles.steps}>
                    {steps.map((step, i) => (
                        <div key={i} className={styles.step}>
                            <div className={styles.number}>{step.num}</div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
