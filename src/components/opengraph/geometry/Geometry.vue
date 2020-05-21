<template>

</template>

<script>
  export default {
    name: 'geometry',
    props: {},
    computed: {},
    data: function () {
      return {
        props: JSON.parse(JSON.stringify(this.$props)),
        id: this.uuid(),
        element: null
      }
    },
    watch: {
      '$props': {
        handler: function (newVal, oldVal) {
          //// console.log('$props!!', this.element.id);
          this.props = JSON.parse(JSON.stringify(newVal))
        },
        deep: true
      },
      props: {
        handler: function (newVal, oldVal) {
          var needToWatch = false;
          for (var key in newVal) {
            //신규값과 이전값이 모두 null 이거나 undefined 일때는 반응하지 않는다.
            if (!newVal[key] && !oldVal[key]) {

            }
            else if (typeof newVal[key] == 'object') {
              if (!oldVal[key] || JSON.stringify(newVal[key]) != JSON.stringify(oldVal[key])) {
                //// console.log('geom property diff', key, newVal[key], oldVal[key]);
                needToWatch = true;
              }
            } else {
              if (newVal[key] != oldVal[key]) {
                //// console.log('geom property diff', key, newVal[key], oldVal[key]);
                needToWatch = true;
              }
            }
          }
          if (!needToWatch) {
            //// console.log('geom $props changed, but no properties changed.');
            return;
          }
          //// console.log('geom $props changed, registToElement.');
          this.registToElement();
        },
        deep: true
      }
    },
    mounted: function () {
      this.registToElement();
    },
    /**
     * 부모 컴포넌트에서 지오메트리를 삭제한다.
     */
    destroyed: function () {
      var me = this;
      if (me.element) {
        me.element.removeGeometry(me.id);
      }
    },
    methods: {
      /**
       * 부모 컴포넌트에 지오메트리를 등록한다.
       */
      registToElement: function () {
        var me = this;
        if (!me.element) {
          me.element = me.getClosestElement();
        }
        if (!me.element) {
          throw new Error('Not found parent element for geomery.');
        }
        me.element.addGeometry(this, me.id);
      },
      getClosestElement: function () {
        //// console.log(this.$parent);
        var parentElementComponent = null;
        var parent;
        var getParent = function (component) {
          parent = component.$parent;
          if (parent) {
            if (parent.opengraphRole == 'opengraph-element') {
              parentElementComponent = parent;
            } else {
              getParent(parent);
            }
          }
        }
        getParent(this);
        return parentElementComponent;
      },
      uuid: function () {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }
    }
  }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

