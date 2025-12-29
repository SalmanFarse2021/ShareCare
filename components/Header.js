"use client";
import styles from './Header.module.css';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
    const { user, signOut } = useAuth();
    const { t, changeLanguage, language } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleLanguage = () => {
        const langs = ['en', 'bn', 'es'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        changeLanguage(langs[nextIndex]);
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logo}>
                    <span>ShareCare</span>
                </Link>
                {/* Mobile menu toggle button */}
                <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
                    <a href="#features" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>{t('header.features')}</a>
                    <a href="#how-it-works" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>{t('header.howItWorks')}</a>
                    <a href="#impact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>{t('header.impact')}</a>

                    {user ? (
                        <div className={styles.userActions}>
                            <Link href="/dashboard" className={styles.userMenu} onClick={() => setIsMenuOpen(false)}>
                                <div className={styles.avatar}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" />
                                    ) : (
                                        <span>{user.isAnonymous ? 'G' : (user.email?.charAt(0).toUpperCase() || 'U')}</span>
                                    )}
                                </div>
                                <span className={styles.dashboardLink}>Dashboard</span>
                            </Link>
                            <button
                                onClick={() => { signOut(); setIsMenuOpen(false); }}
                                className={styles.logoutLink}
                                aria-label="Logout"
                            >
                                {t('auth.logout') || "Logout"}
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className={`btn btn-primary ${styles.cta}`} onClick={() => setIsMenuOpen(false)}>{t('header.login')}</Link>
                    )}
                    <button onClick={toggleLanguage} className={styles.langBtn}>
                        {language === 'en' ? '🇧🇩 BN' : language === 'bn' ? '🇪🇸 ES' : '🇺🇸 EN'}
                    </button>
                </nav>
            </div>
        </header>
    );
}
