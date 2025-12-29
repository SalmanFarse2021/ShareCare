"use client";
import styles from './Footer.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.grid}`}>
                <div>
                    <h3 className={styles.brand}>ShareCare</h3>
                    <p className={styles.tagline}>{t('footer.tagline')}</p>
                </div>

                <div>
                    <h4>{t('footer.app')}</h4>
                    <ul>
                        <li><a href="#">{t('header.features')}</a></li>
                        <li><a href="#">{t('header.howItWorks')}</a></li>
                        <li><a href="#">{t('header.impact')}</a></li>
                    </ul>
                </div>

                <div>
                    <h4>{t('footer.company')}</h4>
                    <ul>
                        <li><a href="#">{t('footer.about')}</a></li>
                        <li><a href="#">{t('footer.careers')}</a></li>
                        <li><a href="#">{t('footer.contact')}</a></li>
                    </ul>
                </div>

                <div>
                    <h4>{t('footer.legal')}</h4>
                    <ul>
                        <li><a href="#">{t('footer.privacy')}</a></li>
                        <li><a href="#">{t('footer.terms')}</a></li>
                        <li><a href="#">{t('footer.security')}</a></li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
            </div>
        </footer>
    );
}
