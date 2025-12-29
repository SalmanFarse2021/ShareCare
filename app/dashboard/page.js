"use client";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import QuickActions from '@/components/Dashboard/QuickActions';
import RecentActivity from '@/components/Dashboard/RecentActivity';
import styles from './page.module.css';

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const userName = user?.displayName || user?.email?.split('@')[0] || "User";

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>{t('dashboard.welcome')} {userName} 👋</h1>
                    <p className={styles.subtitle}>{t('dashboard.overview')}</p>
                </div>
            </header>

            <div className={styles.statsGrid}>
                <StatsCard
                    title={t('dashboard.stats.impact')}
                    value="12"
                    icon="🌟"
                    color="#f59e0b"
                />
                <StatsCard
                    title={t('dashboard.stats.meals')}
                    value="45"
                    icon="🍲"
                    color="#10b981"
                />
                <StatsCard
                    title={t('dashboard.stats.items')}
                    value="8"
                    icon="📦"
                    color="#6366f1"
                />
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.mainContent}>
                    <h3>{t('dashboard.quickActions.title')}</h3>
                    <QuickActions />
                </div>
                <div className={styles.sideContent}>
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}
