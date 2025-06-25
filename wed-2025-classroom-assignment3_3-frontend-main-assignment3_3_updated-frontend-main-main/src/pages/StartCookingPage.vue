<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">טוען...</span>
      </div>
      <p>טוען נתוני הכנה...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger text-center">
      <h4>שגיאה</h4>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-secondary">חזור למתכון</button>
    </div>
    
    <div v-else-if="recipePreparation" class="recipe-preparation">
      <!-- כותרת הדף -->
      <div class="preparation-header text-center mb-4">
        <h1 class="display-4">🍳 הכנת המתכון</h1>
        <h2 class="text-primary mb-3">{{ recipePreparation.title }}</h2>
        
        <div class="recipe-info d-flex justify-content-center flex-wrap gap-3 mb-4">
          <span class="badge badge-info badge-lg">
            <i class="fas fa-clock"></i> {{ recipePreparation.duration }} דקות
          </span>
          <span class="badge badge-success badge-lg">
            <i class="fas fa-users"></i> {{ recipePreparation.servings }} מנות
          </span>
        </div>
        
        <button @click="goBack" class="btn btn-outline-secondary mb-4">
          <i class="fas fa-arrow-right"></i> חזור למתכון
        </button>
      </div>

      <!-- רשימת מרכיבים -->
      <div class="ingredients-section mb-5">
        <h3 class="section-title">
          <i class="fas fa-list-ul"></i> רשימת מרכיבים
        </h3>
        <div class="ingredients-checklist">
          <div v-for="(ingredient, index) in recipePreparation.ingredients" 
               :key="index" 
               class="ingredient-item">
            <label class="ingredient-checkbox">
              <input 
                type="checkbox" 
                v-model="checkedIngredients[index]"
                @change="updateProgress"
              >
              <span class="checkmark"></span>
              <span class="ingredient-text" :class="{ 'checked': checkedIngredients[index] }">
                <strong>{{ ingredient.name }}</strong>
                <span v-if="ingredient.amount" class="ingredient-amount">
                  - {{ ingredient.amount }} {{ ingredient.unit || '' }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- הוראות הכנה -->
      <div class="instructions-section mb-5">
        <h3 class="section-title">
          <i class="fas fa-clipboard-list"></i> הוראות הכנה
        </h3>
        <div class="instructions-steps">
          <div v-for="(instruction, index) in recipePreparation.instructions" 
               :key="index" 
               class="instruction-step"
               :class="{ 'completed': completedSteps[index] }">
            <div class="step-header">
              <span class="step-number">{{ instruction.number }}</span>
              <button 
                @click="toggleStep(index)"
                class="btn btn-sm step-toggle"
                :class="completedSteps[index] ? 'btn-success' : 'btn-outline-success'">
                <i class="fas" :class="completedSteps[index] ? 'fa-check' : 'fa-circle'"></i>
                {{ completedSteps[index] ? 'הושלם' : 'סמן כהושלם' }}
              </button>
            </div>
            <div class="step-content">
              <p :class="{ 'text-muted': completedSteps[index] }">{{ instruction.step }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- מד התקדמות -->
      <div class="progress-section mb-4">
        <h4>התקדמות הכנה</h4>
        <div class="progress mb-2">
          <div 
            class="progress-bar bg-success" 
            role="progressbar" 
            :style="{ width: overallProgress + '%' }"
            :aria-valuenow="overallProgress" 
            aria-valuemin="0" 
            aria-valuemax="100">
            {{ Math.round(overallProgress) }}%
          </div>
        </div>
        <small class="text-muted">
          הושלמו {{ completedStepsCount }} מתוך {{ totalSteps }} שלבים
        </small>
      </div>

      <!-- כפתורי פעולה -->
      <div class="action-buttons text-center">
        <button 
          @click="resetProgress" 
          class="btn btn-warning me-3"
          :disabled="overallProgress === 0">
          <i class="fas fa-undo"></i> איפוס התקדמות
        </button>
        
        <button 
          v-if="overallProgress === 100" 
          @click="completeRecipe"
          class="btn btn-success btn-lg">
          <i class="fas fa-trophy"></i> המתכון הושלם!
        </button>
      </div>

      <!-- הודעת השלמה -->
      <div v-if="showCompletionMessage" class="alert alert-success text-center mt-4">
        <h4><i class="fas fa-star"></i> כל הכבוד!</h4>
        <p>השלמת בהצלחה את הכנת המתכון "{{ recipePreparation.title }}"</p>
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

// Computed properties
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
const fetchRecipePreparation = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/users/me/recipes/${recipeId}/startcooking`);
    recipePreparation.value = response.data;
    
    // Initialize progress arrays
    checkedIngredients.value = new Array(response.data.ingredients.length).fill(false);
    completedSteps.value = new Array(response.data.instructions.length).fill(false);
    
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
  // Additional logic can be added here if needed
  if (overallProgress.value === 100 && !showCompletionMessage.value) {
    showCompletionMessage.value = true;
  }
};

const resetProgress = () => {
  checkedIngredients.value.fill(false);
  completedSteps.value.fill(false);
  showCompletionMessage.value = false;
};

const completeRecipe = async () => {
  try {
    // Optional: Mark recipe as completed in meal plan if it exists there
    await axios.post(`/users/me/meal-plan/${recipeId}/complete`);
    
    // Show success message
    alert('המתכון סומן כהושלם בהצלחה!');
    
    // Navigate back to recipe view
    goBack();
  } catch (err) {
    console.error('שגיאה בסימון המתכון כהושלם:', err);
    // Still show completion message even if meal plan update fails
    showCompletionMessage.value = true;
  }
};

const goBack = () => {
  router.push(`/me/meal-plan`);
};

// Lifecycle
onMounted(() => {
  fetchRecipePreparation();
});
</script>

<style scoped>
.recipe-preparation {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.preparation-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.section-title {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.badge-lg {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

/* Ingredients Section */
.ingredients-checklist {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
}

.ingredient-item {
  margin-bottom: 1rem;
}

.ingredient-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.1rem;
  position: relative;
  padding-right: 2rem;
}

.ingredient-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  right: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 50%;
  border: 2px solid #ddd;
}

.ingredient-checkbox:hover input ~ .checkmark {
  background-color: #ccc;
}

.ingredient-checkbox input:checked ~ .checkmark {
  background-color: #28a745;
  border-color: #28a745;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.ingredient-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.ingredient-checkbox .checkmark:after {
  right: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.ingredient-text.checked {
  text-decoration: line-through;
  color: #6c757d;
}

.ingredient-amount {
  color: #6c757d;
  font-weight: normal;
}

/* Instructions Section */
.instructions-steps {
  space-y: 1rem;
}

.instruction-step {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.instruction-step.completed {
  background: #d4edda;
  border-color: #28a745;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.step-number {
  background: #007bff;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.instruction-step.completed .step-number {
  background: #28a745;
}

.step-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

/* Progress Section */
.progress-section {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
}

.progress {
  height: 25px;
  border-radius: 15px;
}

.progress-bar {
  border-radius: 15px;
  font-weight: bold;
  line-height: 25px;
  transition: width 0.6s ease;
}

/* Action Buttons */
.action-buttons {
  margin-top: 2rem;
}

.btn {
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .preparation-header {
    padding: 1rem;
  }
  
  .step-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .ingredient-checkbox {
    font-size: 1rem;
  }
}

/* Hebrew RTL Support */
.container {
  direction: rtl;
  text-align: right;
}

.step-header {
  direction: rtl;
}

.progress-section {
  direction: rtl;
}
</style>