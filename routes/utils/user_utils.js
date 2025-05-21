const DButils = require("./DButils");


async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into Favorites values (${user_id},"${recipe_id}")`);
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
    // המרת מערך המרכיבים ל-JSON
    const ingredientsJson = JSON.stringify(recipeData.ingredients);
    const instructionsJson = JSON.stringify(recipeData.instructions);
    
    // הכנת המחרוזות לשימוש ב-SQL (בריחה מתווים מיוחדים)
    const escapeSQL = (str) => str.replace(/['"\\\n\r\u0000\u001a]/g, match => {
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
    
    const title = escapeSQL(recipeData.title);
    const image = escapeSQL(recipeData.image);
    const instructions = escapeSQL(instructionsJson);
    const tradition = escapeSQL(recipeData.tradition);
    const family_member = escapeSQL(recipeData.family_member);
    const ingredients = escapeSQL(ingredientsJson);
    
    // שימוש בגרשיים בודדים לערכים ב-SQL
    const result = await DButils.execQuery(
      `INSERT INTO family_recipes (user_id, title, image, instructions, tradition, family_member, ingredients) 
       VALUES ('${user_id}', '${title}', '${image}', '${instructions}', 
               '${tradition}', '${family_member}', '${ingredients}')`
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



exports.removeFromFavorites = removeFromFavorites;
exports.createNewRecipe = createNewRecipe;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markRecipeAsViewed = markRecipeAsViewed;
exports.getLastViewedRecipes = getLastViewedRecipes;
exports.createNewFamilyRecipe=createNewFamilyRecipe;
exports.getSelfRecipe=getSelfRecipe;
exports.getFamilyRecipe=getFamilyRecipe;