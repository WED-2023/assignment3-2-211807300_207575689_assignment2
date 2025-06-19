<template>
  <div class="container">
    <RecipePreviewList 
      v-if="!loading && favorites.length > 0"
      title="My Favorite Recipes" 
      :recipes="favorites" 
    />
    <div v-else-if="loading" class="text-center">
      <p>Loading your favorite recipes...</p>
    </div>
    <div v-else class="text-center">
      <h3>My Favorite Recipes</h3>
      <p>You haven't added any favorite recipes yet.</p>
      <p>Start exploring recipes and add them to your favorites!</p>
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
        const response = await axios.get(
          "/users/me/favorites"
        );
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
.container {
  padding: 20px;
}
</style>