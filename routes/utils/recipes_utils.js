const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("../utils/DButils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.apiKey
        }
        
    });
}

async function getRecipeDetails(recipe_ids) {
  try {
    // אם זה מזהה בודד, הפוך אותו למערך
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }
    
    // מערך להחזרת התוצאות
    const results = [];
    
    // עבור על כל מזהה ושלוף את המידע
    for (let recipe_id of recipe_ids) {
      try {
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
        
        results.push({
          id: id,
          title: title,
          readyInMinutes: readyInMinutes,
          image: image,
          popularity: aggregateLikes,
          vegan: vegan,
          vegetarian: vegetarian,
          glutenFree: glutenFree
        });
      } catch (err) {
        console.error(`Error fetching recipe ${recipe_id}: ${err.message}`);
        // המשך לפריט הבא אם יש שגיאה
        continue;
      }
    }
    
    return results;
  } catch (error) {
    throw { status: 500, message: "Failed to get recipe details: " + error.message };
  }
}

async function getAnalyzedInstructions(recipe_id) {
  try {
    const res = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
      params: {
        apiKey: process.env.apiKey
      }
    });

    if (!res.data || res.data.length === 0) {
      // לא קיימות הוראות אנליטיות
      return [];
    }

    return res.data[0].steps || [];
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // מחזירים פשוט מערך ריק אם לא נמצאו הוראות
      return [];
    }
    throw err; // אם זו שגיאה אחרת – לזרוק
  }
}


async function combineInstructionsWithIngredients(recipe_id) {
  try {
    // מקבל את המידע הבסיסי ואת שלבי ההכנה במקביל
    const [infoRes, steps] = await Promise.all([
      getRecipeInformation(recipe_id),
      getAnalyzedInstructions(recipe_id)
    ]);

    // שלב 1: איסוף כל המצרכים עם כמות ויחידה
    const extendedIngredients = infoRes.data.extendedIngredients || [];

    const ingredients = extendedIngredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.measures?.metric?.amount || ing.amount || null,
      unit: ing.measures?.metric?.unitShort || ing.unit || null
    }));

    // שלב 2: מיפוי של שלבי ההכנה (בלי לצרף לתוכם את המצרכים)
    const instructions = (steps || []).map(step => ({
      number: step.number,
      step: step.step
    }));

    // מחזיר מבנה שטוח כפי שביקשת
    return {
      recipe_id,
      ingredients,
      instructions
    };

  } catch (error) {
    throw {
      status: 500,
      message: "Failed to combine ingredients and instructions: " + error.message
    };
  }
}




// ------------------------------------------שליפת פרטים מ-DB שלנו----------------------


async function getSelfRecipeDetails(recipe_ids) {
  try {
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }

    // המר מזהים למחרוזת עבור SQL
    const idsList = recipe_ids.map(id => `'${id}'`).join(",");

    const recipes = await DButils.execQuery(`
      SELECT recipe_id, title, image, duration, servings, instructions, likes,
             is_vegan, is_vegetarian, is_gluten_free, ingredients
      FROM my_recipes
      WHERE recipe_id IN (${idsList})
    `);

    const formatted = recipes.map(recipe => ({
      id: recipe.recipe_id,
      title: recipe.title,
      image: recipe.image,
      duration: recipe.duration,
      likes: recipe.likes,
      isVegan: recipe.is_vegan,
      isVegetarian: recipe.is_vegetarian,
      isGlutenFree: recipe.is_gluten_free,
      // --לשאול את הבנות לגבי הוגיקה של למה להוסיף את זה אם זה פרטי ואם כן צרי להוסיף להסיר את הערות מהקובץAPI ולצור שאילות SQL לבדיקה של השדות
      // viewed: false,
      // isFavorite": false
      ingredients: JSON.parse(recipe.ingredients)
    }));

    return formatted;
  } catch (error) {
    throw {
      status: 500,
      message: "Failed to get self recipe details: " + error.message
    };
  }
}


async function getFamilyRecipeDetails(recipe_ids) {
  try {
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }

    const idsList = recipe_ids.map(id => `'${id}'`).join(",");
    const recipes = await DButils.execQuery(`
      SELECT id, title, image, instructions, tradition, family_member, ingredients
      FROM family_recipes
      WHERE id IN (${idsList})
    `);

    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      tradition: recipe.tradition,
      family_member: recipe.family_member,
      ingredients: JSON.parse(recipe.ingredients)
    }));
  } catch (error) {
    throw {
      status: 500,
      message: "Failed to get family recipe details: " + error.message
    };
  }
}




exports.getRecipeDetails = getRecipeDetails;
exports.getFamilyRecipeDetails=getFamilyRecipeDetails;
exports.getSelfRecipeDetails=getSelfRecipeDetails;
exports.combineInstructionsWithIngredients=combineInstructionsWithIngredients;

