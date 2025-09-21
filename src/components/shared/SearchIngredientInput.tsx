import { useEffect, useRef, useState } from "react";
import type { Ingredient } from "../../lib/database";

interface SearchIngredientInputProps {
  value: string;
  availableIngredients: Omit<Ingredient, "amount">[];
  selectedIngredient?: Omit<Ingredient, "amount"> | null;
  onIngredientChange: (name: string) => void;
  onIngredientSelect: (ingredient: Omit<Ingredient, "amount">) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  label?: string;
  showExistingBadge?: boolean;
  maxSuggestions?: number;
}

export default function SearchIngredientInput({
  value,
  availableIngredients,
  selectedIngredient = null,
  onIngredientChange,
  onIngredientSelect,
  placeholder = "Start typing ingredient name...",
  className = "",
  required = false,
  id,
  label,
  showExistingBadge = true,
  maxSuggestions = 5,
}: SearchIngredientInputProps) {
  const [suggestions, setSuggestions] = useState<Omit<Ingredient, "amount">[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter ingredients for autocomplete
  useEffect(() => {
    if (value && value.length > 1 && !selectedIngredient) {
      const filtered = availableIngredients
        .filter((ing) => ing.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, maxSuggestions);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, availableIngredients, selectedIngredient, maxSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNameChange = (name: string) => {
    onIngredientChange(name);
  };

  const handleSuggestionSelect = (ingredient: Omit<Ingredient, "amount">) => {
    onIngredientSelect(ingredient);
    setShowSuggestions(false);
  };

  const isUsingExistingIngredient = Boolean(selectedIngredient);

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      {showExistingBadge && isUsingExistingIngredient && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
            Reusing existing ingredient
          </span>
        </div>
      )}
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleNameChange(e.target.value)}
        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${className}`}
        required={required}
        placeholder={placeholder}
      />

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-gray-500">
                Unit: {suggestion.unit} | Shelf:{" "}
                {suggestion.shelf ? "Yes" : "No"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
