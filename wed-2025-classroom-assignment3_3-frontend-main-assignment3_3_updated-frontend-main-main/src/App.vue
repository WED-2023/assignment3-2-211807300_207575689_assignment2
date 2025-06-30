<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'main' }">Vue Recipes</router-link>
      <span class="separator">|</span>
      <router-link :to="{ name: 'search' }">Search</router-link>
      <span class="separator">|</span>
      <router-link :to="{ name: 'About' }">About</router-link>
      
      <!-- Dropdown Menu -->
      <template v-if="store.username">
        <span class="separator">|</span>
        <!-- כפתור Add Recipe שפותח Modal -->
        <button @click="openAddRecipeModal" class="nav-link btn-link">Add Recipe</button>
        <span class="separator">|</span>
        
        <!-- תכנון ארוחה עם אינדיקציה -->
        <router-link :to="{ name: 'MealPlan' }" class="nav-link meal-plan-link">
          <i class="fas fa-calendar-alt"></i>
          תכנון ארוחה
          <span v-if="mealPlanCount > 0" class="meal-plan-badge">
            {{ mealPlanCount }}
          </span>
          <span v-if="mealPlanProgress > 0" class="meal-plan-progress">
            {{ mealPlanProgress }}%
          </span>
        </router-link>
        <span class="separator">|</span>
        
        <span class="dropdown">
          <button @click="toggleDropdown" class="dropdown-btn">
            Personal Area ▼
          </button>
          <div v-show="showDropdown" class="dropdown-content">
            <router-link :to="{ name: 'Favorites' }" @click="closeDropdown">My Favorite Recipes</router-link>
            <router-link :to="{ name: 'MyRecipes' }" @click="closeDropdown">My Recipes</router-link>
            <router-link :to="{ name: 'FamilyRecipes' }" @click="closeDropdown">My Family Recipes</router-link>
          </div>
        </span>
        <span class="separator">|</span>
        <span class="user-info">
          {{ store.username }}:
          <button @click="logout" class="btn btn-link p-0">Logout</button>
        </span>
      </template>

      <template v-else>
        <span class="separator">|</span>
        <span class="guest-info">
          Hello Guest:
          <router-link :to="{ name: 'register' }">Register</router-link>
          <span class="separator">|</span>
          <router-link :to="{ name: 'login' }">Login</router-link>
        </span>
      </template>
    </div>

    <!-- Modal for Add Recipe -->
    <div v-if="showAddRecipeModal" class="modal-backdrop" @click="closeAddRecipeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>🍳 הוספת מתכון חדש</h3>
          <button @click="closeAddRecipeModal" class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <AddRecipe 
            v-model="newRecipe" 
            :onSubmit="submitUserRecipe" 
            :isModal="true"
          />
        </div>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, ref, onUnmounted, reactive } from 'vue';
import axios from 'axios';
import AddRecipe from '@/components/AddRecipe.vue';

export default {
  name: "App",
  components: {
    AddRecipe
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const showDropdown = ref(false);
    const mealPlanCount = ref(0);
    const mealPlanProgress = ref(0);
    const showAddRecipeModal = ref(false);
    
    // נתוני המתכון החדש עבור ה-Modal
    const newRecipe = reactive({
      title: '',
      image: '',
      duration: null,
      servings: null,
      ingredients: [],
      instructions: [],
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      likes: 0
    });
    
    onMounted(() => {
      const savedUsername = localStorage.getItem('loggedInUser');
      if (savedUsername && !store.username) {
        store.login(savedUsername);
      }
      
      // Close dropdown when clicking outside
      document.addEventListener('click', handleClickOutside);
      
      // Load meal plan data if user is logged in
      if (store.username || savedUsername) {
        loadMealPlanData();
      }
      
      // Watch for route changes to update meal plan data
      router.afterEach(() => {
        if (store.username) {
          loadMealPlanData();
        }
      });
      window.addEventListener('mealPlanUpdated', () => {
        if (store.username) loadMealPlanData();
      });
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    const loadMealPlanData = async () => {
      try {
        const response = await axios.get('/users/me/meal-plan');
        const mealPlan = response.data;
        
        mealPlanCount.value = mealPlan.recipes?.length || 0;
        
        if (mealPlanCount.value > 0) {
          const totalProgress = mealPlan.recipes.reduce((sum, recipe) => 
            sum + (recipe.progress || 0), 0
          );
          mealPlanProgress.value = Math.round(totalProgress / mealPlanCount.value);
        } else {
          mealPlanProgress.value = 0;
        }
        
        //console.log(`📊 תכנון ארוחה: ${mealPlanCount.value} מתכונים, ${mealPlanProgress.value}% התקדמות`);
      } catch (error) {
        // אם יש שגיאה (כמו 401), פשוט לא מציגים מידע
        mealPlanCount.value = 0;
        mealPlanProgress.value = 0;
      }
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const closeDropdown = () => {
      showDropdown.value = false;
    };

    const handleClickOutside = (event) => {
      const dropdown = event.target.closest('.dropdown');
      if (!dropdown) {
        showDropdown.value = false;
      }
    };

    // פונקציות ה-Modal
    const openAddRecipeModal = () => {
      if (!store.username) {
        alert('Please login to add recipes');
        router.push('/login');
        return;
      }
      
      // איפוס נתוני המתכון
      Object.assign(newRecipe, {
        title: '',
        image: '',
        duration: null,
        servings: null,
        ingredients: [],
        instructions: [],
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        likes: 0
      });
      
      showAddRecipeModal.value = true;
      // לא נמנע גלילה כדי שהרקע יישאר נגיש
    };

    const closeAddRecipeModal = () => {
      showAddRecipeModal.value = false;
      // לא צריך להחזיר גלילה כי לא חסמנו אותה
    };

    const submitUserRecipe = async (recipe) => {
      try {
        console.log("📦 Submitting recipe from modal:", JSON.stringify(recipe, null, 2));
        
        await axios.post('/users/me/recipes', recipe);
        
        // הצגת הודעת הצלחה
        alert('המתכון נוסף בהצלחה! 🎉');
        
        // סגירת ה-Modal
        closeAddRecipeModal();
        
        // אופציונלי: ניווט לעמוד "המתכונים שלי"
        // router.push('/me/my-recipes');
        
      } catch (err) {
        console.error('Error adding recipe:', err);
        alert('שגיאה בהוספת המתכון. נסה שוב מאוחר יותר.');
      }
    };

    const logout = () => {
      store.logout();
      localStorage.removeItem('loggedInUser');
      mealPlanCount.value = 0;
      mealPlanProgress.value = 0;
      closeAddRecipeModal(); // סגירת Modal אם פתוח
      router.push("/").catch(() => {});
    };

    return { 
      store, 
      logout, 
      showDropdown, 
      toggleDropdown, 
      closeDropdown,
      mealPlanCount,
      mealPlanProgress,
      loadMealPlanData,
      showAddRecipeModal,
      openAddRecipeModal,
      closeAddRecipeModal,
      newRecipe,
      submitUserRecipe
    };
  }
}
</script>

<style lang="scss">
@use "@/scss/form-style.scss" as *;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

#nav {
  padding: 30px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.separator {
  color: #2c3e50;
  margin: 0 4px;
}

.user-info, .guest-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

// כפתור Add Recipe בניווט
.btn-link {
  background: none;
  border: none;
  color: #2c3e50;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  text-decoration: none;
  white-space: nowrap;
  
  &:hover {
    color: #42b983;
  }
}

.meal-plan-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meal-plan-badge {
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.meal-plan-progress {
  background: #28a745;
  color: white;
  font-size: 0.6rem;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: bold;
  margin-right: 2px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  background: none;
  border: none;
  color: #2c3e50;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  white-space: nowrap;
}

.dropdown-btn:hover {
  color: #42b983;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1000;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
}

.dropdown-content a {
  color: #2c3e50;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  border-bottom: 1px solid #f1f1f1;
  white-space: nowrap;
}

.dropdown-content a:last-child {
  border-bottom: none;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
  color: #42b983;
}


.modal-backdrop {
  position: fixed;
  inset: 0; // מקביל ל-top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  background: transparent; // רקע שקוף לחלוטין
  pointer-events: none; // מאפשר אינטראקציה עם הדף שמאחורי אם רוצים
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2); // טיפה יותר כהה להפרדה מהרקע
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  width: 95%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
  z-index: 10000; // גבוה יותר מה-backdrop
  pointer-events: all; // כן קולט אינטראקציה
}


@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  
  // הסרת הpadding מהקומפוננטה פנימית
  :deep(.container) {
    max-width: none;
    padding: 40px;
    margin: 0;
  }
  
  :deep(h2) {
    display: none; // הסתרת הכותרת כי יש לנו כותרת ב-header
  }
}

/* תגובה למסכים קטנים */
@media (max-width: 768px) {
  #nav {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .dropdown-content {
    min-width: 180px;
  }
  
  .meal-plan-link {
    font-size: 0.9rem;
  }
  
  .modal-container {
    margin: 10px;
    max-height: 90vh;
    width: 98%;
  }
  
  .modal-header {
    padding: 15px 20px;
    
    h3 {
      font-size: 1.3rem;
    }
  }
  
  .modal-body :deep(.container) {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .modal-backdrop {
    padding: 0;
  }
  
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
}
</style>