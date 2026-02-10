import { useState } from "react";
import type { Shop } from "../../lib/database";

interface ShopDetailProps {
  shop: Shop;
}

export default function ShopDetail({ shop }: ShopDetailProps) {
  const [visitedUrls, setVisitedUrls] = useState<Set<string>>(new Set());

  function openSmallWindow(
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ) {
    e.preventDefault();
    setVisitedUrls((prev) => new Set(prev).add(url));
    window.open(
      url,
      "_blank",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );
    return false;
  }

  // Separate ingredients by shelf status
  const shelfIngredients = shop.ingredients.filter((si) => si.ingredient.shelf);
  const nonShelfIngredients = shop.ingredients.filter(
    (si) => !si.ingredient.shelf
  );

  return (
    <div className="container mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shopping Detail
        </h1>
        <p className="text-gray-600">
          Created on{" "}
          {new Date(shop.created_at).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {shop.recipes.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-700 font-medium">Recipes:</p>
            <p className="text-gray-600">
              {shop.recipes.map((r) => r.name).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Main shopping list */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Shopping List</h2>
          {visitedUrls.size > 0 && (
            <p className="border rounded-sm border-purple-400 bg-purple-50 px-2 py-1">
              Visited Items
            </p>
          )}
        </div>

        {/* Price summary */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">
              £{shop.total_cost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Fresh ingredients */}
        {nonShelfIngredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Fresh Ingredients
            </h3>
            <div className="space-y-2">
              {nonShelfIngredients.map((si) => {
                const isVisited = visitedUrls.has(si.ingredient.source.url);
                return (
                  <div
                    key={si.id}
                    className={`border rounded-lg p-3 ${
                      isVisited
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {si.ingredient.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          <span>
                            Buy&nbsp;
                            {Math.ceil(si.amount / si.ingredient.source.amount)}
                            &nbsp;
                          </span>
                          <span>
                            ({si.amount} {si.ingredient.unit} needed)
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-700">
                          £{si.cost.toFixed(2)}
                        </p>
                        <a
                          href={si.ingredient.source.url}
                          onClick={(e) =>
                            openSmallWindow(e, si.ingredient.source.url)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm underline mt-1 inline-block ${
                            isVisited
                              ? "text-blue-500 hover:text-blue-700"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          Buy on Ocado
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pantry items */}
        {shelfIngredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Pantry Items
            </h3>
            <div className="space-y-2">
              {shelfIngredients.map((si) => {
                const isVisited = visitedUrls.has(si.ingredient.source.url);
                return (
                  <div
                    key={si.id}
                    className={`border rounded-lg p-3 ${
                      isVisited
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {si.ingredient.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {si.amount} {si.ingredient.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-700">
                          £{si.cost.toFixed(2)}
                        </p>
                        <a
                          href={si.ingredient.source.url}
                          onClick={(e) =>
                            openSmallWindow(e, si.ingredient.source.url)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm underline mt-1 inline-block ${
                            isVisited
                              ? "text-blue-500 hover:text-blue-700"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          Buy on Ocado
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="border-t border-gray-200 pt-4 flex gap-3">
          <a
            href="/shops"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            ← Back to Shops
          </a>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Plan New Shop
          </a>
        </div>
      </div>
    </div>
  );
}
