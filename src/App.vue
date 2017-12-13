<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <v-layout column align-center>
            <img src="/public/v.png" alt="Vuetify.js" class="mb-5" />
            <blockquote>
              &#8220;First, solve the problem. Then, write the code BA.&#8221;
              <footer>
                <small>
                  <em>&mdash;John Johnson</em>
                </small>
              </footer>
            </blockquote>
          </v-layout>
        </v-slide-y-transition>
        <home></home>
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  import Home from './components/Home'


  export default {
    data () {
      return {

        fixed: true,
        title: 'SearchTool App'
      }
    },
    components: {
      Home
    }
  }
</script>
