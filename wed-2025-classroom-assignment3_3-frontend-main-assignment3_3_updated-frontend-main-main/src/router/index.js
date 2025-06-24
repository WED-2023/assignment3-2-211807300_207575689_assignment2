import Main from "../pages/MainPage.vue";
import NotFound from "../pages/NotFoundPage.vue";
import RandomRecipes from "../pages/RandomRecipes.vue";

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/RegisterPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../pages/SearchPage.vue"),
  },
  {
    path: "/recipe/:recipeId",
    name: "recipe",
    component: () => import("../pages/RecipeViewPage.vue"),
  },
  {
    path: "/recipes/explore",
    name: "random",
    component: RandomRecipes,
  },
  {
    path: "/me/favorites",
    name: "Favorites",
    component: () => import("../pages/FavoritesPage.vue")
  },
  {
    path: "/me/my-recipes",
    name: "MyRecipes", 
    component: () => import("../pages/MyRecipesPage.vue")
  },
  {
    path: "/me/family-recipes",
    name: "FamilyRecipes",
    component: () => import("../pages/FamilyRecipesPage.vue")
  },
  {
    path: "/me/add-my-recipe",
    name: "AddMyRecipes", 
    component: () => import("../pages/AddMyRecipesPage.vue")
  },
  {
    path: "/me/add-family-recipe",
    name: "AddFamilyRecipes",
    component: () => import("../pages/AddFamilyRecipesPage.vue")
  },
  {
  path: '/recipes/:recipeId',
  name: 'RecipeDetails',
  component: () => import('@/pages/ShowRecipePage.vue')
  },
  {
    path: "/:catchAll(.*)",
    name: "notFound",
    component: NotFound,
  },
  {
  path: '/about',
  name: 'About',
  component: () => import('@/pages/AboutPage.vue')
}
];

export default routes;