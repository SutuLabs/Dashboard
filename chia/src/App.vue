<template>
  <div id="app">
    <!--<div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/explorer">About</router-link>
  </div>-->
    <div class="is-hidden-mobile">
      <b-navbar>
        <template #brand>
          <b-navbar-item>
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
          <b-navbar-item tag="router-link" :to="{path:'/about'}">
            关于我们
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
    <router-view />
  </div>
</template>

<style lang="scss">
  @import '../node_modules/buefy/dist/buefy.css';
  @import 'bulmaswatch/darkly/_variables.scss';
  @import "bulma/bulma.sass";
  @import 'bulmaswatch/darkly/_overrides.scss';

</style>
