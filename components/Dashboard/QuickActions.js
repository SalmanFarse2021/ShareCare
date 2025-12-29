"use client";
import styles from './Widgets.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function QuickActions() {
    const { t } = useLanguage();

    return (
        <div className={styles.grid}>
            <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>🎁</span>
                <span className={styles.actionLabel}>{t('dashboard.quickActions.donate')}</span>
            </button>
            <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>📢</span>
                <span className={styles.actionLabel}>{t('dashboard.quickActions.request')}</span>
            </button>
        </div>
    );
}
