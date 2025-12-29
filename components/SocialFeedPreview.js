"use client";
import styles from './SocialFeedPreview.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function SocialFeedPreview() {
    const { t } = useLanguage();

    const feedItems = [
        { emoji: "🍛", item: "Warm Rice Meals", distance: "0.5km", status: t('feed.reserved'), isBooked: false },
        { emoji: "🧥", item: "Winter Jackets", distance: "1.2km", status: "Available", isBooked: false },
        { emoji: "🥦", item: "Fresh Vegetables", distance: "0.8km", status: t('feed.reserved'), isBooked: true },
        { emoji: "📚", item: "School Textbooks", distance: "2.5km", status: "Available", isBooked: false },
        { emoji: "💊", item: "First Aid Kits", distance: "1.0km", status: "Available", isBooked: false },
    ];

    return (
        <section className={`section ${styles.feedSection}`}>
            <div className="container">
                <div className={styles.title}>
                    <h2>{t('feed.title')} <span className="text-gradient">{t('feed.titleGradient')}</span></h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('feed.subtitle')}</p>
                </div>

                <div className={styles.feedContainer}>
                    {feedItems.map((item, i) => (
                        <div key={i} className={styles.feedCard}>
                            <div className={styles.imagePlaceholder}>{item.emoji}</div>
                            <div className={styles.content}>
                                <div className={styles.header}>
                                    <span className={styles.distance}>📍 {item.distance}</span>
                                    <span className={`${styles.status} ${item.isBooked ? styles.booked : ''}`}>
                                        {item.isBooked ? t('feed.reserved') : 'Available'}
                                    </span>
                                </div>
                                <div className={styles.itemName}>{item.item}</div>
                                <div className={styles.donor}>{t('feed.by')} Donor {i + 1}</div>
                                <div className={styles.actions}>
                                    <button className={styles.btnRequest} disabled={item.isBooked}>
                                        {item.isBooked ? t('feed.reserved') : t('feed.requestItem')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
