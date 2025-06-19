<template>
  <div class="login-page">
    <div class="image-container">
  <!-- אפשרות עתידית לתמונה רקע: <img src="@/assets/login-image.webp" alt="Login Illustration" /> -->
    </div>
    <div class="form-container">
      <h1 class="title">Login</h1>
      <b-form @submit.prevent="login">
        <b-form-group label="Username:" label-for="username">
          <b-form-input
            id="username"
            v-model="state.username"
            :state="v$.username.$dirty ? !v$.username.$invalid : null"
            @blur="v$.username.$touch()"
          />
          <b-form-invalid-feedback v-if="v$.username.$error">
            Username is required
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group label="Password:" label-for="password">
          <b-form-input
            id="password"
            type="password"
            v-model="state.password"
            :state="v$.password.$dirty ? !v$.password.$invalid : null"
            @blur="v$.password.$touch()"
          />
          <b-form-invalid-feedback v-if="v$.password.$error">
            Password is required
          </b-form-invalid-feedback>
        </b-form-group>

        <b-button type="submit" variant="primary" class="w-100">Login</b-button>

        <div class="mt-2 text-center">
          Don’t have an account?
          <router-link to="/register">Register here</router-link>
        </div>

        <b-alert class="mt-2" v-if="state.submitError" variant="danger" dismissible show>
          Login failed: {{ state.submitError }}
        </b-alert>
      </b-form>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import axios from 'axios';




export default {
  name: 'LoginPage',
  setup() {
  const router = useRouter();
  const internalInstance = getCurrentInstance();
  const store = internalInstance.appContext.config.globalProperties.store;

  const state = reactive({
    username: '',
    password: '',
    submitError: null,
  });

  const rules = {
    username: { required },
    password: { required },
  };

  const v$ = useVuelidate(rules, state);

  const login = async () => {
    const valid = await v$.value.$validate();
    if (!valid) return;

    try {
      const response = await axios.post('/login', {
        username: state.username,
        password: state.password,
      });

      if (response?.data?.success) {
        localStorage.setItem('loggedInUser', state.username);
        store.login(state.username);  // ✅ עובד עם ה־store הגלובלי
        router.push('/');
      } else {
        state.submitError = response?.data?.message || 'Invalid login.';
      }
    } catch (error) {
      state.submitError = error.response?.data?.message || 'Unexpected error occurred.';
    }
  };

  return {
    state,
    v$,
    login,
  };
}
};
</script>


<style scoped lang="scss">
.login-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.image-container {
  flex: 1;
  background-color: #f8f9fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;

  .title {
    text-align: center;
    color: #9168b3;
    font-size: 4em;
    font-weight: bold;
  }

  .b-form-group {
    margin-bottom: 1rem;
  }

  .b-form-group > label {
    font-weight: bold;
  }

  .b-form-input, .b-form-select {
    margin-top: 0.5rem;
  }

  .b-button {
    width: 100%;
    padding: 10px;
  }

  .b-alert {
    margin-top: 1rem;
  }

  .text-center {
    text-align: center;
  }
}
</style>
