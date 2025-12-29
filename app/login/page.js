"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { User, LogIn } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { googleSignIn } = useAuth();
    const { t } = useLanguage();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard/feed");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
                <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>

                {error && <div className={styles.error}>⚠️ {error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">{t('auth.email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">{t('auth.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                        {t('auth.login')}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>{t('auth.or')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button onClick={async () => {
                        try {
                            await googleSignIn();
                            router.push("/dashboard/feed");
                        } catch (err) {
                            setError(err.message);
                        }
                    }} className={styles.googleBtn}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
                        {t('auth.google')}
                    </button>
                </div>

                <div className={styles.footer}>
                    {t('auth.noAccount')} <Link href="/signup">{t('auth.signup')}</Link>
                </div>
            </div>
        </div>
    );
}

