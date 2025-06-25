<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">טוען...</div>
    <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
    <div v-else-if="recipe" class="recipe-details">
      <h2 class="text-center">{{ recipe.title }}</h2>

      <img v-if="recipe.image" :src="recipe.image" class="img-fluid mb-3" />

      <div class="icons mb-3">
        <p>
          <strong>🍽</strong> {{ recipe.servings }} &nbsp;
          <strong>⏰</strong> {{ recipe.duration }} min &nbsp;
          <strong>👍</strong> {{ recipe.likes }} &nbsp;
          <span v-if="recipe.vegan" class="diet-icon" title="טבעוני">🌱</span>
          <span v-if="recipe.vegetarian" class="diet-icon" title="צמחוני">🥬</span>
          <span v-if="recipe.viewed" class="status-icon" title="נצפה">👁️</span>
          <span class="status-icon" :title="recipe.isFavorite ? 'מועדף' : 'לא מועדף'">
            {{ recipe.isFavorite ? "❤️" : "🤍" }}
          </span>
        </p>
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

      <div v-if="recipe.ingredients?.length">
        <h4>מרכיבים:</h4>
        <ul>
          <li v-for="(ing, i) in recipe.ingredients" :key="i">{{ ing }}</li>
        </ul>
      </div>

      <div v-if="recipe.instructions?.length">
        <h4>הוראות הכנה:</h4>
        <ol>
          <li v-for="(inst, i) in recipe.instructions" :key="i">{{ inst }}</li>
        </ol>
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
    
    alert(errorMessage);
    
  } finally {
    addingToMealPlan.value = false;
  }
};

const startCooking = async () => {
  try {
    startingCooking.value = true;
    
    // Navigate to the cooking preparation page
    await router.push(`/recipes/${recipeId}/cooking`);
    
  } catch (err) {
    console.error('שגיאה במעבר לדף הכנת המתכון:', err);
    alert('אירעה שגיאה במעבר לדף ההכנה');
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
.recipe-details img {
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.diet-icon,
.status-icon {
  font-size: 20px;
  margin-left: 10px;
}

.recipe-actions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2.5rem;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  background: rgba(52, 152, 219, 0.9);
  color: white;
  border-color: rgba(52, 152, 219, 0.5);
}

.cooking-btn:hover:not(:disabled) {
  background: rgba(52, 152, 219, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.meal-plan-btn {
  background: rgba(46, 204, 113, 0.9);
  color: white;
  border-color: rgba(46, 204, 113, 0.5);
}

.meal-plan-btn:hover:not(:disabled) {
  background: rgba(46, 204, 113, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
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

.alert {
  border-radius: 15px;
  border: none;
  font-weight: 500;
}

.alert-success {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border: 2px solid rgba(46, 204, 113, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .actions-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .recipe-actions {
    padding: 1.5rem;
  }
  
  .action-btn {
    min-width: auto;
    width: 100%;
    font-size: 1rem;
    padding: 0.8rem 1.2rem;
  }
}

.fas {
  margin-left: 0.5rem;
}
</style>