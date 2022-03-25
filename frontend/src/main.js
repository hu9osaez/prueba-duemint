import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import Axios from 'axios';
import VueAxios from 'vue-axios';

import App from './App.vue';
import router from './router';
import store from './store';

import 'ant-design-vue/dist/antd.css';

const axios = Axios.create({
  baseURL: 'http://localhost:3000/',
});

const app = createApp(App);

app
  .use(Antd)
  .use(VueAxios, axios)
  .use(store)
  .use(router)
  .provide('axios', app.config.globalProperties.axios)
  .mount('#app');
