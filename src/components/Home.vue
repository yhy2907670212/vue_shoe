<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
           <img src="../assets/logo.png" alt="">
           <span>电商后台管理系统</span>
        </div>
        <el-button @click="logout" type="info" plain round size="mini">退出</el-button>
      </el-header>
      <!-- 页面主体区 -->
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏区域 -->
            <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath"> 
              <!-- 一级菜单 -->
              <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menulist">
                <!-- 一级菜单的模板区域 -->
                <template #title>
                  <i :class="iconsObj[item.id]"></i>
                  <span>{{item.authName}}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                    <template #title>
                      <i class="el-icon-menu"></i>
                      <span>{{subItem.authName}}</span>
                    </template>
                </el-menu-item>
              </el-submenu>
            </el-menu>
        </el-aside>
        <!-- 右侧边栏 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath: ''
    }
  },
  //组件创立时执行的生命周期函数
  created() {
    //获取菜单列表
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //退出登录
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    },
    //获取菜单列表
    async getMenuList() {
      const {data: res} = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      // console.log(res);
    },
    //点击按钮切换按钮的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header {
  background-color: #333744;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    width: 15%;
    height: 15%;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eee;
}
.iconfont {
  padding-right: 10px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>