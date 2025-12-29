"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { X, MapPin, Navigation, Search } from 'lucide-react';
import styles from './Feed.module.css';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

// Libraries must be defined outside the component to avoid reloading
const libraries = ["places"];

export default function MapPicker({ isOpen, onClose, onConfirm, initialLocation }) {
    const [center, setCenter] = useState(defaultCenter);
    const [cameraPosition, setCameraPosition] = useState(defaultCenter);
    const [loading, setLoading] = useState(false);

    // Autocomplete Ref
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (initialLocation && initialLocation.coordinates) {
                setCenter({
                    lat: initialLocation.coordinates[1],
                    lng: initialLocation.coordinates[0]
                });
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            setCenter(pos);
                        },
                        () => console.log("Location permission denied")
                    );
                }
            }
        }
    }, [isOpen, initialLocation]);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onCenterChanged = () => {
        if (mapRef.current) {
            const newCenter = mapRef.current.getCenter();
            setCameraPosition({
                lat: newCenter.lat(),
                lng: newCenter.lng()
            });
        }
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry && place.geometry.location) {
                const pos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setCenter(pos);
                mapRef.current?.panTo(pos);
                mapRef.current?.setZoom(16);
            } else {
                console.warn("Place selected does not have geometry.");
            }
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Privacy-Safe Processing
            // 1. Round to 3 decimal places
            const lat = Number(cameraPosition.lat.toFixed(3));
            const lng = Number(cameraPosition.lng.toFixed(3));

            // 2. Generate "Near City, State" Label
            const geocoder = new window.google.maps.Geocoder();
            const result = await geocoder.geocode({ location: cameraPosition });
            let approxAddress = "Approximate Location";
            let exactAddress = "Unknown Address";

            if (result.results[0]) {
                const addressComponents = result.results[0].address_components;
                const formattedAddress = result.results[0].formatted_address;
                exactAddress = formattedAddress;

                const locality = addressComponents.find(c => c.types.includes('locality'))?.long_name;
                const adminArea = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
                const country = addressComponents.find(c => c.types.includes('country'))?.long_name;

                // Fallback to simpler parts if locality missing
                const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name;
                const sublocality = addressComponents.find(c => c.types.includes('sublocality'))?.long_name;

                const mainPart = locality || sublocality || neighborhood || "Unknown City";
                const regionPart = adminArea || "";

                if (mainPart) {
                    approxAddress = `Near ${mainPart}${regionPart ? `, ${regionPart}` : ''}${country ? `, ${country}` : ''}`;
                }
            }

            onConfirm({
                exact: {
                    coordinates: [cameraPosition.lng, cameraPosition.lat],
                    address: exactAddress
                },
                approx: {
                    coordinates: [lng, lat], // Already rounded above
                    address: approxAddress
                }
            });
            onClose();
        } catch (error) {
            console.error("Geocoding failed:", error);
            // Fallback
            const lat = Number(cameraPosition.lat.toFixed(3));
            const lng = Number(cameraPosition.lng.toFixed(3));
            onConfirm({
                address: "Approximate Location",
                coordinates: [lng, lat]
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} style={{ zIndex: 2000 }}>
            <style>{`
                .pac-container {
                    z-index: 9999 !important;
                }
            `}</style>
            <div className={styles.modal} style={{ maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div className={styles.modalHeader}>
                    <h3>Select Location</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <div style={{ position: 'relative', flex: 1, minHeight: '300px' }}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onLoad={onMapLoad}
                        onCenterChanged={onCenterChanged}
                        options={{
                            disableDefaultUI: false,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                        }}
                    >
                        {/* Search Bar - Restored Autocomplete with new API Key */}
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            maxWidth: '400px',
                            zIndex: 1000,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'white',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                                <Search size={18} color="#6b7280" />
                                <Autocomplete
                                    onLoad={(autocomplete) => autocompleteRef.current = autocomplete}
                                    onPlaceChanged={handlePlaceChanged}
                                    className="w-full"
                                >
                                    <input
                                        type="text"
                                        placeholder="Search address ..."
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            width: '100%',
                                            marginLeft: '8px',
                                            fontSize: '14px',
                                            minWidth: '200px'
                                        }}
                                    />
                                </Autocomplete>
                            </div>
                        </div>
                    </GoogleMap>

                    {/* Fixed Center Pin */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -100%)',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        <MapPin size={40} color="#ef4444" fill="#ef4444" />
                    </div>

                    {/* Current Location Button */}
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude,
                                        };
                                        setCenter(pos);
                                        mapRef.current?.panTo(pos);
                                    }
                                );
                            }
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '10px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            cursor: 'pointer'
                        }}
                    >
                        <Navigation size={20} />
                    </button>
                </div>

                <div className={styles.modalFooter} style={{ justifyContent: 'center', padding: '1.5rem' }}>
                    <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
                        Drag map to adjust • Approx location will be saved
                    </p>
                    <button
                        onClick={handleConfirm}
                        className={styles.submitBtn}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Confirming...' : 'Confirm Location'}
                    </button>
                </div>
            </div>
        </div>
    );
}
