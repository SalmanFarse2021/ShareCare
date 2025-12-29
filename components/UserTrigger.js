"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserTrigger({ user, children, style = {} }) {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!user || !user.uid) return <span style={style}>{children}</span>;

    const isMe = currentUser?.uid === user.uid;

    const handleMessage = async () => {
        if (!currentUser) {
            alert("Please login to message.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentUserId: currentUser.uid,
                    targetUserId: user.uid
                })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/dashboard/messages/${data.data._id}`);
            } else {
                alert("Failed to start chat: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            <div
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                style={{ cursor: 'pointer', display: 'inline-flex', ...style }}
            >
                {children}
            </div>

            {/* Modal/Popover */}
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        width: '90%', maxWidth: '320px', position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }} onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="#666" />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: user.photoURL ? `url(${user.photoURL})` : '#e0e7ff',
                                backgroundSize: 'cover', margin: '0 auto 12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px', fontWeight: 'bold', color: '#4338ca'
                            }}>
                                {!user.photoURL && user.displayName?.charAt(0)}
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px' }}>
                                {user.displayName || 'Anonymous'}
                            </h3>
                            {isMe && <span style={{ fontSize: '12px', color: '#666' }}>(That's you)</span>}
                        </div>

                        {!isMe && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={handleMessage}
                                    disabled={loading}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        background: 'var(--primary-600)', color: 'white',
                                        border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    <MessageCircle size={20} />
                                    {loading ? 'Starting Chat...' : 'Send Message'}
                                </button>
                                {/* Future: View Profile Button */}
                                {/* <button style={{ ... }}>View Profile</button> */}
                            </div>
                        )}

                        {isMe && (
                            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                                This is your public profile preview.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
