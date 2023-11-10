<template>
  <div>
    <slot>
    </slot>
  </div>
</template>

<script>
  export default {
    name: 'sub-elements',
    props: {},
    computed: {
      opengraphRole: function () {
        return 'sub-elements';
      },


    },
    created(){

    },
    data: function () {
      return {}
    },
    watch: {

    },
    mounted: function () {


    },
    methods: {
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

