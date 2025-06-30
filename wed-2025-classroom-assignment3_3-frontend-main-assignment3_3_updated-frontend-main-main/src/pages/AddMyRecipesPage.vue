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
  setup() {
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

<style lang="scss" scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 2.2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.form-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 0.2rem rgba(66, 185, 131, 0.25);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.checkbox-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.checkbox-group .form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.btn-main {
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
}

.btn-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 185, 131, 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #ff9966 40%, #ff5e62 60%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 126, 100, 0.4);
}

.btn-danger {
  background: linear-gradient(45deg, #dc3545 40%, #e83e8c 60%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 1.8rem;
  }

  .form-section {
    padding: 20px;
  }

  .btn-main,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
  }
}
</style>
