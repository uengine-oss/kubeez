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
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-128.png`
                    },
                    {
                        'component': 'service',
                        'label': 'Service',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-128.png`
                    },
                    {
                        'component': 'ingress',
                        'label': 'Ingress',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ing-128.png`
                    },
                    {
                        'component': 'persistence-volume',
                        'label': 'Persistence Volume',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-128.png`
                    },
                    {
                        'component': 'persistence-volume-claim',
                        'label': 'Persistence Volume Claim',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pvc-128.png`
                    },
                    {
                        'component': 'pod',
                        'label': 'Pod',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pod-128.png`
                    },
                    {
                        'component': 'replicaSet',
                        'label': 'ReplicaSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs-128.png`
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


