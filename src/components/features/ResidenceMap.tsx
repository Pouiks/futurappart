
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

// Fix Leaflet icons in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
function Recenter({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

interface ResidenceMapProps {
    address: string;
    city: string;
}

export const ResidenceMap = ({ address, city }: ResidenceMapProps) => {
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCoords = async () => {
            if (!address && !city) {
                console.warn("ResidenceMap: No address or city provided.");
                setLoading(false);
                setError(true);
                return;
            }

            try {
                // Strategy 1: Full address + City + France
                // Clean address: remove special characters that might confuse Nominatim
                const cleanAddress = address?.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
                const query1 = `${cleanAddress}, ${city}, France`;

                let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query1)}`);
                let data = await res.json();

                if (data && data.length > 0) {
                    setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                    setLoading(false);
                    return;
                }

                // Strategy 2: Address only (sometimes city is redundant or mismatching in Nominatim's strict mode)
                const query2 = `${cleanAddress}, France`;
                res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query2)}`);
                data = await res.json();

                if (data && data.length > 0) {
                    setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                    setLoading(false);
                    return;
                }

                // Strategy 3: City only (Fallback)
                console.log("ResidenceMap: Falling back to city only", city);
                const query3 = `${city}, France`;
                res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query3)}`);
                data = await res.json();

                if (data && data.length > 0) {
                    setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                } else {
                    console.error("ResidenceMap: Could not find location for", address, city);
                    setError(true);
                }

            } catch (error) {
                console.error("Geocoding error:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCoords();
    }, [address, city]);

    if (loading) return <Skeleton className="h-full w-full rounded-xl" />;

    if (error || !coords) return (
        <div className="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 p-4 text-center text-sm">
            <div className="flex flex-col items-center gap-2">
                <MapPin className="w-8 h-8 text-gray-300" />
                <span>Carte indisponible pour cette adresse</span>
            </div>
        </div>
    );

    return (
        <MapContainer center={[coords.lat, coords.lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lng]}>
                <Popup>
                    {address}
                </Popup>
            </Marker>
            <Recenter lat={coords.lat} lng={coords.lng} />
        </MapContainer>
    );
};
