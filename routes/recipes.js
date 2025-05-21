var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

// router.get("/", (req, res) => res.send("im here"));



router.post("/", async (req, res, next) => {
  try {
    if (!req.session || !req.session.user_id) {
      return res.status(401).send({ message: "User not authenticated" });
    }

    const user_id = req.session.user_id;
    const {
      title,
      image,
      duration,
      popularity = 0,
      isVegan,
      isVegetarian,
      isGlutenFree,
      ingredients,
      instructions,
      servings,
    } = req.body;

    if (!title || !image || !duration || !ingredients || !instructions || !servings) {
      return res.status(400).send({ message: "Invalid input data" });
    }

    const ingredientsJson = JSON.stringify(ingredients);

    await DButils.execQuery(
      `INSERT INTO UserRecipes (user_id, title, image_url, ready_in_minutes, popularity, vegan, vegetarian, glutenFree, ingredients, instructions, servings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, image, duration, popularity, isVegan, isVegetarian, isGlutenFree, ingredientsJson, instructions, servings]
    );

    res.status(201).send({ message: "Recipe created successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * מחזיר רשימת תצוגות מקדימות של מתכונים
 */
router.get("/preview", async (req, res, next) => {
  try {
    // מביא תצוגות מקדימות של 10 מתכונים פופולריים
    const recipes = await recipes_utils.getRecipePreviews();
    
    // בדיקה אם המשתמש מחובר כדי להוסיף מידע רלוונטי
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      
      // מקבל מתכונים שנצפו ומועדפים
      const [viewed_recipes, favorite_recipes] = await Promise.all([
        user_utils.getLastViewedRecipes(user_id, 100), // מקבל יותר כדי לכסות את כל המתכונים שיכולים להיות בתצוגה
        user_utils.getFavoriteRecipes(user_id)
      ]);
      
      // ממפה מזהים למערכים לחיפוש מהיר
      const viewed_recipe_ids = new Set(viewed_recipes.map(r => r.recipe_id.toString()));
      const favorite_recipe_ids = new Set(favorite_recipes.map(r => r.recipe_id.toString()));
      
      // מוסיף מידע לכל מתכון
      recipes.forEach(recipe => {
        recipe.viewed = viewed_recipe_ids.has(recipe.id.toString());
        recipe.isFavorite = favorite_recipe_ids.has(recipe.id.toString());
      });
    }
    
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * מחזיר 3 מתכונים אקראיים עבור אזור ה-Explore
 */
router.get("/explore", async (req, res, next) => {
  try {
    // מביא 3 מתכונים אקראיים
    const recipes = await recipes_utils.getRandomRecipes(3);
    
    // בדיקה אם המשתמש מחובר כדי להוסיף מידע רלוונטי
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      
      // מקבל מתכונים שנצפו ומועדפים
      const [viewed_recipes, favorite_recipes] = await Promise.all([
        user_utils.getLastViewedRecipes(user_id, 100),
        user_utils.getFavoriteRecipes(user_id)
      ]);
      
      // ממפה מזהים למערכים לחיפוש מהיר
      const viewed_recipe_ids = new Set(viewed_recipes.map(r => r.recipe_id.toString()));
      const favorite_recipe_ids = new Set(favorite_recipes.map(r => r.recipe_id.toString()));
      
      // מוסיף מידע לכל מתכון
      recipes.forEach(recipe => {
        recipe.viewed = viewed_recipe_ids.has(recipe.id.toString());
        recipe.isFavorite = favorite_recipe_ids.has(recipe.id.toString());
      });
    }
    
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * חיפוש מתכונים לפי מגוון פרמטרים
 */
router.get("/search", async (req, res, next) => {
  console.log("");
  try {
    // קבלת פרמטרים מהבקשה
    const { query, cuisine, diet, intolerance, sortBy, limit } = req.query;
    
    // בדיקה שקיימת מילת חיפוש
    if (!query || query.trim() === "") {
      return res.status(400).send({ 
        message: "Search query is required",
        success: false
      });
    }
    console.log("Search query:", query);
    
    // הגבלת מספר התוצאות
    const maxLimit = Math.min(parseInt(limit) || 5, 15);
    
    // ביצוע החיפוש
    const recipes = await recipes_utils.searchRecipes(query, {
      cuisine,
      diet,
      intolerance,
      sortBy,
      limit: maxLimit
    });
    
    // אם המשתמש מחובר, הוסף מידע על צפייה ומועדפים
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      
      // קבלת מתכונים שנצפו ומועדפים
      const [viewed_recipes, favorite_recipes] = await Promise.all([
        user_utils.getLastViewedRecipes(user_id, 100),
        user_utils.getFavoriteRecipes(user_id)
      ]);
      
      // יצירת מערכים לחיפוש מהיר
      const viewed_recipe_ids = new Set(viewed_recipes.map(r => r.recipe_id.toString()));
      const favorite_recipe_ids = new Set(favorite_recipes.map(r => r.recipe_id.toString()));
      
      // הוספת מידע לכל מתכון
      recipes.forEach(recipe => {
        recipe.viewed = viewed_recipe_ids.has(recipe.id.toString());
        recipe.isFavorite = favorite_recipe_ids.has(recipe.id.toString());
      });
    }
    
    // החזרת התוצאות
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * מחזיר הוראות הכנה מפורטות למתכון
 */
router.get("/:recipeId/preparation", async (req, res, next) => {
  try {
    const recipeId = req.params.recipeId;
    
    // משתמש בפונקציה הקיימת שמשלבת מרכיבים והוראות הכנה
    const preparationDetails = await recipes_utils.combineInstructionsWithIngredients(recipeId);
    
    // אם המשתמש מחובר, סמן שצפה במתכון
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      
      // סימון המתכון כנצפה
      await user_utils.markRecipeAsViewed(user_id, recipeId);
    }
    
    res.status(200).send(preparationDetails);
  } catch (error) {
    // טיפול בשגיאות ספציפיות
    if (error.response && error.response.status === 404) {
      res.status(404).send({ message: "Recipe not found", success: false });
    } else {
      next(error);
    }
  }
});



/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});





module.exports = router;
