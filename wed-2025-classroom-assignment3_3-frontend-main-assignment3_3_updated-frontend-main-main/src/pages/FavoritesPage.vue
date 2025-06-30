<template>
  <div class="favorites-page">
    <!-- Header -->
    <div class="favorites-header">
      <h1>המועדפים שלי</h1>
      <p>כל המתכונים ששמרת במועדפים</p>
    </div>

    <!-- תוכן -->
    <div class="content-box">
      <RecipePreviewList
        v-if="!loading && favorites.length > 0"
        title="רשימת המועדפים שלך"
        :recipes="favorites"
      />

      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>טוען את המועדפים שלך...</p>
      </div>

      <div v-else class="no-favorites text-center">
        <h3>😢 אין לך מועדפים עדיין</h3>
        <p>גלה מתכונים והוסף אותם לרשימת המועדפים שלך!</p>
        <router-link :to="{ name: 'search' }" class="btn-main mt-2">🔍 חפש מתכונים</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import RecipePreviewList from "../components/RecipePreviewList.vue";

export default {
  name: "FavoritesPage",
  components: {
    RecipePreviewList
  },
  data() {
    return {
      favorites: [],
      loading: true
    };
  },
  async mounted() {
    await this.getFavorites();
  },
  methods: {
    async getFavorites() {
      try {
        this.loading = true;
        const response = await axios.get("/users/me/favorites");
        this.favorites = response.data;
      } catch (error) {
        console.error("Error fetching favorites:", error);
        if (error.response?.status === 401) {
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.favorites-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.favorites-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.content-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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

.no-favorites {
  text-align: center;
  padding: 40px;
  color: #555;
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
  display: inline-block;
  text-decoration: none;
}

.btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .favorites-header h1 {
    font-size: 2rem;
  }

  .content-box {
    padding: 20px;
  }
}
</style>