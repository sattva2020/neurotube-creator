<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 text-center">Вход</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
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
          :rules="[val => !!val || 'Введите пароль']"
          autocomplete="current-password"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-banner v-if="errorMessage" dense class="text-negative bg-negative-light q-mb-sm" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-btn
          type="submit"
          label="Войти"
          color="primary"
          class="full-width"
          :loading="authStore.isLoading"
          no-caps
        />
      </q-form>
    </q-card-section>

    <q-separator />

    <q-card-section class="text-center">
      <span class="text-grey-7">Нет аккаунта?</span>
      <router-link to="/register" class="q-ml-xs text-primary">Зарегистрироваться</router-link>
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
  email: '',
  password: '',
});
const showPassword = ref(false);
const errorMessage = ref('');

async function onSubmit(): Promise<void> {
  console.debug('[LoginPage] Submit:', form.email);
  errorMessage.value = '';

  try {
    await authStore.login({ email: form.email, password: form.password });
    console.debug('[LoginPage] Login successful, redirecting to /');
    await router.push('/');
  } catch (err) {
    const error = err as { statusCode?: number; message?: string };
    console.debug('[LoginPage] Login failed:', error.statusCode, error.message);

    if (error.statusCode === 401) {
      errorMessage.value = 'Неверный email или пароль';
    } else if (error.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Ошибка сети. Попробуйте позже.';
    }
  }
}

onMounted(() => {
  console.debug('[LoginPage] Page mounted');
});
</script>

<style scoped>
.bg-negative-light {
  background-color: rgba(var(--q-negative-rgb), 0.1);
}
</style>
