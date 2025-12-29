"use client";
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Loader2, PieChart, BarChart } from 'lucide-react';

export default function PointAnalysisPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !user) return;

        fetch(`/api/points/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && (data.data.manager?._id || data.data.manager)) {
                    const mId = data.data.manager._id || data.data.manager;
                    fetch(`/api/posts?uid=${mId}&limit=500`)
                        .then(r => r.json())
                        .then(pData => {
                            if (pData.success) setPosts(pData.data);
                        })
                        .finally(() => setLoading(false));
                }
            })
            .catch(() => setLoading(false));
    }, [id, user]);

    const stats = useMemo(() => {
        const total = posts.length;
        const active = posts.filter(p => p.status === 'active').length;
        const claimed = posts.filter(p => p.status === 'claimed').length;
        const completed = posts.filter(p => p.status === 'completed').length;

        const impactRate = total > 0 ? Math.round(((claimed + completed) / total) * 100) : 0;

        const categories = {};
        posts.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });

        // Sort categories by count
        const sortedCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count, percentage: Math.round((count / total) * 100) }));

        return { total, active, claimed, completed, impactRate, sortedCategories };
    }, [posts]);

    if (loading) return <div style={{ padding: '2rem', display: 'flex', gap: '10px' }}><Loader2 className="animate-spin" /> Loading Analysis...</div>;

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Analysis & Reports</h2>

            {/* Top Level Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatsCard title="Total Items Listed" value={stats.total} icon="📦" color="#3b82f6" />
                <StatsCard title="Distribution Rate" value={`${stats.impactRate}%`} icon="📈" color="#10b981" />
                <StatsCard title="Pending Pickup" value={stats.claimed} icon="⏳" color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Status Breakdown */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChart size={18} /> Status Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Active (Available)
                            </span>
                            <span style={{ fontWeight: '600' }}>{stats.active}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Claimed (Reserved)
                            </span>
                            <span style={{ fontWeight: '600' }}>{stats.claimed}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></span> Completed (Given)
                            </span>
                            <span style={{ fontWeight: '600' }}>{stats.completed}</span>
                        </div>
                    </div>
                </div>

                {/* Category Distribution */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart size={18} /> Top Categories
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.sortedCategories.length > 0 ? stats.sortedCategories.slice(0, 5).map((cat, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{cat.name}</span>
                                    <span style={{ color: '#6b7280' }}>{cat.count} ({cat.percentage}%)</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${cat.percentage}%`, height: '100%', background: 'var(--primary-600)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No data available</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
