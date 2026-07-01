import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase-browser";

export default function AppLayout() {
	const navigate = useNavigate();

	async function handleSignOut() {
		await supabase.auth.signOut();
		navigate({ to: "/login" });
	}

	return (
		<>
			<nav className="border-b border-border bg-background">
				<div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
					<Link
						to="/"
						className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
					>
						Meal Guru
					</Link>
					<Link
						to="/pick"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Plan
					</Link>
					<Link
						to="/recipes"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Recipes
					</Link>
					<Link
						to="/ingredients"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
