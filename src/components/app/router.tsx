import {
	Outlet,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { aggregateIngredients } from "@/components/meal-planner/utils/mealPlannerUtils";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import PageLayout from "@/components/shared/PageLayout";
import {
	useActiveShop,
	useIngredients,
	useRecipe,
	useRecipes,
	useShop,
	useShopIngredients,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase-browser";
import AppLayout from "./AppLayout";

// Lazy imports for page components
import LoginForm from "@/components/auth/LoginForm";
import HomePage from "@/components/home/HomePage";
import IngredientList from "@/components/ingredients/IngredientList";
import MealPlanner from "@/components/meal-planner/MealPlanner";
import CookingView from "@/components/recipe/CookingView";
import RecipeList from "@/components/recipes/RecipeList";
import ShopPage from "@/components/shop/ShopPage";

// --- Home loading skeleton (matches HomePageWrapper) ---

function HomeLoadingSkeleton() {
	return (
		<div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
			<h1 className="text-4xl font-bold text-foreground mb-3 font-heading">
				Meal Guru
			</h1>
			<div className="h-5 w-48 mx-auto rounded bg-muted animate-pulse mb-10" />
			<div className="h-11 w-40 mx-auto rounded bg-muted animate-pulse" />
		</div>
	);
}

// --- Route components ---

function LoginPage() {
	return (
		<main className="min-h-screen bg-background flex items-center justify-center">
			<LoginForm />
		</main>
	);
}

function IndexContent() {
	const { data: recipes, isLoading: recipesLoading } = useRecipes();
	const { data: activeShop, isLoading: shopLoading } = useActiveShop();

	if (recipesLoading || shopLoading) {
		return (
			<main className="min-h-screen bg-background flex items-center justify-center">
				<HomeLoadingSkeleton />
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background flex items-center justify-center">
			<HomePage recipes={recipes ?? []} activeShop={activeShop ?? null} />
		</main>
	);
}

function PickContent() {
	const { data: recipes, isLoading } = useRecipes();

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<PageLayout title="Plan your week" backUrl="/" backLabel="Back">
			<MealPlanner recipes={recipes ?? []} />
		</PageLayout>
	);
}

function RecipesContent() {
	const { data: recipes, isLoading: recipesLoading } = useRecipes();
	const { data: ingredients, isLoading: ingredientsLoading } =
		useIngredients();

	if (recipesLoading || ingredientsLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<RecipeList recipes={recipes ?? []} ingredients={ingredients ?? []} />
	);
}

function IngredientsContent() {
	const { data: ingredients, isLoading } = useIngredients();

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<PageLayout title="Ingredients" backLabel="Home" backUrl="/">
			<IngredientList ingredients={ingredients ?? []} />
		</PageLayout>
	);
}

function ShopContent() {
	const { id } = shopIdRoute.useParams();
	const navigate = useNavigate();
	const { data: shop, isLoading: shopLoading } = useShop(id);
	const { data: shopIngredients, isLoading: ingredientsLoading } =
		useShopIngredients(id);

	if (shopLoading || ingredientsLoading) {
		return <LoadingSkeleton />;
	}

	if (!shop) {
		navigate({ to: "/" });
		return null;
	}

	const groups = aggregateIngredients(
		shop.recipes,
		shop.recipes.map((r) => r.id),
	);

	return (
		<ShopPage
			shopId={id}
			recipes={shop.recipes}
			groups={groups}
			shopIngredients={shopIngredients ?? []}
			initialStatus={shop.status ?? "shopping"}
		/>
	);
}

function CookingViewContent() {
	const { id } = recipeIdRoute.useParams();
	const navigate = useNavigate();
	const { data: recipe, isLoading } = useRecipe(id);

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	if (!recipe) {
		navigate({ to: "/recipes" });
		return null;
	}

	// Determine back URL from history or default to /recipes
	const backUrl = "/recipes";

	return <CookingView recipe={recipe} backUrl={backUrl} />;
}

// --- Route tree ---

const rootRoute = createRootRoute({
	component: () => <Outlet />,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: LoginPage,
	validateSearch: (
		search: Record<string, unknown>,
	): { returnTo?: string } => ({
		returnTo: (search.returnTo as string) || undefined,
	}),
	beforeLoad: async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (user) {
			throw redirect({ to: "/" });
		}
	},
});

const authenticatedLayout = createRoute({
	getParentRoute: () => rootRoute,
	id: "_authenticated",
	beforeLoad: async ({ location }) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			throw redirect({
				to: "/login",
				search: { returnTo: location.pathname },
			});
		}
	},
	component: AppLayout,
});

const indexRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/",
	component: IndexContent,
});

const pickRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/pick",
	component: PickContent,
});

const recipesRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/recipes",
	component: RecipesContent,
});

const ingredientsRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/ingredients",
	component: IngredientsContent,
});

const shopIdRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/shop/$id",
	component: ShopContent,
});

const recipeIdRoute = createRoute({
	getParentRoute: () => authenticatedLayout,
	path: "/recipe/$id",
	component: CookingViewContent,
});

const routeTree = rootRoute.addChildren([
	loginRoute,
	authenticatedLayout.addChildren([
		indexRoute,
		pickRoute,
		recipesRoute,
		ingredientsRoute,
		shopIdRoute,
		recipeIdRoute,
	]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
