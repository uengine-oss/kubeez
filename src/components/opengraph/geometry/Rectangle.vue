<template>

</template>

<script>
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-rect',
    props: {
      upperLeft: {
        default: function () {
          return [0, 0];
        },
        type: Array
      },
      width: {
        default: function () {
          return 100;
        },
        type: Number
      },
      height: {
        default: function () {
          return 100;
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
        this.geom = new OG.geometry.Rectangle(this.upperLeft, this.width, this.height);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

