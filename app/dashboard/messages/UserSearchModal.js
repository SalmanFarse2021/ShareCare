"use client";
import { useState, useEffect } from 'react';
import styles from './Messenger.module.css';
import { Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserSearchModal({ onClose }) {
    const { user } = useAuth();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // We need an API to search users. 
                // Assuming /api/users/search?q=XYZ exists or we use a general users endpoint
                // If not, we might need to create it. For now, let's assume we can search via a new endpoint or existing.
                // Since I haven't seen /api/users/search, I will assume I need to create it or mock it.
                // Let's rely on finding by email or name if possible.
                // EDIT: I will create/use /api/users if available.

                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.success) {
                    setResults(data.data.filter(u => u.uid !== user.uid)); // Exclude self
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, user.uid]);

    const startChat = async (targetUserId) => {
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentUserId: user.uid,
                    targetUserId: targetUserId
                })
            });
            const data = await res.json();
            if (data.success) {
                onClose();
                router.push(`/dashboard/messages/${data.data._id}`);
            } else {
                alert('Failed to start chat');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: '0' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>New Message</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
                    <div className={styles.searchWrapper}>
                        <span style={{ color: '#65676b' }}>To:</span>
                        <input
                            className={styles.searchInput}
                            placeholder="Type a name or email"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {loading && <div style={{ padding: '16px', textAlign: 'center', color: '#65676b' }}>Searching...</div>}

                    {!loading && results.map(u => (
                        <div key={u.uid} className={styles.chatItem} onClick={() => startChat(u.uid)}>
                            <div className={styles.avatarContainer}>
                                {u.photoURL ? (
                                    <img src={u.photoURL} alt={u.displayName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatar}>
                                        {u.displayName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatName}>{u.displayName}</div>
                                <div className={styles.lastMessage} style={{ fontSize: '12px' }}>{u.email}</div>
                            </div>
                        </div>
                    ))}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#65676b' }}>No results found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
