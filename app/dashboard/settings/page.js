"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User, Lock, Shield, Check, Camera, Save } from 'lucide-react';
import styles from './Settings.module.css';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const fileInputRef = useRef(null);

    // State for detecting changes
    const [initialData, setInitialData] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Upload state
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        photoURL: '',
        bio: '',
        location: '',
        preferences: {
            isAnonymous: false,
            acceptsMessages: true,
            theme: 'system'
        }
    });

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/user/settings?uid=${user.uid}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const loadedData = {
                        displayName: data.data.displayName || user.displayName || '',
                        photoURL: data.data.photoURL || user.photoURL || '',
                        bio: data.data.bio || '',
                        location: data.data.location || '',
                        preferences: {
                            isAnonymous: data.data.preferences?.isAnonymous || false,
                            acceptsMessages: data.data.preferences?.acceptsMessages ?? true,
                            theme: data.data.preferences?.theme || 'system'
                        }
                    };
                    setFormData(loadedData);
                    setInitialData(loadedData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [user]);

    // Check for changes
    useEffect(() => {
        if (!initialData) return;
        const changed = JSON.stringify(formData) !== JSON.stringify(initialData);
        setHasChanges(changed);
    }, [formData, initialData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    ...formData
                })
            });
            const data = await res.json();
            if (data.success) {
                setInitialData(formData);
                setHasChanges(false);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                alert("Failed to save: " + data.error);
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Create a reference to 'profile_photos/UID/filename'
            const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}_${file.name}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update state
            setFormData(prev => ({ ...prev, photoURL: downloadURL }));

        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const togglePref = (key) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key]
            }
        }));
    };

    if (authLoading || isLoading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className={styles.container}>
            {showToast && (
                <div className={styles.toast}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Settings Saved
                    </div>
                </div>
            )}

            <h1 className={styles.pageTitle}>Settings</h1>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {/* Profile Section */}
            <section className={styles.card}>
                <div className={styles.header}>
                    <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px' }}>
                        <User size={20} color="#4f46e5" />
                    </div>
                    <h2 className={styles.headerTitle}>Public Profile</h2>
                </div>

                <div className={styles.profileLayout}>
                    {/* Avatar */}
                    <div className={styles.avatarContainer} onClick={triggerFileInput}>
                        <div className={styles.avatar} style={{ backgroundImage: formData.photoURL ? `url(${formData.photoURL})` : 'none' }}>
                            {!formData.photoURL && <User size={40} color="#4338ca" />}
                            <div className={styles.avatarOverlay}>
                                {isUploading ? (
                                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <Camera size={24} color="white" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className={styles.formGroup}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Display Name</label>
                            <input
                                value={formData.displayName}
                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                className={styles.input}
                                placeholder="Your name"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Location <span style={{ color: 'red' }}>*</span></label>
                            <input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className={styles.input}
                                placeholder="City, Country"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className={styles.textarea}
                                placeholder="Share a little about yourself..."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Section */}
            <section className={styles.card}>
                <div className={styles.header}>
                    <div style={{ padding: '8px', background: '#d1fae5', borderRadius: '8px' }}>
                        <Shield size={20} color="#059669" />
                    </div>
                    <h2 className={styles.headerTitle}>Privacy & Safety</h2>
                </div>

                <div className={styles.row}>
                    <div>
                        <h3 className={styles.rowTitle}>Anonymous Mode</h3>
                        <p className={styles.rowDesc}>Hide your name in public post feeds.</p>
                    </div>
                    <Toggle
                        active={formData.preferences.isAnonymous}
                        onClick={() => togglePref('isAnonymous')}
                    />
                </div>

                <div className={styles.row}>
                    <div>
                        <h3 className={styles.rowTitle}>Allow Direct Messages</h3>
                        <p className={styles.rowDesc}>Let other users start chats with you.</p>
                    </div>
                    <Toggle
                        active={formData.preferences.acceptsMessages}
                        onClick={() => togglePref('acceptsMessages')}
                    />
                </div>
            </section>

            {/* Save Action Bar (Floating) */}
            <div className={`${styles.saveBar} ${hasChanges ? styles.visible : ''}`}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={styles.saveButton}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Danger Zone */}
            <section className={`${styles.card} ${styles.danger}`}>
                <div className={styles.header}>
                    <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}>
                        <Lock size={20} color="#dc2626" />
                    </div>
                    <h2 className={styles.headerTitle} style={{ color: '#991b1b' }}>Danger Zone</h2>
                </div>
                <div className={styles.row}>
                    <div>
                        <h3 className={styles.rowTitle}>Delete Account</h3>
                        <p className={styles.rowDesc}>Permanently remove your account and all data.</p>
                    </div>
                    <button className={styles.dangerButton}>
                        Delete Account
                    </button>
                </div>
            </section>
        </div>
    );
}

// Helper Components
const Toggle = ({ active, onClick }) => (
    <div
        onClick={onClick}
        className={`${styles.toggle} ${active ? styles.active : ''}`}
    >
        <div className={styles.toggleHandle} />
    </div>
);
