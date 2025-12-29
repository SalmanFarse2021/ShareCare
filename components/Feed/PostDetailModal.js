"use client";
import styles from './Feed.module.css';
import { MapPin, Clock, MessageCircle, Info, X, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

import SwipeButton from './SwipeButton'; // Ensure this matches file structure

export default function PostDetailModal({ post, onClose }) {
    const { user: currentUser } = useAuth();
    if (!post) return null;

    const {
        title, description, type, condition, quantity, unit,
        user: owner, createdAt, images, location, expiryDate, source
    } = post;

    const isOwner = currentUser?.uid === owner?.uid;

    const handleRequestItem = async () => {
        if (!currentUser) {
            alert("Please login to request items");
            return;
        }
        try {
            const res = await fetch(`/api/posts/${post._id}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requester: {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName || 'Anonymous',
                        photoURL: currentUser.photoURL
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to request item");
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const res = await fetch(`/api/posts/${post._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: { uid: currentUser.uid },
                    status: newStatus,
                    requester: newStatus === 'active' ? null : post.requester
                })
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose} style={{ zIndex: 1000 }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
                <div style={{ position: 'relative' }}>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        <X size={20} />
                    </button>

                    {/* Image Gallery */}
                    {images && images.length > 0 && (
                        <div style={{ width: '100%', height: '300px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={images[0]}
                                alt={title}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    )}

                    <div style={{ padding: '24px' }}>
                        {/* Header */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span className={`${styles.typeBadge} ${styles[type]}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                                        {type}
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px', lineHeight: 1.2 }}>{title}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                                        <MapPin size={16} />
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location?.address || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'underline' }}
                                        >
                                            {location?.address || 'Location hidden'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Info Item */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f9fafb', borderRadius: '12px', marginBottom: '24px' }}>
                            <div className={styles.userAvatar} style={{ width: '40px', height: '40px' }}>
                                {owner?.photoURL ? (
                                    <img src={owner.photoURL} alt={owner.displayName} />
                                ) : (
                                    <User size={20} className={styles.defaultAvatarIcon} />
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{owner?.displayName || 'Anonymous'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Posted {new Date(createdAt).toLocaleDateString()}</div>
                            </div>
                            {!isOwner && (
                                <button style={{ marginLeft: 'auto', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MessageCircle size={16} /> Message
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Description</h3>
                            <p style={{ lineHeight: 1.6, color: '#374151', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{description}</p>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Quantity</div>
                                <div style={{ fontWeight: '600' }}>{quantity} {unit}</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Condition</div>
                                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{condition}</div>
                            </div>
                            <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Source</div>
                                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{source || 'Individual'}</div>
                            </div>
                            {expiryDate && (
                                <div style={{ padding: '12px', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fef2f2' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '4px' }}>Expires</div>
                                    <div style={{ fontWeight: '600', color: '#dc2626' }}>{format(new Date(expiryDate), 'MMM d, yyyy')}</div>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                            {post.status === 'active' && !isOwner && (
                                <div style={{ width: '100%' }}>
                                    {currentUser ? (
                                        <SwipeButton onConfirm={handleRequestItem} />
                                    ) : (
                                        <button
                                            onClick={() => alert("Please login to book items")}
                                            style={{ width: '100%', padding: '1rem', background: 'var(--primary-600)', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                        >
                                            Login to Book
                                        </button>
                                    )}
                                </div>
                            )}

                            {post.status === 'requested' && (
                                <div style={{ width: '100%' }}>
                                    {post.requester?.uid === currentUser?.uid ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary-700)', textAlign: 'center', marginBottom: '8px' }}>
                                                You booked this item
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleStatusUpdate('completed')}
                                                    style={{ flex: 1, padding: '1rem', background: 'var(--secondary-500)', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Mark as Taken
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate('active')}
                                                    style={{ flex: 1, padding: '1rem', background: '#f3f4f6', color: 'black', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Cancel Booking
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button disabled style={{ width: '100%', padding: '1rem', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'default' }}>
                                            Booked
                                        </button>
                                    )}
                                </div>
                            )}

                            {post.status === 'completed' && (
                                <button disabled style={{ width: '100%', padding: '1rem', background: '#f3f4f6', color: '#9ca3af', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'default' }}>
                                    Taken
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
