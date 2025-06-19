<template>
  <div class="container">
    <h3>{{ title }}</h3>
    <div class="row">
      <div class="col" v-for="r in recipes" :key="r.id">
        <RecipePreview class="recipePreview" :recipe="r" />
      </div>
    </div>
  </div>
</template>

<script>
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
};
</script>

<style scoped>
.container {
  min-height: 400px;
}
</style>
