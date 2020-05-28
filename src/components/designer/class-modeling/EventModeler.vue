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
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`
                    },
                    {
                        'component': 'service',
                        'label': 'Service',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-palette.svg`
                    },
                    {
                        'component': 'ingress',
                        'label': 'Ingress',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ing-palette.svg`
                    },
                    {
                        'component': 'persistence-volume',
                        'label': 'Persistence Volume',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                    },
                    {
                        'component': 'persistence-volume-claim',
                        'label': 'Persistence Volume Claim',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pvc-palette.svg`
                    },
                    {
                        'component': 'pod',
                        'label': 'Pod',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pod-palette.svg`
                    },
                    {
                        'component': 'replicaSet',
                        'label': 'ReplicaSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs-palette.svg`
                    },
                    {
                        'component': 'namespace',
                        'label': 'Namespace',
                        'width': '400',
                        'height': '400',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ns-palette.svg`
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


