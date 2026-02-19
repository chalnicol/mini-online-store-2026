import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import DropdownSelect from './DropdownSelect';

interface DateTimePickerProps {
    value: string; // "2026-01-01" or "14:30:00"
    type: 'date' | 'time';
    className?: string;
    onChange: (value: string) => void;
}

const DateTimePicker = ({
    value,
    type,
    onChange,
    className,
}: DateTimePickerProps) => {
    const current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    const currentDay = current.getDate();

    const months = [
        { name: 'January', short: 'Jan', days: 31 },
        { name: 'February', short: 'Feb', days: 28 },
        { name: 'March', short: 'Mar', days: 31 },
        { name: 'April', short: 'Apr', days: 30 },
        { name: 'May', short: 'May', days: 31 },
        { name: 'June', short: 'Jun', days: 30 },
        { name: 'July', short: 'Jul', days: 31 },
        { name: 'August', short: 'Aug', days: 31 },
        { name: 'September', short: 'Sep', days: 30 },
        { name: 'October', short: 'Oct', days: 31 },
        { name: 'November', short: 'Nov', days: 30 },
        { name: 'December', short: 'Dec', days: 31 },
    ];

    // State stores ACTUAL values for easier math, not indices where possible
    const [monthIdx, setMonthIdx] = useState(0);
    const [day, setDay] = useState(1);
    const [year, setYear] = useState(currentYear);
    const [hour, setHour] = useState(12); // 1-12
    const [minute, setMinute] = useState(0);
    const [meridianIdx, setMeridianIdx] = useState(0); // 0 = AM, 1 = PM

    // 1. Initial Parse
    useEffect(() => {
        if (!value) return;
        if (type === 'date') {
            const parts = value.split('-').map(Number);
            if (parts.length === 3) {
                setYear(parts[0]);
                setMonthIdx(parts[1] - 1);
                setDay(parts[2]);
            }
        } else {
            const parts = value.split(':').map(Number);
            if (parts.length >= 2) {
                const h24 = parts[0];
                setHour(h24 % 12 || 12);
                setMinute(parts[1]);
                setMeridianIdx(h24 >= 12 ? 1 : 0);
            }
        }
    }, []);

    // 2. Value Updater
    useEffect(() => {
        if (type === 'date') {
            const res = `${year}-${(monthIdx + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            if (res !== value) onChange(res);
        } else {
            let h24 = hour;
            if (meridianIdx === 1 && h24 < 12) h24 += 12; // PM logic
            if (meridianIdx === 0 && h24 === 12) h24 = 0; // AM logic
            const res = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
            if (res !== value) onChange(res);
        }
    }, [monthIdx, day, year, hour, minute, meridianIdx]);

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonth =
        monthIdx === 1 && isLeapYear ? 29 : months[monthIdx].days;

    return (
        <div className={cn('flex w-full items-center', className)}>
            {type === 'date' ? (
                <>
                    <DropdownSelect
                        options={months.map((m) => m.short)}
                        selected={monthIdx}
                        onSelect={setMonthIdx}
                        highlightIndex={
                            year === currentYear ? currentMonth : undefined
                        } // Highlight if current year
                        optionsView="grid"
                        position="top"
                        className="rounded-l border border-gray-400"
                    />
                    <DropdownSelect
                        options={Array.from(
                            { length: daysInMonth },
                            (_, i) => i + 1,
                        )}
                        selected={day - 1}
                        onSelect={(idx) => setDay(idx + 1)}
                        highlightIndex={
                            year === currentYear && monthIdx === currentMonth
                                ? currentDay - 1
                                : undefined
                        } // Highlight if current month
                        optionsView="grid"
                        position="top"
                        className="border-y border-gray-400"
                    />
                    <DropdownSelect
                        options={[currentYear, currentYear + 1]}
                        selected={year === currentYear ? 0 : 1}
                        onSelect={(idx) => setYear(currentYear + idx)}
                        highlightIndex={0} // Highlight current year
                        optionsView="list"
                        position="top"
                        className="rounded-r border border-gray-400"
                    />
                </>
            ) : (
                <>
                    <DropdownSelect
                        options={Array.from({ length: 12 }, (_, i) => i + 1)}
                        selected={hour - 1}
                        onSelect={(idx) => setHour(idx + 1)}
                        optionsView="list"
                        position="top"
                        className="rounded-l border border-gray-400"
                    />
                    <DropdownSelect
                        options={['00', '15', '30', '45']} // Hardcoded steps
                        selected={['00', '15', '30', '45'].indexOf(
                            minute.toString().padStart(2, '0'),
                        )}
                        onSelect={(idx) => {
                            const selectedValue = [0, 15, 30, 45][idx];
                            setMinute(selectedValue);
                        }}
                        optionsView="list" // "grid" is better than "gridWide" for just 4 items
                        position="top"
                        className="border-y border-gray-400"
                    />
                    <DropdownSelect
                        options={['AM', 'PM']}
                        selected={meridianIdx}
                        onSelect={setMeridianIdx}
                        optionsView="list"
                        position="top"
                        className="rounded-r border border-gray-400"
                    />
                </>
            )}
        </div>
    );
};

export default DateTimePicker;
