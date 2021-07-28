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
          <b-navbar-item tag="router-link" :to="{path:'/explorer'}" v-if="false">
            区块链浏览器
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/calculator'}" v-if="false">
            计算器
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/monitor'}">
            矿场监控
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{path:'/plottingPerformance'}">
            P盘效率
          </b-navbar-item>
          <b-dropdown :triggers="['hover']">
            <template #trigger>
              <b-navbar-item>
                <span >常用工具</span>
              </b-navbar-item>
            </template>
            <b-dropdown-item aria-role="menuitem">
              <a  target="_blank" href="https://www.chiaexplorer.com/">
                区块链浏览器<b-icon  size="is-small" icon="open-in-new"></b-icon>
              </a>
            </b-dropdown-item>
            <b-dropdown-item aria-role="menuitem">
              <a  target="_blank" href="https://chiacalculator.com/ ">
                计算器<b-icon  size="is-small" icon="open-in-new"></b-icon>
              </a>
            </b-dropdown-item>
          </b-dropdown>
          <b-dropdown :triggers="['hover']" position="is-bottom-left" aria-role="menu">
            <template #trigger>
              <b-navbar-item>
                <span v-if="!login">个人中心</span>
                <span v-else>{{username}}</span>
                <b-icon icon="menu-down"></b-icon>
              </b-navbar-item>
            </template>
            <b-dropdown-item aria-role="menuitem" v-if="login" @click="quit">退出登录</b-dropdown-item>
            <b-dropdown-item aria-role="menuitem" v-else>
              <b-navbar-item tag="router-link" :to="{path:'/login'}" class="p-0">登录</b-navbar-item>
            </b-dropdown-item>
            <b-dropdown-item aria-role="menuitem">
              <b-navbar-item tag="router-link" :to="{path:'/about'}" class="p-0">关于我们</b-navbar-item>
            </b-dropdown-item>
          </b-dropdown>
          
        </template>
      </b-navbar>
    </div>

    <div class="is-hidden-tablet">
      <b-navbar :mobile-burger="false">
        <template #brand>
          <b-navbar-item>
            <img src="./assets/logo.png">
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
          <b-navbar-item class="navbarButton mx-4" tag="router-link" :to="{path:'/'}">
            <div>
              <b-icon icon="home"></b-icon>
            </div>
            <div class="is-size-7">首页</div>
          </b-navbar-item>
          <b-navbar-item class="navbarButton" tag="router-link" :to="{path:'/explorer'}" v-if="false">
            <div>
              <b-icon icon="view-column"></b-icon>
            </div>
            <div class="is-size-7">浏览器</div>
          </b-navbar-item>
          <b-navbar-item class="navbarButton mx-4" tag="router-link" :to="{path:'/monitor'}">
            <div>
              <b-icon icon="monitor-dashboard"></b-icon>
            </div>
            <div class="is-size-7">矿场监控</div>
          </b-navbar-item>
          <b-dropdown :triggers="['click']" position="is-top-left" aria-role="menu">
            <template #trigger>
              <b-navbar-item class="navbarButton">
                <div>
                  <b-icon icon="account"></b-icon>
                </div>
                <div class="is-size-7">个人中心</div>
              </b-navbar-item>
            </template>
            <b-dropdown-item v-if="login" aria-role="menuitem" @click="quit">
              亲爱的<span class="has-text-success">{{ username }}</span>，您已成功登录。
              <hr class="dropdown-divider">
              退出登录
            </b-dropdown-item>
            <b-dropdown-item v-else aria-role="menuitem">
              <b-navbar-item tag="router-link" :to="{path:'/login'}" class="p-0">登录</b-navbar-item>
            </b-dropdown-item>
            <b-dropdown-item area-role="menuitem">
              <b-navbar-item tag="router-link" :to="{path:'/about'}" class="p-0">关于我们</b-navbar-item>
            </b-dropdown-item>
          </b-dropdown>
        </template>
      </b-navbar>
    </div>
  </div>
</template>


<script lang="ts">
  import { Component,Vue } from 'vue-property-decorator'
  @Component
  export default class App extends Vue {
    username = localStorage.getItem('username'); 

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
