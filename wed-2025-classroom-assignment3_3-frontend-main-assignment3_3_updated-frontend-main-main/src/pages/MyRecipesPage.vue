<template>
  <div class="container">
    <!-- כותרת עמוד -->
    <div class="page-header">
      <h3>המתכונים שלי</h3>
    </div>

    <!-- כפתור יצירת מתכון חדש -->
    <div class="text-center mb-4">
      <router-link :to="{ name: 'AddMyRecipes' }" class="btn-main">
        + צור מתכון חדש
      </router-link>
    </div>

    <!-- רשימת מתכונים -->
    <div v-if="!loading && myRecipes.length > 0" class="my-recipes-box">
      <RecipePreviewList title="" :recipes="myRecipes" />
    </div>

    <!-- מצב טעינה -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>טוען את המתכונים שלך...</p>
    </div>

    <!-- אין מתכונים -->
    <div v-else class="empty-state">
      <h3>עדיין לא יצרת מתכונים 😔</h3>
      <p>התחל להוסיף את המתכונים האישיים שלך עכשיו!</p>
      <router-link :to="{ name: 'AddMyRecipes' }" class="btn-main">
        צור את המתכון הראשון שלך
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import RecipePreviewList from "../components/RecipePreviewList.vue";

export default {
  name: "MyRecipesPage",
  components: {
    RecipePreviewList,
  },
  data() {
    return {
      myRecipes: [],
      loading: true,
    };
  },
  async mounted() {
    await this.getMyRecipes();
  },
  methods: {
    async getMyRecipes() {
      try {
        this.loading = true;
        const response = await axios.get("/users/me/my-recipes");
        this.myRecipes = response.data;
      } catch (error) {
        console.error("Error fetching my recipes:", error);
        if (error.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.page-header h3 {
  font-size: 2.4rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.my-recipes-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.text-center {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  color: #555;
}

.empty-state h3 {
  color: #999;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  text-decoration: none;
  display: inline-block;
}

.btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .page-header h3 {
    font-size: 2rem;
  }

  .my-recipes-box {
    padding: 20px;
  }

  .btn-main {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}
</style>
