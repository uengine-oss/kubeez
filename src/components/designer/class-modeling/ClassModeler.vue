<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <uml-designer
            :elementTypes="elementTypes"
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="class-relation"
            ref="designer"
    >
    </uml-designer>

</template>

<script>
    export default {
        name: 'class-designer',
        props: {
        },
        data() {
            return {
                value: {},
                elementTypes: [
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'uml-class-definition',
                        'label': 'Class',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/event.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'uml-class-definition',
                        'label': 'relation',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/event.png`
                    }
                ],
            }
        },

        created: function () {

        },
        mounted: function () {

        },
        methods: {

        }
    }
</script>


