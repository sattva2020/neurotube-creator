import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './css/neuro-theme.scss';

import App from './App.vue';
import { router } from './router';
import { posthogPlugin } from './plugins/posthog';

gsap.registerPlugin(ScrollTrigger);
console.debug('[main] GSAP + ScrollTrigger registered');

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

app.use(posthogPlugin, {
  apiKey: import.meta.env.VITE_POSTHOG_API_KEY || '',
  host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  router,
});
console.debug('[main] PostHog analytics plugin installed');

app.mount('#app');
console.debug('[main] App mounted to #app');
