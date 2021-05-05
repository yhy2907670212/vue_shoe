import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入全局样式
import '../assets/css/global.css'
// 导入字体图标
import '../assets/fonts/iconfont.css'

// 导入登录组件
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
 //导入home组件
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
//导入Welcome组件
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// 导入用户Users组件
// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users.vue')
//导入权限列表组件
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights.vue')
//导入角色列表组件
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles.vue')

//导入商品分类组件
// import Cate from  '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue')
//导入分类参数组件
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue')

//导入商品列表组件
// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/List.vue')
//导入添加商品组件
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add.vue')

//导入订单列表组件
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
//导入数据报表组件
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home, redirect: '/welcome', children: [
      {path: '/welcome', component: Welcome},
      {path: '/users', component: Users},
      {path: '/rights', component: Rights},
      {path: '/roles', component: Roles},
      {path: '/categories', component: Cate},
      {path: '/params', component: Params},
      {path: '/goods', component: List},
      {path: '/goods/add', component: Add},
      {path: '/orders', component: Order},
      {path: '/reports', component: Report}
    ] }
  ]
});

//挂载路由导航守卫控制访问权限
router.beforeEach((to, from, next) => {
  //to:将要访问的路径 from：表示从哪个路劲跳转来的 next：一个函数，放行
  //如果用户访问的登录页，直接放行
  if (to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  //没有token值，表示没有登录，强制跳转到login
  if (!tokenStr) return next('/login');
  //否则表示已登录 直接放行
  next();
});

export default router

