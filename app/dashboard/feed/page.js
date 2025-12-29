"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plus } from 'lucide-react';
import FilterBar from '@/components/Feed/FilterBar';
import CreatePostModal from '@/components/Feed/CreatePostModal';
import PostDetailModal from '@/components/Feed/PostDetailModal'; // Import
import PostCard from '@/components/Feed/PostCard';
import styles from '@/components/Feed/Feed.module.css';

import { useAuth } from '@/context/AuthContext';

export default function FeedPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Detail Modal State

    // Feed State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'active',
        source: 'all',
        radius: 50,
        search: '',
        sort: 'nearest' // Default Sort
    });
    const [userLocation, setUserLocation] = useState(null);

    // 1. Get User Location on Mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => console.log("Location access denied or error:", err)
            );
        }
    }, []);

    const [showMyPosts, setShowMyPosts] = useState(false);

    // 2. Fetch Posts
    const fetchPosts = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            // Only set full loading if it's the first load or explicit filter change (not auto-refresh polling)
            if (posts.length === 0) setLoading(true);
        }

        try {
            const params = new URLSearchParams({
                page: isLoadMore ? page + 1 : 1,
                limit: 10,
                status: filters.status,
                type: filters.type,
                source: filters.source,
                radius: filters.radius,
                q: filters.search,
                sort: filters.sort // Pass sort param
            });

            if (showMyPosts) {
                params.append('uid', user.uid);
            }

            if (userLocation) {
                params.append('lat', userLocation.lat);
                params.append('lng', userLocation.lng);
            }

            const response = await fetch(`/api/posts?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                if (isLoadMore) {
                    setPosts(prev => [...prev, ...result.data]);
                    setPage(prev => prev + 1);
                } else {
                    setPosts(result.data);
                    if (!isLoadMore) setPage(1);
                }
                // If we got fewer than limit, no more pages
                setHasMore(result.data.length === 10);
                setError(null);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Refetch when filters or location change (reset list)
    useEffect(() => {
        setPosts([]); // Clear posts on filter change to show loading state
        fetchPosts(false);
    }, [filters, userLocation, showMyPosts]);

    // Auto-Refresh Postings (every 60s)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Auto-refreshing feed...");
            fetchPosts(false);
        }, 60000); // 60 seconds
        return () => clearInterval(interval);
    }, [filters, userLocation, showMyPosts]);

    // Refresh when modal closes (post created)
    useEffect(() => {
        if (!isModalOpen) fetchPosts(false);
    }, [isModalOpen]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    fetchPosts(true);
                }
            },
            { threshold: 1.0 }
        );
        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [page, hasMore, loading, loadingMore, filters, showMyPosts]);


    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSearch = (query) => {
        setFilters(prev => ({ ...prev, search: query }));
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (post) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const response = await fetch(`/api/posts/${post._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            });
            const result = await response.json();
            if (result.success) fetchPosts(false);
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const handleMyPostsToggle = () => {
        setShowMyPosts(prev => !prev);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t('feed.title')}</h1>
                    <p className={styles.subtitle}>{t('feed.subtitle')}</p>
                    {userLocation && <span style={{ fontSize: '0.75rem', color: 'green' }}>📍 Found nearby items</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`${styles.createBtn}`}
                        style={{ backgroundColor: showMyPosts ? '#2563eb' : 'white', color: showMyPosts ? 'white' : '#374151', border: '1px solid #e5e7eb' }}
                        onClick={handleMyPostsToggle}
                    >
                        {showMyPosts ? 'All Posts' : 'My Posts'}
                    </button>
                    <button className={styles.createBtn} onClick={() => { setEditingPost(null); setIsModalOpen(true); }}>
                        <Plus size={18} />
                        {t('feed.createPost')}
                    </button>
                </div>
            </div>

            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
            />

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {posts.length > 0 ? (
                <div className={styles.postGrid}>
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onClick={() => setSelectedPost(post)} // Open Modal
                        />
                    ))}
                    {/* Sentinel for Infinite Scroll */}
                    <div id="scroll-sentinel" style={{ height: '20px', width: '100%', textAlign: 'center', gridColumn: '1/-1' }}>
                        {loadingMore && <span>Loading more...</span>}
                    </div>
                </div>
            ) : (
                !loading && (
                    <div className={styles.emptyState}>
                        <p>{t('feed.empty')}</p>
                        <button className={styles.refreshBtn} onClick={() => fetchPosts(false)}>
                            {t('feed.refresh')}
                        </button>
                    </div>
                )
            )}

            {loading && !loadingMore && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading feed...</div>}

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editPost={editingPost}
            />

            <PostDetailModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </div>
    );
}
