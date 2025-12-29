"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';

export default function JoinPointPage() {
    const { user } = useAuth();
    const { id } = useParams(); // pointId
    const searchParams = useSearchParams();
    const router = useRouter();

    // Auto-fill code if present in URL ?code=...
    const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '');
    const [schedule, setSchedule] = useState('');
    const [showContact, setShowContact] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!agreed) return alert('You must agree to the Code of Conduct');

        setLoading(true);
        try {
            const res = await fetch(`/api/points/${id}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviteCode,
                    schedule,
                    showContact,
                    firebaseUid: user.uid
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Welcome to the team!');
                router.push(`/dashboard/points/${id}/team`);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to join');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Shield size={48} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Join Team</h1>
                <p style={{ color: 'var(--neutral-600)' }}>Complete your onboarding to become an active member.</p>
            </div>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Invite Code */}
                <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Invite Code</label>
                    <input
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        required
                        style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* Availability */}
                <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Your Availability / Schedule</label>
                    <input
                        value={schedule}
                        onChange={e => setSchedule(e.target.value)}
                        placeholder="e.g. Mon-Fri 9am-5pm"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* Contact Pref */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <input
                        type="checkbox"
                        checked={showContact}
                        onChange={e => setShowContact(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label style={{ fontSize: '0.875rem', color: '#374151' }}>
                        Allow other team members to see my email/phone in the directory.
                    </label>
                </div>

                {/* Code of Conduct */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Code of Conduct</h3>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.6' }}>
                        <li>Treat all donors, recipients, and staff with respect and dignity.</li>
                        <li>Maintain confidentiality of sensitive data.</li>
                        <li>Do not discriminate based on race, religion, or background.</li>
                        <li>Report any safety concerns to the manager immediately.</li>
                    </ul>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label style={{ fontWeight: '500' }}>
                            I have read and agree to the Code of Conduct.
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !agreed}
                    style={{
                        padding: '1rem',
                        background: agreed ? 'var(--primary-600)' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: agreed ? 'pointer' : 'not-allowed'
                    }}
                >
                    {loading ? 'Joining...' : 'Accept & Join Team'}
                </button>
            </form>
        </div>
    );
}
