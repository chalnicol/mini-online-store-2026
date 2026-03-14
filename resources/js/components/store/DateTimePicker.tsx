import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import DropdownSelectButton from './DropdownSelectButton';

interface DateTimePickerProps {
  value: string; // "2026-01-01" or "14:30:00"
  type: 'date' | 'time';
  onChange: (value: string) => void;
  className?: string;
  optionsPosition?: 'top' | 'bottom';
  maxYear?: number | null;
  minYear?: number | null;
  disabled?: boolean;
}

type MeridianType = 'AM' | 'PM';

const DateTimePicker = ({
  value,
  type,
  onChange,
  optionsPosition = 'bottom',
  maxYear,
  minYear,
  className,
  disabled,
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
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(currentYear);
  const [hour, setHour] = useState(12); // 1-12
  const [minute, setMinute] = useState(0);
  const [meridian, setMeridian] = useState<MeridianType>('AM');
  //   const [meridianIdx, setMeridianIdx] = useState(0); // 0 = AM, 1 = PM

  // 1. Initial Parse
  useEffect(() => {
    if (!value || value === '') {
      setMonth(currentMonth);
      setDay(currentDay);
      setYear(currentYear);
      setHour(12);
      setMinute(0);
      setMeridian('AM');
      return;
    }
    if (type === 'date') {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1] - 1);
        setDay(parts[2]);
      }
    } else {
      const parts = value.split(':').map(Number);
      if (parts.length >= 2) {
        const h24 = parts[0];
        setHour(h24 % 12 || 12);
        setMinute(parts[1]);
        setMeridian(h24 >= 12 ? 'PM' : 'AM');
      }
    }
  }, []);

  // 2. Value Updater
  useEffect(() => {
    if (disabled) return;
    if (type === 'date') {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const maxDays = month === 1 && isLeapYear ? 29 : months[month].days;
      const clampedDay = Math.min(day, maxDays);

      // Sync state if day was out of range
      if (clampedDay !== day) {
        setDay(clampedDay);
      }

      const res = `${year}-${(month + 1).toString().padStart(2, '0')}-${clampedDay.toString().padStart(2, '0')}`;
      if (res !== value) onChange(res);
      //   const res = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      //   if (res !== value) onChange(res);
    } else {
      let h24 = hour;
      //   if (meridianIdx === 1 && h24 < 12) h24 += 12; // PM logic
      //   if (meridianIdx === 0 && h24 === 12) h24 = 0; // AM logic
      if (meridian === 'PM' && h24 < 12) h24 += 12; // PM logic
      if (meridian === 'AM' && h24 === 12) h24 = 0; // AM logic
      const res = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      if (res !== value) onChange(res);
    }
  }, [month, day, year, hour, minute, meridian, disabled]);

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = month === 1 && isLeapYear ? 29 : months[month].days;

  const yearOptions = useMemo(() => {
    let min = currentYear;
    if (minYear && minYear < min) min = minYear;

    let max = currentYear;
    if (maxYear && maxYear > max) max = maxYear;

    return Array.from({ length: max - min + 1 }, (_, i) => {
      return { label: (min + i).toString(), value: min + i };
    });
  }, [minYear, maxYear, currentYear]);

  return (
    <div className={cn('grid grid-cols-3 gap-1', className)}>
      {type === 'date' ? (
        <>
          <DropdownSelectButton<number>
            options={months.map((m, i) => {
              return { label: m.short, value: i };
            })}
            renderedLabel={(value) => months[value].name}
            value={month}
            onChange={setMonth}
            highlighted={currentMonth} // Highlight if current year
            optionsView="grid"
            position={optionsPosition === 'bottom' ? 'bottom-left' : 'top-left'}
            disabled={disabled}
          />
          <DropdownSelectButton<number>
            options={Array.from({ length: daysInMonth }, (_, i) => {
              return { label: (i + 1).toString().padStart(2, '0'), value: i + 1 };
            })}
            value={day}
            onChange={setDay}
            highlighted={currentDay} // Highlight if current month
            optionsView="grand"
            position={optionsPosition === 'bottom' ? 'bottom-left' : 'top-left'}
            disabled={disabled}
          />
          <DropdownSelectButton<number>
            options={yearOptions}
            value={year}
            onChange={setYear}
            highlighted={currentYear} // Highlight if current month
            optionsView={yearOptions.length > 3 ? 'grid' : 'list'}
            position={optionsPosition === 'bottom' ? 'bottom-right' : 'top-right'}
            disabled={disabled}
          />
        </>
      ) : (
        <>
          <DropdownSelectButton<number>
            options={Array.from({ length: 12 }, (_, i) => {
              return { label: (i + 1).toString().padStart(2, '0'), value: i + 1 };
            })}
            value={hour}
            onChange={setHour}
            optionsView="grid"
            position="top-left"
            disabled={disabled}
          />

          <DropdownSelectButton<number>
            options={Array.from({ length: 12 }, (_, i) => {
              return { label: (i * 5).toString().padStart(2, '0'), value: i * 5 };
            })}
            value={minute}
            onChange={setMinute}
            optionsView="grid"
            position="top-left"
            disabled={disabled}
          />

          <DropdownSelectButton<MeridianType>
            options={[
              { label: 'AM', value: 'AM' },
              { label: 'PM', value: 'PM' },
            ]}
            value={meridian}
            onChange={setMeridian}
            optionsView="list"
            position="top-left"
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
};

export default DateTimePicker;
