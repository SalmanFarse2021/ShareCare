"use client";
import styles from './Messenger.module.css';

export default function MessagesPage() {
    return (
        <div className={styles.emptyState}>
            <h2>Select a chat or start a new conversation</h2>
        </div>
    );
}
