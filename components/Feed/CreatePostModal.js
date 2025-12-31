"use client";
import { useState, useEffect } from 'react';
import { X, Camera, MapPin, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Feed.module.css';
import LocationSearch from './LocationSearch';
import MapPicker from './MapPicker';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

export default function CreatePostModal({ isOpen, onClose, editPost = null }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'food',
        condition: 'new',
        quantity: '1',
        unit: '',
        description: '',
        isAnonymous: false,
        source: 'individual',
        locationAddress: '',
        locationCoordinates: null,
        expiryDate: '',
        availability: '24h',
        images: []
    });

    // Populate form if editing
    // Populate form if editing, or reset if creating
    useEffect(() => {
        if (isOpen) {
            if (editPost) {
                setFormData({
                    title: editPost.title || '',
                    type: editPost.type || 'food',
                    condition: editPost.condition || 'new',
                    quantity: editPost.quantity || '1',
                    unit: editPost.unit || '',
                    description: editPost.description || '',
                    isAnonymous: editPost.isAnonymous || false,
                    source: editPost.source || 'individual',
                    locationAddress: editPost.location?.address || '',
                    locationCoordinates: editPost.location?.coordinates || null,
                    expiryDate: editPost.expiryDate ? new Date(editPost.expiryDate).toISOString().split('T')[0] : '',
                    availability: editPost.availabilityDuration || '24h',
                    images: [], // Keep empty for new uploads
                });
            } else {
                // Reset for new post
                setFormData({
                    title: '',
                    type: 'food',
                    condition: 'new',
                    quantity: '1',
                    unit: '',
                    description: '',
                    isAnonymous: false,
                    source: 'individual',
                    locationAddress: '',
                    locationCoordinates: null,
                    expiryDate: '',
                    availability: '24h',
                    images: []
                });
            }
        }
    }, [isOpen, editPost]);

    // Point Search State
    const [pointQuery, setPointQuery] = useState('');
    const [pointResults, setPointResults] = useState([]);
    const [showPointResults, setShowPointResults] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Debounced Point Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pointQuery.length >= 2 && !selectedPoint) {
                fetch(`/api/points/search?q=${encodeURIComponent(pointQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setPointResults(data.data);
                            setShowPointResults(true);
                        }
                    });
            } else {
                setPointResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [pointQuery, selectedPoint]);

    if (!isOpen) return null;

    const handlePointSelect = (point) => {
        setPointQuery(point.name);
        setSelectedPoint(point);
        setShowPointResults(false);
        setFormData(prev => ({
            ...prev,
            locationAddress: point.publicAddress,
            locationCoordinates: point.publicLocation?.coordinates || null
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (name === 'source') {
            // Reset point selection if source changes
            if (value !== 'donation_point') {
                setSelectedPoint(null);
                setPointQuery('');
            }
        }

        if (type === 'file') {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newFiles]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({
            ...prev,
            locationAddress: data.address,
            locationCoordinates: data.coordinates
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation for Donation Point
        if (formData.source === 'donation_point' && !selectedPoint) {
            setError("Please select a valid Donation Point.");
            setLoading(false);
            return;
        }

        try {
            const uploadedImageUrls = [];

            // Upload new images
            if (formData.images.length > 0) {
                for (const file of formData.images) {
                    const uploadData = new FormData();
                    uploadData.append('file', file);

                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadData,
                    });

                    const uploadResult = await uploadRes.json();
                    if (!uploadResult.success) throw new Error('Image upload failed');
                    uploadedImageUrls.push(uploadResult.url);
                }
            }

            // Combine with existing images if editing
            const finalImages = editPost
                ? [...(editPost.images || []), ...uploadedImageUrls]
                : uploadedImageUrls;

            const postData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                condition: formData.condition,
                quantity: formData.quantity,
                unit: formData.unit,
                user: {
                    uid: user?.uid,
                    displayName: formData.isAnonymous ? 'Anonymous' : (user?.displayName || 'User'),
                    photoURL: formData.isAnonymous ? null : (user?.photoURL || null)
                },
                status: 'active',
                images: finalImages,
                location: {
                    address: formData.locationAddress,
                    coordinates: formData.locationCoordinates
                },
                expiryDate: formData.type === 'food' ? formData.expiryDate : null,
                availabilityDuration: formData.availability,
                source: formData.source,
                isAnonymous: formData.isAnonymous,
                point: selectedPoint ? selectedPoint._id : null
            };

            const url = editPost ? `/api/posts/${editPost._id}` : '/api/posts';
            const method = editPost ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            const result = await response.json();

            if (!result.success) throw new Error(result.error || 'Failed to save post');

            onClose();
        } catch (err) {
            console.error("Error saving post:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <MapPicker
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onConfirm={handleLocationSelect}
                initialLocation={{
                    address: formData.locationAddress,
                    coordinates: formData.locationCoordinates
                }}
            />

            <div className={styles.modal} style={{ display: isMapOpen ? 'none' : 'block' }}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.label} style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                            {editPost ? 'Edit Post' : t('feed.post.modalTitle')}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                            {editPost ? 'Update details below' : t('feed.post.modalSubtitle')}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalForm}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                Error: {error}
                            </div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label}>{t('feed.post.titleLabel')}</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                type="text"
                                className={styles.input}
                                placeholder={t('feed.post.titlePlaceholder')}
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>{t('feed.post.typeLabel')}</label>
                                <select name="type" value={formData.type} onChange={handleChange} className={styles.selectInput}>
                                    <option value="food">Food</option>
                                    <option value="clothes">Clothes</option>
                                    <option value="essentials">Essentials</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>{t('feed.post.conditionLabel')}</label>
                                <select name="condition" value={formData.condition} onChange={handleChange} className={styles.selectInput}>
                                    <option value="new">New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>{t('feed.post.quantityLabel')}</label>
                                <input
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    type="number"
                                    className={styles.input}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>{t('feed.post.unitLabel')}</label>
                                <input
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    type="text"
                                    className={styles.input}
                                    placeholder={t('feed.post.unitPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Post From</label>
                                <select name="source" value={formData.source} onChange={handleChange} className={styles.selectInput}>
                                    <option value="individual">Individual</option>
                                    <option value="donation_point">Donation Point</option>
                                    <option value="walk_in">Walk-in Log</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Availability</label>
                                <select name="availability" value={formData.availability} onChange={handleChange} className={styles.selectInput}>
                                    <option value="24h">24 Hours</option>
                                    <option value="48h">48 Hours</option>
                                    <option value="7d">1 Week</option>
                                    <option value="permanent">Until Claimed</option>
                                </select>
                            </div>
                        </div>

                        {formData.source === 'donation_point' && (
                            <div className={styles.field} style={{ position: 'relative' }}>
                                <label className={styles.label}>Donation Point Name</label>
                                <input
                                    type="text"
                                    value={pointQuery}
                                    onChange={(e) => {
                                        setPointQuery(e.target.value);
                                        setSelectedPoint(null); // Reset selection on edit
                                    }}
                                    className={styles.input}
                                    placeholder="Start typing to search points..."
                                />
                                {showPointResults && pointResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem',
                                        zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {pointResults.map(p => (
                                            <div
                                                key={p._id}
                                                onClick={() => handlePointSelect(p)}
                                                style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                                                className="hover:bg-gray-50"
                                            >
                                                <div style={{ fontWeight: '500' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.publicAddress}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label}>Location (Approximate)</label>
                            {isLoaded ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <LocationSearch
                                            onLocationSelect={handleLocationSelect}
                                            defaultValue={formData.locationAddress}
                                        // Lock location if point selected? Or allow overwrite? 
                                        // User requested "put one extra box... autofill address". 
                                        // Best to allow editing but default to point.
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsMapOpen(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0 0.75rem',
                                            background: 'var(--neutral-100)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer'
                                        }}
                                        title="Pick on Map"
                                    >
                                        <MapPin size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--muted-foreground)' }}>Loading Maps...</div>
                            )}
                        </div>

                        {formData.type === 'food' && (
                            <div className={styles.field}>
                                <label className={styles.label}>Expiry Date</label>
                                <input
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    type="date"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label}>{t('feed.post.descLabel')}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Add Photos</label>
                            <div style={{
                                border: '1px dashed var(--neutral-300)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                background: 'var(--neutral-50)',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    marginBottom: formData.images.length > 0 ? '1rem' : 0
                                }} onClick={() => document.getElementById('imageInput').click()}>
                                    <Camera size={20} color="var(--neutral-500)" />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
                                        {formData.images.length > 0 ? 'Add more photos' : 'Click to upload photos'}
                                    </span>
                                </div>
                                <input
                                    id="imageInput"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />

                                {formData.images.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {formData.images.map((file, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    style={{
                                                        position: 'absolute', top: -5, right: -5,
                                                        background: 'red', color: 'white',
                                                        borderRadius: '50%', width: '18px', height: '18px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: 'none', cursor: 'pointer', fontSize: '10px'
                                                    }}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.checkboxRow}>
                            <input
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                                type="checkbox"
                                id="anon"
                                className={styles.checkbox}
                            />
                            <div>
                                <label htmlFor="anon" className={styles.label} style={{ cursor: 'pointer' }}>{t('feed.post.anonLabel')}</label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.125rem' }}>
                                    {t('feed.post.anonDesc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
                            {t('feed.post.cancel')}
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Posting...' : t('feed.post.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
