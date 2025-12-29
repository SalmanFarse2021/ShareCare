"use client";
import { useState } from 'react';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { MapPin } from 'lucide-react';
import styles from './Feed.module.css';

export default function LocationSearch({ onLocationSelect, defaultValue }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here, e.g. location bias */
        },
        debounce: 300,
        defaultValue: defaultValue || "",
    });

    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (description) => {
        setValue(description, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address: description });
            const { lat, lng } = await getLatLng(results[0]);

            onLocationSelect({
                address: description,
                coordinates: [lng, lat] // MongoDB uses [lng, lat] for GeoJSON
            });
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div className={styles.inputIconWrapper}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                    value={value}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && status === "OK" && data.length > 0) {
                            e.preventDefault();
                            handleSelect(data[0].description);
                        }
                    }}
                    disabled={!ready}
                    className={`${styles.input} ${styles.hasIcon}`}
                    placeholder="Search location..."
                />
            </div>

            {status === "OK" && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    marginTop: '0.25rem',
                    zIndex: 1000,
                    listStyle: 'none',
                    padding: '0.5rem 0',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--neutral-50)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
