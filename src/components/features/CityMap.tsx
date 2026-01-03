'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from '@/i18n/navigation';

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CityMapProps {
    city: string;
    units: any[];
    hoveredUnitId: string | null;
    onMarkerClick: (id: string) => void;
    onMarkerHover: (id: string | null) => void;
}

// Hardcoded city centers
const CITY_CENTERS: Record<string, [number, number]> = {
    'paris': [48.8566, 2.3522],
    'lyon': [45.7578, 4.8320],
    'marseille': [43.2965, 5.3698],
    'bordeaux': [44.8378, -0.5792],
    'toulouse': [43.6047, 1.4442],
    'lille': [50.6292, 3.0573],
    'montpellier': [43.6108, 3.8767],
    'rennes': [48.1173, -1.6778],
    'nantes': [47.2184, -1.5536],
    'strasbourg': [48.5734, 7.7521],
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

interface MapInvalidatorProps {
    isReady: boolean;
}

function MapInvalidator({ isReady }: MapInvalidatorProps) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        // Invalidate size after short delay to allow transition to finish
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map, isReady]);

    return null;
}

export const CityMap = ({ city, units, hoveredUnitId, onMarkerClick, onMarkerHover }: CityMapProps) => {
    const cityKey = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Default to France center if unknown
    const center = CITY_CENTERS[cityKey] || [46.603354, 1.888334];

    // Logic for zoom: if "france" or unknown city, zoom out (6). Else zoom in (13).
    const isCountryLevel = cityKey === 'france' || !CITY_CENTERS[cityKey];
    const finalZoom = isCountryLevel ? 6 : 13;
    const finalCenter = CITY_CENTERS[cityKey] || [46.2276, 2.2137];

    // Generate stable random offsets for demo
    const markers = useMemo(() => {
        return units.map(u => {
            // Pseudo-random based on ID char codes
            const seed = u.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const latOffset = ((seed % 100) / 1000 - 0.05) * 0.5; // Spread roughly 5km
            const lngOffset = (((seed * 13) % 100) / 1000 - 0.05) * 0.5;

            return {
                ...u,
                lat: finalCenter[0] + latOffset,
                lng: finalCenter[1] + lngOffset
            };
        });
    }, [units, finalCenter]);

    return (
        <MapContainer
            key={city} // Use city as key to force remount only when city changes
            center={finalCenter}
            zoom={finalZoom}
            scrollWheelZoom={true}
            className="h-full w-full z-0 isolate"
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
        >
            <ChangeView center={finalCenter} zoom={finalZoom} />
            <MapInvalidator isReady={true} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {markers.map((u) => {
                const isHovered = hoveredUnitId === u.id;
                // Create custom icon for highlighted state
                const icon = new L.Icon({
                    iconUrl: isHovered
                        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                        : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                return (
                    <Marker
                        key={u.id}
                        position={[u.lat, u.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => onMarkerClick(u.id),
                            mouseover: () => onMarkerHover(u.id),
                            mouseout: () => onMarkerHover(null),
                        }}
                    >
                        <Popup>
                            <div className="w-full p-0 font-sans">
                                {/* Image Container - Edge to Edge thanks to global css fix */}
                                <div className="h-32 w-full bg-gray-100 relative group">
                                    <img
                                        src={u.photo || '/assets/default_studio.png'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={u.residenceName}
                                    />
                                    {/* Price Tag */}
                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold shadow-sm text-gray-900 border border-gray-100">
                                        {u.price}€
                                    </div>
                                    {/* Available Badge */}
                                    {u.available && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                            Dispo
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-3 bg-white">
                                    <h4 className="font-extrabold text-gray-900 text-sm leading-tight mb-0.5 truncate uppercase tracking-tight">{u.residenceName}</h4>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-3">{u.type} • {u.surface} m²</p>

                                    <Link href={`/logement/${u.id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-md font-bold transition-all shadow-sm hover:translate-y-px">
                                        Voir l'offre
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};
