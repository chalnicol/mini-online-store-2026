import {
	Home,
	Settings,
	User,
	Bell,
	type LucideProps,
	ShoppingCart,
} from "lucide-react";

// 1. Define the icons you want to "allow" in your app
export const ICON_MAP = {
	home: Home,
	settings: Settings,
	user: User,
	notifications: Bell,
	cart: ShoppingCart,
} as const;

// 2. Create the type based on the keys above
export type IconName = keyof typeof ICON_MAP;

interface IconProps extends LucideProps {
	name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
	const IconComponent = ICON_MAP[name];
	return <IconComponent {...props} />;
};
