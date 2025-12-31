"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Check, X, Trash2, Shield, Clock, Plus } from 'lucide-react';

export default function TeamManagementPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [manager, setManager] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of item being acted on

    useEffect(() => {
        if (!id || !user) return;
        fetchData();
    }, [id, user]);

    const fetchData = async () => {
        try {
            // Need to fetch point to get manager info + team array populated
            // The team API returns pure team array, but we might want manager details separately if not in team
            // Let's use the main point details API for comprehensive data
            const res = await fetch(`/api/points/${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setTeam(data.data.team || []);
                setManager(data.data.manager); // Assuming populated
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (memberId) => {
        setActionLoading(memberId);
        try {
            const res = await fetch(`/api/points/${id}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    memberId,
                    actingUserUid: user.uid
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchData(); // Refresh list
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (memberId, isReject = false) => {
        if (!isReject && !confirm("Are you sure you want to remove this member?")) return;

        setActionLoading(memberId);
        try {
            const res = await fetch(`/api/points/${id}/team?memberId=${memberId}&uid=${user.uid}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Team...</div>;

    const pendingRequests = team.filter(m => m.status === 'pending_request');
    const activeMembers = team.filter(m => m.status === 'active');

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Team Management</h2>
                <p style={{ color: '#6b7280' }}>Manage roles, requests, and staff.</p>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div style={{ marginBottom: '32px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} className="text-amber-600" />
                        <h3 style={{ fontWeight: '600', fontSize: '16px' }}>Pending Requests</h3>
                    </div>
                    <div>
                        {pendingRequests.map(req => (
                            <div key={req._id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 24px', borderBottom: '1px solid #f3f4f6'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden' }}>
                                        {req.user?.photoURL ? (
                                            <img src={req.user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#9ca3af" /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{req.user?.displayName || 'Unknown User'}</div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Wants to join as <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{req.role}</span></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleApprove(req._id)}
                                        disabled={actionLoading === req._id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px', background: '#dcfce7', color: '#166534',
                                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
                                        }}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleRemove(req._id, true)}
                                        disabled={actionLoading === req._id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px', background: '#fee2e2', color: '#991b1b',
                                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
                                        }}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Members */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '16px' }}>Current Team</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '500' }}>Member</th>
                            <th style={{ padding: '16px 24px', fontWeight: '500' }}>Role</th>
                            <th style={{ padding: '16px 24px', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Manager Row */}
                        {manager && (
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {manager.displayName?.[0] || 'M'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{manager.displayName}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{manager.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ padding: '4px 10px', background: '#ffedd5', color: '#c2410c', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                        Manager
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>Active</span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>Owner</span>
                                </td>
                            </tr>
                        )}

                        {activeMembers.length > 0 ? activeMembers.map(member => (
                            <tr key={member._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden' }}>
                                            {member.user?.photoURL ? (
                                                <img src={member.user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#9ca3af" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{member.user?.displayName || 'Unknown'}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
                                        background: member.role === 'member' ? '#dbeafe' : '#f3f4f6',
                                        color: member.role === 'member' ? '#1e40af' : '#374151'
                                    }}>
                                        {member.role}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>Active</span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleRemove(member._id)}
                                        disabled={actionLoading === member._id}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                        title="Remove Member"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                                    No other team members yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
