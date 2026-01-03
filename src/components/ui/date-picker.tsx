'use client';

import * as React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value?: string;
    onChange: (date: string) => void; // Expecting ISO string YYYY-MM-DD
    label?: string;
    placeholder?: string;
    error?: string;
    minDate?: Date;
    className?: string; // Add className prop
}

export const DatePicker = ({ value, onChange, label, placeholder = "JJ/MM/AAAA", error, minDate, className }: DatePickerProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Initialize focus on value or minDate (if in future) or today
    const [currentMonth, setCurrentMonth] = React.useState(() => {
        if (value) return new Date(value);
        if (minDate && minDate > new Date()) return minDate;
        return new Date();
    });

    // Parse value to Date object if exists
    const selectedDate = value ? new Date(value) : null;

    // ... (keep refs and effects) ...
    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate Calendar Days
    const days = React.useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: fr });
        const endDate = endOfWeek(monthEnd, { locale: fr });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const handleSelect = (date: Date) => {
        onChange(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-lg font-bold text-gray-900 mb-2">{label}</label>}

            {/* Trigger Input - Keep styling but ensure high contrast text */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border-2 rounded-lg py-3 px-4 flex items-center justify-between cursor-pointer transition-colors
                ${className || ''} 
                ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
                ${isOpen ? 'ring-2 ring-blue-600 border-blue-600' : ''}`}
            >
                <span className={`text-lg font-bold ${selectedDate ? 'text-gray-900' : 'text-gray-500'}`}>
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
                </span>
                <CalendarIcon className="w-5 h-5 text-gray-600" />
            </div>
            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 z-[100] bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-[340px] animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 px-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="text-lg font-extrabold text-gray-900 capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2 border-b pb-2">
                        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                            <div key={day} className="text-center text-sm font-bold text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, dayIdx) => {
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodayDate = isToday(day);
                            const isDisabled = minDate && day < startOfDay(minDate);

                            return (
                                <button
                                    key={day.toString()}
                                    disabled={isDisabled}
                                    title={isDisabled ? "Un délai de 3 jours est nécessaire pour traiter votre demande" : undefined}
                                    onClick={() => !isDisabled && handleSelect(day)}
                                    className={`
                                        h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all relative group
                                        ${isDisabled ? 'text-gray-300 opacity-30 cursor-help decoration-slice' : 'cursor-pointer'}
                                        ${!isDisabled && !isCurrentMonth ? 'text-gray-400' : ''}
                                        ${!isDisabled && isCurrentMonth ? 'text-gray-900 font-bold hover:bg-gray-100' : ''}
                                        ${isSelected ? 'bg-blue-600 !text-white hover:!bg-blue-700 shadow-md transform scale-105' : ''}
                                        ${!isSelected && isTodayDate && !isDisabled ? 'ring-2 ring-blue-600 text-blue-700 bg-blue-50' : ''}
                                    `}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
