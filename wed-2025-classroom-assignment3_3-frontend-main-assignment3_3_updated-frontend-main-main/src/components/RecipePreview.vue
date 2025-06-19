<template>
  <div class="card h-100">
    <div class="image-container">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
      />
      <!-- אייקונים דיאטטיים -->
      <div class="diet-icons">
        <div v-if="recipe.vegan" class="diet-icon vegan-icon" title="טבעוני">
          🌱
        </div>
        <div v-if="recipe.vegetarian" class="diet-icon vegetarian-icon" title="צמחוני">
          🥬
        </div>
      </div>
    </div>
    <div class="card-body text-center">
      <h5 class="card-title">{{ recipe.title }}</h5>
      <p class="card-text">⏰ {{ recipe.duration }} minutes</p>
      <p class="card-text">❤️ {{ recipe.likes }}</p>
      
    </div>
  </div>
</template>

<script>
export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    }
  }
}
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

.vegan-icon {
  background-color: rgba(255, 255, 255, 0.9);
}

.vegetarian-icon {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>