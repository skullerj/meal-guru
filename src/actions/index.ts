import createIngredient from "./ingredient/create-ingredient";
import deleteIngredient from "./ingredient/delete-ingredient";
import updateIngredient from "./ingredient/update-ingredient";
import editRecipe from "./recipe/edit-recipe";
import parseRecipe from "./recipe/parse-recipe";
import saveRecipe from "./recipe/save-recipe";

export const server = {
  parseRecipe,
  saveRecipe,
  editRecipe,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
