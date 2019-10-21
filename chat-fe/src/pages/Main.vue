<template>
  <v-app id="inspire">
    <v-content>
        <chat-area v-if="!showLogin" :user="user" />
        <login v-if="showLogin" @isLoggedIn="login($event)" />
    </v-content>
  </v-app>
</template>

<script>
import LoginVue from '../components/Login.vue';
import ChatVue from '../components/Chat.vue';
  export default {
    data() {
      return {
        showLogin: true,
        user: ''
      }
    },
    components: {
      'login': LoginVue,
      'chat-area': ChatVue
    },
    methods: {
      login(user) {
        this.showLogin = false;
        this.user = user;
      }
    }
  }
</script>