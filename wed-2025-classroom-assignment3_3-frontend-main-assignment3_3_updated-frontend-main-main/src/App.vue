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
        <router-link to="/me/add-my-recipe" class="nav-link">Add Recipe</router-link>
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
    <router-view />
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, ref, onUnmounted } from 'vue';
import axios from 'axios';

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const showDropdown = ref(false);
    const mealPlanCount = ref(0);
    const mealPlanProgress = ref(0);
    
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
        
        //console.log(📊 תכנון ארוחה: ${mealPlanCount.value} מתכונים, ${mealPlanProgress.value}% התקדמות);
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

    const logout = () => {
      store.logout();
      localStorage.removeItem('loggedInUser');
      mealPlanCount.value = 0;
      mealPlanProgress.value = 0;
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
      loadMealPlanData
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
  

}
</style>