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
                        'component': 'persistent-volume',
                        'label': 'PersistentVolume',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                    },
                    {
                        'component': 'persistent-volume-claim',
                        'label': 'PersistentVolumeClaim',
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
                    {
                        'component': 'job',
                        'label': 'Job',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/job-palette.svg`
                    },
                    {
                        'component': 'cronjob',
                        'label': 'CronJob',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cronjob-palette.svg`
                    },
                    {
                        'component': 'statefulSet',
                        'label': 'StatefulSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sts-palette.svg`
                    },
                    {
                        'component': 'daemonSet',
                        'label': 'DaemonSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ds-palette.svg`
                    },
                    {
                        'component': 'configMap',
                        'label': 'ConfigMap',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cm-palette.svg`
                    },
                    {
                        'component': 'secret',
                        'label': 'Secret',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/secret-palette.svg`
                    },
                    {
                        'component': 'role',
                        'label': 'Role',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/role-palette.svg`
                    },
                    {
                        'component': 'role-binding',
                        'label': 'RoleBinding',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rb-palette.svg`
                    },
                    {
                        'component': 'cluster-role',
                        'label': 'ClusterRole',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/c-role-palette.svg`
                    },
                    {
                        'component': 'cluster-role-binding',
                        'label': 'ClusterRoleBinding',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/crb-palette.svg`
                    },
                    {
                        'component': 'storage-class',
                        'label': 'StorageClass',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sc-palette.svg`
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


