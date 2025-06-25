<template>
  <div class="card h-100 position-relative">
    <!-- Favorite Icon -->
    <div
      class="favorite-icon"
      @click.stop="toggleFavorite"
      :class="{ active: recipe.isFavorite }"
      title="הוסף למועדפים"
    >
      {{ recipe.isFavorite ? "❤️" : "🤍" }}
    </div>

    <!-- Viewed indication -->
    <div v-if="recipe.viewed" class="viewed-indicator" title="נצפה">👁️</div>

    <!-- Navigation to recipe page -->
    <router-link
      :to="{ name: 'RecipeDetails', params: { recipeId: recipe.id } }"
      class="stretched-link"
      @click="markAsViewed"
    ></router-link>

    <!-- Image -->
    <div class="image-container">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
      />
      <!-- Diet Icons -->
      <div class="diet-icons">
        <div v-if="recipe.vegan" class="diet-icon" title="טבעוני">🌱</div>
        <div v-if="recipe.vegetarian" class="diet-icon" title="צמחוני">🥬</div>
      </div>
    </div>

    <!-- Details -->
    <div class="card-body text-center">
      <h5 class="card-title">{{ recipe.title }}</h5>
      <p class="card-text">⏰ {{ recipe.duration }} דקות</p>
      <p class="card-text">👍 {{ recipe.likes }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    // כאן הבדיקה!
    console.log("המתכון שהתקבל:", this.recipe);
    console.log("האם מועדף:", this.recipe.isFavorite);
    console.log("האם נצפה:", this.recipe.viewed);
  },
  methods: {
    markAsViewed() {
      if (!this.recipe.viewed) {
        this.$emit("mark-viewed", this.recipe.id);
      }
    },
    toggleFavorite() {
      this.$emit("toggle-favorite", this.recipe.id);
    },
  },
};
</script>

<style scoped>
.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-container {
  position: relative;
}

.diet-icons {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.diet-icon {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.favorite-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  cursor: pointer;
  z-index: 2;
  color: gray;
  transition: color 0.2s ease;
}

.favorite-icon.active {
  color: red;
}

.viewed-indicator {
  position: absolute;
  top: 10px;
  z-index: 2;
  right: 10px;
  font-size: 22px;
  color: #777;
}
</style>