import QueryProvider from "@/components/QueryProvider";
import { useActiveShop, useRecipes } from "@/lib/queries";
import HomePage from "./HomePage";

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

function Content() {
  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const { data: activeShop, isLoading: shopLoading } = useActiveShop();

  if (recipesLoading || shopLoading) {
    return <HomeLoadingSkeleton />;
  }

  return <HomePage recipes={recipes ?? []} activeShop={activeShop ?? null} />;
}

export default function HomePageWrapper() {
  return (
    <QueryProvider>
      <Content />
    </QueryProvider>
  );
}
