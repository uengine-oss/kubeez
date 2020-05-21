<template>

</template>

<script>
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-beziercurve',
    props: {
      controlPoints: {
        default: function () {
          return [[200, 100], [100, 300], [-100, -100], [-200, 100]];
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
        this.geom = new OG.geometry.BezierCurve(this.controlPoints);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

