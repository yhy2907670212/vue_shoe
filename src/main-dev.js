import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element-ui文件
import './plugins/element.js'
// 导入axios库文件
import axios from 'axios'
// 导入vue-table-with-tree-grid插件
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器 vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
//require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//导入 nprogress 包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//配置请求的根路径 默认地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//在request拦截器中，展示进度条 NProgress.start()
// 为请求头对象，添加 Token 验证的 Authorization 字段
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
//在response 拦截器中，隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  return config
})
//定义全局请求方式
Vue.prototype.$http = axios

Vue.config.productionTip = false

//定义TreeTable组件
Vue.component('tree-table', TreeTable)

// 配置全局时间处理过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, 0);
  const d = (dt.getDate() + '').padStart(2, 0);
  const hh = (dt.getHours() + '').padStart(2, 0);
  const mm = (dt.getMinutes() + '').padStart(2, 0);
  const ss = (dt.getSeconds() + '').padStart(2, 0);
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})

//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
