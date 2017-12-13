<template>
  <v-list two-line>
    <template v-for="item,i in suggestionArray">
      <v-list-tile v-bind:key="i" @click="selectItem(item)">
        <!-- City -->
        <v-list-tile-content v-if="type === 'city'">
          <v-list-tile-title v-html="item.city.S"></v-list-tile-title>
          <v-list-tile-sub-title v-html="item.canonicalName.S"></v-list-tile-sub-title>
        </v-list-tile-content>
        <!-- Country -->
        <v-list-tile-content v-else-if="type === 'country'">
          <v-list-tile-title v-html="item.country.S"></v-list-tile-title>
          <v-list-tile-sub-title v-html="item.canonicalCountry.S"></v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </template>
  </v-list>
</template>

<script>
  export default {
    props: ['type','suggestionArray'],
    methods: {
      selectItem(item) {
        console.log('Selected', item)
        this.$emit('selected',{type: this.type,item})
      }
    }
  }
</script>