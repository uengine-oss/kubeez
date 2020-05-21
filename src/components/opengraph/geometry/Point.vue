<template>

</template>

<script>
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-point',
    props: {
      coordinate: {
        default: function () {
          return [20, 5]
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
        this.geom = new OG.geometry.Point(this.coordinate);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

