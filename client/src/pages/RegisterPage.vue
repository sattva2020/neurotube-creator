<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 text-center">Регистрация</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="form.displayName"
          label="Имя"
          outlined
          :rules="[val => !!val || 'Введите имя', val => val.length >= 2 || 'Минимум 2 символа']"
          autocomplete="name"
        />

        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          outlined
          :rules="[val => !!val || 'Введите email', val => /.+@.+\..+/.test(val) || 'Некорректный email']"
          autocomplete="email"
        />

        <q-input
          v-model="form.password"
          label="Пароль"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="[val => !!val || 'Введите пароль', val => val.length >= 6 || 'Минимум 6 символов']"
          autocomplete="new-password"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.confirmPassword"
          label="Подтвердите пароль"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="[val => !!val || 'Подтвердите пароль', val => val === form.password || 'Пароли не совпадают']"
          autocomplete="new-password"
        />

        <q-banner v-if="errorMessage" dense class="text-negative bg-negative-light q-mb-sm" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          label="Зарегистрироваться"
          color="primary"
          class="full-width"
          :loading="authStore.isLoading"
          no-caps
        />
      </q-form>
    </q-card-section>

    <q-separator />

    <q-card-section class="text-center">
      <span class="text-grey-7">Уже есть аккаунт?</span>
      <router-link to="/login" class="q-ml-xs text-primary">Войти</router-link>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});
const showPassword = ref(false);
const errorMessage = ref('');

async function onSubmit(): Promise<void> {
  console.debug('[RegisterPage] Submit:', form.email);
  errorMessage.value = '';

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Пароли не совпадают';
    return;
  }

  try {
    await authStore.register({
      displayName: form.displayName,
      email: form.email,
      password: form.password,
    });
    console.debug('[RegisterPage] Register successful, redirecting to /');
    await router.push('/');
  } catch (err) {
    const error = err as { statusCode?: number; message?: string };
    console.debug('[RegisterPage] Register failed:', error.statusCode, error.message);

    if (error.statusCode === 409) {
      errorMessage.value = 'Пользователь с таким email уже существует';
    } else if (error.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Ошибка сети. Попробуйте позже.';
    }
  }
}

onMounted(() => {
  console.debug('[RegisterPage] Page mounted');
});
</script>

<style scoped>
.bg-negative-light {
  background-color: rgba(var(--q-negative-rgb), 0.1);
}
</style>
