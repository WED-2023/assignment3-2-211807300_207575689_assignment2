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
  console.log(recipe_ids)
  try {
    // אם זה מזהה בודד, הפוך אותו למערך
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }
    
    // מערך להחזרת התוצאות
    const results = [];
    
    // עבור על כל מזהה ושלוף את המידע
    for (let recipeid of recipe_ids) {
      const [source, recipe_id] = recipeid.split('_');
      if (source ==="s"){
        try {
        let recipe_info = await getRecipeInformation(recipe_id);
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
        
        results.push({
          id: "s_"+id,
          title: title,
          duration: readyInMinutes,
          image: image,
          likes: aggregateLikes,
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
      //------------------------------------------------------------------------
      if (source === "m") {
        try {
          let recipe_array = await getSelfRecipeDetails(recipe_id);
          let recipe_info = recipe_array[0]
          results.push({
            id: "m_" + recipe_info.id,
            title: recipe_info.title,
            duration: recipe_info.duration,
            image: recipe_info.image,
            likes: recipe_info.likes,
            vegan: recipe_info.vegan,
            vegetarian: recipe_info.vegetarian,
            glutenFree: recipe_info.glutenFree
          });
        } catch (err) {
          console.error(`Error fetching self recipe ${recipe_id}: ${err.message}`);
          continue;
        }
      }

      if (source === "f") {
        try {
          let recipe_array = await getFamilyRecipeDetails(recipe_id);
          let recipe_info = recipe_array[0]
          console.log("FAMILY RECIPE:", recipe_info);
          results.push({
            id: recipe_info.id,
            title: recipe_info.title,
            duration: recipe_info.duration,
            image: recipe_info.image,
            likes: recipe_info.likes,
            vegan: recipe_info.vegan,
            vegetarian: recipe_info.vegetarian,
            glutenFree: recipe_info.glutenFree
          });
        } catch (err) {
          console.error(`Error fetching family recipe ${recipe_id}: ${err.message}`);
          continue;
        }
      }
      //-----------------------------------------------------------------------
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

    if (!infoRes || !infoRes.data) {
      throw { status: 404, message: "Recipe not found" };
    }

    // שלב 1: איסוף כל המצרכים עם כמות ויחידה
    const extendedIngredients = infoRes.data.extendedIngredients || [];

    const ingredients = extendedIngredients.map(ing => {
      // לוג מפורט יותר לדיבוג
      console.log(`Ingredient ${ing.id} (${ing.name}) - measure data:`, 
                  JSON.stringify({
                    amount: ing.amount,
                    unit: ing.unit,
                    measures: ing.measures,
                    measureUS: ing.measures?.us,
                    measureMetric: ing.measures?.metric,
                    originalAmount: ing.originalAmount,
                    originalUnit: ing.originalUnit
                  }));
      
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
      recipeId: recipe_id,
      title: infoRes.data.title,
      duration: infoRes.data.readyInMinutes,
      servings: infoRes.data.servings,
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




// ------------------------------------------שליפת פרטים מ-DB שלנו----------------------


async function getSelfRecipeDetails(recipe_ids) {

  try {
    if (!Array.isArray(recipe_ids)) {
      recipe_ids = [recipe_ids];
    }

    // המר מזהים למחרוזת עבור SQL
    const idsList = recipe_ids.map(id => `'${id}'`).join(",");

    const recipes = await DButils.execQuery(`
      SELECT recipe_id, title, image, duration, servings, likes,
             is_vegan, is_vegetarian, is_gluten_free, ingredients, instructions
      FROM my_recipes
      WHERE recipe_id IN (${idsList})
    `);


    const formatted = recipes.map(recipe => ({
      id: "m_" +recipe.recipe_id,
      title: recipe.title,
      image: recipe.image,
      duration: recipe.duration,
      likes: recipe.likes,
      isVegan: recipe.is_vegan=== 1,
      isVegetarian: recipe.is_vegetarian=== 1,
      isGlutenFree: recipe.is_gluten_free=== 1,
      // --לשאול את הבנות לגבי הוגיקה של למה להוסיף את זה אם זה פרטי ואם כן צרי להוסיף להסיר את הערות מהקובץAPI ולצור שאילות SQL לבדיקה של השדות
      // viewed: false,
      // isFavorite": false
      //instructions: JSON.parse(recipe.instructions)
      ingredients:recipe.ingredients,
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


async function getFamilyRecipeDetails(recipe_ids) {
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
      instructions: recipe.instructions,
      tradition: recipe.tradition,
      family_member: recipe.family_member,
      ingredients: recipe.ingredients,
      duration: recipe.duration,
      likes: recipe.likes,
      vegan: recipe.vegan === 1,
      vegetarian: recipe.vegetarian === 1,
      glutenFree: recipe.glutenFree === 1
    }));
  } catch (error) {
    throw {
      status: 500,
      message: "Failed to get family recipe details: " + error.message
    };
  }
}


/**
 * מקבל מספר מתכונים אקראיים מ-Spoonacular API
 * @param {number} number - מספר המתכונים לקבלה (ברירת מחדל: 3)
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
      id: "s_"+recipe.id,
      title: recipe.title,
      image: recipe.image,
      duration: recipe.duration,
      likes: recipe.aggregateLikes,
      isVegan: recipe.vegan,
      isVegetarian: recipe.vegetarian,
      isGlutenFree: recipe.glutenFree
    }));
  } catch (error) {
    throw { status: 500, message: "Failed to get random recipes: " + error.message };
  }
}

/**
 * מקבל רשימת תצוגות מקדימות של מתכונים
 * @param {number} number - מספר המתכונים להצגה (ברירת מחדל: 10)
 */
async function getRecipePreviews(number = 10) {
  try {
    console.log(`Calling Spoonacular API for ${number} recipe previews`);
    
    const response = await axios.get(`${api_domain}/complexSearch`, {
      params: {
        number: number,
        sort: "popularity",
        addRecipeInformation: true,
        apiKey: process.env.apiKey
      }
    });
    
    console.log("Preview API response status:", response.status);
    
    // בדיקה אם התשובה מכילה את השדה results
    if (!response.data || !response.data.results) {
      console.log("No results found in API response");
      return [];
    }
    
    console.log(`Found ${response.data.results.length} recipe previews`);
    
    // מיפוי התוצאות לפורמט הרצוי
    return response.data.results.map(recipe => ({
      id: "s_"+recipe.id,
      title: recipe.title,
      image: recipe.image || "", // טיפול במקרה שאין תמונה
      duration: recipe.duration || 0, // טיפול במקרה שאין זמן הכנה
      likes: recipe.aggregateLikes || 0,
      isVegan: recipe.vegan || false,
      isVegetarian: recipe.vegetarian || false,
      isGlutenFree: recipe.glutenFree || false
    }));
  } catch (error) {
    console.error("Error in getRecipePreviews:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data).substring(0, 200));
    }
    // החזרת מערך ריק במקרה של שגיאה
    return [];
  }
}

/**
 * חיפוש מתכונים לפי מילת מפתח וסינונים נוספים
 * @param {string} query - מילת מפתח לחיפוש
 * @param {Object} options - אפשרויות נוספות לחיפוש
 * @returns {Array} רשימת מתכונים שעונים על הקריטריונים
 */
async function searchRecipes(query, options = {}) {
  try {
    console.log(`Searching for recipes with query: "${query}" and options:`, options);
    
    // הכנת פרמטרים לחיפוש
    const { cuisine, diet, intolerance, sortBy = "popularity", limit = 5 } = options;
    
    // בניית פרמטרים לבקשה
    const params = {
      query: query,
      number: limit,
      addRecipeInformation: true, // כדי לקבל פרטים מלאים כולל מידע על תזונה
      instructionsRequired: true, // כדי לקבל רק מתכונים עם הוראות הכנה
      apiKey: process.env.apiKey
    };
    
    // הוספת פרמטרים לפי הסינונים שנבחרו
    if (cuisine) params.cuisine = cuisine;
    if (diet) params.diet = diet;
    if (intolerance) params.intolerances = intolerance;
    
    // קביעת סוג המיון
    if (sortBy === "duration") {
      params.sort = "readyInMinutes";
    } else {
      params.sort = "popularity";
    }
    
    // ביצוע הבקשה - שימו לב לשינוי מ-/search ל-/complexSearch
    console.log(`Calling Spoonacular API with params:`, params);
    const response = await axios.get(`${api_domain}/complexSearch`, { params });
    
    // רישום תשובה בלוג
    console.log(`Found ${response.data.results?.length || 0} recipes for query "${query}"`);
    
    // אם אין תוצאות או אין שדה results, החזר מערך ריק
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return [];
    }
    
    // המרת התוצאות לפורמט הדרוש
    return response.data.results.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image || "",
      duration: recipe.readyInMinutes || 0,
      likes: recipe.aggregateLikes || 0,
      isVegan: recipe.vegan || false,
      isVegetarian: recipe.vegetarian || false,
      isGlutenFree: recipe.glutenFree || false,
      // instructions: recipe.instructions || "",
      // שדות נוספים שיכולים להיות שימושיים
      // summary: recipe.summary || "",
      // servings: recipe.servings || 0
    }));
  } catch (error) {
    console.error("Error in searchRecipes:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data).substring(0, 200));
    }
    // במקרה של שגיאה, החזר מערך ריק במקום לזרוק שגיאה
    return [];
  }
}



// ייצוא הפונקציות החדשות
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipePreviews = getRecipePreviews;
exports.getRecipeDetails = getRecipeDetails;
exports.getFamilyRecipeDetails=getFamilyRecipeDetails;
exports.getSelfRecipeDetails=getSelfRecipeDetails;
exports.combineInstructionsWithIngredients=combineInstructionsWithIngredients;
exports.searchRecipes = searchRecipes;

