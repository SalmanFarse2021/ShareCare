"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Users, Mail, Trash2, Check, X } from 'lucide-react';

export default function TeamPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [team, setTeam] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'volunteer' });
    const [generatedCode, setGeneratedCode] = useState(null);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`/api/points/${id}/team`);
            const data = await res.json();
            if (data.success) {
                setTeam(data.team);
                // Determine current user's role for UI permissions
                const me = data.team.find(m => m.user && m.user.email === user.email);
                // If I am the manager (not in team array but owner), API should probably return owner info or I check against point.manager (not fetched here yet).
                // Ideally API returns "myRole". For now, assuming if I can access this page I have some role, or I am the owner. 
                // Hack: If not found in team, assume Manager (Owner).
                setCurrentUserRole(me ? me.role : 'manager');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && user) fetchTeam();
    }, [id, user]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/points/${id}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'invite',
                    actingUserUid: user.uid,
                    ...inviteData
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedCode(data.inviteCode);
                fetchTeam();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Invite failed');
        }
    };

    const handleApprove = async (memberId) => {
        try {
            const res = await fetch(`/api/points/${id}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    actingUserUid: user.uid,
                    memberId
                })
            });
            if (res.ok) fetchTeam();
            else {
                const d = await res.json();
                alert(d.error);
            }
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleRemove = async (memberId) => {
        if (!confirm('Remove/Reject this member?')) return;
        try {
            const res = await fetch(`/api/points/${id}/team?memberId=${memberId}&uid=${user.uid}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchTeam();
        } catch (error) {
            alert('Failed to remove');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading team...</div>;

    const activeMembers = team.filter(m => m.status === 'active' || m.status === 'invited');
    const pendingRequests = team.filter(m => m.status === 'pending_request');

    const canInvite = currentUserRole === 'manager'; // Only Manager invites
    const canApprove = currentUserRole === 'manager' || currentUserRole === 'member'; // Member/Manager approves

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Team Management</h1>
                    <p style={{ color: 'var(--neutral-600)' }}>Manage roles, requests, and staff.</p>
                </div>
                {canInvite && (
                    <button
                        onClick={() => setShowInvite(true)}
                        style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Users size={18} /> Invite Member
                    </button>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div style={{ marginBottom: '2rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', background: '#ffedd5', fontWeight: 'bold', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} /> Pending Requests ({pendingRequests.length})
                    </div>
                    {pendingRequests.map(member => (
                        <div key={member._id} style={{ padding: '1rem', borderBottom: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {member.user?.photoURL ? <img src={member.user.photoURL} style={{ width: '100%', borderRadius: '50%' }} /> : '👤'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{member.user?.displayName || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.875rem' }}>wants to join as <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{member.role}</span></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {canApprove && (
                                    <>
                                        <button onClick={() => handleApprove(member._id)} style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={16} /> Approve
                                        </button>
                                        <button onClick={() => handleRemove(member._id)} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <X size={16} /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Invite Modal */}
            {showInvite && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Invite New Member</h3>

                        {!generatedCode ? (
                            <form onSubmit={handleInvite}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={inviteData.email}
                                        onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                        placeholder="colleague@example.com"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                                    <select
                                        value={inviteData.role}
                                        onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                    >
                                        <option value="volunteer">Volunteer</option>
                                        <option value="member">Member</option>
                                        {/* Manager cannot invite another manager directly normally, but keeping flexibility if needed, though hidden for now per prompt */}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowInvite(false)} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Generate Invite</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 'bold' }}>Invite Created!</p>
                                    <p style={{ fontSize: '0.875rem' }}>Share this code with the user:</p>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>{generatedCode}</div>
                                </div>
                                <button type="button" onClick={() => { setShowInvite(false); setGeneratedCode(null); }} style={{ width: '100%', padding: '0.75rem', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Team List */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Member</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Role</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Schedule</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeMembers.map(member => (
                            <tr key={member._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {member.user ? (
                                            <>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {member.user.photoURL ? <img src={member.user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <Users size={20} color="#9ca3af" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{member.user.displayName || 'Unknown'}</div>
                                                    {member.showContact && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{member.user.email}</div>}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Mail size={20} color="#ef4444" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500', fontStyle: 'italic', color: '#6b7280' }}>Pending Invite</div>
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Code: {member.inviteCode}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize',
                                        background: member.role === 'manager' ? '#eff6ff' : (member.role === 'member' ? '#f0fdf4' : '#f3f4f6'),
                                        color: member.role === 'manager' ? '#1d4ed8' : (member.role === 'member' ? '#15803d' : '#374151')
                                    }}>
                                        {member.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                    {member.schedule || '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {currentUserRole === 'manager' && (
                                        <button
                                            onClick={() => handleRemove(member._id)}
                                            style={{ padding: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            title="Remove Member"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
