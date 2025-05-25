var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    if (!req.session || !req.session.user_id) {
      return res.status(401).send({ message: "User not authenticated", success: false });
    }

    const user = (
      await DButils.execQuery(`SELECT username FROM users WHERE user_id = '${req.session.user_id}'`)
    )[0];

    if (!user) {
      return res.status(401).send({ message: "User not authenticated", success: false });
    }

    res.status(200).send({
      username: user.username,
      isAuthenticated: true
    });
  } catch (error) {
    next(error);
  }
});

// מסמן מתכון כנצפה על ידי המשתמש
router.post('/me/viewed/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    await user_utils.markRecipeAsViewed(user_id, recipe_id);
    
    res.status(200).send({ 
      message: "Recipe successfully marked as viewed",
      success: true
    });
  } catch(error) {
    next(error);
  }
});

// מחזיר את המתכונים האחרונים שנצפו על ידי המשתמש
router.get('/me/last-watched', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getLastViewedRecipes(user_id);
    
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    
    const results = await recipe_utils.getAllRecipesPreviewDetails(user_id,recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error);
  }
});

/**
 * Get user's favorite recipes
 */
router.get('/me/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await recipe_utils.getAllRecipesPreviewDetails(user_id,recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

/**
 * Add recipe to favorites
 */
router.post('/me/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    // Check if recipe is already in favorites
    const favorites = await user_utils.getFavoriteRecipes(user_id);
    const isAlreadyFavorite = favorites.some(fav => fav.recipe_id === recipe_id);
    if (isAlreadyFavorite) {
      return res.status(409).send({ message: "Recipe already in favorites" });
    }
    
    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send({ message: "Recipe successfully added to favorites" });
  } catch(error) {
    next(error);
  }
});

/**
 * Remove recipe from favorites
 */
router.delete('/me/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    // Check if recipe exists in favorites
    const favorites = await user_utils.getFavoriteRecipes(user_id);
    const isInFavorites = favorites.some(fav => fav.recipe_id === recipe_id);
    if (!isInFavorites) {
      return res.status(404).send({ message: "Recipe not found in favorites" });
    }
    
    await user_utils.removeFromFavorites(user_id, recipe_id);
    res.status(200).send({ 
      message: "Recipe successfully removed from favorites",
      recipeId: recipe_id
    });
  } catch(error) {
    next(error);
  }
});

/**
 * Create a new recipe for the logged-in user
 */
router.post('/me/recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    
    // Validate all required fields are present
    const { title, image, duration, vegan, vegetarian, glutenFree, ingredients, instructions, servings } = req.body;
    
    if (!title || !image || !duration || vegan === undefined || vegetarian === undefined || 
        glutenFree === undefined || !ingredients || !instructions || !servings) {
      return res.status(400).send({ message: "Missing required fields", success: false });
    }
    
    // Ensure ingredients is an array
    if (!Array.isArray(ingredients)) {
      return res.status(400).send({ message: "Ingredients must be an array", success: false });
    }
    
    // Ensure instructions is an array
    if (!Array.isArray(instructions)) {
      return res.status(400).send({ message: "Instructions must be an array", success: false });
    }
    
    // Create new recipe
    const recipe_id = await user_utils.createNewRecipe(user_id, {
      title,
      image,
      duration,
      servings,
      popularity: 0, // New recipe starts with 0 likes
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      instructions
    });
    
    res.status(201).send({ 
      message: "Recipe created successfully", 
      success: true,
      recipe_id: recipe_id
    });
    
  } catch(error) {
    next(error);
  }
});

/**
 * Get recipes created by the user
 */
router.get('/me/my-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getSelfRecipe(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await recipe_utils.getAllRecipesPreviewDetails(user_id,recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

/**
 * Create a new family recipe for the logged-in user
 */
router.post('/me/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    
    // Validate all required fields are present
    const { title, image, family_member, tradition, ingredients, instructions } = req.body;
    
    if (!title || !image || !family_member || !tradition || !ingredients || !instructions) {
      return res.status(400).send({ message: "Missing required fields", success: false });
    }
    
    // Ensure ingredients is an array
    if (!Array.isArray(ingredients)) {
      return res.status(400).send({ message: "Ingredients must be an array", success: false });
    }
    
    // Ensure instructions is an array
    if (!Array.isArray(instructions)) {
      return res.status(400).send({ message: "Instructions must be an array", success: false });
    }
    
    // Create new family recipe
    const recipe_id = await user_utils.createNewFamilyRecipe(user_id, {
      title,
      image,
      family_member,
      tradition,
      ingredients,
      instructions
    });
    
    res.status(201).send({ 
      message: "Family recipe created successfully", 
      success: true
    });
    
  } catch(error) {
    next(error);
  }
});

/**
 * Get family recipes created by the user
 */
router.get('/me/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipe(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.id));
    const results = await recipe_utils.getAllRecipesPreviewDetails(user_id,recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

/**
 * Start cooking a recipe - get detailed preparation info
 */
router.get("/me/recipes/:id/startcooking", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.status(401).send({ message: "User not logged in" });
    }

    const recipeId = req.params.id;
    const [source, recipe_id] = recipeId.split('_');
    let full_recipe;

    if (source === "s") {
      // Spoonacular recipe
      full_recipe = await recipe_utils.combineInstructionsWithIngredients(recipe_id);
    } else if (source === "m") {
      // Self-created recipe
      const recipe_array = await recipe_utils.getSelfRecipeDetails(recipe_id);
      full_recipe = recipe_array[0];
    } else if (source === "f") {
      // Family recipe
      const recipe_array = await recipe_utils.getFamilyRecipeDetails(recipe_id);
      full_recipe = recipe_array[0];
    } else {
      return res.status(400).send({ message: "Unknown recipe source" });
    }

    if (!full_recipe) {
      return res.status(404).send({ message: "Recipe not found" });
    }

    res.status(200).send(full_recipe);

  } catch (err) {
    console.error("Error in startcooking:", err);
    res.status(500).send({ message: "Failed to fetch recipe instructions" });
  }
});

/**
 * Get user's meal plan
 */
router.get('/me/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const mealPlan = await user_utils.getMealPlan(user_id);
    res.status(200).send(mealPlan);
  } catch(error) {
    next(error);
  }
});

/**
 * Add recipe to meal plan
 */
router.post('/me/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const { recipeId, position } = req.body;
    
    if (!recipeId) {
      return res.status(400).send({ message: "Recipe ID is required" });
    }
    
    await user_utils.addToMealPlan(user_id, recipeId, position);
    res.status(200).send({ message: "Recipe successfully added to meal plan" });
  } catch(error) {
    next(error);
  }
});

/**
 * Clear entire meal plan
 */
router.delete('/me/meal-plan', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    await user_utils.clearMealPlan(user_id);
    res.status(200).send({ message: "Meal plan successfully cleared" });
  } catch(error) {
    next(error);
  }
});

/**
 * Remove specific recipe from meal plan
 */
router.delete('/me/meal-plan/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    const result = await user_utils.removeFromMealPlan(user_id, recipe_id);
    
    res.status(200).send({
      message: result.remainingRecipes === 0 ? 
        "Recipe successfully removed from meal plan. Your meal plan is now empty." :
        "Recipe successfully removed from meal plan",
      recipeId: recipe_id,
      remainingRecipes: result.remainingRecipes
    });
  } catch(error) {
    if (error.status === 404) {
      return res.status(404).send({ message: "Recipe not found in meal plan" });
    }
    next(error);
  }
});

/**
 * Update recipe position in meal plan
 */
router.put('/me/meal-plan/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    const { position } = req.body;
    
    if (position === undefined || position < 0) {
      return res.status(400).send({ message: "Valid position is required" });
    }
    
    await user_utils.updateMealPlanPosition(user_id, recipe_id, position);
    res.status(200).send({ message: "Recipe position successfully updated" });
  } catch(error) {
    if (error.status === 404) {
      return res.status(404).send({ message: "Recipe not found in meal plan" });
    }
    next(error);
  }
});

module.exports = router;