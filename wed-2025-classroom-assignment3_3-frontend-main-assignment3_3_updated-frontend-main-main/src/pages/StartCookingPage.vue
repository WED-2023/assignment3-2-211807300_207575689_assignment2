<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-success" role="status">
        <span class="sr-only">טוען...</span>
      </div>
      <p class="mt-3 text-success">טוען נתוני הכנה...</p>
    </div>
   
    <div v-else-if="error" class="alert alert-danger text-center">
      <h4>שגיאה</h4>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-secondary">חזור למתכון</button>
    </div>
   
    <div v-else-if="recipePreparation" class="recipe-preparation">
      <!-- כותרת הדף עם עיצוב ירוק -->
      <header class="preparation-header">
        <h1>הכנת המתכון</h1>
        <h2 class="recipe-title" :class="{ 'rtl': isHebrew(recipePreparation.title), 'ltr': !isHebrew(recipePreparation.title) }">
          {{ recipePreparation.title }}
        </h2>
       
        <!-- תמונת המתכון -->
        <div v-if="recipePreparation.image" class="recipe-image-container">
          <img :src="recipePreparation.image" :alt="recipePreparation.title" class="recipe-image" />
        </div>
       
        <div class="recipe-info">
          <div class="info-badge">
            <span class="badge-icon">⏰</span>
            <span class="badge-text">{{ recipePreparation.duration }} דקות</span>
          </div>
          <div class="info-badge">
            <span class="badge-icon">🍽</span>
            <span class="badge-text">{{ currentServings }} מנות</span>
          </div>
        </div>
       
        <!-- בקרת מנות -->
        <div class="servings-controller">
          <h4>כמות מנות:</h4>
          <div class="servings-buttons">
            <button @click="changeServings(-1)" class="serving-btn" :disabled="currentServings <= 1">-</button>
            <span class="servings-display">{{ currentServings }}</span>
            <button @click="changeServings(1)" class="serving-btn">+</button>
          </div>
          <p class="servings-note">
            {{ servingsMultiplier === 1 ? 'כמות מקורית' : `מוכפל ב-${servingsMultiplier.toFixed(1)}` }}
          </p>
        </div>
       
        <button @click="goBack" class="btn-back">
          ← חזור למתכון
        </button>
      </header>

      <!-- מד התקדמות כללי -->
      <div class="overall-progress-section mb-4">
        <h3 class="progress-title">התקדמות כללית</h3>
        <div class="progress-container">
          <div class="progress-bar-custom">
            <div
              class="progress-fill"
              :style="{ width: overallProgress + '%' }">
              <span class="progress-text">{{ Math.round(overallProgress) }}%</span>
            </div>
          </div>
          <p class="progress-details">
            הושלמו {{ completedStepsCount }} מתוך {{ totalSteps }} שלבים
          </p>
        </div>
      </div>

      <!-- רשימת מרכיבים -->
      <div class="ingredients-section mb-5">
        <h3 class="section-title">
           רשימת מרכיבים
        </h3>
        <div class="ingredients-content">
          <div v-for="(ingredient, index) in recipePreparation.ingredients"
               :key="index"
               class="ingredient-item"
               :class="{ 'rtl': isHebrew(ingredient.name), 'ltr': !isHebrew(ingredient.name) }">
            <label class="ingredient-checkbox">
              <input
                type="checkbox"
                v-model="checkedIngredients[index]"
                @change="updateProgress"
              >
              <span class="custom-checkbox"></span>
              <span class="ingredient-text" :class="{ 'checked': checkedIngredients[index] }">
                <strong>{{ ingredient.name }}</strong>
                <span v-if="ingredient.amount" class="ingredient-amount">
                  - {{ calculateAdjustedAmount(ingredient.amount) }} {{ ingredient.unit || '' }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- הוראות הכנה -->
      <div class="instructions-section mb-5">
        <h3 class="section-title">
          הוראות הכנה
        </h3>
        <div class="instructions-content">
          <div v-for="(instruction, index) in recipePreparation.instructions"
               :key="index"
               class="instruction-step"
               :class="{
                 'completed': completedSteps[index],
                 'rtl': isHebrew(instruction.step),
                 'ltr': !isHebrew(instruction.step)
               }">
            <div class="step-header">
              <div class="step-number">{{ instruction.number || (index + 1) }}</div>
              <button
                @click="toggleStep(index)"
                class="step-toggle-btn"
                :class="{ 'completed': completedSteps[index] }">
                <span class="btn-icon">{{ completedSteps[index] ? '✓' : '○' }}</span>
                <span class="btn-text">{{ completedSteps[index] ? 'הושלם' : 'סמן כהושלם' }}</span>
              </button>
            </div>
            <div class="step-content">
              <p>{{ instruction.step }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- כפתורי פעולה -->
      <div class="action-buttons">
        <button
          @click="resetProgress"
          class="btn-action btn-reset"
          :disabled="overallProgress === 0">
          🔄 איפוס התקדמות
        </button>
       
        <button
          v-if="overallProgress === 100"
          @click="completeRecipe"
          class="btn-action btn-complete">
          🏆 המתכון הושלם!
        </button>
      </div>

      <!-- הודעת השלמה -->
      <div v-if="showCompletionMessage" class="completion-message">
        <div class="completion-content">
          <h4>🌟 כל הכבוד!</h4>
          <p>השלמת בהצלחה את הכנת המתכון "{{ recipePreparation.title }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const recipeId = route.params.recipeId;

// State
const recipePreparation = ref(null);
const loading = ref(true);
const error = ref(null);
const checkedIngredients = ref([]);
const completedSteps = ref([]);
const showCompletionMessage = ref(false);
const currentServings = ref(1);
const originalServings = ref(1);

// Cache key for localStorage
const getCacheKey = () => `recipe_progress_${recipeId}`;
const getServingsCacheKey = () => `recipe_servings_${recipeId}`;

// פונקציה לזיהוי טקסט עברי
const isHebrew = (text) => {
  if (!text) return false;
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};

// Computed properties
const servingsMultiplier = computed(() => {
  return originalServings.value > 0 ? currentServings.value / originalServings.value : 1;
});

const completedStepsCount = computed(() => {
  return completedSteps.value.filter(step => step).length;
});

const totalSteps = computed(() => {
  return completedSteps.value.length;
});

const overallProgress = computed(() => {
  if (totalSteps.value === 0) return 0;
  return (completedStepsCount.value / totalSteps.value) * 100;
});

// Methods
const calculateAdjustedAmount = (originalAmount) => {
  if (!originalAmount || isNaN(parseFloat(originalAmount))) return originalAmount;
  const adjusted = parseFloat(originalAmount) * servingsMultiplier.value;
  // Round to 2 decimal places and remove trailing zeros
  return parseFloat(adjusted.toFixed(2));
};

const changeServings = (delta) => {
  const newServings = currentServings.value + delta;
  if (newServings >= 1) {
    currentServings.value = newServings;
    saveServingsToCache();
  }
};

const saveProgressToCache = () => {
  const progressData = {
    checkedIngredients: checkedIngredients.value,
    completedSteps: completedSteps.value,
    showCompletionMessage: showCompletionMessage.value,
    timestamp: Date.now()
  };
  localStorage.setItem(getCacheKey(), JSON.stringify(progressData));
 
  // Also save global progress for meal plan display
  const globalProgressData = {
    recipeId: recipeId,
    progress: overallProgress.value,
    completedSteps: completedStepsCount.value,
    totalSteps: totalSteps.value,
    lastUpdated: Date.now()
  };
  localStorage.setItem(`global_recipe_progress_${recipeId}`, JSON.stringify(globalProgressData));
};

const loadProgressFromCache = () => {
  try {
    const cached = localStorage.getItem(getCacheKey());
    if (cached) {
      const progressData = JSON.parse(cached);
      checkedIngredients.value = progressData.checkedIngredients || [];
      completedSteps.value = progressData.completedSteps || [];
      showCompletionMessage.value = progressData.showCompletionMessage || false;
      console.log('✔️ התקדמות נטענה מהזיכרון המקומי');
    }
  } catch (err) {
    console.error('שגיאה בטעינת התקדמות מהזיכרון:', err);
  }
};

const saveServingsToCache = () => {
  localStorage.setItem(getServingsCacheKey(), currentServings.value.toString());
};

const loadServingsFromCache = () => {
  try {
    const cached = localStorage.getItem(getServingsCacheKey());
    if (cached) {
      currentServings.value = parseInt(cached) || 1;
    }
  } catch (err) {
    console.error('שגיאה בטעינת כמות מנות מהזיכרון:', err);
  }
};

const fetchRecipePreparation = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/users/me/recipes/${recipeId}/startcooking`);
    recipePreparation.value = response.data;
    originalServings.value = response.data.servings || 1;
   
    // Load cached servings or use original
    loadServingsFromCache();
    if (currentServings.value === 1) {
      currentServings.value = originalServings.value;
    }
   
    // Initialize progress arrays
    const ingredientsLength = response.data.ingredients.length;
    const instructionsLength = response.data.instructions.length;
   
    // Initialize with default values first
    checkedIngredients.value = new Array(ingredientsLength).fill(false);
    completedSteps.value = new Array(instructionsLength).fill(false);
   
    // Then load cached progress
    loadProgressFromCache();
   
    // Ensure arrays have correct length after loading cache
    if (checkedIngredients.value.length !== ingredientsLength) {
      checkedIngredients.value = checkedIngredients.value.slice(0, ingredientsLength);
      while (checkedIngredients.value.length < ingredientsLength) {
        checkedIngredients.value.push(false);
      }
    }
   
    if (completedSteps.value.length !== instructionsLength) {
      completedSteps.value = completedSteps.value.slice(0, instructionsLength);
      while (completedSteps.value.length < instructionsLength) {
        completedSteps.value.push(false);
      }
    }
   
    console.log('✔️ נתוני הכנת המתכון נטענו בהצלחה:', response.data);
  } catch (err) {
    console.error('❌ שגיאה בטעינת נתוני הכנת המתכון:', err);
    if (err.response?.status === 401) {
      error.value = 'נדרשת התחברות למערכת כדי לצפות בהכנת המתכון';
    } else if (err.response?.status === 500) {
      error.value = 'שגיאת שרת - לא ניתן לטעון את נתוני הכנת המתכון';
    } else {
      error.value = 'אירעה שגיאה בעת טעינת נתוני הכנת המתכון';
    }
  } finally {
    loading.value = false;
  }
};

const toggleStep = (stepIndex) => {
  completedSteps.value[stepIndex] = !completedSteps.value[stepIndex];
  updateProgress();
};

const updateProgress = () => {
  saveProgressToCache();
  if (overallProgress.value === 100 && !showCompletionMessage.value) {
    showCompletionMessage.value = true;
    saveProgressToCache(); // Save the completion message state too
  }
};

const resetProgress = () => {
  checkedIngredients.value.fill(false);
  completedSteps.value.fill(false);
  showCompletionMessage.value = false;
  currentServings.value = originalServings.value;
 
  // Clear cache
  localStorage.removeItem(getCacheKey());
  localStorage.removeItem(getServingsCacheKey());
  localStorage.removeItem(`global_recipe_progress_${recipeId}`);
 
  saveServingsToCache(); // Save reset servings
};

const completeRecipe = async () => {
  try {
    await axios.post(`/users/me/meal-plan/${recipeId}/complete`);
   
    // Clear progress cache when recipe is completed
    localStorage.removeItem(getCacheKey());
    localStorage.removeItem(getServingsCacheKey());
    localStorage.removeItem(`global_recipe_progress_${recipeId}`);
   
    alert('המתכון סומן כהושלם בהצלחה!');
    goBack();
  } catch (err) {
    console.error('שגיאה בסימון המתכון כהושלם:', err);
    showCompletionMessage.value = true;
    saveProgressToCache();
  }
};

const goBack = () => {
  router.push(`/recipes/${recipeId}`);
};

// Lifecycle
onMounted(() => {
  fetchRecipePreparation();
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

.recipe-preparation {
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(34, 139, 34, 0.1);
}

/* כותרת עם עיצוב ירוק */
.preparation-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.preparation-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.recipe-title {
  font-size: 2rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.recipe-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.3rem;
}

.btn-back {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* תמונת המתכון */
.recipe-image-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.recipe-image {
  max-width: 300px;
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.recipe-image:hover {
  transform: scale(1.05);
}

/* בקרת מנות */
.servings-controller {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 20px;
  text-align: center;
}

.servings-controller h4 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.servings-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.serving-btn {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.serving-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.serving-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.servings-display {
  background: rgba(255, 255, 255, 0.9);
  color: #42b983;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 60px;
}

.servings-note {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* התקדמות כללית */
.overall-progress-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.progress-title {
  color: #2d5a3d;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.progress-container {
  max-width: 400px;
  margin: 0 auto;
}

.progress-bar-custom {
  background: #e9ecef;
  border-radius: 25px;
  height: 40px;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  height: 100%;
  border-radius: 25px;
  transition: width 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.progress-text {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.progress-details {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* כותרות סקציות */
.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: white;
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  text-align: center;
}

/* מרכיבים */
.ingredients-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ingredients-content {
  padding: 1.5rem;
}

.ingredient-item {
  margin-bottom: 1.2rem;
  transition: all 0.2s ease;
}

.ingredient-item:hover {
  background-color: rgba(66, 185, 131, 0.05);
  border-radius: 8px;
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.ingredient-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.1rem;
  gap: 1rem;
}

.ingredient-checkbox input[type="checkbox"] {
  display: none;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #42b983;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.ingredient-checkbox input:checked + .custom-checkbox {
  background: #42b983;
}

.ingredient-checkbox input:checked + .custom-checkbox::after {
  content: '✓';
  position: absolute;
  color: white;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
}

.ingredient-text {
  color: #2d5a3d;
  font-weight: 600;
  transition: all 0.3s ease;
}

.ingredient-text.checked {
  text-decoration: line-through;
  color: #999;
}

.ingredient-amount {
  color: #666;
  font-weight: normal;
}

/* הוראות הכנה */
.instructions-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.instructions-content {
  padding: 1.5rem;
}

.instruction-step {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.instruction-step.completed {
  background: rgba(66, 185, 131, 0.1);
  border-color: #42b983;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.instruction-step.rtl .step-header {
  flex-direction: row-reverse;
}

.step-number {
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.3);
}

.instruction-step.completed .step-number {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.step-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #42b983;
  color: #42b983;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-toggle-btn.completed {
  background: #42b983;
  color: white;
}

.step-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
}

.step-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  color: #2d5a3d;
}

.instruction-step.completed .step-content p {
  opacity: 0.7;
}

/* כפתורי פעולה */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.btn-reset {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.btn-reset:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-reset:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
}

.btn-complete {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  font-size: 1.3rem;
}

.btn-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

/* הודעת השלמה */
.completion-message {
  margin-top: 2rem;
  text-align: center;
}

.completion-content {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.completion-content h4 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.completion-content p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-preparation {
    padding: 1rem;
  }
 
  .preparation-header {
    padding: 1.5rem;
  }
 
  .preparation-header h1 {
    font-size: 2rem;
  }
 
  .recipe-title {
    font-size: 1.5rem;
  }
 
  .recipe-info {
    gap: 1rem;
  }
 
  .step-header {
    flex-direction: column;
    gap: 1rem;
  }
 
  .instruction-step.rtl .step-header {
    flex-direction: column;
  }
 
  .recipe-image {
    max-width: 250px;
    height: 150px;
  }
 
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
 
  .btn-action {
    min-width: auto;
    width: 100%;
    max-width: 300px;
  }
}
</style>
