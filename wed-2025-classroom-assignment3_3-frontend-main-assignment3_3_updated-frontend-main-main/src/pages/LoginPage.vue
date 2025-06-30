<template>
  <div class="login-page">
    <div class="form-container">
      <h1 class="title">Login</h1>
      <b-form @submit.prevent="login">
        <b-form-group label="Username:" label-for="שם משתמש">
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

        <b-form-group label="Password:" label-for="סיסמה">
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
          Don't have an account?
          <router-link to="/register">הרשמה</router-link>
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
  emits: ['login-success'], // הוספת emit עבור הודעה על התחברות מוצלחת
  setup(props, { emit }) {
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
          store.login(state.username);

          // שלח הודעה שההתחברות הצליחה
          emit('login-success');
          
          // אם זה עמוד נפרד (לא קומפוננטה), נווט לדף הבית
          if (router.currentRoute.value.name === 'login') {
            router.push('/');
          }
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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.8s ease-out;

  .title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #42b983;
  }

  :deep(.form-group) {
    margin-bottom: 1.5rem;
  }

  :deep(.btn) {
    background: linear-gradient(135deg, #42b983 0%, #369870 100%);
    border: none;
    padding: 12px 20px;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;

    &:hover {
      background: linear-gradient(135deg, #369870 0%, #2d7a5f 100%);
    }
  }

  .text-center {
    margin-top: 1rem;

    a {
      color: #42b983;
      font-weight: bold;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  :deep(.alert) {
    border-radius: 10px;
    font-weight: 500;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
