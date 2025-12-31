"use client";
import styles from './Feed.module.css';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Clock, Building2, User, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import SwipeButton from './SwipeButton';
import UserTrigger from '@/components/UserTrigger';

import { useRouter } from 'next/navigation';

export default function PostCard({ post, onEdit, onDelete, onClick }) {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const {
        title, description, type, condition, quantity, unit,
        user, createdAt, images, location, expiryDate, source, isAnonymous
    } = post;

    const [showMenu, setShowMenu] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // ... (rest)

    const handleCardClick = (e) => {
        // Allow text selection inside the card without triggering modal
        // But if it's a simple click, trigger it.
        // For now, let's prioritize opening the modal to ensure it works.
        // We can check if the target is text later if needed.

        if (onClick) {
            onClick(post);
        } else {
            router.push(`/dashboard/feed/${post._id}`);
        }
    };

    // User info
    const displayName = isAnonymous ? 'Anonymous' : (user?.displayName || 'Anonymous');
    const photoURL = isAnonymous ? null : user?.photoURL;
    const isOwner = currentUser?.uid === user?.uid;
    // Debug log to verify ownership logic
    // console.log(`Post: ${title}, Owner: ${user?.uid}, Current: ${currentUser?.uid}, Match: ${isOwner}`);

    // Timestamp
    let timeAgo = 'Just now';
    if (createdAt) {
        timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    }

    // Source Label
    const getSourceLabel = () => {
        switch (source) {
            case 'donation_point': return 'Donation Point';
            case 'walk_in': return 'Walk-in Log';
            default: return null;
        }
    };
    const sourceLabel = getSourceLabel();

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
                // Ideally trigger a refresh here. For now, simple reload or we can rely on parent refresh if we passed a callback
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
                    user: { uid: currentUser.uid }, // Auth check
                    status: newStatus,
                    requester: newStatus === 'active' ? null : post.requester // Clear requester if rejecting (reset to active)
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
        <div className={styles.postCard} style={{ position: 'relative' }}>
            {/* Owner Actions Menu - Absolute Top Right */}
            {isOwner && (
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 20 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    >
                        <MoreVertical size={20} color="#374151" />
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute', right: 0, top: '120%',
                            background: 'white', border: '1px solid var(--border)',
                            borderRadius: '8px', boxShadow: 'var(--shadow-md)',
                            zIndex: 30, minWidth: '140px', overflow: 'hidden',
                            animation: 'fadeIn 0.1s ease-out'
                        }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(post); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    width: '100%', padding: '10px 12px',
                                    border: 'none', background: 'white', cursor: 'pointer',
                                    fontSize: '0.875rem', textAlign: 'left',
                                    color: 'var(--neutral-700)',
                                    borderBottom: '1px solid var(--neutral-100)'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--neutral-50)'}
                                onMouseLeave={(e) => e.target.style.background = 'white'}
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(post); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    width: '100%', padding: '10px 12px',
                                    border: 'none', background: 'white', cursor: 'pointer',
                                    fontSize: '0.875rem', textAlign: 'left',
                                    color: '#dc2626'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                                onMouseLeave={(e) => e.target.style.background = 'white'}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Header (Moved to Top) */}
            <div className={styles.cardHeader} style={{ background: 'white', borderBottom: 'none', paddingBottom: '0.75rem' }}>
                <div className={styles.userInfo}>
                    <UserTrigger user={{ uid: user?.uid, displayName, photoURL }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.userAvatar}>
                            {photoURL ? (
                                <img src={photoURL} alt={displayName} />
                            ) : (
                                <User size={20} className={styles.defaultAvatarIcon} />
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={styles.userName}>{displayName}</span>
                                {sourceLabel && (
                                    <span style={{
                                        fontSize: '0.625rem', padding: '1px 6px',
                                        background: '#e0e7ff', color: '#4338ca',
                                        borderRadius: '4px', textTransform: 'uppercase', fontWeight: '600'
                                    }}>
                                        {sourceLabel}
                                    </span>
                                )}
                            </div>
                            <span className={styles.postTime}>{timeAgo}</span>
                        </div>
                    </UserTrigger>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: isOwner ? '24px' : '0' }}>
                    <span className={`${styles.typeBadge} ${styles[type]}`}>{type}</span>
                </div>
            </div>

            {/* Image Gallery Preview */}
            {images && images.length > 0 && (
                <div className={styles.cardImage} style={{ height: '250px' }}>
                    <img src={images[0]} alt={title} style={{ objectFit: 'cover' }} />
                    {images.length > 1 && (
                        <div style={{
                            position: 'absolute', bottom: '10px', right: '10px',
                            background: 'rgba(0,0,0,0.6)', color: 'white',
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem'
                        }}>
                            +{images.length - 1} more
                        </div>
                    )}
                </div>
            )}



            <div className={styles.cardBody}>
                <h3 className={styles.postTitle}>{title}</h3>
                <p className={styles.postDesc}>{description}</p>

                <div className={styles.metaRow} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <span>📦 {quantity} {unit}</span>
                    <span>✨ {condition}</span>
                    {location?.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', textDecoration: 'none' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                <MapPin size={14} /> {location.address}
                            </a>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
                                style={{
                                    background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px',
                                    fontSize: '0.75rem', padding: '2px 6px', cursor: 'pointer', color: 'var(--primary-600)'
                                }}
                            >
                                {showMap ? 'Hide Map' : 'View Map'}
                            </button>
                        </div>
                    )}
                    {expiryDate && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            color: '#dc2626', fontWeight: '500'
                        }}>
                            <Clock size={14} /> Exp: {format(new Date(expiryDate), 'MMM d')}
                        </span>
                    )}
                </div>

                {showMap && location && (
                    <div style={{ marginTop: '1rem', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location.coordinates ? `${location.coordinates[1]},${location.coordinates[0]}` : encodeURIComponent(location.address)}`}
                        ></iframe>
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                {/* Lifecycle UI Logic */}
                {post.status === 'active' && !isOwner && (
                    <div style={{ width: '100%' }}>
                        {currentUser ? (
                            <SwipeButton onConfirm={handleRequestItem} />
                        ) : (
                            <button
                                className={styles.actionBtn}
                                onClick={() => alert("Please login to book items")}
                                style={{ width: '100%' }}
                            >
                                Login to Book
                            </button>
                        )}
                    </div>
                )}

                {post.status === 'active' && isOwner && (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                        Available
                    </div>
                )}

                {post.status === 'requested' && (
                    <div style={{ width: '100%' }}>
                        {post.requester?.uid === currentUser?.uid ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary-700)' }}>
                                    You booked this item
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleStatusUpdate('completed')}
                                        className={styles.actionBtn}
                                        style={{ background: 'var(--secondary-500)', fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        Mark as Taken
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('active')}
                                        className={styles.actionBtn}
                                        style={{ background: 'var(--neutral-200)', color: 'black', fontSize: '0.875rem', padding: '0.5rem' }}
                                    >
                                        Cancel Booking
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className={styles.actionBtn} disabled style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', cursor: 'default' }}>
                                {post.status === 'requested' ? 'Booked' : 'Booked'}
                            </button>
                        )}
                    </div>
                )}

                {post.status === 'completed' && (
                    <button className={styles.actionBtn} disabled style={{ background: 'var(--neutral-100)', color: 'var(--neutral-500)', cursor: 'default' }}>
                        Taken
                    </button>
                )}
            </div>
        </div >
    );
}

// Helper functions inside component (needs refactoring to move inside default function or accept props)
// Since this is inside render return, we need to add the logic functions inside the component body first.
// I will perform a separate replace for adding the handlers.
