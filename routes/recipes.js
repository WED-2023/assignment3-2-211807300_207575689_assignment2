var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


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


module.exports = router;
