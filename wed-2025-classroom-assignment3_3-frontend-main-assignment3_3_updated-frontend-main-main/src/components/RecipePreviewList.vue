<template>
  <div class="container">
    <h3>{{ title }}</h3>
    <div class="row">
      <div class="col" v-for="r in recipes" :key="r.id">
        <!-- האזנה לאירועים -->
        <RecipePreview
          class="recipePreview"
          :recipe="r"
          @mark-viewed="handleMarkViewed"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "RecipePreviewList",
  components: { RecipePreview },
  props: {
    title: {
      type: String,
      required: true,
    },
    recipes: {
      type: Array,
      required: true,
    },
  },
  methods: {
    async handleMarkViewed(recipeId) {
      try {
        await axios.post(`/users/me/viewed/${recipeId}`);
        const r = this.recipes.find((r) => r.id === recipeId);
        if (r) r.viewed = true;
      } catch (error) {
        console.error("Failed to mark as viewed:", error);
      }
    },
    async handleToggleFavorite(recipeId) {
      try {
        await axios.post(`/users/me/favorites/${recipeId}`);
        const r = this.recipes.find((r) => r.id === recipeId);
        if (r) r.isFavorite = true;
      } catch (error) {
        if (error.response?.status === 409) {
          const r = this.recipes.find((r) => r.id === recipeId);
          if (r) r.isFavorite = true;
        } else {
          console.error("Failed to add to favorites:", error);
        }
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 400px;
}
</style>
