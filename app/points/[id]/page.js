"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, Info, Shield, CheckCircle, Package, Bell, Users, AlertTriangle } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import PostCard from '@/components/Feed/PostCard'; // Import PostCard
import PostDetailModal from '@/components/Feed/PostDetailModal'; // Import Modal

const libraries = ['places'];

export default function PointDetailsPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const [point, setPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinRole, setJoinRole] = useState('volunteer');
    const [requestStatus, setRequestStatus] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    // Posts State
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // For Modal

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetch(`/api/points/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setPoint(data.data);
                        if (user && data.data.subscribers?.includes(user.uid)) {
                            setIsSubscribed(true);
                        }
                        // Fetch posts by this manager
                        const managerId = data.data.manager?._id || data.data.manager;
                        if (managerId) {
                            fetchPosts(managerId);
                        }
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, user]);

    const fetchPosts = async (managerId) => {
        setLoadingPosts(true);
        try {
            // Fetch active posts by this user (manager)
            const res = await fetch(`/api/posts?uid=${managerId}&status=active&limit=50`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch point posts", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleSubscribe = async () => {
        if (!user) return router.push('/login');
        setSubscribing(true);
        try {
            const action = isSubscribed ? 'unsubscribe' : 'subscribe';
            const res = await fetch(`/api/points/${id}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseUid: user.uid, action })
            });
            const data = await res.json();
            if (data.success) {
                setIsSubscribed(!isSubscribed);
                // Update local point data for count
                setPoint(prev => ({ ...prev, subscribers: data.subscribers }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubscribing(false);
        }
    };

    const handleJoinRequest = async (e) => {
        e.preventDefault();
        setRequestStatus('loading');
        try {
            const res = await fetch(`/api/points/${id}/join-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    role: joinRole
                })
            });
            const data = await res.json();
            if (res.ok) {
                setRequestStatus('success');
                setTimeout(() => setShowJoinModal(false), 2000);
            } else {
                alert(data.error);
                setRequestStatus(null);
            }
        } catch (error) {
            alert('Request failed');
            setRequestStatus(null);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Point...</div>;
    if (!point) return <div style={{ padding: '4rem', textAlign: 'center' }}>Point not found.</div>;

    const location = point.publicLocation?.coordinates ? { lat: point.publicLocation.coordinates[1], lng: point.publicLocation.coordinates[0] } : null;

    // Derived Stats
    const stats = [
        { label: 'Available Items', value: posts.length, icon: Package },
        { label: 'Team Members', value: point.team?.length || 0, icon: Users },
        { label: 'Community', value: point.subscribers?.length || 0, icon: Users },
    ];

    const urgentNeeds = point.urgentNeeds?.filter(n => n.isActive) || [];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <div style={{ height: '150px', background: 'linear-gradient(to right, var(--primary-600), var(--primary-800))' }}></div>
                <div style={{ padding: '2rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {point.type.replace('_', ' ')}
                            </span>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{point.name}</h1>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                <MapPin size={18} />
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.publicAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'underline' }}
                                >
                                    {point.publicAddress}
                                </a>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                style={{
                                    padding: '1rem 1.5rem', background: isSubscribed ? '#f3f4f6' : 'white',
                                    color: isSubscribed ? 'black' : 'var(--primary-600)',
                                    border: isSubscribed ? 'none' : '1px solid var(--primary-600)',
                                    borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Bell size={18} fill={isSubscribed ? "currentColor" : "none"} />
                                {isSubscribed ? 'Following' : 'Follow'}
                            </button>
                            <button
                                onClick={() => user ? setShowJoinModal(true) : router.push('/login')}
                                style={{
                                    padding: '1rem 2rem', background: 'var(--primary-600)', color: 'white',
                                    border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                                    cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}
                            >
                                Request to Join Team
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{ flex: 1, padding: '1.5rem', textAlign: 'center', borderRight: i !== stats.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-700)', lineHeight: '1' }}>{stat.value}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <stat.icon size={14} /> {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* Urgent Needs Board */}
                {urgentNeeds.length > 0 && (
                    <div style={{ background: '#fff1f2', border: '1px solid #fda4af', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#be123c' }}>
                            <AlertTriangle size={24} /> Urgent Needs
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {urgentNeeds.map((need, idx) => (
                                <div key={idx} style={{
                                    background: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: '600', color: '#be123c',
                                    border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    {need.urgency === 'critical' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#be123c' }}></span>}
                                    {need.item}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {/* Available Items Section - Full Width or Top */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={24} /> Available Items
                        </h2>

                        {loadingPosts ? (
                            <div>Loading items...</div>
                        ) : posts.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {posts.map(post => (
                                    <div key={post._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                                        <PostCard
                                            post={post}
                                            onClick={() => setSelectedPost(post)}
                                        // Disable edit/delete as this is a public view, unless user is owner (PostCard handles owner check internally)
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', background: '#f9fafb', borderRadius: '8px' }}>
                                Currently no items listed for donation.
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        {/* Left: Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Description */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={20} /> About
                                </h2>
                                <p style={{ lineHeight: '1.6', color: '#374151', marginBottom: '1.5rem' }}>
                                    {point.description || 'No description provided.'}
                                </p>

                                {/* Contact Info */}
                                {(point.contact?.phone || point.contact?.email || point.contact?.website) && (
                                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {point.contact.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                                <span style={{ fontWeight: '600' }}>Phone:</span> {point.contact.phone}
                                            </div>
                                        )}
                                        {point.contact.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                                <span style={{ fontWeight: '600' }}>Email:</span> {point.contact.email}
                                            </div>
                                        )}
                                        {point.contact.website && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563' }}>
                                                <span style={{ fontWeight: '600' }}>Website:</span>
                                                <a href={point.contact.website.startsWith('http') ? point.contact.website : `https://${point.contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)', textDecoration: 'underline' }}>
                                                    {point.contact.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Needs */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={20} /> Accepted Items
                                </h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {point.allowedItems?.map(item => (
                                        <span key={item} style={{
                                            padding: '0.5rem 1rem', background: '#ecfdf5', color: '#047857',
                                            borderRadius: '20px', fontWeight: '500', textTransform: 'capitalize'
                                        }}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right: Map & Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* Map */}
                            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', height: '300px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                {isLoaded && location && (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={location}
                                        zoom={14}
                                        options={{ disableDefaultUI: true }}
                                    >
                                        <Marker position={location} />
                                    </GoogleMap>
                                )}
                            </div>

                            {/* Hours */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={20} /> Operating Hours
                                </h2>
                                <div style={{ color: '#374151' }}>
                                    <p><strong>Status:</strong> {point.status === 'active' ? 'Open' : 'Closed'}</p>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        Please contact the center for exact timings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Join Modal */}
                    {showJoinModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                                {/* ... keep modal content ... */}
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Join the Team</h3>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Request to join <strong>{point.name}</strong>.</p>
                                {requestStatus === 'success' ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                        <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
                                        <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#16a34a' }}>Request Sent!</p>
                                        <p style={{ color: '#6b7280' }}>A manager will review your request shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleJoinRequest}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>I want to join as a...</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setJoinRole('volunteer')}
                                                    style={{
                                                        flex: 1, padding: '1rem', borderRadius: '8px', border: `2px solid ${joinRole === 'volunteer' ? 'var(--primary-600)' : '#e5e7eb'}`,
                                                        background: joinRole === 'volunteer' ? 'var(--primary-50)' : 'white', cursor: 'pointer', textAlign: 'center'
                                                    }}
                                                >
                                                    <strong>Volunteer</strong>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Help with tasks</div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setJoinRole('member')}
                                                    style={{
                                                        flex: 1, padding: '1rem', borderRadius: '8px', border: `2px solid ${joinRole === 'member' ? 'var(--primary-600)' : '#e5e7eb'}`,
                                                        background: joinRole === 'member' ? 'var(--primary-50)' : 'white', cursor: 'pointer', textAlign: 'center'
                                                    }}
                                                >
                                                    <strong>Member</strong>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Official staff</div>
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="button" onClick={() => setShowJoinModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                            <button type="submit" disabled={requestStatus === 'loading'} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                                {requestStatus === 'loading' ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    <PostDetailModal
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                    />
                </div>
            </div>
        </div>
    );
}
