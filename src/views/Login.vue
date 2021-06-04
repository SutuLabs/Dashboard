<template>
  <div class="login">
    <div class="block">
      <div class="column is-half is-offset-one-quarter box p-6">
        <div class="block">
          <b-field label="用户名"
                   horizontal>
            <b-input v-model="username"></b-input>
          </b-field>
          <b-field label="密码"
                   horizontal>
            <b-input v-model="password"
                     type="password"
                     password-reveal></b-input>
          </b-field>
        </div>
        <div class="buttons is-centered">
          <b-button @click="login()"
                    type="is-info">Save</b-button>
        </div>
        <b-notification auto-close
                        type="is-danger"
                        v-model="errorinput"
                        aria-close-label="Close notification">
          输入用户名或密码有误，请重新输入！
        </b-notification>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import getInfo from '@/services/getInfo'
  @Component
  export default class Home extends Vue {
    username = ''
    password = ''
    errorinput = false
    login() {
      if (this.username != '' && this.password != '') {
        localStorage.setItem('username', this.username)
        localStorage.setItem('password', this.password)
        getInfo
          .getInfo('servers')
          .then((response) => response.json())
          .then(() => {
            this.$router.push('/')
            this.$router.go(0) //Vue无法响应localStorage改变，刷新使页面响应更新
          })
          .catch(() => {
            localStorage.removeItem('username')
            localStorage.removeItem('password')
            this.errorinput = true
          })
      } else {
        this.errorinput = true
      }
    }
  }
</script>