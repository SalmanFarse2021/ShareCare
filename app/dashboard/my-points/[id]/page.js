"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/Dashboard/StatsCard';
import { Users, Package, Bell, ExternalLink, Edit, QrCode, Trash2 } from 'lucide-react';

export default function PointOverviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [point, setPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ items: 0 });

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this Donation Point? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/points/${id}?uid=${user?.uid}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                router.refresh();
                router.push('/dashboard/my-points');
            } else {
                alert(data.error || "Failed to delete point");
            }
        } catch (error) {
            console.error("Delete point error", error);
            alert("An error occurred");
        }
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        // 1. Fetch Point Data
        fetch(`/api/points/${id}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPoint(data.data);

                    // 2. Fetch Active Items Count (if manager exists)
                    if (data.data.manager?._id || data.data.manager) {
                        const managerId = data.data.manager._id || data.data.manager;
                        fetch(`/api/posts?uid=${managerId}&status=active`)
                            .then(r => r.json())
                            .then(pData => {
                                if (pData.success) {
                                    setStats(prev => ({ ...prev, items: pData.data.length }));
                                }
                            });
                    }
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;
    if (!point) return <div style={{ padding: '2rem' }}>Point not found</div>;

    const urgentNeeds = point.urgentNeeds?.filter(n => n.isActive) || [];

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Overview: {point.name}</h2>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatsCard
                    title="Community Followers"
                    value={point.subscribers?.length || 0}
                    icon={<Bell size={24} />}
                    color="#6366f1"
                />
                <StatsCard
                    title="Active Items"
                    value={stats.items}
                    icon={<Package size={24} />}
                    color="#10b981"
                />
                <StatsCard
                    title="Team Members"
                    value={point.team?.length || 0}
                    icon={<Users size={24} />}
                    color="#f59e0b"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Urgent Needs Preview */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Urgent Needs Board</h3>
                            <button
                                onClick={() => router.push(`/dashboard/points/${id}/edit`)}
                                style={{ fontSize: '14px', color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                                Manage
                            </button>
                        </div>

                        {urgentNeeds.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {urgentNeeds.map((need, idx) => (
                                    <span key={idx} style={{
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                                        background: need.urgency === 'critical' ? '#fef2f2' : '#eff6ff',
                                        color: need.urgency === 'critical' ? '#991b1b' : '#1e40af',
                                        border: `1px solid ${need.urgency === 'critical' ? '#fecaca' : '#bfdbfe'}`
                                    }}>
                                        {need.item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No active urgent needs listed.</div>
                        )}
                    </div>

                    {/* Point Info */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Public Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '12px', fontSize: '14px' }}>
                            <div style={{ color: '#6b7280' }}>Address:</div>
                            <div>{point.publicAddress}</div>

                            <div style={{ color: '#6b7280' }}>Status:</div>
                            <div>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                    background: point.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                    color: point.status === 'active' ? '#166534' : '#374151'
                                }}>
                                    {point.status === 'active' ? 'Open' : 'Closed'}
                                </span>
                            </div>

                            <div style={{ color: '#6b7280' }}>Contact:</div>
                            <div>{point.contact?.phone || point.contact?.email || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => window.open(`/points/${id}`, '_blank')}
                                style={{
                                    padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#374151'
                                }}>
                                <ExternalLink size={18} /> View Public Page
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/points/${id}/edit`)}
                                style={{
                                    padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#374151'
                                }}>
                                <Edit size={18} /> Edit Point Details
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/points/${id}/edit`)} // Redirects to edit where modal is
                                style={{
                                    padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#374151'
                                }}>
                                <QrCode size={18} /> Get QR Poster
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#dc2626'
                                }}>
                                <Trash2 size={18} /> Delete Point
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
