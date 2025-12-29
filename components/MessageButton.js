"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MessageButton({ targetUserId, label = "Message", style = {} }) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleMessage = async (e) => {
        e.preventDefault(); // Prevent parent Link clicks
        e.stopPropagation();

        if (!user) {
            alert("Please login to message.");
            return;
        }

        if (user.uid === targetUserId) return; // Can't message self

        setLoading(true);
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
                router.push(`/dashboard/messages/${data.data._id}`);
            } else {
                alert("Failed to start chat: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.uid === targetUserId) return null;

    return (
        <button
            onClick={handleMessage}
            disabled={loading}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '16px',
                background: '#f0f2f5', color: '#050505',
                border: 'none', cursor: 'pointer', fontWeight: '600',
                fontSize: '14px', ...style
            }}
        >
            <MessageCircle size={18} />
            {loading ? '...' : label}
        </button>
    );
}
