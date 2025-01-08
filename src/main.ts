import './app.css';
import App from './App.svelte';

import { init } from '@telegram-apps/sdk';

init();

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
