"use client";
import styles from './Messenger.module.css';
import ChatSidebar from './ChatSidebar';

export default function MessagesLayout({ children }) {
    return (
        <div className={styles.messengerContainer}>
            <ChatSidebar />
            <main className={styles.mainChat}>
                {children}
            </main>
        </div>
    );
}
