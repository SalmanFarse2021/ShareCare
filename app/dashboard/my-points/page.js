"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';

export default function MyPointsPage() {
    const { user } = useAuth();
    const [myPoints, setMyPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/points?manager=${user.uid}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success) setMyPoints(data.data);
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/dashboard/points">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', marginBottom: '1rem' }}>
                        <ArrowLeft size={18} /> Back to Directory
                    </button>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Points</h1>
                    <Link href="/dashboard/points/create">
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', background: 'var(--primary-600)', color: 'white',
                            borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
                        }}>
                            <Plus size={18} /> Register New
                        </button>
                    </Link>
                </div>
            </div>

            {myPoints.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {myPoints.map(point => (
                        <div key={point._id} style={{
                            background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{point.name}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>{point.publicAddress}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link href={`/dashboard/my-points/${point._id}`}>
                                    <button style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        Manage Point
                                    </button>
                                </Link>
                                <Link href={`/dashboard/points/${point._id}/edit`}>
                                    <button style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        Edit Details
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
                    You don't have any points yet. Create one to get started!
                </div>
            )}
        </div>
    );
}
