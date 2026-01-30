/**
 * Formats a 24-hour time string (HH:mm) to 12-hour format with AM/PM.
 */
export const formatTo12Hour = (timeStr: string): string => {
	if (!timeStr) return "";

	const [hours, minutes] = timeStr.split(":");
	let hour = parseInt(hours, 10);
	const ampm = hour >= 12 ? "PM" : "AM";

	hour = hour % 12;
	hour = hour ? hour : 12; // convert 0 to 12

	return `${hour}:${minutes} ${ampm}`;
};

/**
 * Returns today's date in YYYY-MM-DD format for HTML input constraints.
 */
export const getTodayDateString = (): string => {
	return new Date().toISOString().split("T")[0];
};

/**
 * Formats a YYYY-MM-DD string into "Jan 02, 2026"
 */
export const formatShortDate = (dateStr: string): string => {
	if (!dateStr) return "";

	// We add 'T00:00:00' to prevent the Date object from
	// shifting the day due to local timezone offsets
	const date = new Date(`${dateStr}T00:00:00`);

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(date);
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const getRelativeTime = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
	const minutes = Math.round(seconds / 60);
	const hours = Math.round(minutes / 60);
	const days = Math.round(hours / 24);
	const weeks = Math.round(days / 7);
	const months = Math.round(days / 30.436875); // Average days in a month
	const years = Math.round(days / 365.25);

	if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
	if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
	if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
	if (Math.abs(days) < 7) return rtf.format(days, "day");
	if (Math.abs(weeks) < 4) return rtf.format(weeks, "week"); // Limit weeks for compactness
	if (Math.abs(months) < 12) return rtf.format(months, "month");
	return rtf.format(years, "year");
};
