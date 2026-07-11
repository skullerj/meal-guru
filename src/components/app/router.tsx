import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
// Lazy imports for page components
import LoginForm from "@/components/auth/LoginForm";
import HomePage from "@/components/home/HomePage";
import IngredientList from "@/components/ingredients/IngredientList";
import MealPlanner from "@/components/meal-planner/MealPlanner";
import CookingView from "@/components/recipe/CookingView";
import RecipeList from "@/components/recipes/RecipeList";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import PageLayout from "@/components/shared/PageLayout";
import ShopPage from "@/components/shop/ShopPage";
import ShopPageSkeleton from "@/components/shop/ShopPageSkeleton";
import { getShopIngredients } from "@/lib/database";
import {
  queryKeys,
  useActiveShop,
  useIngredients,
  useRecipe,
  useRecipes,
} from "@/lib/queries";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase-browser";
import AppLayout from "./AppLayout";

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
    <PageLayout title="Plan your week" showBack backLabel="Back">
      <MealPlanner recipes={recipes ?? []} />
    </PageLayout>
  );
}

function RecipesContent() {
  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const { data: ingredients, isLoading: ingredientsLoading } = useIngredients();

  if (recipesLoading || ingredientsLoading) {
    return <LoadingSkeleton />;
  }

  return <RecipeList recipes={recipes ?? []} ingredients={ingredients ?? []} />;
}

function IngredientsContent() {
  const { data: ingredients, isLoading } = useIngredients();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <PageLayout title="Ingredients" backLabel="Home" showBack>
      <IngredientList ingredients={ingredients ?? []} />
    </PageLayout>
  );
}

function ShopContent() {
  const { id } = shopIdRoute.useParams();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.shopIngredients(id),
      queryFn: () => getShopIngredients(supabase, id),
    });
  }, [id]);

  return (
    <ErrorBoundary key={id} fallback={<ShopErrorFallback />}>
      <Suspense fallback={<ShopPageSkeleton />}>
        <ShopPage shopId={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

function ShopErrorFallback() {
  return (
    <PageLayout title="Something went wrong" showBack backLabel="Go home">
      <p className="text-muted-foreground">This shop could not be loaded.</p>
    </PageLayout>
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

  return <CookingView recipe={recipe} />;
}

// --- Route tree ---

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (user) return user;
  if (error) {
    // Network error (offline) — fall back to cached session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  }
  return null;
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => ({
    returnTo: (search.returnTo as string) || undefined,
  }),
  beforeLoad: async () => {
    const user = await getAuthUser();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

const authenticatedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async ({ location }) => {
    const user = await getAuthUser();
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

export const router = createRouter({ routeTree, basepath: '/app' });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
