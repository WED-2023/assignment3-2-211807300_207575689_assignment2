<template>
  <div class="register-page">
    <div class="register-header">
      <h1>הרשמה</h1>
      <p>הצטרף אלינו והתחל לשמור ולשתף מתכונים</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="register" @input="v$.$touch()" class="register-form">
        <!-- Username -->
        <div class="form-group">
          <label>שם משתמש:</label>
          <input v-model="state.username" type="text" class="form-control" />
          <div v-if="v$.username.$error" class="text-danger">
            <div v-if="v$.username.required.$invalid">שם משתמש נדרש.</div>
            <div v-if="v$.username.minLength.$invalid">לפחות 3 תווים.</div>
            <div v-if="v$.username.maxLength.$invalid">לכל היותר 8 תווים.</div>
            <div v-if="v$.username.pattern.$invalid">אותיות באנגלית בלבד.</div>
          </div>
        </div>

        <!-- First Name -->
        <div class="form-group">
          <label>שם פרטי:</label>
          <input v-model="state.first_name" type="text" class="form-control" />
          <div v-if="v$.first_name.$error" class="text-danger">שם פרטי נדרש.</div>
        </div>

        <!-- Last Name -->
        <div class="form-group">
          <label>שם משפחה:</label>
          <input v-model="state.last_name" type="text" class="form-control" />
          <div v-if="v$.last_name.$error" class="text-danger">שם משפחה נדרש.</div>
        </div>

        <!-- Country -->
        <div class="form-group">
          <label>מדינה:</label>
          <select v-model="state.country" class="form-control">
            <option disabled value="">בחר מדינה</option>
            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
          <div v-if="v$.country.$error" class="text-danger">מדינה נדרשת.</div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>סיסמה:</label>
          <input :type="showPasswords ? 'text' : 'password'" v-model="state.password" class="form-control" />
          <div v-if="v$.password.$error" class="text-danger">
            <div v-if="v$.password.required.$invalid">סיסמה נדרשת.</div>
            <div v-if="v$.password.minLength.$invalid">לפחות 5 תווים.</div>
            <div v-if="v$.password.maxLength.$invalid">לכל היותר 10 תווים.</div>
            <div v-if="v$.password.pattern.$invalid">חייב להכיל מספר ותו מיוחד.</div>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label>אישור סיסמה:</label>
          <input :type="showPasswords ? 'text' : 'password'" v-model="state.confirm_password" class="form-control" />
          <div v-if="v$.confirm_password.$error" class="text-danger">
            <div v-if="v$.confirm_password.required.$invalid">נא לאשר את הסיסמה.</div>
            <div v-if="v$.confirm_password.sameAsPassword.$invalid">הסיסמאות לא תואמות.</div>
          </div>
        </div>

        <!-- Show Password Checkbox -->
        <div class="form-check">
          <input type="checkbox" id="showPasswords" class="form-check-input" v-model="showPasswords" />
          <label for="showPasswords" class="form-check-label">הצג סיסמה</label>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>אימייל:</label>
          <input v-model="state.email" type="email" class="form-control" />
          <div v-if="v$.email.$error" class="text-danger">
            <div v-if="v$.email.required.$invalid">אימייל נדרש.</div>
            <div v-if="v$.email.email.$invalid">אימייל לא תקין.</div>
          </div>
        </div>

        <button type="submit" class="search-btn">הרשמה</button>

        <div class="login-link">
          כבר יש לך חשבון?
          <router-link to="/login">התחבר כאן</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, email, sameAs, helpers } from '@vuelidate/validators';

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter();
    const state = reactive({
      username: '',
      first_name: '',
      last_name: '',
      country: '',
      password: '',
      confirm_password: '',
      email: '',
      profilePic: undefined
    });

    const rules = {
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(8),
        pattern: helpers.regex(/^[A-Za-z]+$/)
      },
      first_name: { required },
      last_name: { required },
      country: { required },
      password: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(10),
        pattern: helpers.regex(/^(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
      },
      confirm_password: {
        required,
        sameAsPassword: sameAs(computed(() => state.password))
      },
      email: {
        required,
        email
      }
    };

    const v$ = useVuelidate(rules, state);
    const countries = ref([]);
    const showPasswords = ref(false);

    onMounted(async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
        const data = await response.json();
        countries.value = data.map(c => c.name.common).sort();
      } catch (error) {
        console.error("Failed to load countries", error);
      }
    });

    const register = async () => {
      if (await v$.value.$validate()) {
        try {
          await axios.post("/Register", {
            username: state.username,
            first_name: state.first_name,
            last_name: state.last_name,
            country: state.country,
            password: state.password,
            confirm_password: state.confirm_password,
            email: state.email,
            profilePic: state.profilePic
          });
          alert("ההרשמה בוצעה בהצלחה!");
          router.push("/login");
        } catch (err) {
          if (err.response?.status === 409) {
            alert("שם המשתמש כבר קיים. אנא בחר שם אחר.");
          } else {
            alert("ההרשמה נכשלה: " + JSON.stringify(err.response?.data || err.message));
          }
        }
      }
    };

    return {
      state,
      v$,
      register,
      countries,
      showPasswords
    };
  }
};
</script>

<style scoped>
.register-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #42b983 40%, #369870 60%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  font-size: 2rem;
  font-weight: bold;
}
.register-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.register-header p {
  font-size: 1.1rem;
  opacity: 0.95;
}


.register-container {
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.register-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
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

.login-link {
  grid-column: span 2;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .register-form {
    grid-template-columns: 1fr;
  }

  .btn-primary,
  .form-check,
  .login-link {
    grid-column: span 1;
  }
}
</style>

