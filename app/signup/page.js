"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css"; // Reuse login styles
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { googleSignIn } = useAuth();
    const { t } = useLanguage();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(t('auth.errorParams'));
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('auth.signupTitle')}</h1>
                    <p className={styles.subtitle}>{t('auth.signupSubtitle')}</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">{t('auth.email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">{t('auth.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                        {t('auth.signup')}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>{t('auth.or')}</span>
                </div>

                <button onClick={async () => {
                    try {
                        await googleSignIn();
                        router.push("/dashboard");
                    } catch (err) {
                        setError(err.message);
                    }
                }} className={styles.googleBtn}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
                    {t('auth.google')}
                </button>

                <div className={styles.footer}>
                    {t('auth.hasAccount')} <Link href="/login">{t('auth.login')}</Link>
                </div>
            </div>
        </div>
    );
}
