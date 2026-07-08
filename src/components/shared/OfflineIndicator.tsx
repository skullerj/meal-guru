import { useOnlineStatus } from "@/lib/use-online-status";
import Icon from "./Icon";

export default function OfflineIndicator() {
	const isOnline = useOnlineStatus();
	if (isOnline) return null;

	return (
		<div className="bg-destructive text-primary-foreground text-sm text-center py-1.5 px-4 flex items-center justify-center gap-2">
			<Icon name="wifi-off" size="sm" />
			You're offline — changes will sync when reconnected
		</div>
	);
}
