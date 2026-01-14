"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton'; // Adjust path as needed or pass as prop
// Assuming clean architecture, we might want to pass children or specific props for the FavoriteButton overlay

interface ImageGalleryProps {
    images: string[];
    unitId: string;
    isFavorite: boolean;
    residenceName?: string;
}

export function ImageGallery({ images, unitId, isFavorite, residenceName }: ImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openGallery = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeGallery = useCallback(() => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    }, []);

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeGallery, nextImage, prevImage]);

    // Grid Layout Logic (Previous hardcoded logic moved here)
    const mainImage = images[0];
    const secondaryImages = images.slice(1, 3); // Take next 2 for the side column

    return (
        <>
            {/* GRID DISPLAY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] md:h-[450px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white p-1 relative">
                {/* Main Large Image */}
                <div
                    className="relative h-[300px] md:h-full md:col-span-1 rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => openGallery(0)}
                >
                    <img
                        src={mainImage}
                        alt={`${residenceName} - Vue principale`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-blue-900 shadow-sm uppercase tracking-wider">
                            Principal
                        </span>
                    </div>
                    {/* FAVORITE BIG BUTTON OVERLAY - Kept separate to not trigger gallery open ?? */}
                    <div className="absolute top-4 right-4 z-30" onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton
                            unitId={unitId}
                            initialIsFavorite={isFavorite}
                            size="xl"
                        />
                    </div>
                    {/* Hover Hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <Maximize2 className="text-white w-12 h-12 drop-shadow-lg" />
                    </div>
                </div>

                {/* Secondary Column */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
                    {/* Top Right */}
                    {secondaryImages[0] && (
                        <div
                            className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                            onClick={() => openGallery(1)}
                        >
                            <img
                                src={secondaryImages[0]}
                                alt="Vue secondaire"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                            </div>
                        </div>
                    )}

                    {/* Bottom Right */}
                    {secondaryImages[1] && (
                        <div
                            className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                            onClick={() => openGallery(2)}
                        >
                            <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10" />
                            <img
                                src={secondaryImages[1]}
                                alt="Détail"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition">
                                    <span className="hidden sm:inline">Voir les</span> photos
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* LIGHTBOX MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Close Button */}
                    <button
                        onClick={closeGallery}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation Left */}
                    <button
                        onClick={prevImage}
                        className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-40 hidden md:block"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Navigation Right */}
                    <button
                        onClick={nextImage}
                        className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-40 hidden md:block"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Image Container */}
                    <div className="w-full h-full flex flex-col items-center justify-center p-4" onClick={closeGallery}>
                        {/* Stop propagation on image click to prevent closing */}
                        <div
                            className="relative max-w-full max-h-[85vh] transition-transform duration-300 transform"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[currentIndex]}
                                alt={`Gallery image ${currentIndex + 1}`}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />

                            {/* Counter */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </div>

                        {/* Thumbnails (Optional, maybe for V2) */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto p-4" onClick={(e) => e.stopPropagation()}>
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
