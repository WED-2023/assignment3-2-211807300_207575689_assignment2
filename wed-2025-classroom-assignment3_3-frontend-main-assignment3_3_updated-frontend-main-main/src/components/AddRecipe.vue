<template>
  <b-form @submit.prevent="handleSubmit">
    <b-form-group label="Title" label-for="title">
      <b-form-input id="title" v-model="recipe.title" required></b-form-input>
    </b-form-group>

    <b-form-group label="Image URL" label-for="image">
      <b-form-input id="image" v-model="recipe.image"></b-form-input>
    </b-form-group>

    <b-form-group label="Duration (minutes)" label-for="duration">
      <b-form-input id="duration" type="number" v-model.number="recipe.duration" required></b-form-input>
    </b-form-group>

    <b-form-group label="Servings" label-for="servings">
      <b-form-input id="servings" type="number" v-model.number="recipe.servings"></b-form-input>
    </b-form-group>

    <b-form-group label="Ingredients (comma-separated)" label-for="ingredients">
      <b-form-textarea id="ingredients" v-model="ingredientsText"></b-form-textarea>
    </b-form-group>

    <b-form-group label="Instructions (line per step)" label-for="instructions">
      <b-form-textarea id="instructions" v-model="instructionsText"></b-form-textarea>
    </b-form-group>

    <b-form-checkbox v-model="recipe.vegan">Vegan</b-form-checkbox>
    <b-form-checkbox v-model="recipe.vegetarian">Vegetarian</b-form-checkbox>
    <b-form-checkbox v-model="recipe.glutenFree">Gluten Free</b-form-checkbox>

    <slot name="additional-fields"></slot>

    <b-button type="submit" variant="success" class="mt-3">Submit</b-button>
  </b-form>
</template>

<script>
export default {
  name: "RecipeForm",
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    onSubmit: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      ingredientsText: this.modelValue.ingredients?.map(i => i.name).join(", ") || "",
      instructionsText: this.modelValue.instructions?.map(i => i.step).join("\n") || "",
    };
  },
  computed: {
    recipe: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      }
    }
  },
  methods: {
    handleSubmit() {
      this.recipe.ingredients = this.ingredientsText
        .split(",")
        .map(i => ({ name: i.trim() }))
        .filter(i => i.name);

      this.recipe.instructions = this.instructionsText
        .split("\n")
        .map((step, index) => ({ number: index + 1, step: step.trim() }))
        .filter(i => i.step);

      this.onSubmit(this.recipe);
    }
  }
};
</script>

<style scoped>
.b-form-group + .b-form-group {
  margin-top: 1rem;
}
</style>
