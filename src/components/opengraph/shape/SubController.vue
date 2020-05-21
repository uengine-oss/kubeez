<template>
  <div>
    <slot>
    </slot>
  </div>
</template>

<script>
  export default {
    name: 'sub-controller',
    props: {
      cloneable: {
        default: function () {
          return false;
        },
        type: Boolean
      },
      image: String,
    },
    //&& me.elementRole != 'sub-controller'
    computed: {
      opengraphRole: function () {
        return 'sub-controller';
      }
    },
    data: function () {
      return {
        id: this.uuid(),
        element: null,
        cloneComponent: null
      }
    },
    watch: {
      '$props': {
        handler: function () {
          this.registToElement();
        },
        deep: true
      }
    },
    mounted: function () {
      this.registToElement();
    },
    /**
     * 부모 컴포넌트에서 서브컨트롤러를 삭제한다.
     */
    destroyed: function () {
      var me = this;
      if (me.element) {
        me.element.removeSubContollers(me.id);
      }
    },
    methods: {
      /**
       * 부모 컴포넌트에 서브컨트롤러를 등록한다.
       */
      registToElement: function () {
        var me = this;
        if (!me.element) {
          me.element = me.getClosestElement();
        }
        if (!me.element) {
          throw new Error('Not found parent element for geomery.');
        }
        me.element.addSubContollers(this, me.id);
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
      addCloneElement: function (component) {
        this.cloneComponent = component;
      },
      removeControllerElement: function () {
        this.cloneComponent = null;
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

