<template>
  <div class="login-page">
    <div class="login-header">
      <h1>התחברות</h1>
      <p>ברוכים השבים! אנא התחבר כדי להמשיך</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="login" @input="v$.$touch()" class="login-form">
        <!-- Username -->
        <div class="form-group">
          <label>שם משתמש:</label>
          <input
            v-model="state.username"
            type="text"
            class="form-control"
            :class="{ invalid: v$.username.$error && v$.username.$dirty }"
          />
          <div v-if="v$.username.$error && v$.username.$dirty" class="text-danger">
            <div v-if="v$.username.required.$invalid">שם משתמש נדרש.</div>
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>סיסמה:</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="state.password"
            class="form-control"
            :class="{ invalid: v$.password.$error && v$.password.$dirty }"
          />
          <div v-if="v$.password.$error && v$.password.$dirty" class="text-danger">
            <div v-if="v$.password.required.$invalid">סיסמה נדרשת.</div>
          </div>
        </div>

        <!-- Show Password Checkbox -->
        <div class="form-check">
          <input type="checkbox" id="showPassword" v-model="showPassword" />
          <label for="showPassword">הצג סיסמה</label>
        </div>

        <button type="submit" class="btn-primary">התחבר</button>

        <div class="register-link">
          אין לך חשבון?
          <router-link to="/register">הרשם כאן</router-link>
        </div>

        <div v-if="state.submitError" class="text-danger submit-error">
          {{ state.submitError }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import axios from "axios";

export default {
  name: "LoginPage",
  emits: ["login-success"], // נשלח להורה כשההתחברות מצליחה
  setup(props, { emit }) {
    const router = useRouter();

    // קבלת store מ-globalProperties
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;

    // מצב טופס
    const state = reactive({
      username: "",
      password: "",
      submitError: null,
    });

    // חוקים לוולידציה
    const rules = {
      username: { required },
      password: { required },
    };

    const v$ = useVuelidate(rules, state);
    const showPassword = ref(false);

    const login = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;

      try {
        const response = await axios.post("/login", {
          username: state.username,
          password: state.password,
        });

        if (response?.data?.success) {
          // שמירת המשתמש בלוקאל סטורג' והרצת login מה-store
          localStorage.setItem("loggedInUser", state.username);
          store.login(state.username);

          // שליחת event להתחברות מוצלחת
          emit("login-success");

          // הפניה לדף הבית רק אם אנחנו בדף login
          if (router.currentRoute.value.name === "login") {
            router.push("/");
          }
        } else {
          state.submitError = response?.data?.message || "שם משתמש או סיסמה שגויים.";
        }
      } catch (error) {
        state.submitError = error.response?.data?.message || "אירעה שגיאה בשרת.";
      }
    };

    return {
      state,
      v$,
      login,
      showPassword,
    };
  },
};
</script>


<style scoped>
.login-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: rtl;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.login-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.login-header p {
  font-size: 1.1rem;
  opacity: 0.95;
}

.form-container {
  background: #ffffff;
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.login-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #333;
}

.form-control {
  padding: 8px 12px;
  font-size: 0.95rem;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.form-control.invalid {
  border-color: #d9534f;
  box-shadow: 0 0 0 3px rgba(217, 83, 79, 0.3);
}

.text-danger {
  font-size: 0.8rem;
  color: #d9534f;
  margin-top: 3px;
}

.form-check {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  margin-top: 10px;
}

.btn-primary {
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: span 2;
  margin-top: 20px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 185, 131, 0.4);
}

.register-link {
  grid-column: span 2;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
  color: #42b983;
}

.register-link a {
  font-weight: bold;
  text-decoration: none;
  color: #42b983;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

.submit-error {
  grid-column: span 2;
  margin-top: 10px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .login-form {
    grid-template-columns: 1fr;
  }

  .form-check,
  .btn-primary,
  .register-link,
  .submit-error {
    grid-column: span 1;
  }
}
</style>
