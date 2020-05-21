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
    name: 'svg-element',
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
        //// console.log($(me.$el).find('svg').html());
        //var svg = $(me.$el).find('svg').html();
        var svg =$('<div>').append($(me.$el).find('svg').clone()).html();
        return new OG.shape.SvgShape(svg, me.label);
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

