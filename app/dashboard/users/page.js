"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Search, MessageSquare, User as UserIcon } from 'lucide-react';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) setUsers(data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2rem' }}>Loading community members...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Community Members</h1>
                    <p style={{ color: '#6b7280' }}>Connect with {users.length} other members.</p>
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 10px 10px 40px',
                            borderRadius: '8px', border: '1px solid #e5e7eb',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                {filteredUsers.map(user => (
                    <div key={user._id} style={{
                        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                        overflow: 'hidden', transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6',
                                overflow: 'hidden', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
                                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>

                            <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>
                                {user.displayName || 'Anonymous User'}
                            </h3>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                                Member since {new Date(user.createdAt).getFullYear()}
                            </p>

                            {currentUser && currentUser.uid !== user.firebaseUid && (
                                <Link
                                    href="#" // Ideally initiate chat via API then redirect
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: Trigger chat creation handled in UserSearchModal logic usually
                                        // For now, let's just create a chat and redirect manually if needed, 
                                        // OR open the modal. Simplified: Just link to messages for now.
                                        window.location.href = '/dashboard/messages';
                                    }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 16px', background: '#eff6ff', color: '#2563eb',
                                        borderRadius: '20px', textDecoration: 'none', fontWeight: '500', fontSize: '14px'
                                    }}
                                >
                                    <MessageSquare size={16} />
                                    Message
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No members found matching "{searchTerm}"
                </div>
            )}
        </div>
    );
}
