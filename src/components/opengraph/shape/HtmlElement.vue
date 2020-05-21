<template>
  <div>
    <slot>
    </slot>
  </div>
</template>

<script>
  import OpengraphElement from './OpengraphElement'
  export default {
    mixins: [OpengraphElement],
    name: 'html-element',
    props: {},
    computed: {},
    data: function () {
      return {}
    },
    watch: {},
    mounted: function () {

    },
    methods: {
      generateShape: function () {
        var me = this;
        return new OG.shape.HtmlShape(me.html, me.label);
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

