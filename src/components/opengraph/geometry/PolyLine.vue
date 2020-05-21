<template>

</template>

<script>
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-polyline',
    props: {
      vertices: {
        default: function () {
          return [[20, 5], [30, 15], [40, 25], [50, 15]]
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
        this.geom = new OG.geometry.PolyLine(this.vertices);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

