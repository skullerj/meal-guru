import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import { supabase } from "@/lib/supabase-browser";

export default function AppLayout() {
	const navigate = useNavigate();

	async function handleSignOut() {
		await supabase.auth.signOut();
		navigate({ to: "/login" });
	}

	return (
		<>
			<OfflineIndicator />
			<nav className="border-b border-border bg-background">
				<div className="max-w-5xl mx-auto px-4 flex items-center gap-6">
					<Link
						to="/"
						className="text-sm font-semibold text-foreground hover:text-primary transition-colors py-3 font-heading"
					>
						Meal Guru
					</Link>
					<Link
						to="/pick"
						className="text-sm hover:text-foreground transition-colors py-3 -mb-px border-b-2"
						activeOptions={{ exact: false }}
						activeProps={{
							className:
								"font-medium text-foreground border-primary",
						}}
						inactiveProps={{
							className:
								"text-muted-foreground border-transparent",
						}}
					>
						Plan
					</Link>
					<Link
						to="/recipes"
						className="text-sm hover:text-foreground transition-colors py-3 -mb-px border-b-2"
						activeOptions={{ exact: false }}
						activeProps={{
							className:
								"font-medium text-foreground border-primary",
						}}
						inactiveProps={{
							className:
								"text-muted-foreground border-transparent",
						}}
					>
						Recipes
					</Link>
					<Link
						to="/ingredients"
						className="text-sm hover:text-foreground transition-colors py-3 -mb-px border-b-2"
						activeOptions={{ exact: false }}
						activeProps={{
							className:
								"font-medium text-foreground border-primary",
						}}
						inactiveProps={{
							className:
								"text-muted-foreground border-transparent",
						}}
					>
						Ingredients
					</Link>
					<button
						type="button"
						onClick={handleSignOut}
						className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Log out
					</button>
				</div>
			</nav>
			<Outlet />
		</>
	);
}
