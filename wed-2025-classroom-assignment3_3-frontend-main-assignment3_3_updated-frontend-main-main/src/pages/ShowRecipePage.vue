<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">טוען...</div>
    <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
    <div v-else-if="recipe" class="recipe-details">
      <!-- כותרת עם רקע ירוק כמו בדף הבית -->
      <header class="recipe-header">
        <h1 :class="{ 'rtl': isHebrew(recipe.title), 'ltr': !isHebrew(recipe.title) }">
          {{ recipe.title }}
        </h1>
      </header>

      <div class="recipe-image-container">
        <img v-if="recipe.image" :src="recipe.image" class="img-fluid recipe-main-image" />
       
        <!-- כפתור מועדפים -->
        <div
          class="favorite-toggle"
          @click="toggleFavorite"
          :class="{ active: recipe.isFavorite }"
          title="הוסף/הסר ממועדפים"
        >
          {{ recipe.isFavorite ? "❤️" : "🤍" }}
        </div>
      </div>

      <div class="recipe-meta mb-4">
        <div class="meta-item">
          <span class="meta-icon">🍽</span>
          <span class="meta-text">{{ recipe.servings }} מנות</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">⏰</span>
          <span class="meta-text">{{ recipe.duration }} דקות</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">👍</span>
          <span class="meta-text">{{ recipe.likes }}</span>
        </div>
        <div v-if="recipe.viewed" class="meta-item">
          <span class="meta-icon" title="נצפה">👁️</span>
          <span class="meta-text">נצפה</span>
        </div>
      </div>

      <!-- אייקוני דיאטה ומועדפים - עם תצוגה מלאה -->
      <div class="diet-indicators mb-4" v-if="hasDietaryInfo() || recipe.isFavorite">
        <!-- אינדקציית מועדפים -->
        <div v-if="recipe.isFavorite" class="diet-badge favorite" title="במועדפים">
          <span class="diet-icon">❤️</span>
          <span class="diet-text">במועדפים</span>
        </div>
       
        <div v-if="recipe.vegan" class="diet-badge vegan" title="טבעוני">
          <span class="diet-icon">🌱</span>
          <span class="diet-text">טבעוני</span>
        </div>
        <div v-if="recipe.vegetarian" class="diet-badge vegetarian" title="צמחוני">
          <span class="diet-icon">🥬</span>
          <span class="diet-text">צמחוני</span>
        </div>
        <div v-if="recipe.glutenFree" class="diet-badge gluten-free" title="ללא גלוטן">
          <span class="diet-icon">🌾</span>
          <span class="diet-text">ללא גלוטן</span>
        </div>
        <div v-if="recipe.dairyFree" class="diet-badge dairy-free" title="ללא לקטוז">
          <span class="diet-icon">🥛</span>
          <span class="diet-text">ללא לקטוז</span>
        </div>
        <div v-if="recipe.sugarFree" class="diet-badge sugar-free" title="ללא סוכר">
          <span class="diet-icon">🍯</span>
          <span class="diet-text">ללא סוכר</span>
        </div>
        <div v-if="recipe.keto" class="diet-badge keto" title="קטוגני">
          <span class="diet-icon">🥑</span>
          <span class="diet-text">קטוגני</span>
        </div>
      </div>

      <!-- כפתורי פעולה -->
      <div class="recipe-actions text-center mb-4">
        <div class="actions-container">
          <!-- כפתור התחל בישול -->
          <div class="action-item cooking-action">
            <button
              @click="startCooking"
              class="btn btn-primary btn-lg action-btn cooking-btn"
              :disabled="startingCooking">
              <i class="fas fa-play-circle"></i>
              {{ startingCooking ? 'מכין את המתכון...' : 'התחל בישול' }}
            </button>
            <p class="action-description mt-2">
              מצב הכנה עם רשימת מרכיבים ושלבים אינטראקטיביים
            </p>
          </div>

          <!-- כפתור הוספה לתכנון ארוחות -->
          <div class="action-item meal-plan-action">
            <button
              @click="addToMealPlan"
              class="btn btn-success btn-lg action-btn meal-plan-btn"
              :disabled="addingToMealPlan">
              <i class="fas fa-calendar-plus"></i>
              {{ addingToMealPlan ? 'מוסיף לתכנון...' : 'הוסף לתכנון ארוחות' }}
            </button>
            <p class="action-description mt-2">
              הוסף את המתכון לתכנון הארוחות השבועי שלך
            </p>
          </div>
        </div>

        <!-- הודעת הצלחה -->
        <div v-if="showSuccessMessage" class="alert alert-success mt-3" role="alert">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </div>

      <!-- מרכיבים -->
      <div v-if="recipe.ingredients?.length" class="ingredients-section">
        <h4 class="section-title">
          רשימת מרכיבים
        </h4>
        <div class="ingredients-grid">
          <div
            v-for="(ingredient, i) in recipe.ingredients"
            :key="i"
            class="ingredient-item"
            :class="{ 'rtl': isHebrew(ingredient.name || ingredient), 'ltr': !isHebrew(ingredient.name || ingredient) }"
          >
            <span class="ingredient-text">{{ ingredient.name || ingredient }}</span>
            <span v-if="ingredient.amount || ingredient.unit" class="ingredient-amount">
              {{ ingredient.amount }} {{ ingredient.unit }}
            </span>
          </div>
        </div>
      </div>

      <!-- הוראות הכנה -->
      <div v-if="recipe.instructions?.length" class="instructions-section">
        <h4 class="section-title">
          הוראות הכנה
        </h4>
        <div class="instructions-list">
          <div
            v-for="(instruction, i) in recipe.instructions"
            :key="i"
            class="instruction-item"
            :class="{ 'rtl': isHebrew(instruction.step || instruction), 'ltr': !isHebrew(instruction.step || instruction) }"
          >
            <div class="step-number">{{ i + 1 }}</div>
            <div class="instruction-text">{{ instruction.step || instruction }}</div>
          </div>
        </div>
      </div>

      <!-- מידע משפחתי -->
      <div v-if="recipe.tradition || recipe.family_member" class="family-section">
        <h4 class="section-title">
          מידע משפחתי
        </h4>
        <div class="family-info">
          <div v-if="recipe.tradition" class="family-item" :class="{ 'rtl': isHebrew(recipe.tradition), 'ltr': !isHebrew(recipe.tradition) }">
            <strong>מסורת:</strong> {{ recipe.tradition }}
          </div>
          <div v-if="recipe.family_member" class="family-item" :class="{ 'rtl': isHebrew(recipe.family_member), 'ltr': !isHebrew(recipe.family_member) }">
            <strong>בן משפחה:</strong> {{ recipe.family_member }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const recipeId = route.params.recipeId;

const recipe = ref(null);
const loading = ref(true);
const error = ref(null);
const startingCooking = ref(false);
const addingToMealPlan = ref(false);
const showSuccessMessage = ref(false);
const successMessage = ref('');

// פונקציה לזיהוי טקסט עברי
const isHebrew = (text) => {
  if (!text) return false;
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

// פונקציה לבדיקה אם יש מידע דיאטה
const hasDietaryInfo = () => {
  if (!recipe.value) return false;
  return recipe.value.vegan || recipe.value.vegetarian || recipe.value.glutenFree ||
         recipe.value.dairyFree || recipe.value.sugarFree || recipe.value.keto;
};

const toggleFavorite = async () => {
  try {
    const newFavoriteStatus = !recipe.value.isFavorite;
   
    // קריאה לשרת לעדכון סטטוס המועדפים
    const response = await axios.patch(`/recipes/${recipeId}/favorite`, {
      isFavorite: newFavoriteStatus
    });
   
    // עדכון המצב המקומי רק אם הקריאה הצליחה
    if (response.status === 200) {
      recipe.value.isFavorite = newFavoriteStatus;
     
      // הצגת הודעה
      const message = newFavoriteStatus ? 'המתכון נוסף למועדפים!' : 'המתכון הוסר מהמועדפים';
      successMessage.value = message;
      showSuccessMessage.value = true;
     
      // הסתרת ההודעה אחרי 3 שניות
      setTimeout(() => {
        showSuccessMessage.value = false;
      }, 3000);
    }
   
  } catch (err) {
    console.error('שגיאה בעדכון מועדפים:', err);
   
    let errorMessage = 'אירעה שגיאה בעדכון המועדפים';
   
    if (err.response?.status === 401) {
      errorMessage = 'נדרשת התחברות למערכת כדי לסמן מועדפים';
    } else if (err.response?.status === 404) {
      errorMessage = 'המתכון לא נמצא';
    }
   
    alert(errorMessage);
  }
};

const addToMealPlan = async () => {
  try {
    addingToMealPlan.value = true;
   
    // קריאה ל-API להוספת המתכון לתכנון ארוחות
    await axios.post('/users/me/meal-plan', {
      recipeId: recipeId
    });
   
    // הצגת הודעת הצלחה
    successMessage.value = `המתכון "${recipe.value.title}" נוסף בהצלחה לתכנון הארוחות!`;
    showSuccessMessage.value = true;
    window.dispatchEvent(new CustomEvent('mealPlanUpdated'));
   
    // הסתרת ההודעה אחרי 4 שניות
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 4000);
   
  } catch (err) {
    console.error('שגיאה בהוספת המתכון לתכנון ארוחות:', err);
   
    let errorMessage = 'אירעה שגיאה בהוספת המתכון לתכנון ארוחות';
   
    if (err.response?.status === 401) {
      errorMessage = 'נדרשת התחברות למערכת כדי להוסיף מתכונים לתכנון ארוחות';
    } else if (err.response?.status === 404) {
      errorMessage = 'המתכון לא נמצא';
    } else if (err.response?.status === 400) {
      errorMessage = 'מזהה המתכון לא תקין';
    }
   
    successMessage.value = errorMessage;
    showSuccessMessage.value = true;
   
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 4000);
   
  } finally {
    addingToMealPlan.value = false;
  }
};

const startCooking = async () => {
  try {
    startingCooking.value = true;
   
    // Navigate to the cooking preparation page
    await router.push(`/recipes/${recipeId}/startcooking`);
   
  } catch (err) {
    console.error('שגיאה במעבר לדף הכנת המתכון:', err);
   
    successMessage.value = 'אירעה שגיאה במעבר לדף ההכנה';
    showSuccessMessage.value = true;
   
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } finally {
    startingCooking.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/recipes/${recipeId}`);
    console.log('✔️ קיבלנו מתכון מהשרת:', res.data);
    recipe.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'אירעה שגיאה בעת טעינת המתכון.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* כללי - בסיס כיווניות */
.rtl {
  direction: rtl;
  text-align: right;
}

.ltr {
  direction: ltr;
  text-align: left;
}

/* עיצוב כללי בגוונים ירוקים */
.recipe-details {
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(34, 139, 34, 0.1);
}

/* כותרת עם רקע ירוק כמו בדף הבית */
.recipe-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recipe-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

/* תמונה ראשית */
.recipe-image-container {
  position: relative;
  margin-bottom: 2rem;
}

.recipe-main-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(34, 139, 34, 0.2);
}

.favorite-toggle {
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 32px;
  cursor: pointer;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.favorite-toggle:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 1);
}

.favorite-toggle.active {
  background: rgba(255, 182, 193, 0.9);
}

/* מטא נתונים */
.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  background:#42b983;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(46, 125, 50, 0.2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #42b983;
  font-weight: 600;
}

.meta-icon {
  font-size: 1.2rem;
}

.meta-text {
  font-size: 1rem;
  color: #ffffff;
}

/* אייקוני דיאטה */
.diet-indicators {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  z-index: 3;
}

.diet-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 0.7rem 1.2rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: transform 0.2s ease;
}

.diet-badge:hover {
  transform: translateY(-2px);
}

.diet-badge.favorite {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
}

.diet-badge.vegan {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
}

.diet-badge.vegetarian {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
}

.diet-badge.gluten-free {
  background: linear-gradient(135deg, #8bc34a 0%, #7cb342 100%);
}

.diet-badge.dairy-free {
  background: linear-gradient(135deg, #9ccc65 0%, #8bc34a 100%);
}

.diet-badge.sugar-free {
  background: linear-gradient(135deg, #aed581 0%, #9ccc65 100%);
}

.diet-badge.keto {
  background: linear-gradient(135deg, #689f38 0%, #558b2f 100%);
}

/* כפתורי פעולה */
.recipe-actions {
  background: linear-gradient(135deg, #b8edd5);
  border-radius: 20px;
  padding: 2.5rem;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(46, 125, 50, 0.2);
}

.actions-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.action-item {
  text-align: center;
}

.action-btn {
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 200px;
  backdrop-filter: blur(10px);
}

.cooking-btn {
  background:#42b983;
  color: white;
  border-color: rgba(76, 175, 80, 0.5);
}

.cooking-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.meal-plan-btn {
  background: #42b983;
  color: white;
  border-color: rgba(56, 142, 60, 0.5);
}

.meal-plan-btn:hover:not(:disabled) {
  background:#42b983;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(56, 142, 60, 0.4);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.action-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  line-height: 1.4;
}

/* הודעות */
.alert {
  border-radius: 15px;
  border: none;
  font-weight: 500;
}

.alert-success {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  border: 2px solid rgba(76, 175, 80, 0.3);
}

/* כותרות סקציות */
.section-title {
  display: flex;
  align-items: center;     /* ממרכז אנכית */
  justify-content: center; /* ממרכז אופקית */
  gap: 0.8rem;
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  text-align: center;
}

.section-icon {
  font-size: 1.8rem;
}

/* מרכיבים */
.ingredients-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ingredients-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-item:hover {
  background-color: rgba(66, 185, 131, 0.05);
}

.ingredient-text {
  color: #42b983;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.ingredient-amount {
  color: #666;
  font-size: 1rem;
  font-weight: 400;
  white-space: nowrap;
}

.ingredient-item.rtl .ingredient-amount {
  margin-left: 1rem;
}

.ingredient-item.ltr .ingredient-amount {
  margin-right: 1rem;
}

/* הוראות הכנה */
.instructions-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.instruction-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  align-items: flex-start;
}

.instruction-item:last-child {
  border-bottom: none;
}

.instruction-item:hover {
  background-color: rgba(66, 185, 131, 0.05);
}

.instruction-item.ltr {
  flex-direction: row-reverse;
}

.step-number {
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.3);
}

.instruction-text {
  color: #42b983;
  font-size: 1.1rem;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
}

/* מידע משפחתי */
.family-section {
  background: rgba(129, 199, 132, 0.05);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(129, 199, 132, 0.2);
}

.family-info {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.1);
}

.family-item {
  color: #42b983;
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

.family-item:last-child {
  margin-bottom: 0;
}

.family-item strong {
  color: #42b983;
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-details {
    padding: 1rem;
  }
 
  .recipe-header h1 {
    font-size: 2rem;
  }
 
  .recipe-meta {
    gap: 1rem;
  }
 
  .actions-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
 
  .action-btn {
    min-width: auto;
    width: 100%;
    font-size: 1rem;
    padding: 0.8rem 1.2rem;
  }
 
  .ingredients-grid {
    grid-template-columns: 1fr;
  }
 
  .instruction-item {
    flex-direction: column;
    gap: 1rem;
  }
 
  .instruction-item.ltr {
    flex-direction: column;
  }
 
  .step-number {
    align-self: flex-start;
  }
 
  .section-title {
    font-size: 1.5rem;
  }
}

.fas {
  margin-left: 0.5rem;
}
</style>