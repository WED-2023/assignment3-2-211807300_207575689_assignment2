const DButils = require("./DButils");


async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into Favorites values ('${user_id}',"${recipe_id}")`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from Favorites where user_id='${user_id}'`);
    return recipes_id;
}

async function removeFromFavorites(user_id, recipe_id) {
  await DButils.execQuery(
    `DELETE FROM favorites WHERE user_id = ${user_id} AND recipe_id = '${recipe_id}'`
  );
}

async function createNewRecipe(user_id, recipeData) {
  try {
    // המרת ערכים בוליאניים למספרים (0/1) עבור השדות הרלוונטיים
    const isVegan = recipeData.isVegan ? 1 : 0;
    const isVegetarian = recipeData.isVegetarian ? 1 : 0;
    const isGlutenFree = recipeData.isGlutenFree ? 1 : 0;
    
    // המרת מערך המרכיבים ל-JSON
    const ingredientsJson = JSON.stringify(recipeData.ingredients);
    const instructionsJson = JSON.stringify(recipeData.instructions);
    
    // שמירה של המתכון בטבלת my_recipes, כולל שדה ingredients
    const result = await DButils.execQuery(
      `INSERT INTO my_recipes (user_id, title, image, duration, servings, instructions, likes, is_vegan, is_vegetarian, is_gluten_free, ingredients) 
       VALUES ('${user_id}', '${recipeData.title}', '${recipeData.image}', ${recipeData.duration}, 
               ${recipeData.servings}, '${instructionsJson}', ${recipeData.popularity}, 
               ${isVegan}, ${isVegetarian}, ${isGlutenFree}, '${ingredientsJson}')`
    );
    
    const recipe_id = result.insertId;
    
    return recipe_id;
  } catch (error) {
    throw { status: 500, message: "Failed to create recipe: " + error.message };
  }

}

async function getSelfRecipe(user_id) {
  const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM my_recipes WHERE user_id='${user_id}'`);
  return recipes_id;
}


// async function createNewFamilyRecipe(user_id, recipeData) {
//   try {
//     const ingredientsJson = JSON.stringify(recipeData.ingredients);
//     // מאי-- חשוב לשים לב שזה יהיה בגרשיים כפולים כדי שאים יש גרש בפנים יעבוד
//     const result = await DButils.execQuery(
//       `INSERT INTO family_recipes (user_id, title,image,instructions, tradition, family_member, ingredients) 
//        VALUES ("${user_id}", "${recipeData.title}", "${recipeData.image}", "${recipeData.instructions}", 
//                "${recipeData.tradition}", "${recipeData.family_member}", "${ingredientsJson}")`
//     );

//     const recipe_id = result.insertId;

//     return recipe_id;
//   } catch (error) {
//     throw { status: 500, message: "Failed to create family recipe: " + error.message };
//   }
// }



async function createNewFamilyRecipe(user_id, recipeData) {
  try {
    // המרת instructions ו-ingredients ל-JSON
    const ingredientsJson = JSON.stringify(recipeData.ingredients);
    const instructionsJson = JSON.stringify(recipeData.instructions);
    
    // פונקציה לבריחה מתווים מיוחדים ב-SQL
    const escapeSQL = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/['"\\\n\r\u0000\u001a]/g, match => {
        switch (match) {
          case "'": return "\\'";
          case '"': return '\\"';
          case '\\': return '\\\\';
          case '\n': return '\\n';
          case '\r': return '\\r';
          case '\u0000': return '\\0';
          case '\u001a': return '\\Z';
          default: return match;
        }
      });
    };
    
    // בריחה מכל הערכים
    const title = escapeSQL(recipeData.title);
    const image = escapeSQL(recipeData.image);
    const tradition = escapeSQL(recipeData.tradition);
    const family_member = escapeSQL(recipeData.family_member);
    const escapedInstructions = escapeSQL(instructionsJson);
    const escapedIngredients = escapeSQL(ingredientsJson);
    
    const result = await DButils.execQuery(
      `INSERT INTO family_recipes (user_id, title, image, instructions, tradition, family_member, ingredients) 
       VALUES ('${user_id}', '${title}', '${image}', '${escapedInstructions}', 
               '${tradition}', '${family_member}', '${escapedIngredients}')`
    );

    const recipe_id = result.insertId;
    return recipe_id;
  } catch (error) {
    throw { status: 500, message: "Failed to create family recipe: " + error.message };
  }
}

async function getFamilyRecipe(user_id){
    const recipes_id = await DButils.execQuery(`select id from family_recipes where user_id='${user_id}'`);
    return recipes_id;
}


/**
 * מסמן מתכון כנצפה על ידי המשתמש
 * @param {number} user_id - מזהה המשתמש
 * @param {string} recipe_id - מזהה המתכון
 */
async function markRecipeAsViewed(user_id, recipe_id) {
  try {
    // בדיקה אם המתכון כבר נצפה על ידי המשתמש
    const existingViews = await DButils.execQuery(
      `SELECT * FROM watched WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
    );
    
    if (existingViews.length === 0) {
      // אם המתכון לא נצפה בעבר, נוסיף רשומה חדשה
      await DButils.execQuery(
        `INSERT INTO watched (user_id, recipe_id, viewed_at) VALUES ('${user_id}', '${recipe_id}', CURRENT_TIMESTAMP())`
      );
    } else {
      // אם המתכון כבר נצפה, נעדכן רק את זמן הצפייה האחרון
      await DButils.execQuery(
        `UPDATE watched SET viewed_at = CURRENT_TIMESTAMP() WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
      );
    }
  } catch (error) {
    throw { status: 500, message: "Failed to mark recipe as viewed: " + error.message };
  }
}

/**
 * מחזיר את רשימת המתכונים האחרונים שנצפו על ידי המשתמש
 * @param {number} user_id - מזהה המשתמש
 * @param {number} limit - מספר המתכונים להחזרה (ברירת מחדל: 3)
 * @returns {Array} רשימת מזהי המתכונים שנצפו לאחרונה
 */
async function getLastViewedRecipes(user_id, limit = 3) {
  try {
    const recipes = await DButils.execQuery(
      `SELECT recipe_id FROM watched 
       WHERE user_id='${user_id}' 
       ORDER BY viewed_at DESC 
       LIMIT ${limit}`
    );
    return recipes;
  } catch (error) {
    throw { status: 500, message: "Failed to get last viewed recipes: " + error.message };
  }
}

// הוסף את הפונקציות הבאות לקובץ user_utils.js

/**
 * מחזיר את תכנית הארוחה של המשתמש עם פרטי המתכונים
 */
async function getMealPlan(user_id) {
  try {
    // קבלת רשימת המתכונים בתכנית הארוחה
    const mealPlanRecipes = await DButils.execQuery(
      `SELECT recipe_id, position, progress 
       FROM meal_plan 
       WHERE user_id='${user_id}' 
       ORDER BY position ASC`
    );
    
    if (mealPlanRecipes.length === 0) {
      return { recipes: [] };
    }
    
    // קבלת פרטי המתכונים
    const recipe_ids = mealPlanRecipes.map(item => item.recipe_id);
    const recipe_utils = require('./recipes_utils');
    const recipeDetails = await recipe_utils.getAllRecipesPreviewDetails(user_id, recipe_ids);
    
    // שילוב הנתונים
    const recipes = mealPlanRecipes.map(mealPlanItem => {
      const recipeDetail = recipeDetails.find(recipe => recipe.id === mealPlanItem.recipe_id);
      
      return {
        recipeId: mealPlanItem.recipe_id,
        title: recipeDetail ? recipeDetail.title : 'Unknown Recipe',
        image: recipeDetail ? recipeDetail.image : '',
        isFavorite:recipeDetail.isFavorite,
        likes: recipeDetail.likes,
        vegan:  recipeDetail.vegan,
        vegetarian: recipeDetail.vegetarian,
        glutenFree:  recipeDetail.glutenFree,
        viewed:recipeDetail.viewed,
        duration: recipeDetail ? recipeDetail.duration : 0,
        position: mealPlanItem.position,
        progress: mealPlanItem.progress
      };
    });
    
    return { recipes };
  } catch (error) {
    throw { status: 500, message: "Failed to get meal plan: " + error.message };
  }
}

/**
 * מוסיף מתכון לתכנית הארוחה
 */
async function addToMealPlan(user_id, recipe_id, position = null) {
  try {
    // בדיקה אם המתכון כבר קיים בתכנית
    const existing = await DButils.execQuery(
      `SELECT id FROM meal_plan WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
    );
    
    if (existing.length > 0) {
      throw { status: 409, message: "Recipe already in meal plan" };
    }
    
    // אם לא הוגדרה עמדה, קח את העמדה הבאה הזמינה
    if (position === null) {
      const maxPosition = await DButils.execQuery(
        `SELECT COALESCE(MAX(position), -1) as max_pos FROM meal_plan WHERE user_id='${user_id}'`
      );
      position = maxPosition[0].max_pos + 1;
    }
    
    await DButils.execQuery(
      `INSERT INTO meal_plan (user_id, recipe_id, position, progress) 
       VALUES ('${user_id}', '${recipe_id}', ${position}, 0)`
    );
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: "Failed to add to meal plan: " + error.message };
  }
}

/**
 * מנקה את כל תכנית הארוחה
 */
async function clearMealPlan(user_id) {
  try {
    await DButils.execQuery(`DELETE FROM meal_plan WHERE user_id='${user_id}'`);
  } catch (error) {
    throw { status: 500, message: "Failed to clear meal plan: " + error.message };
  }
}

/**
 * מסיר מתכון ספציפי מתכנית הארוחה
 */
async function removeFromMealPlan(user_id, recipe_id) {
  try {
    const result = await DButils.execQuery(
      `DELETE FROM meal_plan WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
    );
    
    if (result.affectedRows === 0) {
      throw { status: 404, message: "Recipe not found in meal plan" };
    }
    
    // בדיקה כמה מתכונים נשארו
    const remainingRecipes = await DButils.execQuery(
      `SELECT COUNT(*) as count FROM meal_plan WHERE user_id='${user_id}'`
    );
    
    return { remainingRecipes: remainingRecipes[0].count };
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: "Failed to remove from meal plan: " + error.message };
  }
}

/**
 * מעדכן את העמדה של מתכון בתכנית הארוחה
 */
async function updateMealPlanPosition(user_id, recipe_id, new_position) {
  try {
    const result = await DButils.execQuery(
      `UPDATE meal_plan SET position = ${new_position} 
       WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
    );
    
    if (result.affectedRows === 0) {
      throw { status: 404, message: "Recipe not found in meal plan" };
    }
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: "Failed to update meal plan position: " + error.message };
  }
}

/**
 * מעדכן התקדמות מתכון ל-100% (מתכון הושלם)
 */
async function markRecipeAsCompleted(user_id, recipe_id) {
  try {
    const result = await DButils.execQuery(
      `UPDATE meal_plan SET progress = 100 
       WHERE user_id='${user_id}' AND recipe_id='${recipe_id}'`
    );
    
    if (result.affectedRows === 0) {
      throw { status: 404, message: "Recipe not found in meal plan" };
    }
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: "Failed to mark recipe as completed: " + error.message };
  }
}


exports.getMealPlan = getMealPlan;
exports.addToMealPlan = addToMealPlan;
exports.clearMealPlan = clearMealPlan;
exports.removeFromMealPlan = removeFromMealPlan;
exports.updateMealPlanPosition = updateMealPlanPosition;
exports.markRecipeAsCompleted = markRecipeAsCompleted;

exports.removeFromFavorites = removeFromFavorites;
exports.createNewRecipe = createNewRecipe;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markRecipeAsViewed = markRecipeAsViewed;
exports.getLastViewedRecipes = getLastViewedRecipes;
exports.createNewFamilyRecipe=createNewFamilyRecipe;
exports.getSelfRecipe=getSelfRecipe;
exports.getFamilyRecipe=getFamilyRecipe;