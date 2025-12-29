"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Trash2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

export default function PointInventoryPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [managerId, setManagerId] = useState(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!id || !user) return;

        // Fetch Point to get Manager ID first
        fetch(`/api/points/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && (data.data.manager?._id || data.data.manager)) {
                    const mId = data.data.manager._id || data.data.manager;
                    setManagerId(mId);
                    fetchPosts(mId);
                }
            })
            .catch(err => setLoading(false));

    }, [id, user]);

    const fetchPosts = async (uid) => {
        try {
            const res = await fetch(`/api/posts?uid=${uid}&limit=200`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (postId, newStatus) => {
        try {
            // Optimistic update
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: newStatus } : p));

            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: { uid: user.uid },
                    status: newStatus
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
        } catch (error) {
            alert('Failed to update status');
            // Revert on failure involves refetching or complex state management, simplified here for now
            fetchPosts(managerId);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm("Are you sure you want to delete this item permanently?")) return;

        try {
            setPosts(prev => prev.filter(p => p._id !== postId)); // Optimistic delete

            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
        } catch (error) {
            alert('Failed to delete item');
            fetchPosts(managerId);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div style={{ padding: '2rem', display: 'flex', gap: '10px' }}><Loader2 className="animate-spin" /> Loading Inventory...</div>;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Inventory Management</h2>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>Track stock levels and manage item status.</p>
                </div>
                <div style={{
                    padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '14px', fontWeight: '600'
                }}>
                    Total Items: {posts.length}
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white' }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="claimed">Claimed</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Item Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <tr key={post._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{post.title}</td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', textTransform: 'capitalize' }}>{post.category}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select
                                            value={post.status}
                                            onChange={(e) => handleStatusUpdate(post._id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: 'none',
                                                background: post.status === 'active' ? '#dcfce7' : post.status === 'claimed' ? '#fef3c7' : '#f3f4f6',
                                                color: post.status === 'active' ? '#166534' : post.status === 'claimed' ? '#92400e' : '#374151',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="claimed">Claimed</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            style={{ padding: '6px', color: '#ef4444', background: '#fee2e2', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                            title="Delete Item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                                    No items found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
