<template>
  <div class="main-page container">
    <div class="row">
      <!-- Left Column: Random Recipes -->
      <div class="col-md-6">
        <RecipePreviewList title="Explore These Recipes" :recipes="exploreRecipes" />
        <div class="text-center mt-3">
          <button class="btn btn-secondary" @click="loadRandomRecipes">Show 3 More</button>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-md-6">
        <div v-if="store.username">
          <RecipePreviewList title="Last Watched Recipes" :recipes="lastWatchedRecipes" />
        </div>
        <div v-else class="text-center">
          <h3>Welcome Guest!</h3>
          <p>Please log in to see your recently viewed recipes.</p>
          <router-link :to="{ name: 'login' }" class="btn btn-primary m-1">Login</router-link>
          <router-link :to="{ name: 'register' }" class="btn btn-outline-primary m-1">Register</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, getCurrentInstance, onMounted } from "vue";
import RecipePreviewList from "../components/RecipePreviewList.vue";

export default {
  name: "MainPage",
  components: { RecipePreviewList },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;

    const exploreRecipes = ref([]);
    const lastWatchedRecipes = ref([]);

    const loadRandomRecipes = async () => {
      try {
        const response = await axios.get("/recipes/explore");
        exploreRecipes.value = response.data;
      } catch (err) {
        console.error("Error loading random recipes", err);
      }
    };

    const loadLastWatchedRecipes = async () => {
      if (store.username) {
        try {
          const response = await axios.get("/users/me/last-watched");
          lastWatchedRecipes.value = response.data.slice(0, 3);
        } catch (err) {
          console.error("Error loading last watched recipes", err);
        }
      }
    };

    onMounted(() => {
      loadRandomRecipes();
      loadLastWatchedRecipes();
    });

    return {
      exploreRecipes,
      lastWatchedRecipes,
      loadRandomRecipes,
      store,
    };
  },
};
</script>

<style scoped>
.main-page {
  padding-top: 30px;
}
</style>
