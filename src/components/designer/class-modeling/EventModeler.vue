<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <modeling-designer
            :elementTypes="elementTypes"
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="class-relation"
            ref="designer"
    >
    </modeling-designer>
</template>

<script>
    export default {
        name: 'event-designer',
        props: {

        },
        data() {
            return {
                value: {},
                url: '',
                elementTypes: [
                    {
                        'component': 'deployment',
                        'label': 'Deployment',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/command.png`
                    },
                    {
                        'component': 'service',
                        'label': 'Service',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/policy.png`
                    },
                    {
                        'component': 'ingress',
                        'label': 'Ingress',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`
                    },
                    {
                        'component': 'persistence-volume',
                        'label': 'Persistence Volume',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`
                    },
                    {
                        'component': 'persistence-volume-claim',
                        'label': 'Persistence Volume Claim',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`
                    },
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


