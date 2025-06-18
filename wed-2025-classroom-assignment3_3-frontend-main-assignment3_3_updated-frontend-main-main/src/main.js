import { createApp, reactive } from 'vue';
import App from './App.vue';
import routes from './router/index';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { createRouter, createWebHistory } from 'vue-router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import { BContainer, BRow, BCol } from 'bootstrap-vue-3';
import Vuelidate from '@vuelidate/core';

// Axios default config
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // Required for cookie-based sessions

// Router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Shared store
const store = reactive({
  username: localStorage.getItem('username'),
  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
  },
  logout() {
    localStorage.removeItem('username');
    this.username = undefined;
  },
});

// Axios interceptors (optional for logging/debugging)
axios.interceptors.request.use((config) => config, (error) => Promise.reject(error));
axios.interceptors.response.use((response) => response, (error) => Promise.reject(error));

// Create and mount app
const app = createApp(App);

app.use(router);
app.use(VueAxios, axios);
app.use(BootstrapVue3);
app.use(Vuelidate);

app.component('BContainer', BContainer);
app.component('BRow', BRow);
app.component('BCol', BCol);

app.config.globalProperties.store = store;

app.mount('#app');