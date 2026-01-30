interface HighlightedTextProps {
	text: string;
	highlight: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
	text,
	highlight,
}) => {
	if (!highlight.trim()) return <span>{text}</span>;

	const regex = new RegExp(`(${highlight})`, "gi");
	const parts = text.split(regex);

	return (
		<span>
			{parts.map((part, i) =>
				regex.test(part) ? (
					<span key={i} className="text-sky-600 bg-sky-50">
						{part}
					</span>
				) : (
					<span key={i}>{part}</span>
				)
			)}
		</span>
	);
};

export default HighlightedText;
