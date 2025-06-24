const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("../utils/DButils");

//מחזיר למתכון יחיד של ה
//-Spoonacular את כל פרטי המטאה דטאה שלו
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.apiKey
        }
    });
}

//מחזיר למתכון יחיד של ה
//-Spoonacular את שלבי ההכנה של המתכון
async function getAnalyzedInstructions(recipe_id) {
    try {
        const res = await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
            params: {
                apiKey: process.env.apiKey
            }
        });

        if (!res.data || res.data.length === 0) {
            return [];
        }

        return res.data[0].steps || [];
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return [];
        }
        throw err;
    }
}

//מחזיר למתכון יחיד של ה
//-Spoonacular את כל פרטי הכנת המתכון מרכיבים ושלבי הכנה
async function combineInstructionsWithIngredients(recipe_id) {
 try {
    // מקבל את המידע הבסיסי ואת שלבי ההכנה במקביל
    const [infoRes, steps] = await Promise.all([
      getRecipeInformation(recipe_id),
      getAnalyzedInstructions(recipe_id)
    ]);
    
    if (!infoRes || !infoRes.data) {
      throw { status: 404, message: "Recipe not found" };
    }
    let {title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = infoRes.data;

    // שלב 1: איסוף כל המצרכים עם כמות ויחידה
    const extendedIngredients = infoRes.data.extendedIngredients || [];

    const ingredients = extendedIngredients.map(ing => {
      
      // בדיקה מקיפה יותר של אפשרויות למציאת יחידת מידה
      let unitValue = null;
      if (ing.measures?.metric?.unitShort) {
        unitValue = ing.measures.metric.unitShort;
      } else if (ing.measures?.us?.unitShort) {
        unitValue = ing.measures.us.unitShort;
      } else if (ing.unit) {
        unitValue = ing.unit;
      } else if (ing.unitShort) {
        unitValue = ing.unitShort;
      } else if (ing.unitLong) {
        unitValue = ing.unitLong;
      } else if (ing.originalUnit) {
        unitValue = ing.originalUnit;
      }
      
      // בדיקה מקיפה יותר של אפשרויות למציאת כמות
      let amountValue = null;
      if (ing.measures?.metric?.amount !== undefined) {
        amountValue = ing.measures.metric.amount;
      } else if (ing.measures?.us?.amount !== undefined) {
        amountValue = ing.measures.us.amount;
      } else if (ing.amount !== undefined) {
        amountValue = ing.amount;
      } else if (ing.originalAmount !== undefined) {
        amountValue = ing.originalAmount;
      }
      
      return {
        id: ing.id,
        name: ing.name,
        amount: amountValue,
        unit: unitValue
      };
    });

    // שלב 2: מיפוי של שלבי ההכנה (בלי לצרף לתוכם את המצרכים)
    const instructions = (steps || []).map(step => ({
      number: step.number,
      step: step.step
    }));

    // הוספת מידע נוסף מהמתכון
    const preparationInfo = {
      recipeId: "s_"+recipe_id,
      likes: aggregateLikes,
      image: image,
      title: title,
      duration: readyInMinutes,
      servings: infoRes.data.servings,
      vegan: vegan === 1,
      vegetarian: vegetarian === 1,
      glutenFree: glutenFree === 1,
      ingredients: ingredients,
      instructions: instructions
      
    };

    return preparationInfo;
  } catch (error) {
    // אם זו שגיאה ספציפית, החזר אותה
    if (error.status) {
      throw error;
    }
    
    // אחרת, זרוק שגיאה כללית
    throw {
      status: 500,
      message: "Failed to combine ingredients and instructions: " + error.message
    };
  }
}



//מחזיר לרשימה או ממתכון יחיד מסוג מתכון פרטי את כל פרטים של המתכון  כולל מרכיבים ושלבי הכנה
async function getSelfRecipefullDetails(recipe_ids) {
    try {
        if (!Array.isArray(recipe_ids)) {
            recipe_ids = [recipe_ids];
        }

        // Convert IDs to string for SQL
        const idsList = recipe_ids.map(id => `'${id}'`).join(",");

        const recipes = await DButils.execQuery(`
            SELECT recipe_id, title, image, duration, servings, likes,
                   is_vegan, is_vegetarian, is_gluten_free, ingredients, instructions
            FROM my_recipes
            WHERE recipe_id IN (${idsList})
        `);

        const formatted = recipes.map(recipe => ({
            id: "m_"+recipe.recipe_id,
            title: recipe.title,
            image: recipe.image,
            duration: recipe.duration,
            likes: recipe.likes,
            servings: recipe.servings,
            vegan: recipe.is_vegan === 1,
            vegetarian: recipe.is_vegetarian === 1,
            glutenFree: recipe.is_gluten_free === 1,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        }));

        return formatted;
    } catch (error) {
        throw {
            status: 500,
            message: "Failed to get self recipe details: " + error.message
        };
    }
}

//מחזיר לרשימה או ממתכון יחיד מסוג מתכון משפחתי את כל פרטים של המתכון  כולל מרכיבים ושלבי הכנה
async function getFamilyRecipefullDetails(recipe_ids) {
    try {
        if (!Array.isArray(recipe_ids)) {
            recipe_ids = [recipe_ids];
        }

        const idsList = recipe_ids.map(id => `'${id}'`).join(",");

        const recipes = await DButils.execQuery(`
            SELECT 
                id, title, image, instructions, tradition, family_member, ingredients,
                duration, likes, vegan, vegetarian, glutenFree
            FROM family_recipes
            WHERE id IN (${idsList})
        `);

        return recipes.map(recipe => ({
            id: "f_" + recipe.id,
            title: recipe.title,
            image: recipe.image,
            duration: recipe.duration,
            likes: recipe.likes,
            vegan: recipe.vegan === 1,
            vegetarian: recipe.vegetarian === 1,
            glutenFree: recipe.glutenFree === 1,
            family_member: recipe.family_member,
            tradition: recipe.tradition,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        }));
    } catch (error) {
        throw {
            status: 500,
            message: "Failed to get family recipe details: " + error.message
        };
    }
}

//מחזיר לכל סוגי המתכונים יחיד או רשימה את הפרטי של תצוגה מקדימה  
async function getAllRecipesPreviewDetails(user_id=null, recipe_ids) {
  try {
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }

    let viewedStatusMap = {};
    let favoriteStatusMap = {};

    if (user_id) {
      viewedStatusMap = await getViewedStatusForRecipes(user_id, recipe_ids);
      favoriteStatusMap = await getFavoriteStatusForRecipes(user_id, recipe_ids);
    }

    const results = [];

    for (let recipeid of recipe_ids) {
      const [source, recipe_id] = recipeid.split('_');

      let commonData = {
        id: recipeid,
        viewed: viewedStatusMap[recipeid] || false,
        favorite: favoriteStatusMap[recipeid] || false
      };

      try {
        if (source === "s") {
          let recipe_info = await getRecipeInformation(recipe_id);
          let {title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

          results.push({
            ...commonData,
            title,
            image,
            duration: readyInMinutes,
            likes: aggregateLikes,
            vegan,
            vegetarian,
            glutenFree
          });
        } else if (source === "m") {
          let recipe_info = (await getSelfRecipefullDetails(recipe_id))[0];

          results.push({
            ...commonData,
            title: recipe_info.title,
            image: recipe_info.image,
            duration: recipe_info.duration,
            likes: recipe_info.likes,
            vegan: recipe_info.vegan,
            vegetarian: recipe_info.vegetarian,
            glutenFree: recipe_info.glutenFree
          });
        } else if (source === "f") {
          let recipe_info = (await getFamilyRecipefullDetails(recipe_id))[0];

          results.push({
            ...commonData,
            title: recipe_info.title,
            image: recipe_info.image,
            duration: recipe_info.duration,
            likes: recipe_info.likes,
            vegan: recipe_info.vegan,
            vegetarian: recipe_info.vegetarian,
            glutenFree: recipe_info.glutenFree
          });
        }
      } catch (err) {
        console.error(`Error fetching recipe ${recipeid}: ${err.message}`);
        continue;
      }
    }

    return results;
  } catch (error) {
    throw { status: 500, message: "Failed to get recipe details: " + error.message };
  }
}

// עבור רשימה של מתקונים ומשתמש מהסשיין אנחנו בודקי במה הוא צפה לשימוש בדף התצגת מתכונים הכללי על מנת לשלב בתצוגה מקדימה
async function getViewedStatusForRecipes(user_id, recipe_ids) {
  try {
    if (!Array.isArray(recipe_ids) || recipe_ids.length === 0) {
      return {};
    }

    const query = `
      SELECT recipe_id
      FROM watched
      WHERE user_id = '${user_id}'
      AND recipe_id IN (${recipe_ids.map(id => `'${id}'`).join(",")})
    `;

    const viewed = await DButils.execQuery(query);

    const viewedSet = new Set(viewed.map(row => row.recipe_id));

    const result = {};
    for (const id of recipe_ids) {
      result[id] = viewedSet.has(id);
    }

    return result;
  } catch (error) {
    throw { status: 500, message: "Failed to check viewed status: " + error.message };
  }
}
//אותו דבר עבור מועדפים
async function getFavoriteStatusForRecipes(user_id, recipe_ids) {
  try {
    if (!Array.isArray(recipe_ids) || recipe_ids.length === 0) {
      return {};
    }

    const query = `
      SELECT recipe_id
      FROM favorites
      WHERE user_id = '${user_id}'
      AND recipe_id IN (${recipe_ids.map(id => `'${id}'`).join(",")})
    `;

    const favorites = await DButils.execQuery(query);
    const favSet = new Set(favorites.map(row => row.recipe_id));

    const result = {};
    for (const id of recipe_ids) {
      result[id] = favSet.has(id);
    }

    return result;
  } catch (error) {
    throw { status: 500, message: "Failed to check favorite status: " + error.message };
  }
}
//-----------------------------------------------------------

/**
 * Get random recipes from Spoonacular API
 * @param {number} number - Number of recipes to fetch (default: 3)
 * @returns {Array} Array of random recipe previews
 */
async function getRandomRecipes(number = 3) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                apiKey: process.env.apiKey
            }
        });
        
        return response.data.recipes.map(recipe => ({
            id: "s_" + recipe.id,
            title: recipe.title,
            image: recipe.image,
            duration: recipe.readyInMinutes,
            likes: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        }));
    } catch (error) {
        throw { status: 500, message: "Failed to get random recipes: " + error.message };
    }
}

/**
 * Get recipe previews for main recipe view Spoonacular
 * @param {number} number - Number of recipes to display (default: 10)
 * @returns {Array} Array of recipe previews
 */
async function getRecipePreviews(number = 10) {
    try {
        
        const response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                number: number,
                sort: "popularity",
                addRecipeInformation: true,
                apiKey: process.env.apiKey
            }
        });
        
        
        if (!response.data || !response.data.results) {
            return [];
        }
        
        return response.data.results.map(recipe => ({
            id: "s_" + recipe.id,
            title: recipe.title,
            image: recipe.image || "",
            duration: recipe.readyInMinutes || 0,
            likes: recipe.aggregateLikes || 0,
            vegan: recipe.vegan || false,
            vegetarian: recipe.vegetarian || false,
            glutenFree: recipe.glutenFree || false
        }));
    } catch (error) {
        console.error("Error in getRecipePreviews:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", JSON.stringify(error.response.data).substring(0, 200));
        }
        return [];
    }
}

/**
 * Search for recipes with filters and sorting options
 * @param {string} query - Search keyword
 * @param {Object} options - Search options (cuisine, diet, intolerance, sortBy, limit)
 * @returns {Array} Array of matching recipes
 */
async function searchRecipes(query, options = {}) {
    try {
        
        const { cuisine, diet, intolerance, sortBy = "popularity", limit = 5 } = options;
        
        // Build request parameters
        const params = {
            query: query,
            number: limit,
            addRecipeInformation: true,
            instructionsRequired: true,
            apiKey: process.env.apiKey
        };
        
        // Add optional filters
        if (cuisine) params.cuisine = cuisine;
        if (diet) params.diet = diet;
        if (intolerance) params.intolerances = intolerance;
        
        // Set sorting
        if (sortBy === "duration") {
            params.sort = "readyInMinutes";
        } else {
            params.sort = "popularity";
        }
        
        const response = await axios.get(`${api_domain}/complexSearch`, { params });
                
        if (!response.data || !response.data.results || response.data.results.length === 0) {
            return [];
        }
        
        return response.data.results.map(recipe => ({
            id: "s_" + recipe.id,
            title: recipe.title,
            image: recipe.image || "",
            duration: recipe.readyInMinutes || 0,
            likes: recipe.aggregateLikes || 0,
            vegan: recipe.vegan || false,
            vegetarian: recipe.vegetarian || false,
            glutenFree: recipe.glutenFree || false
        }));
    } catch (error) {
        console.error("Error in searchRecipes:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", JSON.stringify(error.response.data).substring(0, 200));
        }
        return [];
    }
}




// Export functions
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipePreviews = getRecipePreviews;
exports.getAllRecipesPreviewDetails = getAllRecipesPreviewDetails;
exports.getFamilyRecipefullDetails = getFamilyRecipefullDetails;
exports.getSelfRecipefullDetails = getSelfRecipefullDetails;
exports.combineInstructionsWithIngredients = combineInstructionsWithIngredients;
exports.searchRecipes = searchRecipes;
exports.getViewedStatusForRecipes=getViewedStatusForRecipes;
exports.getFavoriteStatusForRecipes=getFavoriteStatusForRecipes;