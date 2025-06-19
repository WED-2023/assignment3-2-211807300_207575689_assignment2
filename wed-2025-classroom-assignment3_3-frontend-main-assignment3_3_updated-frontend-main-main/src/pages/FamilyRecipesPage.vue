<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Family Recipes</h3>
      <router-link :to="{name:'AddFamilyRecipes'}" class="btn btn-primary">
        + Add Family Recipe
      </router-link>
    </div>
    
    <div v-if="!loading && familyRecipes.length > 0" class="row">
      <div class="col-md-4 mb-4" v-for="recipe in familyRecipes" :key="recipe.id">
        <div class="card h-100 family-recipe-card">
          <div class="image-container">
            <img
              v-if="recipe.image"
              :src="recipe.image"
              class="card-img-top recipe-image"
              alt="Family recipe image"
            />
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ recipe.title }}</h5>
            <p class="card-text">
              <strong>Family Member:</strong> {{ recipe.family_member }}
            </p>
            <p class="card-text">
              <strong>Tradition:</strong> {{ recipe.tradition }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="loading" class="text-center">
      <p>Loading your family recipes...</p>
    </div>
    <div v-else class="text-center">
      <p>You haven't added any family recipes yet.</p>
      <p>Share your family's culinary traditions!</p>
      <router-link to="/family-recipe/create" class="btn btn-primary">
        Add Your First Family Recipe
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "FamilyRecipesPage",
  data() {
    return {
      familyRecipes: [],
      loading: true
    };
  },
  async mounted() {
    await this.getFamilyRecipes();
  },
  methods: {
    async getFamilyRecipes() {
      try {
        this.loading = true;
        const response = await axios.get(
          "/users/me/family-recipes"
        );
        this.familyRecipes = response.data;
      } catch (error) {
        console.error("Error fetching family recipes:", error);
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

.family-recipe-card {
  transition: transform 0.2s;
}

.family-recipe-card:hover {
  transform: translateY(-5px);
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-container {
  position: relative;
}
</style>