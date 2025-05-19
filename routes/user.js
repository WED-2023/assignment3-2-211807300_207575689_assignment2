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
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); // חילוץ מזהי המתכונים למערך
    
    const results = await recipe_utils.getRecipeDetails(recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error);
  }
});

// מחזיר את המועדפים של המשתמש
router.get('/me/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipeDetails(recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

// מוסיף מתכון למועדפים
router.post('/me/favorites/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    // בדיקה שהמתכון לא קיים כבר במועדפים
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

// מסיר מתכון מהמועדפים
router.delete('/me/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    
    // בדיקה שהמתכון קיים במועדפים
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

// הוספת מתכון חדש למשתמש המחובר
router.post('/me/recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    
    // וידוא שכל השדות הנדרשים קיימים
    const { title, image, duration, isVegan, isVegetarian, isGlutenFree, ingredients, instructions, servings } = req.body;
    
    if (!title || !image || !duration || isVegan === undefined || isVegetarian === undefined || 
        isGlutenFree === undefined || !ingredients || !instructions || !servings) {
      return res.status(400).send({ message: "Missing required fields", success: false });
    }
    
    // ודא שרשימת המרכיבים היא מערך
    if (!Array.isArray(ingredients)) {
      return res.status(400).send({ message: "Ingredients must be an array", success: false });
    }
    
    // יצירת המתכון חדש
    const recipe_id = await user_utils.createNewRecipe(user_id, {
      title,
      image,
      duration,
      popularity: 0, // המתכון החדש מתחיל עם 0 לייקים
      isVegan,
      isVegetarian,
      isGlutenFree,
      ingredients,
      instructions,
      servings
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

// מחזיר את המתכונים שנוצרו על ידי המשתמש
router.get('/me/my-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getSelfRecipe(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getSelfRecipeDetails(recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

// הוספת מתכון משפחתי למשתמש המחובר
router.post('/me/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    
    // וידוא שכל השדות הנדרשים קיימים
    const { title, image, family_member, tradition, ingredients ,instructions } = req.body;
    
    if (!title || !image || !family_member || !tradition ||  !ingredients || !instructions ) {
      return res.status(400).send({ message: "Missing required fields", success: false });
    }
    
    // ודא שרשימת המרכיבים היא מערך
    if (!Array.isArray(ingredients)) {
      return res.status(400).send({ message: "Ingredients must be an array", success: false });
    }
    
    // יצירת המתכון חדש
    const recipe_id = await user_utils.createNewFamilyRecipe(user_id, {
      title,
      image,
      instructions, 
      tradition, 
      family_member, 
      ingredients
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

// מחזיר את המתכונים המשפחתיים שנוצרו על ידי המשתמש
router.get('/me/family-recipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipe(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.id)); //extracting the recipe ids into array
    const results = await recipe_utils.getFamilyRecipeDetails(recipes_id_array);
    res.status(200).send(results);
  } catch(error) {
    next(error); 
  }
});

// התחל לעבוד על מתכון
// בגלל שאין צור לשמור את ההתקדמות והכפיות אז נבצע זאת בצד לקוח רק בוויזואליזציה
router.get("/me/recipes/:id/startcooking", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.status(401).send({ message: "User not logged in" });
    }

    const recipeId = req.params.id;
    const instructions = await recipe_utils.combineInstructionsWithIngredients(recipeId);

    res.status(200).send({
      recipe_id: recipeId,
      instructions
    });
  } catch (err) {
    next(err);
  }
});





module.exports = router;



