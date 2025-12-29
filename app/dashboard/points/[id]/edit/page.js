"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Trash2, QrCode, Printer, Plus } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function EditPointPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [newNeed, setNewNeed] = useState('');
    const [newNeedUrgency, setNewNeedUrgency] = useState('normal');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        email: '',
        status: 'active',
        allowedItems: [],
        schedule: '',
        urgentNeeds: []
    });

    useEffect(() => {
        if (!user) return;
        fetch(`/api/points/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const p = data.data;
                    setFormData({
                        name: p.name || '',
                        description: p.description || '',
                        phone: p.phone || (p.contact?.phone || ''),
                        email: p.email || (p.contact?.email || ''),
                        status: p.status || 'active',
                        allowedItems: p.allowedItems || [],
                        schedule: p.schedule || '',
                        urgentNeeds: p.urgentNeeds || []
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemToggle = (item) => {
        setFormData(prev => {
            const items = prev.allowedItems.includes(item)
                ? prev.allowedItems.filter(i => i !== item)
                : [...prev.allowedItems, item];
            return { ...prev, allowedItems: items };
        });
    };

    const handleAddNeed = () => {
        if (!newNeed.trim()) return;
        setFormData(prev => ({
            ...prev,
            urgentNeeds: [...prev.urgentNeeds, { item: newNeed, urgency: newNeedUrgency, isActive: true }]
        }));
        setNewNeed('');
        setNewNeedUrgency('normal');
    };

    const handleRemoveNeed = (index) => {
        setFormData(prev => ({
            ...prev,
            urgentNeeds: prev.urgentNeeds.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update structure to match schema for contact
            const updatePayload = {
                ...formData,
                contact: {
                    phone: formData.phone,
                    email: formData.email
                }
            };

            const res = await fetch(`/api/points/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    updates: updatePayload
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Changes saved!');
                // Don't redirect, let them keep editing or use QR
                // router.push('/dashboard/points'); 
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handlePrintQR = () => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head><title>Print QR Poster</title></head>
                <body style="text-align: center; font-family: sans-serif; padding: 2rem;">
                    <h1>${formData.name}</h1>
                    <p>Scan to view details and donate!</p>
                    <br/>
                    ${document.getElementById('qr-code-svg').outerHTML}
                    <br/><br/>
                    <p style="color: #666; font-size: 0.8rem;">Powered by ShareCare</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    const publicUrl = `${window.location.origin}/points/${id}`;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>Edit Point Details</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    style={{
                        padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #e5e7eb',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        fontWeight: '600', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <QrCode size={18} /> Get QR Poster
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Status */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    >
                        <option value="active">Active (Open)</option>
                        <option value="maintenance">Maintenance (Temporarily Closed)</option>
                    </select>
                </div>

                {/* Name */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Point Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* Description */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description (Bio)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                {/* Urgent Needs Manager */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>🚨 Urgent Needs</label>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Display specific items you critically need right now.</p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            placeholder="e.g. Winter Blankets"
                            value={newNeed}
                            onChange={(e) => setNewNeed(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <select
                            value={newNeedUrgency}
                            onChange={(e) => setNewNeedUrgency(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleAddNeed}
                            style={{ padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {formData.urgentNeeds.map((need, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: need.urgency === 'critical' ? '#dc2626' : need.urgency === 'high' ? '#ea580c' : '#22c55e'
                                    }}></span>
                                    <span style={{ fontWeight: '500' }}>{need.item}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>{need.urgency}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNeed(idx)}
                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Accepted Items Categories</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['food', 'clothes', 'essentials', 'medicine', 'books', 'toys'].map(item => (
                            <button
                                key={item} type="button"
                                onClick={() => handleItemToggle(item)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '20px',
                                    border: `1px solid ${formData.allowedItems.includes(item) ? 'var(--primary-600)' : '#ccc'}`,
                                    background: formData.allowedItems.includes(item) ? 'var(--primary-50)' : 'white',
                                    color: formData.allowedItems.includes(item) ? 'var(--primary-700)' : 'black',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={async () => {
                            if (confirm('Are you sure you want to delete this donation point? This action cannot be undone.')) {
                                setSaving(true);
                                try {
                                    const res = await fetch(`/api/points/${id}?uid=${user.uid}`, {
                                        method: 'DELETE'
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        alert('Point deleted');
                                        router.push('/dashboard/points');
                                    } else {
                                        alert(data.error);
                                    }
                                } catch (error) {
                                    alert('Failed to delete');
                                } finally {
                                    setSaving(false);
                                }
                            }
                        }}
                        style={{
                            padding: '0.75rem 1.5rem', background: '#fee2e2', color: '#b91c1c',
                            border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                        }}
                    >
                        <Trash2 size={20} /> Delete Point
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '0.75rem 2rem', background: 'var(--primary-600)', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                        }}
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* QR Modal */}
            {showQRModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Shareable Poster</h2>
                        <div style={{ background: '#f3f4f6', padding: '2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <QRCode
                                id="qr-code-svg"
                                value={publicUrl}
                                size={200}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                            <p style={{ marginTop: '1rem', fontWeight: '600' }}>{formData.name}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowQRModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                            <button onClick={handlePrintQR} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Printer size={18} /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
