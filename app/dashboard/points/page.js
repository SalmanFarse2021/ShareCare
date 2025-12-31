"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, MapPin, Loader2, Search, Navigation } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function PointsHubPage() {
    const { user } = useAuth();

    // State
    const [myPoints, setMyPoints] = useState([]);
    const [allPoints, setAllPoints] = useState([]);
    const [search, setSearch] = useState('');
    const [userLoc, setUserLoc] = useState(null); // { lat, lng }
    const [loadingMy, setLoadingMy] = useState(true);
    const [loadingAll, setLoadingAll] = useState(true);

    const autocompleteRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries
    });

    // Fetch My Points
    useEffect(() => {
        if (!user) return;
        fetch(`/api/points?manager=${user.uid}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setMyPoints(data.data);
            })
            .finally(() => setLoadingMy(false));
    }, [user]);

    // Fetch All Points (Reactive to userLoc and search)
    useEffect(() => {
        let url = '/api/points?';
        const params = new URLSearchParams();

        if (userLoc) {
            params.append('lat', userLoc.lat);
            params.append('lng', userLoc.lng);
        }
        if (search) {
            params.append('search', search);
        }

        // Debounce if strictly typing, but for MVP fetching direct
        setLoadingAll(true);
        fetch(url + params.toString())
            .then(res => res.json())
            .then(data => {
                if (data.success) setAllPoints(data.data);
            })
            .finally(() => setLoadingAll(false));
    }, [userLoc, search]);

    // Auto-detect location on mount
    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log('Location access denied or error'),
                { enableHighAccuracy: true }
            );
        }
    };

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setUserLoc({ lat, lng });
            }
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* --- HEADER & SEARCH GRID --- */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto auto',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                {/* Row 1: Title & Actions */}
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Donation Points Hub</h1>

                {user && (
                    <>
                        <Link href="/dashboard/points/create">
                            <button style={{
                                width: '100%', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', background: 'white', color: 'var(--primary-600)',
                                borderRadius: '8px', border: '1px solid var(--primary-600)', cursor: 'pointer', fontWeight: '600'
                            }}>
                                <Plus size={18} /> Create Point
                            </button>
                        </Link>
                        <Link href="/dashboard/my-points">
                            <button style={{
                                width: '100%', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', background: 'var(--primary-600)', color: 'white',
                                borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600'
                            }}>
                                View My Points
                            </button>
                        </Link>
                    </>
                )}
                {!user && <div style={{ gridColumn: '2 / 4' }}></div>} {/* Spacer if no user */}

                {/* Row 2: Search Input (Spans Title + Create) & Search Button (Under My Points) */}
                <div style={{ gridColumn: '1 / 3', position: 'relative' }}>
                    {isLoaded && (
                        <Autocomplete
                            onLoad={ref => autocompleteRef.current = ref}
                            onPlaceChanged={() => {
                                if (autocompleteRef.current) {
                                    const place = autocompleteRef.current.getPlace();
                                    if (place.geometry) {
                                        const lat = place.geometry.location.lat();
                                        const lng = place.geometry.location.lng();
                                        setUserLoc({ lat, lng });
                                        setSearch(place.formatted_address || place.name);
                                    }
                                }
                            }}
                        >
                            <div style={{ position: 'relative', width: '100%' }}>
                                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                                <button
                                    onClick={detectLocation}
                                    title="Use my location"
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: userLoc ? 'var(--primary-600)' : '#9ca3af',
                                        padding: '4px'
                                    }}
                                >
                                    <Navigation size={20} fill={userLoc ? "currentColor" : "none"} />
                                </button>
                                <input
                                    placeholder="Search by name or location..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        if (e.target.value === '') setUserLoc(null);
                                    }}
                                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                />
                            </div>
                        </Autocomplete>
                    )}
                </div>

                <div style={{ gridColumn: '3 / 4' }}>
                    <button
                        style={{
                            width: '100%', height: '100%',
                            padding: '1rem 2rem', background: 'var(--primary-600)', color: 'white',
                            border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* List */}
            {loadingAll ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading points...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {allPoints.map(point => (
                        <div key={point._id} style={{
                            background: 'white', borderRadius: '16px', overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ height: '150px', background: '#f3f4f6', position: 'relative' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${point.publicLocation?.coordinates ? `${point.publicLocation.coordinates[1]},${point.publicLocation.coordinates[0]}` : encodeURIComponent(point.publicAddress)}`}
                                ></iframe>
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{point.name}</h3>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.publicAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '1rem', display: 'block', textDecoration: 'none' }}
                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                >
                                    {point.publicAddress}
                                </a>

                                <Link href={`/points/${point._id}`} style={{ marginTop: 'auto' }}>
                                    <button style={{
                                        width: '100%', padding: '0.75rem', background: 'var(--primary-600)', color: 'white',
                                        border: 'none', borderRadius: '8px', cursor: 'pointer'
                                    }}>
                                        View Details
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loadingAll && allPoints.length === 0 && (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No points found. Try a different location.</div>
            )}
        </div>

    );
}
