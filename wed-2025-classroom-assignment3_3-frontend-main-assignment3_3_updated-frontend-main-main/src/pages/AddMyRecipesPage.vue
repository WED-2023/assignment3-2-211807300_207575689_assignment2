<template>
  <div class="container mt-4">
    <h2 class="mb-4">Add Personal Recipe</h2>
    <AddRecipe v-model="newRecipe" :onSubmit="submitUserRecipe" />
  </div>
</template>

<script>
import { reactive } from 'vue';
import axios from 'axios';
import AddRecipe from '@/components/AddRecipe.vue';

export default {
  name: 'AddUserRecipe',
  components: { AddRecipe },
  setup(_, { root }) {
    const newRecipe = reactive({
      title: '',
      image: '',
      duration: null,
      servings: null,
      ingredients: [],
      instructions: [],
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      likes: 0
    });

    const submitUserRecipe = async (recipe) => {
      try {
        console.log("📦 Submitting recipe:", JSON.stringify(recipe, null, 2)); // הדפסת DEBAG  למחוק אחרכך

        await axios.post('/users/me/recipes', recipe);
        alert('Recipe added successfully!');
        root.$router.push('/my-recipes');
      } catch (err) {
        console.error('Error adding recipe:', err);
        alert('Failed to add recipe');
      }
    };

    return {
      newRecipe,
      submitUserRecipe,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
