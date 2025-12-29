"use client";
import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Feed.module.css';

export default function FilterBar({ filters, onFilterChange, onSearch }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [distance, setDistance] = useState(filters?.radius || 10);
    const popoverRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) onSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]); // eslint-disable-line

    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverRef]);

    const handleTypeSelect = (type) => {
        onFilterChange({ ...filters, type: filters.type === type ? 'all' : type });
    };

    const handleDistanceChange = (e) => {
        const val = e.target.value;
        setDistance(val);
        onFilterChange({ ...filters, radius: val });
    };

    const handleSortChange = (e) => {
        onFilterChange({ ...filters, status: e.target.value });
    };

    return (
        <div className={styles.toolbar} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
            {/* Top Row: Search & Toggles */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder={t('feed.searchPlaceholder', 'Search by keywords...')}
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 36px',
                            borderRadius: '24px',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <button
                    className={styles.filterBtn}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: isOpen ? '#e0e7ff' : 'white' }}
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* Quick Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                    className={`${styles.pill} ${filters.type === 'food' ? styles.activePill : ''}`}
                    onClick={() => handleTypeSelect('food')}
                >
                    Food
                </button>
                <button
                    className={`${styles.pill} ${filters.type === 'clothes' ? styles.activePill : ''}`}
                    onClick={() => handleTypeSelect('clothes')}
                >
                    Clothes
                </button>
                <button
                    className={`${styles.pill} ${filters.type === 'essentials' ? styles.activePill : ''}`}
                    onClick={() => handleTypeSelect('essentials')}
                >
                    Essentials
                </button>
                <button
                    className={`${styles.pill} ${filters.source === 'donation_point' ? styles.activePill : ''}`}
                    onClick={() => onFilterChange({ ...filters, source: filters.source === 'donation_point' ? 'all' : 'donation_point' })}
                >
                    📍 Fixed Points
                </button>
            </div>

            {isOpen && (
                <div className={styles.popover} ref={popoverRef} style={{ top: '100%', right: '0', marginTop: '8px', width: '100%', maxWidth: '300px' }}>
                    <div className={styles.popoverSection}>
                        <label className={styles.popoverLabel}>{t('feed.distance')} ({distance} km)</label>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={distance}
                                onChange={handleDistanceChange}
                                className={styles.slider}
                            />
                        </div>
                    </div>

                    <div className={styles.popoverSection}>
                        <label className={styles.popoverLabel}>Status</label>
                        <select
                            className={styles.select}
                            value={filters.status}
                            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        >
                            <option value="active">Available First</option>
                            <option value="all">Show All</option>
                        </select>
                    </div>

                    <div className={styles.popoverSection} style={{ marginTop: '1rem' }}>
                        <label className={styles.popoverLabel}>Sort By</label>
                        <select
                            className={styles.select}
                            value={filters.sort || 'nearest'}
                            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
                        >
                            <option value="nearest">Distance (Nearest First)</option>
                            <option value="newest">Time (Newest First)</option>
                            <option value="urgency">Urgency</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
