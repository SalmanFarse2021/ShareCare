"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, Edit } from 'lucide-react';
import styles from './Messenger.module.css';
import { usePathname } from 'next/navigation';
import UserSearchModal from './UserSearchModal';
import io from 'socket.io-client';

let socket;

export default function ChatSidebar() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const pathname = usePathname();

    // Fetch initial chats
    useEffect(() => {
        if (user) {
            fetch(`/api/chats?userId=${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setChats(data.data);
                })
                .finally(() => setLoading(false));
        }
    }, [user]);

    const [onlineUsers, setOnlineUsers] = useState(new Set());

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!user) return;

        fetch('/api/socket/io').finally(() => {
            socket = io({ path: '/api/socket/io', addTrailingSlash: false });

            socket.on('connect', () => {
                socket.emit('register_user', user.uid);
            });

            socket.on('online_users_list', (userIds) => {
                setOnlineUsers(new Set(userIds));
            });

            socket.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => new Set(prev).add(userId));
            });

            socket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            });

            // Listen for new messages to update sidebar list
            socket.on('receive_message', (message) => {
                // Reload chats to refresh order and last message
                // Optimization: Manually update state without fetch, but fetch is safer for consistency
                fetch(`/api/chats?userId=${user.uid}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) setChats(data.data);
                    });
            });
        });

        return () => {
            if (socket) socket.disconnect();
        }
    }, [user]);

    if (loading) return <div className={styles.sidebar}><div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div></div>;

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className={styles.sidebarTitle}>Chats</h1>
                    <button
                        className={styles.iconButton}
                        style={{ background: '#f0f2f5', color: 'black' }}
                        onClick={() => setShowNewMessageModal(true)}
                    >
                        <Edit size={20} />
                    </button>
                </div>
                <div className={styles.searchWrapper}>
                    <Search size={16} color="#65676b" />
                    <input className={styles.searchInput} placeholder="Search Messenger" />
                </div>
            </div>

            <div className={styles.chatList}>
                {chats.map(chat => {
                    const other = chat.participants.find(p => p.user !== user.uid) || { displayName: 'Unknown' };
                    const isActive = pathname === `/dashboard/messages/${chat._id}`;

                    return (
                        <Link key={chat._id} href={`/dashboard/messages/${chat._id}`} className={`${styles.chatItem} ${isActive ? styles.active : ''}`}>
                            <div className={styles.avatarContainer}>
                                {other.photoURL ? (
                                    <img src={other.photoURL} alt={other.displayName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatar}>
                                        {other.displayName.charAt(0)}
                                    </div>
                                )}
                                {onlineUsers.has(other.user) && <div className={styles.onlineBadge}></div>}
                            </div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatName}>{other.displayName}</div>
                                <div className={styles.lastMessage}>
                                    {chat.lastMessage ? (
                                        <>
                                            {chat.lastMessage.senderId === user.uid ? 'You: ' : ''}
                                            {chat.lastMessage.text}
                                        </>
                                    ) : 'Started a chat'}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {showNewMessageModal && (
                <UserSearchModal onClose={() => setShowNewMessageModal(false)} />
            )}
        </div>
    );
}

