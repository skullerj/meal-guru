import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import type { Recipe } from "@/data/types";
import {
  createShop,
  deactivateShopsForWeek,
  getWeekMonday,
  recommendRecipeIds,
  type ShopSummary,
} from "@/lib/database";
import { supabase } from "@/lib/supabase-browser";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/queries";

interface HomePageProps {
  recipes: Recipe[];
  activeShop: ShopSummary | null;
}

export default function HomePage({ recipes, activeShop }: HomePageProps) {
  if (recipes.length === 0) {
    return <NoRecipesState />;
  }

  if (!activeShop) {
    return <NoActiveShopState />;
  }

  const recipeNames = activeShop.recipe_ids
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => r !== undefined);

  if (activeShop.status === "shopping") {
    return <ShoppingState activeShop={activeShop} recipeNames={recipeNames} />;
  }

  return <CookingState activeShop={activeShop} recipeNames={recipeNames} />;
}

function NoRecipesState() {
  return (
    <div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-3 font-heading">
        Meal Guru
      </h1>
      <p className="text-lg text-muted-foreground mb-4">Let's get started</p>
      <p className="text-sm text-muted-foreground mb-10">
        You need to add some recipes before you can plan your week. Head over to
        your recipe book to get started.
      </p>
      <Link to="/recipes">
        <Button variant="primary" size="lg" leftIcon="book-open">
          Go to recipes
        </Button>
      </Link>
    </div>
  );
}

function NoActiveShopState() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleStartWeek() {
    setLoading(true);
    setError(false);
    try {
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.activeShop,
      });
      navigate({ to: "/shop/$id", params: { id: shop.id } });
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-3 font-heading">
        Meal Guru
      </h1>
      <p className="text-lg text-muted-foreground mb-4">
        What are you cooking this week?
      </p>
      <p className="text-sm text-muted-foreground mb-10">
        When you start a week our smart picker will look at your previous weeks
        and pick a recommendation of two recipes for your week, you can also
        build your week manually.
      </p>
      <div className="flex flex-col items-center gap-5">
        <Button
          variant="primary"
          size="lg"
          leftIcon="sparkles"
          onClick={handleStartWeek}
          loading={loading}
        >
          Start the week
        </Button>
        {error && (
          <p className="text-xs text-destructive">
            Something went wrong. Try again.
          </p>
        )}
        <Link
          to="/pick"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pick recipes manually
          <Icon name="chevron-right" size="xs" className="inline ml-0.5" />
        </Link>
      </div>
    </div>
  );
}

function RecipeNameList({ recipeNames }: { recipeNames: Recipe[] }) {
  return (
    <ul className="mb-8 space-y-1">
      {recipeNames.map((recipe) => (
        <li key={recipe.id} className="text-sm text-muted-foreground">
          {recipe.name}
        </li>
      ))}
    </ul>
  );
}

function ShoppingState({
  activeShop,
  recipeNames,
}: { activeShop: ShopSummary; recipeNames: Recipe[] }) {
  return (
    <div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-3 font-heading">
        Meal Guru
      </h1>
      <p className="text-lg text-muted-foreground mb-6">Shopping time!</p>
      <RecipeNameList recipeNames={recipeNames} />
      <Link to="/shop/$id" params={{ id: activeShop.id }}>
        <Button variant="primary" size="lg" leftIcon="shopping-cart">
          Go to shopping list
        </Button>
      </Link>
    </div>
  );
}

function CookingState({
  activeShop,
  recipeNames,
}: { activeShop: ShopSummary; recipeNames: Recipe[] }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleStartNewWeek() {
    setLoading(true);
    setError(false);
    try {
      const weekMonday = getWeekMonday();
      await deactivateShopsForWeek(supabase, weekMonday);
      const ids = await recommendRecipeIds(supabase);
      const shop = await createShop(supabase, ids);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.activeShop,
      });
      navigate({ to: "/shop/$id", params: { id: shop.id } });
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-3 font-heading">
        Meal Guru
      </h1>
      <p className="text-lg text-muted-foreground mb-6">Time to cook!</p>
      <RecipeNameList recipeNames={recipeNames} />
      <div className="flex flex-col items-center gap-4">
        <Link to="/shop/$id" params={{ id: activeShop.id }}>
          <Button variant="primary" size="lg" leftIcon="chef-hat">
            View your recipes
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleStartNewWeek}
          loading={loading}
        >
          Start new week
        </Button>
        {error && (
          <p className="text-xs text-destructive">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </div>
  );
}
