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



/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path removes a recipe from the favorites list of the logged-in user
 */
router.delete('/favorites', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    if (!user_id) {
      return res.status(401).send({ message: "User not authenticated" });
    }

    const recipe_id = req.body.recipeId;
    if (!recipe_id) {
      return res.status(400).send({ message: "Missing recipeId in request body" });
    }

    await user_utils.removeFromFavorites(user_id, recipe_id);
    res.status(200).send({ message: "The Recipe was successfully removed from favorites" });
  } catch (error) {
    next(error);
  }
});



module.exports = router;






module.exports = router;
