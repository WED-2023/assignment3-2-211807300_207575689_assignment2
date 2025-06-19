<template>
  <div class="container mt-4">
    <h2 class="mb-4">Add Family Recipe</h2>
    <AddRecipe v-model="newRecipe" :onSubmit="submitFamilyRecipe">
      <template #additional-fields>
        <b-form-group label="Family Member" label-for="family_member">
          <b-form-input id="family_member" v-model="newRecipe.family_member" required />
        </b-form-group>

        <b-form-group label="Tradition" label-for="tradition">
          <b-form-input id="tradition" v-model="newRecipe.tradition" required />
        </b-form-group>
      </template>
    </AddRecipe >
  </div>
</template>

<script>
import { reactive } from 'vue';
import axios from 'axios';
import AddRecipe from '@/components/AddRecipe.vue';

export default {
  name: 'AddFamilyRecipe',
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
      family_member: '',
      tradition: ''
    });

    const submitFamilyRecipe = async (recipe) => {
      try {
        await axios.post('/users/me/family-recipes', recipe);
        alert('Recipe added successfully!');
        root.$router.push('/family-recipes');
      } catch (err) {
        console.error('Error adding recipe:', err);
        alert('Failed to add recipe');
      }
    };

    return {
      newRecipe,
      submitFamilyRecipe,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
