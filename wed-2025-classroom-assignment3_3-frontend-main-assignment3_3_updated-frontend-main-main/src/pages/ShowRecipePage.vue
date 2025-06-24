<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">טוען...</div>
    <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
    <div v-else-if="recipe" class="recipe-details">
      <h2 class="text-center">{{ recipe.title }}</h2>

      <img v-if="recipe.image" :src="recipe.image" class="img-fluid mb-3" />

      <div class="icons mb-3">
        <p>

          <strong>🍽</strong> {{ recipe.servings }} &nbsp;

          <strong>⏰</strong> {{ recipe.duration }} min &nbsp;

          <strong>👍</strong> {{ recipe.likes }} &nbsp;

          <span v-if="recipe.vegan" class="diet-icon" title="טבעוני">🌱</span>
          <span v-if="recipe.vegetarian" class="diet-icon" title="צמחוני">🥬</span>
          <span v-if="recipe.viewed" class="status-icon" title="נצפה">👁️</span>
          <span class="status-icon" :title="recipe.isFavorite ? 'מועדף' : 'לא מועדף'">
            {{ recipe.isFavorite ? "❤️" : "🤍" }}
          </span>
        </p>
      </div>

      <div v-if="recipe.ingredients?.length">
        <h4>מרכיבים:</h4>
        <ul>
          <li v-for="(ing, i) in recipe.ingredients" :key="i">{{ ing }}</li>
        </ul>
      </div>

      <div v-if="recipe.instructions?.length">
        <h4>הוראות הכנה:</h4>
        <ol>
          <li v-for="(inst, i) in recipe.instructions" :key="i">{{ inst }}</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const recipeId = route.params.recipeId;

const recipe = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await axios.get(`/recipes/${recipeId}`);
    console.log('✔️ קיבלנו מתכון מהשרת:', res.data); // ← הוסיפי את זה כאן
    recipe.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'אירעה שגיאה בעת טעינת המתכון.';
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.recipe-details img {
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.diet-icon,
.status-icon {
  font-size: 20px;
  margin-left: 10px;
}
</style>
