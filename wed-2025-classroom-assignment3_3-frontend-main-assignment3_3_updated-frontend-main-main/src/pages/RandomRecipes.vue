<template>
  <div class="container mt-4">
    <h2 class="mb-4">Random Recipes</h2>
    <RecipePreviewList :recipes="recipes" />
    <div class="text-center mt-3">
      <button class="btn btn-secondary" @click="fetchRandomRecipes">
        Show 3 New Random Recipes
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import RecipePreviewList from "@/components/RecipePreviewList.vue";

export default {
  name: "RandomRecipes",
  components: { RecipePreviewList },
  setup() {
    const recipes = ref([]);

    const fetchRandomRecipes = async () => {
      try {
        const { data } = await axios.get("/recipes/explore");
        recipes.value = data;
      } catch (error) {
        console.error("Failed to fetch random recipes:", error);
      }
    };

    onMounted(() => {
      fetchRandomRecipes();
    });

    return { recipes, fetchRandomRecipes };
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
