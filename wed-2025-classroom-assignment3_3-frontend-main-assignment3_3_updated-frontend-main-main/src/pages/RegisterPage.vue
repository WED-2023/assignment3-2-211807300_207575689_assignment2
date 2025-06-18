<template>
  <div class="register-page">
    <h1>Register</h1>
    <form @submit.prevent="register" @input="v$.$touch()">
      <!-- Username -->
      <div class="form-group">
        <label>Username:</label>
        <input v-model="state.username" type="text" class="form-control" />
        <div v-if="v$.username.$error" class="text-danger">
          <div v-if="v$.username.required.$invalid">Username is required.</div>
          <div v-if="v$.username.minLength.$invalid">At least 3 characters.</div>
          <div v-if="v$.username.maxLength.$invalid">At most 8 characters.</div>
          <div v-if="v$.username.pattern.$invalid">Letters only.</div>
        </div>
      </div>

      <!-- First Name -->
      <div class="form-group">
        <label>First Name:</label>
        <input v-model="state.first_name" type="text" class="form-control" />
        <div v-if="v$.first_name.$error" class="text-danger">First name is required.</div>
      </div>

      <!-- Last Name -->
      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="state.last_name" type="text" class="form-control" />
        <div v-if="v$.last_name.$error" class="text-danger">Last name is required.</div>
      </div>

      <!-- Country -->
      <div class="form-group">
        <label>Country:</label>
        <select v-model="state.country" class="form-control">
          <option disabled value="">Please select a country</option>
          <option v-for="country in countries" :key="country" :value="country">
            {{ country }}
          </option>
        </select>
        <div v-if="v$.country.$error" class="text-danger">Country is required.</div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label>Password:</label>
        <input :type="showPasswords ? 'text' : 'password'" v-model="state.password" class="form-control" />
        <div v-if="v$.password.$error" class="text-danger mt-1">
          <div v-if="v$.password.required.$invalid">Password is required.</div>
          <div v-if="v$.password.minLength.$invalid">At least 5 characters.</div>
          <div v-if="v$.password.maxLength.$invalid">At most 10 characters.</div>
          <div v-if="v$.password.pattern.$invalid">Include number & special char.</div>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label>Confirm Password:</label>
        <input :type="showPasswords ? 'text' : 'password'" v-model="state.confirm_password" class="form-control" />
        <div v-if="v$.confirm_password.$error" class="text-danger mt-1">
          <div v-if="v$.confirm_password.required.$invalid">Please confirm your password.</div>
          <div v-if="v$.confirm_password.sameAsPassword.$invalid">Passwords do not match.</div>
        </div>
      </div>

      <!-- Show Password Checkbox -->
      <div class="form-check mt-2 mb-3">
        <input type="checkbox" id="showPasswords" class="form-check-input" v-model="showPasswords" />
        <label for="showPasswords" class="form-check-label">Show password</label>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label>Email:</label>
        <input v-model="state.email" type="email" class="form-control" />
        <div v-if="v$.email.$error" class="text-danger">
          <div v-if="v$.email.required.$invalid">Email is required.</div>
          <div v-if="v$.email.email.$invalid">Invalid email.</div>
        </div>
      </div>

      <button type="submit" class="btn btn-success mt-3">Register</button>
    </form>
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
          console.log("Sending data:", state);
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
          alert("Registration successful!");
          router.push("/login");
        } catch (err) {
          if (err.response?.status === 409) {
            alert("Username already exists. Please choose a different username.");
          } else {
            alert("Registration failed: " + JSON.stringify(err.response?.data || err.message));
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
  max-width: 400px;
  margin: auto;
}
</style>
