export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  url: string;
  shelf: boolean;
}

export interface InstructionStep {
  text: string;
  ingredientIds: string[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
}

export const recipes: Recipe[] = [
  {
    id: "one-pot-pepper-pasta",
    name: "One Pot Pepper Pasta",
    ingredients: [
      {
        id: "rapseed-oil",
        name: "Rapseed oil",
        amount: 2,
        unit: "tbsp",
        url: "https://www.ocado.com/products/ktc-rapeseed-vegetable-oil/298819011",
        shelf: true,
      },
      {
        id: "onions",
        name: "Onions",
        amount: 2,
        unit: "units",
        url: "https://www.ocado.com/products/ocado-brown-onions/65448011",
        shelf: false,
      },
      {
        id: "peppers",
        name: "Peppers",
        amount: 2,
        unit: "units",
        url: "https://www.ocado.com/products/ocado-red-peppers/65259011",
        shelf: false,
      },
      {
        id: "garlic",
        name: "Garlic Cloves",
        amount: 3,
        unit: "cloves",
        url: "https://www.ocado.com/products/ocado-garlic/54450011",
        shelf: true,
      },
      {
        id: "thyme",
        name: "Thyme",
        amount: 1,
        unit: "tsp",
        url: "https://www.ocado.com/products/ocado-dried-thyme/363264011",
        shelf: true,
      },
      {
        id: "paprika",
        name: "Smoked Paprika",
        amount: 2,
        unit: "tsp",
        url: "https://www.ocado.com/products/cook-with-m-s-smoked-paprika/505528011",
        shelf: true,
      },
      {
        id: "chopped-tomatoes",
        name: "Chopped Tomatoes",
        amount: 1,
        unit: "can",
        url: "https://www.ocado.com/products/mutti-polpa-finely-chopped-italian-tomatoes-basil/616229011",
        shelf: false,
      },
      {
        id: "tomato-puree",
        name: "Tomato Purée",
        amount: 2,
        unit: "tbsp",
        url: "https://www.ocado.com/products/cirio-tomato-puree/80259011",
        shelf: true,
      },
      {
        id: "vegetable-stock",
        name: "Vegetable Stock Cube",
        amount: 2,
        unit: "cubes",
        url: "https://www.ocado.com/products/knorr-20-vegetable-stock-cubes/384239011",
        shelf: true,
      },
      {
        id: "penne",
        name: "Penne Pasta",
        amount: 180,
        unit: "g",
        url: "https://www.ocado.com/products/ocado-penne-pasta/587564011",
        shelf: true,
      },
    ],
    instructions: [
      {
        text: "Boil salted water in a large pot and cook spaghetti according to package instructions until al dente.",
        ingredientIds: ["spaghetti", "salt"],
      },
      {
        text: "While pasta cooks, cut pancetta into small cubes and fry in a large pan until crispy.",
        ingredientIds: ["pancetta"],
      },
      {
        text: "In a bowl, whisk together eggs and grated Parmesan cheese with black pepper.",
        ingredientIds: ["eggs", "parmesan", "black-pepper"],
      },
      {
        text: "Drain pasta, reserving 1 cup of pasta water. Add hot pasta to pancetta pan.",
        ingredientIds: ["spaghetti"],
      },
      {
        text: "Remove from heat and quickly mix in egg mixture, adding pasta water gradually until creamy.",
        ingredientIds: [],
      },
      {
        text: "Serve immediately with extra Parmesan and black pepper.",
        ingredientIds: ["parmesan", "black-pepper"],
      },
    ],
  },
];
