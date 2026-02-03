import { useState } from "react";
import type { Ingredient } from "../../lib/database";
import Button, {
  type ButtonSize,
  type ButtonVariant,
} from "../shared/Button";
import CardButton from "../shared/CardButton";
import CheckboxCard, {
  type CheckboxCardVariant,
} from "../shared/CheckboxCard";
import Icon, { type IconName, type IconSize } from "../shared/Icon";
import IconButton, {
  type IconButtonSize,
  type IconButtonVariant,
} from "../shared/IconButton";
import SearchIngredientInput from "../shared/SearchIngredientInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

const allIcons: IconName[] = [
  "check-circle",
  "upload",
  "loading",
  "warning",
  "arrow-left",
  "reset",
  "save",
  "edit",
  "delete",
  "add",
  "info",
  "close",
  "package",
];

const iconSizes: IconSize[] = ["xs", "sm", "md", "lg", "xl"];

const buttonVariants: ButtonVariant[] = [
  "primary",
  "secondary",
  "success",
  "danger",
  "card",
];

const buttonSizes: ButtonSize[] = ["sm", "md", "lg"];

const iconButtonVariants: IconButtonVariant[] = [
  "primary",
  "secondary",
  "success",
  "danger",
  "ghost",
];

const iconButtonSizes: IconButtonSize[] = ["sm", "md", "lg"];

const checkboxCardVariants: CheckboxCardVariant[] = ["blue", "green", "yellow"];

const mockIngredients: Omit<Ingredient, "amount">[] = [
  {
    id: "1",
    name: "Chicken Breast",
    unit: "g",
    shelf: false,
    created_at: "2024-01-01T00:00:00Z",
    source: { url: "https://example.com/chicken", price: 5.99, amount: 500 },
  },
  {
    id: "2",
    name: "Olive Oil",
    unit: "ml",
    shelf: true,
    created_at: "2024-01-01T00:00:00Z",
    source: { url: "https://example.com/oil", price: 8.99, amount: 500 },
  },
  {
    id: "3",
    name: "Garlic",
    unit: "unit",
    shelf: true,
    created_at: "2024-01-01T00:00:00Z",
    source: { url: "https://example.com/garlic", price: 0.5, amount: 1 },
  },
  {
    id: "4",
    name: "Onion",
    unit: "unit",
    shelf: false,
    created_at: "2024-01-01T00:00:00Z",
    source: { url: "https://example.com/onion", price: 0.3, amount: 1 },
  },
  {
    id: "5",
    name: "Salt",
    unit: "g",
    shelf: true,
    created_at: "2024-01-01T00:00:00Z",
    source: { url: "https://example.com/salt", price: 1.5, amount: 500 },
  },
];

export default function StyleGuide() {
  const [cardSelected, setCardSelected] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>(
    {}
  );
  const [ingredientValue, setIngredientValue] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<
    Omit<Ingredient, "amount"> | null
  >(null);

  const toggleCheckbox = (key: string) => {
    setCheckboxStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Style Guide</h1>
      <p className="text-gray-600 mb-12">
        A showcase of all shared components and their variations.
      </p>

      {/* Section 1: Icons */}
      <Section title="Icons">
        <SubSection title="All Icons">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {allIcons.map((iconName) => (
              <div
                key={iconName}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg"
              >
                <Icon name={iconName} size="md" />
                <span className="mt-2 text-xs text-gray-500">{iconName}</span>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Icon Sizes">
          <div className="flex items-end gap-8">
            {iconSizes.map((size) => (
              <div key={size} className="flex flex-col items-center">
                <Icon name="check-circle" size={size} />
                <span className="mt-2 text-xs text-gray-500">{size}</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Section 2: Buttons */}
      <Section title="Buttons">
        <SubSection title="Variants and Sizes">
          <div className="space-y-4">
            {buttonVariants.map((variant) => (
              <div key={variant} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-600">{variant}</span>
                {buttonSizes.map((size) => (
                  <Button key={`${variant}-${size}`} variant={variant} size={size}>
                    Button {size}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="States">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </div>
        </SubSection>

        <SubSection title="With Icons">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon="add">
              Left Icon
            </Button>
            <Button variant="primary" rightIcon="arrow-left">
              Right Icon
            </Button>
            <Button variant="primary" leftIcon="save" rightIcon="check-circle">
              Both Icons
            </Button>
          </div>
        </SubSection>
      </Section>

      {/* Section 3: IconButtons */}
      <Section title="Icon Buttons">
        <SubSection title="Variants and Sizes">
          <div className="space-y-4">
            {iconButtonVariants.map((variant) => (
              <div key={variant} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-600">{variant}</span>
                {iconButtonSizes.map((size) => (
                  <IconButton
                    key={`${variant}-${size}`}
                    icon="edit"
                    variant={variant}
                    size={size}
                    aria-label={`${variant} ${size} icon button`}
                  />
                ))}
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="States">
          <div className="flex flex-wrap gap-4">
            <IconButton icon="edit" aria-label="Normal" />
            <IconButton icon="edit" disabled aria-label="Disabled" />
            <IconButton icon="edit" loading aria-label="Loading" />
          </div>
        </SubSection>

        <SubSection title="Different Icons">
          <div className="flex flex-wrap gap-4">
            {allIcons.slice(0, 8).map((iconName) => (
              <IconButton
                key={iconName}
                icon={iconName}
                variant="secondary"
                aria-label={iconName}
              />
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Section 4: CardButton */}
      <Section title="Card Button">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <CardButton onClick={() => setCardSelected(!cardSelected)}>
            <div className="text-left">
              <div className="font-medium">Clickable Card</div>
              <div className="text-sm text-gray-500">Click to toggle</div>
            </div>
          </CardButton>
          <CardButton selected>
            <div className="text-left">
              <div className="font-medium">Selected Card</div>
              <div className="text-sm text-gray-500">Always selected</div>
            </div>
          </CardButton>
          <CardButton disabled>
            <div className="text-left">
              <div className="font-medium">Disabled Card</div>
              <div className="text-sm text-gray-500">Cannot interact</div>
            </div>
          </CardButton>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Interactive card state: {cardSelected ? "Selected" : "Unselected"}
        </p>
      </Section>

      {/* Section 5: CheckboxCard */}
      <Section title="Checkbox Card">
        <SubSection title="Variants">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            {checkboxCardVariants.map((variant) => (
              <div key={variant} className="space-y-2">
                <CheckboxCard
                  variant={variant}
                  checked={checkboxStates[`${variant}-checked`] ?? false}
                  onToggle={() => toggleCheckbox(`${variant}-checked`)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checkboxStates[`${variant}-checked`] ?? false}
                      onChange={() => toggleCheckbox(`${variant}-checked`)}
                      className="h-4 w-4"
                    />
                    <div className="text-left">
                      <div className="font-medium capitalize">{variant} Variant</div>
                      <div className="text-sm text-gray-500">Click to toggle</div>
                    </div>
                  </div>
                </CheckboxCard>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Disabled State">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <CheckboxCard
              variant="blue"
              checked={false}
              onToggle={() => {}}
              disabled
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" disabled className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Disabled Unchecked</div>
                  <div className="text-sm text-gray-500">Cannot interact</div>
                </div>
              </div>
            </CheckboxCard>
            <CheckboxCard
              variant="green"
              checked
              onToggle={() => {}}
              disabled
            >
              <div className="flex items-center gap-3">
                <input type="checkbox" checked disabled className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Disabled Checked</div>
                  <div className="text-sm text-gray-500">Cannot interact</div>
                </div>
              </div>
            </CheckboxCard>
          </div>
        </SubSection>
      </Section>

      {/* Section 6: SearchIngredientInput */}
      <Section title="Search Ingredient Input">
        <div className="max-w-md space-y-8">
          <SubSection title="Empty State">
            <SearchIngredientInput
              value=""
              availableIngredients={mockIngredients}
              onIngredientChange={() => {}}
              onIngredientSelect={() => {}}
              placeholder="Start typing ingredient name..."
              label="Ingredient Name"
            />
          </SubSection>

          <SubSection title="Interactive (with suggestions)">
            <SearchIngredientInput
              value={ingredientValue}
              availableIngredients={mockIngredients}
              selectedIngredient={selectedIngredient}
              onIngredientChange={(name) => {
                setIngredientValue(name);
                setSelectedIngredient(null);
              }}
              onIngredientSelect={(ingredient) => {
                setIngredientValue(ingredient.name);
                setSelectedIngredient(ingredient);
              }}
              placeholder="Try typing 'ch' or 'on'..."
              label="Search Ingredient"
              showExistingBadge
            />
            {selectedIngredient && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {selectedIngredient.name} ({selectedIngredient.unit})
              </p>
            )}
          </SubSection>
        </div>
      </Section>

      {/* Section 7: Dialog */}
      <Section title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sample Dialog</DialogTitle>
              <DialogDescription>
                This is a sample dialog demonstrating the Dialog component from
                shadcn/ui built on Radix UI primitives.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">
                Dialog content goes here. You can add forms, lists, or any other
                content.
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </div>
  );
}
