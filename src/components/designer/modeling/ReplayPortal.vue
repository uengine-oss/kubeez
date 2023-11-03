<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <v-layout :style="layoutStyle">
        <v-runtime-template v-if="modelingHtml" :template="'<div>' + modelingHtml + '</div>'"/>

        <v-progress-circular
                v-else
                :size="50"
                color="primary"
                indeterminate
        ></v-progress-circular>

    </v-layout>
</template>

<script>
    import VRuntimeTemplate from "v-runtime-template";
    import EventStormingModelReplay from "../es-modeling/EventStormingModelReplay";
    // import StorageBase from "./StorageBase";
    import StorageBase from "./ModelStorageBase";

    var jp = require('jsonpath');

    export default {
        name: 'replay-portal',
        props: {},
        mixins: [StorageBase],
        components: {VRuntimeTemplate},
        data() {
            return {
                modelingHtml: null,
                projectName: '',
                projectId: null,
                type:'es',
                componentKey: 0,
            }
        },
        created: async function () {
            var me = this
            var projectId = me.$route.params.projectId
            me.type = await me.getString(`db://definitions/${projectId}/information/type`)
            me.projectName = await me.getString(`db://definitions/${projectId}/information/projectName`)

            Vue.component('event-storming-model-replay', EventStormingModelReplay)

            if (me.type == 'es') {
                me.modelingHtml = '<event-storming-model-replay :projectName="projectName" :key="componentKey" :type="type" @forceUpdateKey="forceRerender()"> </event-storming-model-replay>'
            } else {
                alert('현재 모델링은 준비중 입니다.')
            }


        },
        computed: {
            layoutStyle(){
              if(this.modelingHtml){
                  return '';
              }
              return 'width: 100%; height: 100%; place-items: center; place-content: center;';
            },
        },
        watch: {},
        methods: {
            forceRerender(){
                this.componentKey += 1;
            },
        }
    }
</script>


<style scoped lang="css" rel="stylesheet/css">


    .canvas-panel.small {
        left: 0;
        right: 0;
        width: 83%;
        height: 100%;
        position: absolute;
        overflow: hidden;

        /*transform: scale(0.5) translate(-50%, -50%);*/
    }

</style>

