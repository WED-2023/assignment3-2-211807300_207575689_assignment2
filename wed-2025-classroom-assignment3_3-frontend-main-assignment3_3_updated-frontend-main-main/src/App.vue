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
          Guest:
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

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const showDropdown = ref(false);
    
    onMounted(() => {
      const savedUsername = localStorage.getItem('loggedInUser');
      if (savedUsername && !store.username) {
        store.login(savedUsername);
      }
      
      // Close dropdown when clicking outside
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

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
      router.push("/").catch(() => {});
    };

    return { 
      store, 
      logout, 
      showDropdown, 
      toggleDropdown, 
      closeDropdown 
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
  flex-wrap: nowrap; /* מונע שבירת שורה */
  gap: 8px; /* רווחים קטנים ואחידים */
  white-space: nowrap; /* מונע שבירת טקסט */
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  white-space: nowrap; /* מונע שבירת הקישורים */
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.separator {
  color: #2c3e50;
  margin: 0 4px; /* רווח קטן מסביב למפרידים */
}

.user-info, .guest-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
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
  z-index: 1000; /* z-index גבוה יותר */
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
}
</style>