<template>
  <div class="recipe-card position-relative">
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
        class="recipe-image"
        alt="תמונת מתכון"
      />

      <!-- Diet Icons -->
      <div class="diet-icons">
        <div v-if="recipe.vegan" class="diet-icon" title="טבעוני">🌱</div>
        <div v-if="recipe.vegetarian" class="diet-icon" title="צמחוני">🥬</div>
        <div v-if="recipe.glutenFree" class="diet-icon" title="ללא גלוטן">🌾</div>
      </div>
    </div>

    <!-- Details -->
    <div class="card-body text-center">
      <h5 class="recipe-title">{{ recipe.title }}</h5>
      <p class="recipe-info">⏰ {{ recipe.duration }} דקות</p>
      <p class="recipe-info">👍 {{ recipe.likes }}</p>

      <!-- משפחתי -->
      <div class="family-info mt-2">
        <div v-if="recipe.tradition"> מסורת: {{ recipe.tradition }}</div>
        <div v-if="recipe.family_member"> בן משפחה: {{ recipe.family_member }}</div>
      </div>
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
.recipe-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.diet-icons {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.diet-icon {
  background-color: rgba(255, 255, 255, 0.9);
  color: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.favorite-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  cursor: pointer;
  z-index: 2;
  color: #bbb;
  transition: color 0.3s ease;
}

.favorite-icon.active {
  color: red;
}

.viewed-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 22px;
  color: #777;
  z-index: 2;
}

.card-body {
  padding: 15px;
}

.recipe-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.recipe-info {
  color: #555;
  margin-bottom: 5px;
}

.family-info {
  background: #f9f9f9;
  padding: 8px;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #444;
}

@media (max-width: 768px) {
  .recipe-image {
    height: 150px;
  }
}
</style>