"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, MapPin, Box, Activity, ShieldAlert,
    Users, BarChart3, MessageSquare, Settings, LogOut
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const navItems = [
        { label: t('dashboard.feed'), href: '/dashboard/feed', icon: Activity },
        { label: t('dashboard.points'), href: '/dashboard/points', icon: MapPin },
        { label: t('dashboard.messages'), href: '/dashboard/messages', icon: MessageSquare },
        { label: t('dashboard.users'), href: '/dashboard/users', icon: Users },
        { label: t('dashboard.moderation'), href: '/dashboard/moderation', icon: ShieldAlert },
        { label: t('dashboard.settings'), href: '/dashboard/settings', icon: Settings },
        { label: t('dashboard.logout'), action: handleLogout, icon: LogOut, isDanger: true }
    ];

    return (
        <aside className={styles.sidebar}>
            <Link href="/" className={styles.logo}>
                ShareCare
            </Link>

            <nav className={styles.nav}>
                {navItems.map((item, index) => {
                    if (item.action) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className={`${styles.navItem} ${item.isDanger ? styles.danger : ''}`}
                                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 'inherit', fontFamily: 'inherit' }}
                            >
                                <item.icon className={styles.icon} size={20} />
                                {item.label}
                            </button>
                        );
                    }
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                        >
                            <item.icon className={styles.icon} size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
