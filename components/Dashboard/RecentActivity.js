"use client";
import styles from './Widgets.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function RecentActivity() {
    const { t } = useLanguage();

    // Mock data
    const activities = [
        { type: 'donation', title: 'Rice Bags Shared', time: '2 hours ago', icon: '🍚' },
        { type: 'request', title: 'Winter Jacket Requested', time: '5 hours ago', icon: '🧥' }
    ];

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('dashboard.activity.title')}</h3>
            <div className={styles.activityList}>
                {activities.length > 0 ? (
                    activities.map((item, id) => (
                        <div key={id} className={styles.activityItem}>
                            <div className={styles.activityIcon} style={{ background: '#e0e7ff' }}>{item.icon}</div>
                            <div className={styles.activityDetails}>
                                <div className={styles.activityTitle}>{item.title}</div>
                                <div className={styles.activityTime}>{item.time}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>{t('dashboard.activity.empty')}</p>
                )}
            </div>
        </div>
    );
}
