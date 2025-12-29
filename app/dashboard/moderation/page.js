"use client";
import { useLanguage } from '@/context/LanguageContext';

export default function ModerationPage() {
    const { t } = useLanguage();
    return (
        <div>
            <h1>{t('dashboard.moderation')}</h1>
            <p>Review flagged items and community reports.</p>
        </div>
    );
}
