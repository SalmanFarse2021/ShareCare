"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';

export default function SwipeButton({ onConfirm, isLoading = false, disabled = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragWidth, setDragWidth] = useState(0);
    const [confirmed, setConfirmed] = useState(false);
    const containerRef = useRef(null);
    const sliderRef = useRef(null);

    const handleStart = (e) => {
        if (isLoading || disabled || confirmed) return;
        setIsDragging(true);
    };

    const handleMove = (e) => {
        if (!isDragging || confirmed) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = clientX - containerRect.left;

        const maxDrag = containerRect.width - 50; // 50px handle width

        if (newWidth >= maxDrag) {
            setDragWidth(containerRect.width);
            setConfirmed(true);
            setIsDragging(false);
            if (onConfirm) onConfirm();
        } else if (newWidth > 0) {
            setDragWidth(newWidth);
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
        if (!confirmed) {
            setDragWidth(0); // Snap back
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleEnd);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, confirmed]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '48px',
                backgroundColor: '#f3f4f6', // neutral-100
                borderRadius: '24px',
                overflow: 'hidden',
                userSelect: 'none',
                cursor: confirmed || disabled ? 'default' : 'pointer',
                border: '1px solid #e5e7eb'
            }}
        >
            {/* Background Text: "Available" (Left) */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                color: '#6b7280', // neutral-500
                fontWeight: '600',
                fontSize: '0.875rem',
                paddingLeft: '60px', // Offset for handle start position
                opacity: dragWidth > 50 ? 0 : 1, // Fade out quickly
                transition: 'opacity 0.2s'
            }}>
                Available
            </div>

            {/* Background Text: "Book" (Right) */}
            <div style={{
                position: 'absolute',
                top: 0, right: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                color: '#4f46e5', // Primary brand color
                fontWeight: '600',
                fontSize: '0.875rem',
                paddingRight: '20px',
                opacity: dragWidth > 50 ? 1 : 0.5, // Highlight as we get closer
                transition: 'opacity 0.2s'
            }}>
                Book
            </div>

            {/* Slider Fill/Track */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                width: confirmed ? '100%' : `${Math.max(50, dragWidth)}px`, // Min width for handle
                backgroundColor: confirmed ? '#10b981' : '#4f46e5', // Success Green or Primary Blue
                borderRadius: '24px',
                transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '4px'
            }}>
                {/* Handle */}
                <div
                    ref={sliderRef}
                    onMouseDown={handleStart}
                    onTouchStart={handleStart}
                    style={{
                        width: '40px', height: '40px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        marginRight: '2px', // gap
                        cursor: disabled ? 'not-allowed' : 'grab'
                    }}
                >
                    {isLoading ? (
                        <div style={{ width: '16px', height: '16px', border: '2px solid #ddd', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <ChevronsRight size={20} color={confirmed ? '#10b981' : '#4f46e5'} style={{ marginLeft: '2px' }} />
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
