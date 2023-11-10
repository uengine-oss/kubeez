<template>

  <div>
    <class-designer v-if="value && value._type=='org.uengine.uml.ClassDiagram'" :value="value" :id="path"
                    :backend="backend"></class-designer>
    <process-designer v-if="value && value._type=='org.uengine.kernel.ProcessDefinition'" :value="value" :id="path"
                      :backend="backend"></process-designer>
  </div>

</template>
<script>
  export default {
    props: {
      backend: Object,
      path: String
    },
    data() {
      return {
        value: null
      }
    },
    watch: {
      path: function (val) {
        this.load();
      }
    },
    computed: {},
    mounted() {
      this.load();
    },
    methods: {
      load: function () {
        var me = this;

        //remove designer component, as setting value null.
        me.value = null;

        //after designer component removed, render new designer component.
        me.$nextTick(function () {
          var def = {};
          me.backend.$bind('definition/raw/' + me.path + '.json', def);
          def.$load().then(function (definition) {
            if (definition) {
              me.value = definition.definition;
            }
          });
        })
      }
    }
  }
</script>

