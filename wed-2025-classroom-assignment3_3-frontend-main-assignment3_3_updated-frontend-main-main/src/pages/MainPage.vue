<template>
  <div class="main-page">
    <!-- Header -->
    <div class="main-header">
      <h1>דף הבית</h1>
      <p>גלה מתכונים טעימים במיוחד</p>
    </div>

    <div class="content-sections">
      <!-- Left Column - Random Recipes -->
      <div class="content-box">
        <RecipePreviewList title="מתכונים לגילוי" :recipes="exploreRecipes" />
        <div class="text-center mt-3">
          <button class="btn-main" @click="loadRandomRecipes">+ הצג עוד 3</button>
        </div>
      </div>

      <!-- Right Column - Last Watched or Login Component -->
      <div class="content-box">
        <div v-if="store.username">
          <RecipePreviewList title="המתכונים האחרונים שצפית בהם" :recipes="lastWatchedRecipes" />
        </div>
        <div v-else class="login-container">
          <h3 class="welcome-title">ברוך הבא אורח</h3>
          <p class="welcome-subtitle">התחבר כדי לראות את ההיסטוריה שלך</p>
          
          <!-- כאן משתמשים ברכיב Login הקיים -->
          <LoginPage @login-success="handleLoginSuccess" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, getCurrentInstance, onMounted } from "vue";
import RecipePreviewList from "@/components/RecipePreviewList.vue";
import LoginPage from "@/pages/LoginPage.vue"; // יבוא רכיב ההתחברות

export default {
  name: "MainPage",
  components: { 
    RecipePreviewList,
    LoginPage
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;

    const exploreRecipes = ref([]);
    const lastWatchedRecipes = ref([]);

    const loadRandomRecipes = async () => {
      try {
        const response = await axios.get("/recipes/explore");
        exploreRecipes.value = response.data;
      } catch (err) {
        console.error("Error loading random recipes", err);
      }
    };

    const loadLastWatchedRecipes = async () => {
      if (store.username) {
        try {
          const response = await axios.get("/users/me/last-watched");
          lastWatchedRecipes.value = response.data.slice(0, 3);
        } catch (err) {
          console.error("Error loading last watched recipes", err);
        }
      }
    };

    // פונקציה שתופעל כאשר ההתחברות מצליחה
    const handleLoginSuccess = () => {
      loadLastWatchedRecipes();
    };

    onMounted(() => {
      loadRandomRecipes();
      loadLastWatchedRecipes();
    });

    return {
      exploreRecipes,
      lastWatchedRecipes,
      loadRandomRecipes,
      store,
      handleLoginSuccess,
    };
  },
};
</script>

<style scoped>
.main-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.main-header h1 {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.content-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.content-box {
  background: white;
  text-align: center;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.btn-main {
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-container {
  padding: 10px;
}

.welcome-title {
  color: #369870;
  font-size: 1.8rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.welcome-subtitle {
  color: #666;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

/* התאמות לרכיב ההתחברות */
.login-container :deep(.login-page) {
  display: block;
  height: auto;
  overflow: visible;
}

.login-container :deep(.image-container) {
  display: none; /* מסתיר את חלק התמונה */
}

.login-container :deep(.form-container) {
  flex: none;
  padding: 0;
  justify-content: flex-start;
}

.login-container :deep(.title) {
  display: none; /* מסתיר את כותרת Login כי יש לנו כותרת משלנו */
}

@media (max-width: 768px) {
  .content-sections {
    grid-template-columns: 1fr;
  }

  .main-header h1 {
    font-size: 2rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }
}
</style>