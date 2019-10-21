<template>
  <v-app>
    <v-content>
      <Main/>
    </v-content>
  </v-app>
</template>

<script>
import Main from './pages/Main';

export default {
  name: 'App',
  components: {
    Main,
  },
  data: () => ({
    //
  }),
};
</script>
