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
    name: 'edge-element',
    props: {
      _style:Object,
    },
    computed: {},
    data: function () {
      return {}
    },
    watch: {},
    mounted: function () {
      var me = this

    },
    methods: {
      generateShape: function () {
        var me = this;
        if (me.vertices && me.vertices.length > 1) {
          return new OG.shape.EdgeShape(me.vertices[0], me.vertices[me.vertices.length - 1], me.label, me.fromLabel, me.toLabel);
        } else {
          return new OG.shape.EdgeShape(null, null, me.label, me.fromLabel, me.toLabel);
        }
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

