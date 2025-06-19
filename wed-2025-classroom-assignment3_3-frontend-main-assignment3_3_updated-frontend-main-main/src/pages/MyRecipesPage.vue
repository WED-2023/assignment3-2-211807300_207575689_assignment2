<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>My Recipes</h3>
      <router-link :to="{name:'AddMyRecipes'}" class="btn btn-primary">
        + Create New Recipe
      </router-link>
    </div>
   
    <RecipePreviewList 
      v-if="!loading && myRecipes.length > 0"
      title="" 
      :recipes="myRecipes" 
    />
    <div v-else-if="loading" class="text-center">
      <p>Loading your recipes...</p>
    </div>
    <div v-else class="text-center">
      <p>You haven't created any recipes yet.</p>
      <p>Start creating your own delicious recipes!</p>
      <router-link to="/recipe/create" class="btn btn-primary">
        Create Your First Recipe
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
    RecipePreviewList
  },
  data() {
    return {
      myRecipes: [],
      loading: true
    };
  },
  async mounted() {
    await this.getMyRecipes();
  },
  methods: {
    async getMyRecipes() {
      try {
        this.loading = true;
        const response = await axios.get("/users/me/my-recipes"
        );
        this.myRecipes = response.data;
      } catch (error) {
        console.error("Error fetching my recipes:", error);
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