<template>

</template>

<script>
  //center, radiusX, radiusY, angle
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-ellipse',
    props: {
      center: {
        default: function () {
          return [10, 10];
        },
        type: Array
      },
      radiusX: {
        default: function () {
          return 10;
        },
        type: Number
      },
      radiusY: {
        default: function () {
          return 5;
        },
        type: Number
      },
      angle: {
        default: function () {
          return 0;
        },
        type: Number
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
        this.geom = new OG.geometry.Ellipse(this.center, this.radiusX, this.radiusY, this.angle);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

