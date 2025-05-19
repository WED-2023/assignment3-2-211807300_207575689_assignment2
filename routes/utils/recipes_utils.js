const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



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


exports.getRecipeDetails = getRecipeDetails;



