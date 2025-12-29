"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin, Clock, Share2, MessageCircle, AlertTriangle } from 'lucide-react';
import styles from '@/components/Feed/Feed.module.css'; // Reusing feed styles or creating new ones?
// Using inline styles for speed, or reusing Feed.module.css if applicable

export default function PostDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/${id}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.data);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    if (!post) return <div style={{ padding: '2rem', textAlign: 'center' }}>Post not found</div>;

    const {
        title, description, type, condition, quantity, unit,
        user: owner, createdAt, images, location, expiryDate, source
    } = post;

    const isOwner = user?.uid === owner?.uid;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button
                onClick={() => router.back()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
                <ArrowLeft size={20} /> Back to Feed
            </button>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {/* Image Gallery */}
                {images && images.length > 0 && (
                    <div style={{ width: '100%', height: '400px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={images[0]}
                            alt={title}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    </div>
                )}

                <div style={{ padding: '30px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div>
                            <span style={{
                                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                                fontSize: '0.875rem', fontWeight: '500', marginBottom: '10px',
                                background: type === 'food' ? '#dcfce7' : '#e0e7ff',
                                color: type === 'food' ? '#166534' : '#4338ca',
                                textTransform: 'capitalize'
                            }}>
                                {type}
                            </span>
                            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 10px 0', lineHeight: 1.2 }}>{title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
                                <MapPin size={18} />
                                <span>{location?.address || 'Location hidden'}</span>
                            </div>
                        </div>
                        {isOwner && (
                            <span style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem' }}>
                                Your Post
                            </span>
                        )}
                    </div>

                    {/* Owner Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                            {owner?.photoURL ? (
                                <img src={owner.photoURL} alt={owner.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{owner?.displayName || 'Anonymous'}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Posted {new Date(createdAt).toLocaleDateString()}</div>
                        </div>
                        {!isOwner && (
                            <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
                                <MessageCircle size={18} /> Message
                            </button>
                        )}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Description</h3>
                        <p style={{ lineHeight: 1.6, color: '#374151', fontSize: '1.1rem' }}>{description}</p>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>Quantity</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{quantity} {unit}</div>
                        </div>
                        <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>Condition</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', textTransform: 'capitalize' }}>{condition}</div>
                        </div>
                        <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>Source</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', textTransform: 'capitalize' }}>{source || 'Individual'}</div>
                        </div>
                        {expiryDate && (
                            <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '12px' }}>
                                <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '5px' }}>Expires</div>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#dc2626' }}>{new Date(expiryDate).toLocaleDateString()}</div>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {!isOwner && post.status === 'active' && (
                        <button style={{
                            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                            background: '#2563eb', color: 'white', fontSize: '1.1rem', fontWeight: '600',
                            cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                        }}>
                            Request This Item
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
