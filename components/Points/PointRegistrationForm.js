"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/Feed/MapPicker';
import { MapPin, Clock, Upload, CheckCircle } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

export default function PointRegistrationForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Load Script for Map
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const [formData, setFormData] = useState({
        name: '',
        type: 'ngo_office',
        description: '',
        publicLocation: null,
        privateLocation: null,
        publicAddress: '',
        privateAddress: '',
        serviceRadius: 5,
        allowedItems: ['food', 'clothes'],
        phone: '',
        email: user?.email || '',

        status: 'active' // Auto-activate
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxMessage = (type) => {
        setFormData(prev => {
            const items = prev.allowedItems.includes(type)
                ? prev.allowedItems.filter(i => i !== type)
                : [...prev.allowedItems, type];
            return { ...prev, allowedItems: items };
        });
    };

    const handleLocationSelect = (locData) => {
        // locData: { exact: { coordinates, address }, approx: { coordinates, address } }
        setFormData(prev => ({
            ...prev,
            publicLocation: {
                type: 'Point',
                coordinates: locData.approx.coordinates
            },
            privateLocation: {
                type: 'Point',
                coordinates: locData.exact.coordinates
            },
            publicAddress: locData.approx.address,
            privateAddress: locData.exact.address
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                manager: user.uid,
                team: [{ user: user.uid, role: 'manager' }]
            };

            const res = await fetch('/api/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert('Point created and activated successfully!');
                router.push('/dashboard/points');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert('Failed to register: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
                Register Donation Point
            </h2>

            {/* Progress Steps */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: step >= i ? 'var(--primary-600)' : 'var(--neutral-200)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>{i}</div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Point Name</label>
                            <input
                                name="name" required
                                value={formData.name} onChange={handleChange}
                                placeholder="e.g. Downtown Community Center"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                            <select
                                name="type" required
                                value={formData.type} onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="ngo_office">NGO Office</option>
                                <option value="community_center">Community Center</option>
                                <option value="mosque">Mosque</option>
                                <option value="church">Church</option>
                                <option value="disaster_camp">Disaster Camp</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description} onChange={handleChange}
                                placeholder="Briefly describe your center..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px' }}
                            />
                        </div>
                        <button type="button" onClick={() => setStep(2)}
                            style={{ padding: '0.75rem', background: 'var(--primary-600)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                            Next: Location
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
                            <div
                                onClick={() => setShowMap(true)}
                                style={{
                                    padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px',
                                    cursor: 'pointer', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <MapPin size={20} color="var(--primary-600)" />
                                {formData.privateAddress ? formData.privateAddress : "Select on Map"}
                            </div>
                            {formData.publicAddress && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
                                    Publicly shown as: <strong>{formData.publicAddress}</strong>
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Service Radius (km)</label>
                            <input
                                type="number" name="serviceRadius" min="1" max="50"
                                value={formData.serviceRadius} onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setStep(1)}
                                style={{ flex: 1, padding: '0.75rem', background: 'var(--neutral-200)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                Back
                            </button>
                            <button type="button" onClick={() => { if (!formData.privateLocation) return alert('Please select a location'); setStep(3); }}
                                style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-600)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                Next: Operations
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Allowed Items</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['food', 'clothes', 'essentials', 'medicine'].map(item => (
                                    <button
                                        key={item} type="button"
                                        onClick={() => handleCheckboxMessage(item)}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '20px',
                                            border: `1px solid ${formData.allowedItems.includes(item) ? 'var(--primary-600)' : '#ccc'}`,
                                            background: formData.allowedItems.includes(item) ? 'var(--primary-50)' : 'white',
                                            color: formData.allowedItems.includes(item) ? 'var(--primary-700)' : 'black',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {item.charAt(0).toUpperCase() + item.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contact Phone</label>
                            <input
                                name="phone" required
                                value={formData.phone} onChange={handleChange}
                                placeholder="+1 234 567 890"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setStep(2)}
                                style={{ flex: 1, padding: '0.75rem', background: 'var(--neutral-200)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                Back
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ flex: 2, padding: '0.75rem', background: 'var(--primary-600)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                {loading ? 'Creating Point...' : 'Create Point'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Map Picker Modal */}
            {isLoaded && (
                <MapPicker
                    isOpen={showMap}
                    onClose={() => setShowMap(false)}
                    onConfirm={handleLocationSelect}
                />
            )}
        </div>
    );
}
