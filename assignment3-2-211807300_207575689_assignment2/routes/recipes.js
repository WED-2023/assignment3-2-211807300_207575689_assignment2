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
    console.log("✔️ נכנס לנתיב של "/" ")

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
    // Spoonacular- מביא תצוגות מקדימות של 10 מתכונים פופולריים
    const recipes = await recipes_utils.getRecipePreviews();
    
    // בדיקה אם המשתמש מחובר כדי להוסיף מידע רלוונטי
    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      
      try {
        // מקבל את מזהי המתכונים לבדיקה
        const recipe_ids = recipes.map(recipe => recipe.id.toString());
        
        // בדיקת סטטוס צפייה ומועדפים באמצעות הפונקציות הקיימות
        const [viewedStatus, favoriteStatus] = await Promise.all([
          recipes_utils.getViewedStatusForRecipes ? 
            recipes_utils.getViewedStatusForRecipes(user_id, recipe_ids) : 
            Promise.resolve({}),
          recipes_utils.getFavoriteStatusForRecipes ? 
            recipes_utils.getFavoriteStatusForRecipes(user_id, recipe_ids) : 
            Promise.resolve({})
        ]);
        
        // הוספת המידע לכל מתכון
        recipes.forEach(recipe => {
          const recipeId = recipe.id.toString();
          recipe.viewed = viewedStatus[recipeId] || false;
          recipe.isFavorite = favoriteStatus[recipeId] || false;
        });
        
      } catch (error) {
        console.error("Failed to add user data for preview:", error.message);
        // במקרה של שגיאה, ממשיכים בלי המידע הנוסף
      }
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
      
      try {
        // מקבל את מזהי המתכונים לבדיקה
        const recipe_ids = recipes.map(recipe => recipe.id.toString());
        
        // בדיקת סטטוס צפייה ומועדפים באמצעות הפונקציות הקיימות
        const [viewedStatus, favoriteStatus] = await Promise.all([
          recipes_utils.getViewedStatusForRecipes ? 
            recipes_utils.getViewedStatusForRecipes(user_id, recipe_ids) : 
            Promise.resolve({}),
          recipes_utils.getFavoriteStatusForRecipes ? 
            recipes_utils.getFavoriteStatusForRecipes(user_id, recipe_ids) : 
            Promise.resolve({})
        ]);
        
        // הוספת המידע לכל מתכון
        recipes.forEach(recipe => {
          const recipeId = recipe.id.toString();
          recipe.viewed = viewedStatus[recipeId] || false;
          recipe.isFavorite = favoriteStatus[recipeId] || false;
        });
        
      } catch (error) {
        console.error("Failed to add user data for explore:", error.message);
        // במקרה של שגיאה, ממשיכים בלי המידע הנוסף
      }
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
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  console.log("✔️ נכנס לנתיב של recipe details");
  try {
    const recipeId = req.params.recipeId; 
    const user_id = req.session?.user_id || null; 
    
    const [source, recipe_id] = recipeId.split('_');
    let full_recipe;

    if (source === "s") {
      // Spoonacular recipe
      full_recipe = await recipes_utils.combineInstructionsWithIngredients(recipe_id); 
    } else if (source === "m") {
      // Self-created recipe
      const recipe_array = await recipes_utils.getSelfRecipefullDetails(recipe_id);
      full_recipe = recipe_array[0];
    } else if (source === "f") {
      // Family recipe
      const recipe_array = await recipes_utils.getFamilyRecipefullDetails(recipe_id);
      full_recipe = recipe_array[0];
    } else {
      return res.status(400).send({ message: "Unknown recipe source" });
    }

    if (!full_recipe) {
      return res.status(404).send({ message: "Recipe not found" });
    }
    // הוסף מידע משתמש אם מחובר
    if (user_id) {
      try {
        await user_utils.markRecipeAsViewed(user_id, recipeId);
        
        const [viewedStatus, favoriteStatus] = await Promise.all([
          recipes_utils.getViewedStatusForRecipes ? 
            recipes_utils.getViewedStatusForRecipes(user_id, [recipeId]) : 
            Promise.resolve({}),
          recipes_utils.getFavoriteStatusForRecipes ? 
            recipes_utils.getFavoriteStatusForRecipes(user_id, [recipeId]) : 
            Promise.resolve({})
        ]);
        
        full_recipe.viewed = viewedStatus[recipeId] || false;
        full_recipe.isFavorite = favoriteStatus[recipeId] || false;
      } catch (error) {
        console.error("Failed to add user data:", error.message);
      }
    }
    console.log(full_recipe)
    res.send(full_recipe); 
    
  } catch (error) { 
    console.error("Error retrieving recipe details:", error);
    res.status(500).send({ message: "Error retrieving recipe details" });
  }
});






module.exports = router;
