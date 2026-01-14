'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface MaskedDateInputProps {
    value?: string; // Expects YYYY-MM-DD
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export const MaskedDateInput = ({ value, onChange, className, placeholder = "JJ/MM/AAAA" }: MaskedDateInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    // Sync from prop (YYYY-MM-DD) to Display (DD/MM/YYYY)
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-');
            if (y && m && d) {
                setInputValue(`${d}/${m}/${y}`);
            }
        } else {
            setInputValue('');
        }
    }, [value]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Auto-slash logic
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        if (val.length > 5) {
            val = val.substring(0, 5) + '/' + val.substring(5);
        }
        if (val.length > 10) {
            val = val.substring(0, 10);
        }

        setInputValue(val);
        validateAndPropagate(val);
    };

    const validateAndPropagate = (val: string) => {
        if (val.length === 10) {
            const [d, m, y] = val.split('/');
            const numD = parseInt(d);
            const numM = parseInt(m);
            const numY = parseInt(y);

            if (numM >= 1 && numM <= 12 && numD >= 1 && numD <= 31 && numY > 1900 && numY < 2100) {
                // Return YYYY-MM-DD
                onChange(`${y}-${m}-${d}`);
            }
        }
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; // YYYY-MM-DD
        if (!val) return;
        onChange(val); // Update parent
        // Update local display immediately
        const [y, m, d] = val.split('-');
        setInputValue(`${d}/${m}/${y}`);
    };

    const openCalendar = () => {
        if (dateInputRef.current) {
            try {
                dateInputRef.current.showPicker();
            } catch (e) {
                // Fallback for browsers not supporting showPicker
                dateInputRef.current.focus();
            }
        }
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                className={`${className || ''} pr-10`} // Make room for icon
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInput}
                maxLength={10}
            />

            <button
                type="button"
                onClick={openCalendar}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 z-10"
                tabIndex={-1}
            >
                <CalendarIcon className="w-5 h-5" />
            </button>

            {/* Hidden Native Picker */}
            <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 pointer-events-none left-0 bottom-0 w-0 h-0"
                style={{ visibility: 'hidden', position: 'absolute' }} // Double insurance
                value={value || ''}
                onChange={handlePickerChange}
                tabIndex={-1}
            />
        </div>
    );
};
