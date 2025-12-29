"use client";
import styles from './DownloadCTA.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function DownloadCTA() {
    const { t } = useLanguage();

    return (
        <section id="download" className={styles.cta}>
            <div className="container">
                <div className={styles.content}>
                    <h2>{t('cta.title')}</h2>
                    <p>{t('cta.description')}</p>
                    <div className={styles.buttons}>
                        <button className="btn btn-primary">{t('cta.downloadIOS')}</button>
                        <button className="btn btn-secondary">{t('cta.downloadAndroid')}</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
