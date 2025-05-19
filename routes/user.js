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



// מחזיר את המועדפים של המשתמש
router.get('/me/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
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


module.exports = router;






module.exports = router;
