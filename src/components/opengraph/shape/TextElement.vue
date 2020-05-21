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
    name: 'text-element',
    props: {},
    computed: {},
    data: function () {
      return {}
    },
    watch: {
        text: function (newVal) {
            var me = this;
            // // console.log('newVal: ', newVal)
            this.props.text = newVal
            // // console.log(this.props.text)

        }
    },
    mounted: function () {

    },
    methods: {
      generateShape: function () {
        var me = this;
        return new OG.shape.TextShape(me.text);
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

