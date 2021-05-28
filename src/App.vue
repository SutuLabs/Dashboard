<template>
  <div id="app">
    <div class="is-hidden-mobile">
      <b-navbar>
        <template #brand>
          <b-navbar-item tag="router-link" :to="{path:'/'}">
            <img src="./assets/logo.png">
          </b-navbar-item>
          <div class="slogan">
            Chiabee，为矿场提供更专业的技术服务。
          </div>
        </template>
        <template #end>
          <b-navbar-item tag="router-link" :to="{path:'/'}">
            首页
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/explorer'}">
            区块链浏览器
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/calculator'}">
            计算器
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/monitor'}">
            矿场监控
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/plottingPerformance'}">
            P盘效率
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/about'}">
            关于我们
          </b-navbar-item>
          <b-navbar-item v-if="!login" tag="router-link" :to="{path:'/login'}">
            登录
          </b-navbar-item>
          <b-navbar-item v-else @click="quit">
            退出登录
          </b-navbar-item>
        </template>
      </b-navbar>
    </div>

    <div class="is-hidden-tablet">
      <b-navbar :mobile-burger="false">
        <template #brand>
          <b-navbar-item>
            <img src="logo.png">
          </b-navbar-item>
          <div class="slogan">
            Chiabee，为矿场提供更专业的技术服务。
          </div>
        </template>
      </b-navbar>
    </div>

    <div class="p-4">
      <router-view />
    </div>

    <div class="is-hidden-tablet">
      <b-navbar :fixed-bottom="true" :mobile-burger="false">
        <template #brand>
          <b-navbar-item class="navbarButton" tag="router-link" :to="{path:'/'}">
            <div>
              <b-icon icon="home"></b-icon>
            </div>
            <div>首页</div>
          </b-navbar-item>
          <b-navbar-item class="navbarButton" tag="router-link" :to="{path:'/explorer'}">
            <div>
              <b-icon icon="view-column"></b-icon>
            </div>
            <div>浏览器</div>
          </b-navbar-item>
          <b-navbar-item class="navbarButton" tag="router-link" :to="{path:'/monitor'}">
            <div>
              <b-icon icon="monitor-dashboard"></b-icon>
            </div>
            <div>矿场监控</div>
          </b-navbar-item>
          <b-navbar-item class="navbarButton" tag="router-link" :to="{path:'/about'}">
            <div>
              <b-icon icon="information"></b-icon>
            </div>
            <div>关于</div>
          </b-navbar-item>
           <b-navbar-item v-if="!login" class="navbarButton" tag="router-link" :to="{path:'/login'}">
            <div>
              <b-icon icon="account"></b-icon>
            </div>
            <div>登录</div>
          </b-navbar-item>
          <b-navbar-item v-else @click="quit" class="navbarButton">
            <div>
              <b-icon icon="account"></b-icon>
            </div>
            <div>退出登录</div>
          </b-navbar-item>
        </template>
      </b-navbar>
    </div>
  </div>
</template>


<script lang="ts">
  import { Component,Vue } from 'vue-property-decorator'
  @Component
  export default class App extends Vue {
    login = localStorage.getItem('username') ? true : false
     quit(){
       localStorage.removeItem('username')
       localStorage.removeItem('password')
       this.login = false
       this.$router.go(0)     //Vue无法响应localStorage改变，刷新使页面响应更新 
    }
  }
</script>
<style lang="scss">
  @import '../node_modules/buefy/dist/buefy.css';
  @import 'bulmaswatch/darkly/_variables.scss';
  @import "bulma/bulma.sass";
  @import 'bulmaswatch/darkly/_overrides.scss';

  .navbarButton {
    width: 25vw;
    display: flex;
    flex-direction: column;
  }

  .slogan {
    margin-top: 24px;
    font-size: small;
    color: gold;
  }

  .card-header-title > .heading {
    padding-left: 20px;
    padding-top: 8px;
  }
</style>
