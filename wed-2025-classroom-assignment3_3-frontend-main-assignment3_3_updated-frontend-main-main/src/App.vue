<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{ name: 'main' }">דף הבית</router-link>
      <span class="separator">|</span>
      <router-link :to="{ name: 'search' }">חיפוש</router-link>
      <span class="separator">|</span>
      <router-link :to="{ name: 'About' }">אודות</router-link>

      <template v-if="store.username">
        <span class="separator">|</span>
        <button @click="openAddRecipeModal" class="nav-link btn-link">הוספת מתכון</button>
        <span class="separator">|</span>

        <router-link :to="{ name: 'MealPlan' }" class="nav-link meal-plan-link">
          <i class="fas fa-calendar-alt"></i>
          תכנון ארוחה
          <span v-if="mealPlanCount > 0" class="meal-plan-badge">{{ mealPlanCount }}</span>
          <span v-if="mealPlanProgress > 0" class="meal-plan-progress">{{ mealPlanProgress }}%</span>
        </router-link>
        <span class="separator">|</span>

        <span class="dropdown">
          <button @click="toggleDropdown" class="dropdown-btn">האזור האישי ▼</button>
          <div v-show="showDropdown" class="dropdown-content">
            <router-link :to="{ name: 'Favorites' }" @click="closeDropdown">המתכונים המועדפים שלי</router-link>
            <router-link :to="{ name: 'MyRecipes' }" @click="closeDropdown">המתכונים שלי</router-link>
            <router-link :to="{ name: 'FamilyRecipes' }" @click="closeDropdown">מתכוני המשפחה שלי</router-link>
          </div>
        </span>
        <span class="separator">|</span>

        <span class="user-info">
          {{ store.username }}:
          <button @click="logout" class="btn btn-link p-0">התנתקות</button>
        </span>
      </template>

      <!-- עבור אורח - רק לינק להרשמה, ההתחברות תהיה במסך הראשי -->
      <template v-else>
        <span class="separator">|</span>
        <span class="guest-info">
          <router-link :to="{ name: 'register' }">הרשמה</router-link>
          :שלום אורח
          <span class="separator">|</span>
          <router-link :to="{ name: 'login' }">התחברות</router-link>
        </span>
      </template>
    </div>

    <!-- Modal for Add Recipe -->
    <div v-if="showAddRecipeModal" class="modal-backdrop" @click="closeAddRecipeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3> הוספת מתכון חדש</h3>
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
  components: { AddRecipe },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const showDropdown = ref(false);
    const mealPlanCount = ref(0);
    const mealPlanProgress = ref(0);
    const showAddRecipeModal = ref(false);

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
      likes: 0,
    });

    onMounted(() => {
      const savedUsername = localStorage.getItem('loggedInUser');
      if (savedUsername && !store.username) {
        store.login(savedUsername);
      }
      document.addEventListener('click', handleClickOutside);

      if (store.username || savedUsername) {
        loadMealPlanData();
      }

      router.afterEach(() => {
        if (store.username) loadMealPlanData();
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
          const totalProgress = mealPlan.recipes.reduce((sum, recipe) => sum + (recipe.progress || 0), 0);
          mealPlanProgress.value = Math.round(totalProgress / mealPlanCount.value);
        } else {
          mealPlanProgress.value = 0;
        }
      } catch {
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

    const openAddRecipeModal = () => {
      if (!store.username) {
        alert('נא להתחבר כדי להוסיף מתכונים');
        router.push('/');  // מעביר למסך הראשי עם טופס ההתחברות
        return;
      }
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
        likes: 0,
      });
      showAddRecipeModal.value = true;
    };

    const closeAddRecipeModal = () => {
      showAddRecipeModal.value = false;
    };

    const submitUserRecipe = async (recipe) => {
      try {
        await axios.post('/users/me/recipes', recipe);
        alert('המתכון נוסף בהצלחה! 🎉');
        closeAddRecipeModal();
      } catch (err) {
        alert('שגיאה בהוספת המתכון. נסה שוב מאוחר יותר.');
      }
    };

    const logout = () => {
      store.logout();
      localStorage.removeItem('loggedInUser');
      mealPlanCount.value = 0;
      mealPlanProgress.value = 0;
      closeAddRecipeModal();
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
      submitUserRecipe,
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

#nav {
  padding: 30px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
}

#nav a, .btn-link, .dropdown-btn {
  font-weight: 700;
  color: #2c3e50;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s ease;
  background: none;
  border: none;
  font-size: 1rem;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#nav a:hover, 
.btn-link:hover, 
.dropdown-btn:hover {
  color: #42b983;
}

.separator {
  color: #2c3e50;
  margin: 0 6px;
  user-select: none;
}

.user-info, .guest-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-weight: 600;
}

.meal-plan-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  cursor: pointer;
}

.meal-plan-badge {
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
}

.meal-plan-progress {
  background: #28a745;
  color: white;
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
  margin-right: 2px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  position: absolute;
  top: 110%;
  left: 0;
  background-color: white;
  min-width: 210px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  border-radius: 6px;
  overflow: hidden;
  z-index: 1000;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.dropdown-content[style*="display: none"] {
  opacity: 0;
  pointer-events: none;
}

.dropdown-content a {
  color: #2c3e50;
  padding: 14px 20px;
  display: block;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-content a:last-child {
  border-bottom: none;
}

.dropdown-content a:hover {
  background-color: #42b983;
  color: white;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  background: rgba(0,0,0,0.35);
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  width: 95%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
  pointer-events: all;
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
  justify-content: center; /* מרכז אופקי */
  align-items: center;     /* מרכז אנכי */
  padding: 20px 60px;      /* רווח גדול מצד ימין ושמאל */
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #42b983 40%, #369870 60%);
  color: white;
  position: relative;      /* כדי למקם את כפתור הסגירה יחסית */
}

/* הכותרת תישאר במרכז */
.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}


/* כפתור סגירה מימין, מעל הליי-אאוט המרכזי */
.modal-close-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
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
  transition: background-color 0.2s ease;
}

.modal-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.modal-body :deep(.container) {
  max-width: none;
  padding: 40px;
  margin: 0;
}

.modal-body :deep(h2) {
  display: none;
}

/* Responsive */

@media (max-width: 768px) {
  #nav {
    flex-wrap: wrap;
    gap: 6px;
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
  }

  .modal-header h3 {
    font-size: 1.3rem;
  }

  .modal-body :deep(.container) {
    padding: 30px;
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