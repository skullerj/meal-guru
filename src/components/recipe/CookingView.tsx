import { useState } from "react";
import type { Recipe, RecipeIngredient } from "../../data/types";
import Button from "../shared/Button";
import PageLayout from "../shared/PageLayout";

interface Props {
  recipe: Recipe;
}

function formatIngredient(ri: RecipeIngredient): string {
  const amount =
    ri.amount % 1 === 0 ? ri.amount.toString() : ri.amount.toFixed(1);
  return `${amount}${ri.ingredient.unit === "unit" ? "" : ri.ingredient.unit} ${ri.ingredient.name}`;
}

export default function CookingView({ recipe }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = recipe.steps ?? [];
  const hasSteps = steps.length > 0;

  // stepIndex 0 = overview, 1..n = steps
  const isOverview = stepIndex === 0;
  const currentStep = isOverview ? null : steps[stepIndex - 1];
  const isLastStep = stepIndex === steps.length;

  const stepIngredients: RecipeIngredient[] = currentStep
    ? recipe.ingredients.filter((ri) =>
        currentStep.ingredient_ids.includes(ri.id)
      )
    : [];

  function handleBack() {
    window.history.back();
  }

  if (!hasSteps) {
    return (
      <PageLayout title={recipe.name} showBack>
        <p className="text-muted-foreground">No cooking instructions yet.</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-4 cursor-pointer border-0 bg-transparent p-0"
        >
          Back to list
        </button>
      </PageLayout>
    );
  }

  const overviewSubtitle = (
    <p className="text-sm text-muted-foreground">
      {recipe.ingredients.length} ingredient
      {recipe.ingredients.length !== 1 ? "s" : ""} &middot; {steps.length} step
      {steps.length !== 1 ? "s" : ""}
    </p>
  );

  return (
    <PageLayout
      title={recipe.name}
      showBack
      subtitle={isOverview ? overviewSubtitle : undefined}
    >
      {isOverview ? (
        <div>
          <div className="rounded-lg border border-border bg-card p-4 mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              All ingredients
            </h2>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ri) => (
                <li key={ri.id} className="text-sm text-muted-foreground">
                  {formatIngredient(ri)}
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[44px]"
            onClick={() => setStepIndex(1)}
          >
            Start cooking
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Step {stepIndex} of {steps.length}
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-6">
            {currentStep?.instruction}
          </p>

          {stepIngredients.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 mb-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Ingredients for this step
              </h3>
              <ul className="space-y-1">
                {stepIngredients.map((ri) => (
                  <li key={ri.id} className="text-sm text-foreground">
                    {formatIngredient(ri)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 min-h-[44px]"
              disabled={stepIndex <= 0}
              onClick={() => setStepIndex((i) => i - 1)}
            >
              Previous
            </Button>
            {isLastStep ? (
              <Button
                variant="success"
                size="lg"
                className="flex-1 min-h-[44px]"
                onClick={handleBack}
              >
                Done
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="flex-1 min-h-[44px]"
                onClick={() => setStepIndex((i) => i + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
