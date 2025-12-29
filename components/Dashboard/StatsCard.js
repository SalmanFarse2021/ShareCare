"use client";
import styles from './Widgets.module.css';

export default function StatsCard({ title, value, icon, color }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardContent}>
                <div>
                    <p className={styles.cardTitle}>{title}</p>
                    <h3 className={styles.cardValue}>{value}</h3>
                </div>
                <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20`, color: color }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
