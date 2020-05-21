<template>

</template>

<script>
  //center, radius
  import Geometry from './Geometry'
  export default {
    mixins: [Geometry],
    name: 'geometry-circle',
    props: {
      center: {
        default: function () {
          return [10, 10];
        },
        type: Array
      },
      radius: {
        default: function () {
          return 5;
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
        this.geom = new OG.geometry.Circle(this.center, this.radius);
        this.geom.style = new OG.geometry.Style(JSON.parse(JSON.stringify(this._style)));
        return this.geom;
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

