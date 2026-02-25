import { useEffect, useState } from 'react';

interface InlineDatePickerProps {
    value?: string; // Expects "YYYY-MM-DD"
    onChange: (date: string) => void;
    error?: string;
}

const InlineDatePicker = ({
    value,
    onChange,
    error,
}: InlineDatePickerProps) => {
    // Parse initial value if exists
    const initialDate = value ? value.split('-') : ['', '', ''];

    const [day, setDay] = useState(initialDate[2] || '');
    const [month, setMonth] = useState(initialDate[1] || '');
    const [year, setYear] = useState(initialDate[0] || '');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        setLocalError('');

        // Only validate and trigger onChange if all fields have input
        if (day && month && year) {
            const d = parseInt(day);
            const m = parseInt(month);
            const y = parseInt(year);

            // Validation Checks
            const date = new Date(y, m - 1, d);
            const isValidDate =
                date.getFullYear() === y &&
                date.getMonth() === m - 1 &&
                date.getDate() === d;

            if (!isValidDate) {
                setLocalError('Invalid date (check days in month).');
                return;
            }

            if (y < 1900 || y > 2100) {
                setLocalError('Year must be between 1900 and 2100.');
                return;
            }

            // If valid, send the formatted string back to the form
            const formattedDate = `${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            onChange(formattedDate);
        }
    }, [day, month, year]);

    // Helper to ensure only numbers are typed
    const handleNumberInput = (
        val: string,
        setter: (v: string) => void,
        max: number,
    ) => {
        const numeric = val.replace(/\D/g, '');
        if (numeric.length <= max) setter(numeric);
    };

    return (
        <div>
            <div className="grid grid-cols-[1fr_1fr_2fr] gap-x-0.5 rounded border border-gray-400 bg-white">
                <p className="rounded-tl bg-gray-200 text-center text-xs font-semibold text-gray-700 uppercase">
                    month
                </p>
                <p className="border-s border-gray-400 bg-gray-200 text-center text-xs font-semibold text-gray-700 uppercase">
                    date
                </p>
                <p className="rounded-tr border-s border-gray-400 bg-gray-200 text-center text-xs font-semibold text-gray-700 uppercase">
                    year
                </p>
                {/* Month */}
                <input
                    type="text"
                    placeholder="MM"
                    value={month}
                    onChange={(e) =>
                        handleNumberInput(e.target.value, setMonth, 2)
                    }
                    className="w-full rounded-bl bg-white p-1 text-center outline-none focus:ring-1 focus:ring-sky-900"
                />

                {/* Day */}
                <input
                    type="text"
                    placeholder="DD"
                    value={day}
                    onChange={(e) =>
                        handleNumberInput(e.target.value, setDay, 2)
                    }
                    className="w-full bg-white p-1 text-center outline-none focus:ring-1 focus:ring-sky-900"
                />

                {/* Year */}
                <input
                    type="text"
                    placeholder="YYYY"
                    value={year}
                    onChange={(e) =>
                        handleNumberInput(e.target.value, setYear, 4)
                    }
                    className="w-full rounded-br bg-white p-1 text-center outline-none focus:ring-1 focus:ring-sky-900"
                />
            </div>

            {(localError || error) && (
                <p className="text-xs font-medium text-red-600">
                    {localError || error}
                </p>
            )}
        </div>
    );
};

export default InlineDatePicker;
