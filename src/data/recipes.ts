export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  amount: number;
  source: {
    url: string;
    price: number;
    amount: number;
  };
  shelf: boolean;
}

interface InstructionStep {
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
    id: "lentileggplant-stew",
    name: "Lentil-Eggplant Stew",
    ingredients: [
      {
        id: "olive-oil",
        name: "olive oil",
        amount: 50,
        unit: "ml",
        source: {
          url: "https://www.ocado.com/products/filippo-berio-extra-virgin-olive-oil/13887011",
          price: 5,
          amount: 500,
        },
        shelf: true,
      },
      {
        id: "garlic-cloves",
        name: "garlic cloves",
        amount: 3,
        unit: "cloves",
        source: {
          url: "https://www.ocado.com/products/ocado-large-garlic/91370011",
          price: 0.4,
          amount: 6,
        },
        shelf: false,
      },
      {
        id: "red-onion",
        name: "red onion",
        amount: 160,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/ocado-red-onions/65453011",
          price: 0.95,
          amount: 480,
        },
        shelf: false,
      },
      {
        id: "thyme",
        name: "thyme",
        amount: 9,
        unit: "gr",
        source: {
          url: "https://www.ocado.com/products/cook-with-m-s-thyme/518923011",
          price: 1.5,
          amount: 17,
        },
        shelf: true,
      },
      {
        id: "eggplants",
        name: "eggplants",
        amount: 2,
        unit: "units",
        source: {
          url: "https://www.ocado.com/products/ocado-aubergine/474749011",
          price: 0.95,
          amount: 1,
        },
        shelf: false,
      },
      {
        id: "cherry-tomatoes",
        name: "cherry tomatoes",
        amount: 200,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/m-s-cherry-tomatoes/517743011",
          price: 1.2,
          amount: 350,
        },
        shelf: false,
      },
      {
        id: "puy-lentils",
        name: "puy lentils",
        amount: 180,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/great-scot-green-lentils/516744011",
          price: 1.75,
          amount: 500,
        },
        shelf: true,
      },
      {
        id: "vegetable-broth-cube",
        name: "vegetable broth cube stocks",
        amount: 1,
        unit: "unit",
        source: {
          url: "https://www.ocado.com/products/oxo-12-vegetable-stock-cubes/19366011",
          price: 2.4,
          amount: 12,
        },
        shelf: true,
      },
      {
        id: "dry-white-wine",
        name: "dry white wine",
        amount: 80,
        unit: "ml",
        source: {
          url: "https://www.ocado.com/products/m-s-pinot-grigio-provincia-di-pavia/513458011",
          price: 7.5,
          amount: 750,
        },
        shelf: true,
      },
      {
        id: "crme-frache",
        name: "crème fraîche",
        amount: 100,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/m-s-creme-fraiche/574047011",
          price: 1.1,
          amount: 300,
        },
        shelf: false,
      },
      {
        id: "chilly-flakes",
        name: "Chilly Flakes",
        amount: 2,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/cook-with-m-s-chilli-flakes/518837011",
          price: 1.5,
          amount: 30,
        },
        shelf: true,
      },
      {
        id: "oregano-leaves",
        name: "oregano leaves",
        amount: 2,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/cook-with-m-s-oregano/518834011",
          price: 1.5,
          amount: 12,
        },
        shelf: true,
      },
      {
        id: "salt",
        name: "salt",
        amount: 18,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/saxa-fine-sea-salt/529703011",
          price: 1.65,
          amount: 350,
        },
        shelf: true,
      },
      {
        id: "black-pepper",
        name: "black pepper",
        amount: 8,
        unit: "g",
        source: {
          url: "https://www.ocado.com/products/cook-with-m-s-black-peppercorns/518911011",
          price: 3.2,
          amount: 100,
        },
        shelf: true,
      },
    ],
    instructions: [
      {
        text: "In a large pan, heat 2 tbsp olive oil over medium temperature. Add garlic, onion, thyme and ½ tsp salt and sauté golden brown for 8 minutes, stirring regularly. Transfer to a bowl - without the oil - and set aside.",
        ingredientIds: [],
      },
      {
        text: "Season eggplant and tomatoes in a bowl with ¼ tsp salt and plenty of pepper. Heat the remaining oil (1 tbsp) vigorously in the pan. Add eggplant and tomatoes, sauté over medium to high heat for 10 minutes, turning constantly, until the eggplant is golden brown and soft and the tomatoes are slightly darkened. Add garlic and onion back, add lentils, broth, wine and 450ml water, stir everything with ¾ tsp salt. Bring to a boil and simmer over medium heat for 40 minutes, until the lentils are cooked but still have some bite.",
        ingredientIds: [],
      },
      {
        text: "Serve the stew warm or chilled, with a dollop of crème fraîche and a few drops of olive oil, sprinkled with Isot Biber and oregano leaves.",
        ingredientIds: [],
      },
    ],
  },
];
