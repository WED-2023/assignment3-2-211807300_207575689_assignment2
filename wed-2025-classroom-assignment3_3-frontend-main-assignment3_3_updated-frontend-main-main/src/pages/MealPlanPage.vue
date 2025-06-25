<template>
  <div class="meal-plan-container">
    <!-- Header -->
    <div class="meal-plan-header">
      <h1 class="page-title">
        <i class="fas fa-calendar-alt"></i>
        תכנון הארוחה שלי
      </h1>
      <p class="page-subtitle">תכנן, ארגן והכן את הארוחות שלך בקלות</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">טוען...</span>
      </div>
      <p class="mt-3">טוען תכנון ארוחה...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger text-center">
      <h4>שגיאה</h4>
      <p>{{ error }}</p>
      <button @click="loadMealPlan" class="btn btn-primary">נסה שוב</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="mealPlanRecipes.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-utensils empty-icon"></i>
      </div>
      <h3>תכנון הארוחה שלך ריק</h3>
      <p>התחל להוסיף מתכונים לתכנון הארוחה שלך מדפי המתכונים</p>
      <router-link to="/" class="btn btn-primary btn-lg">
        <i class="fas fa-search"></i>
        עבור לחיפוש מתכונים
      </router-link>
    </div>

    <!-- Meal Plan Content -->
    <div v-else class="meal-plan-content">
      <!-- Statistics Bar -->
      <div class="stats-bar mb-4">
        <div class="row text-center">
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ totalRecipes }}</div>
              <div class="stat-label">מתכונים בתכנון</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ completedRecipes }}</div>
              <div class="stat-label">מתכונים שהושלמו</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ Math.round(overallProgress) }}%</div>
              <div class="stat-label">התקדמות כללית</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-item">
              <div class="stat-number">{{ totalCookingTime }}</div>
              <div class="stat-label">דקות בישול</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Progress Bar -->
      <div class="overall-progress mb-4">
        <h5>התקדמות כללית</h5>
        <div class="progress progress-lg">
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
          {{ completedRecipes }} מתוך {{ totalRecipes }} מתכונים הושלמו
        </small>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons mb-4">
        <button 
          @click="clearAllRecipes" 
          class="btn btn-outline-danger"
          :disabled="clearing">
          <i class="fas fa-trash-alt"></i>
          {{ clearing ? 'מנקה...' : 'נקה את כל התכנון' }}
        </button>
        
        <button 
          @click="refreshMealPlan" 
          class="btn btn-outline-primary"
          :disabled="loading">
          <i class="fas fa-sync-alt"></i>
          רענן
        </button>
      </div>

      <!-- Meal Plan Recipes using RecipePreviewList -->
      <div class="meal-plan-recipes">
        <h4 class="mb-3">
          <i class="fas fa-list-ol"></i>
          רשימת מתכונים לארוחה ({{ totalRecipes }})
        </h4>
        
        <!-- Custom Recipe Cards for Meal Plan -->
        <div class="meal-plan-grid">
          <div 
            v-for="(recipe, index) in sortedRecipes" 
            :key="recipe.recipeId"
            class="meal-plan-recipe-card"
            :class="{ 'completed': recipe.progress === 100 }">
            
            <!-- Recipe Preview using existing component structure -->
            <div class="recipe-preview-wrapper">
              <!-- Recipe Position Badge -->
              <div class="recipe-position-badge">
                {{ index + 1 }}
              </div>
              
              <!-- Progress Badge -->
              <div class="recipe-progress-badge" :class="{ 'completed': recipe.progress === 100 }">
                {{ recipe.progress || 0 }}%
              </div>
              
              <!-- Recipe Image and Basic Info -->
              <div class="recipe-image-container">
                <img 
                  :src="recipe.image" 
                  :alt="recipe.title"
                  class="recipe-image">
                <div class="recipe-overlay">
                  <router-link 
                    :to="`/recipes/${recipe.recipeId}`"
                    class="btn btn-sm btn-light">
                    <i class="fas fa-eye"></i>
                    צפה במתכון
                  </router-link>
                </div>
              </div>
              
              <!-- Recipe Details -->
              <div class="recipe-details">
                <h5 class="recipe-title">{{ recipe.title }}</h5>
                <div class="recipe-meta">
                  <span class="duration">
                    <i class="fas fa-clock"></i>
                    {{ recipe.duration }} דקות
                  </span>
                </div>
                
                <!-- Progress Bar -->
                <div class="recipe-progress">
                  <div class="progress">
                    <div 
                      class="progress-bar" 
                      :class="recipe.progress === 100 ? 'bg-success' : 'bg-primary'"
                      role="progressbar" 
                      :style="{ width: (recipe.progress || 0) + '%' }"
                      :aria-valuenow="recipe.progress || 0" 
                      aria-valuemin="0" 
                      aria-valuemax="100">
                    </div>
                  </div>
                  <small class="progress-text">{{ recipe.progress || 0 }}% הושלם</small>
                </div>
                
                <!-- Action Buttons -->
                <div class="recipe-actions">
                  <button 
                    @click="startCooking(recipe.recipeId)"
                    class="btn btn-primary btn-sm"
                    :class="{ 'btn-success': recipe.progress === 100 }">
                    <i class="fas fa-play"></i>
                    {{ recipe.progress === 100 ? 'הושלם' : 'התחל בישול' }}
                  </button>

                  <!-- Position Controls with Icons -->
                  <div class="position-controls">
                    <button 
                      @click="moveRecipeUp(index)"
                      :disabled="index === 0"
                      class="btn btn-sm btn-outline-secondary"
                      title="העבר למעלה">
                      <i class="fas fa-arrow-up"></i>
                    </button>
                    <button 
                      @click="moveRecipeDown(index)"
                      :disabled="index === sortedRecipes.length - 1"
                      class="btn btn-sm btn-outline-secondary"
                      title="העבר למטה">
                      <i class="fas fa-arrow-down"></i>
                    </button>
                  </div>

  <!-- Remove Recipe Button with Icon -->
  <button 
    @click="removeRecipe(recipe.recipeId, index)"
    class="btn btn-outline-danger btn-sm"
    title="הסר מתכנון">
    <i class="fas fa-trash-alt"></i>
  </button>
</div>

                
                <!-- Quick Actions -->
                <div class="quick-actions mt-2">
                  <button 
                    v-if="recipe.progress < 100"
                    @click="markAsCompleted(recipe.recipeId)"
                    class="btn btn-sm btn-outline-success">
                    <i class="fas fa-check"></i>
                    סמן כהושלם
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div v-if="totalRecipes > 0" class="summary-card mt-4">
        <h5>
          <i class="fas fa-chart-pie"></i>
          סיכום תכנון הארוחה
        </h5>
        <div class="summary-content">
          <div class="summary-row">
            <span>זמן בישול כולל:</span>
            <strong>{{ totalCookingTime }} דקות ({{ Math.round(totalCookingTime / 60) }} שעות)</strong>
          </div>
          <div class="summary-row">
            <span>מתכונים שהושלמו:</span>
            <strong>{{ completedRecipes }} / {{ totalRecipes }}</strong>
          </div>
          <div class="summary-row">
            <span>התקדמות כללית:</span>
            <strong>{{ Math.round(overallProgress) }}%</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// State
const mealPlan = ref({ recipes: [] });
const loading = ref(true);
const error = ref(null);
const clearing = ref(false);

const mealPlanRecipes = computed(() => mealPlan.value.recipes || []);

const totalRecipes = computed(() => mealPlanRecipes.value.length);

const completedRecipes = computed(() => 
  mealPlanRecipes.value.filter(recipe => recipe.progress === 100).length
);

const overallProgress = computed(() => {
  if (totalRecipes.value === 0) return 0;
  const totalProgress = mealPlanRecipes.value.reduce((sum, recipe) => 
    sum + (recipe.progress || 0), 0
  );
  return totalProgress / totalRecipes.value;
});

const totalCookingTime = computed(() => 
  mealPlanRecipes.value.reduce((sum, recipe) => sum + (recipe.duration || 0), 0)
);

const sortedRecipes = computed(() => 
  [...mealPlanRecipes.value].sort((a, b) => (a.position || 0) - (b.position || 0))
);

// Methods
const loadMealPlan = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await axios.get('/users/me/meal-plan');
    mealPlan.value = response.data;
    
    console.log('✔️ תכנון ארוחה נטען בהצלחה:', response.data);
  } catch (err) {
    console.error('❌ שגיאה בטעינת תכנון ארוחה:', err);
    
    if (err.response?.status === 401) {
      error.value = 'נדרשת התחברות למערכת כדי לצפות בתכנון הארוחה';
    } else {
      error.value = 'אירעה שגיאה בטעינת תכנון הארוחה';
    }
  } finally {
    loading.value = false;
  }
};

const removeRecipe = async (recipeId, index) => {
  if (!confirm('האם אתה בטוח שברצונך להסיר מתכון זה מתכנון הארוחה?')) {
    return;
  }
  
  try {
    await axios.delete(`/users/me/meal-plan/${recipeId}`);
    
    // Remove from local state
    mealPlan.value.recipes.splice(index, 1);
    
    console.log(`✔️ מתכון ${recipeId} הוסר מתכנון הארוחה`);
  } catch (err) {
    console.error('❌ שגיאה בהסרת מתכון:', err);
    alert('אירעה שגיאה בהסרת המתכון');
  }
};

const clearAllRecipes = async () => {
  if (!confirm('האם אתה בטוח שברצונך לנקות את כל תכנון הארוחה? פעולה זו לא ניתנת לביטול.')) {
    return;
  }
  
  try {
    clearing.value = true;
    await axios.delete('/users/me/meal-plan');
    
    mealPlan.value.recipes = [];
    
    console.log('✔️ תכנון הארוחה נוקה בהצלחה');
  } catch (err) {
    console.error('❌ שגיאה בניקוי תכנון הארוחה:', err);
    alert('אירעה שגיאה בניקוי תכנון הארוחה');
  } finally {
    clearing.value = false;
  }
};

const moveRecipeUp = async (index) => {
  if (index === 0) return;
  
  const recipe = sortedRecipes.value[index];
  const newPosition = Math.max(0, recipe.position - 1);
  
  await updateRecipePosition(recipe.recipeId, newPosition);
};

const moveRecipeDown = async (index) => {
  if (index === sortedRecipes.value.length - 1) return;
  
  const recipe = sortedRecipes.value[index];
  const newPosition = recipe.position + 1;
  
  await updateRecipePosition(recipe.recipeId, newPosition);
};

const updateRecipePosition = async (recipeId, newPosition) => {
  try {
    await axios.put(`/users/me/meal-plan/${recipeId}`, {
      position: newPosition
    });
    
    // Update local state
    const recipe = mealPlan.value.recipes.find(r => r.recipeId === recipeId);
    if (recipe) {
      recipe.position = newPosition;
    }
    
    console.log(`✔️ מיקום מתכון ${recipeId} עודכן ל-${newPosition}`);
  } catch (err) {
    console.error('❌ שגיאה בעדכון מיקום מתכון:', err);
    alert('אירעה שגיאה בעדכון סדר המתכון');
  }
};

const markAsCompleted = async (recipeId) => {
  try {
    await axios.post(`/users/me/meal-plan/${recipeId}/complete`);
    
    // Update local state
    const recipe = mealPlan.value.recipes.find(r => r.recipeId === recipeId);
    if (recipe) {
      recipe.progress = 100;
    }
    
    console.log(`✔️ מתכון ${recipeId} סומן כהושלם`);
  } catch (err) {
    console.error('❌ שגיאה בסימון מתכון כהושלם:', err);
    alert('אירעה שגיאה בסימון המתכון כהושלם');
  }
};

const startCooking = (recipeId) => {
  router.push(`/me/recipes/${recipeId}/startcooking`);
};

const refreshMealPlan = () => {
  loadMealPlan();
};

// Lifecycle
onMounted(() => {
  loadMealPlan();
});
</script>

<style scoped>
.meal-plan-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.meal-plan-header {
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 20px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #e9ecef;
  margin-bottom: 2rem;
}

.stats-bar {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.stat-item {
  padding: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.overall-progress {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.progress-lg {
  height: 20px;
  border-radius: 10px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meal-plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.meal-plan-recipe-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.meal-plan-recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.meal-plan-recipe-card.completed {
  border: 2px solid #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #ffffff 100%);
}

.recipe-position-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #3498db;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.recipe-progress-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(52, 152, 219, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
  backdrop-filter: blur(10px);
}

.recipe-progress-badge.completed {
  background: rgba(40, 167, 69, 0.9);
}

.recipe-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.meal-plan-recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 20px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.meal-plan-recipe-card:hover .recipe-overlay {
  opacity: 1;
}

.recipe-details {
  padding: 1.5rem;
}

.recipe-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recipe-meta {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.recipe-meta i {
  margin-left: 5px;
  color: #3498db;
}

.recipe-progress {
  margin-bottom: 1rem;
}

.recipe-progress .progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e9ecef;
  margin-bottom: 0.5rem;
}

.recipe-progress .progress-bar {
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-text {
  color: #6c757d;
  font-size: 0.8rem;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.recipe-actions .btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

.position-controls {
  display: flex;
  gap: 0.25rem;
}

.position-controls .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-actions .btn {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}

.progress-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.summary-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.summary-content {
  margin-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.summary-row:last-child {
  border-bottom: none;
}

/* Animations */
.recipe-list-enter-active,
.recipe-list-leave-active {
  transition: all 0.3s ease;
}

.recipe-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.recipe-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .meal-plan-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .meal-plan-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .recipe-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .recipe-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .position-controls {
    flex-direction: row;
    justify-content: center;
  }
  
  .stats-bar .row {
    text-align: center;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

.fas {
  margin-left: 0.5rem;
}
</style>