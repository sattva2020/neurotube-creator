import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';
import { router } from './router';

console.debug('[main] Initializing NeuroTube Creator app');

const app = createApp(App);

app.use(createPinia());
console.debug('[main] Pinia store installed');

app.use(router);
console.debug('[main] Vue Router installed');

app.use(Quasar, {
  plugins: {},
});
console.debug('[main] Quasar framework installed');

app.mount('#app');
console.debug('[main] App mounted to #app');
