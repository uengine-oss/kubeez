<template>

</template>

<script>
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-line',
    props: {
      from: {
        default: function () {
          return [20, 5];
        },
        type: Array
      },
      to: {
        default: function () {
          return [30, 15];
        },
        type: Array
      },
      _style: {
        default: function () {
          return {};
        },
        type: Object
      }
    },
    methods: {
      createGeometry: function () {
        this.geom = new OG.geometry.Line(this.from, this.to);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

