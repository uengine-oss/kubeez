<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <kube-modeling-designer
            :elementTypes="elementTypes"
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="relation-abstract"
            ref="kuberDesigner"
    >
    </kube-modeling-designer>
</template>

<script>
    export default {
        name: 'kube-designer',
        props: {},
        data() {
            return {
                value: {},
                url: '',
                elementTypes: [
                [
                    {
                        'component': 'Workload',
                        'label': 'Workload',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`
                    },
                    {
                        'component': 'namespace',
                        'label': 'Namespace',
                        'width': '400',
                        'height': '400',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ns-palette.svg`
                    },
                    {
                        'component': 'deployment',
                        'label': 'Deployment',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`
                    },
                    {
                        'component': 'replicaSet',
                        'label': 'ReplicaSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs-palette.svg`
                    },
                    {
                        'component': 'pod',
                        'label': 'Pod',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pod-palette.svg`
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
                ],
                [
                    {
                        'component': 'Routing',
                        'label': 'Routing',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-palette.svg`
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
                ],
                [
                    {
                        'component': 'Persistence',
                        'label': 'Persistence',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
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
                        'component': 'storage-class',
                        'label': 'StorageClass',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sc-palette.svg`
                    },
                ],
                [
                    {
                        'component': 'Job',
                        'label': 'Job',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/job-palette.svg`
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
                ],[
                    {
                        'component': 'Configuration',
                        'label': 'Configuration',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cm-palette.svg`
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
                ],[
                    {
                        'component': 'Role Based Access Control',
                        'label': 'Role',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/role-palette.svg`
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
                ],[
                    {
                        'component': 'Istio',
                        'label': 'Istio',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-gateway.svg`
                    },
                    {
                        'component': 'gateway',
                        'label': 'Gateway',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-gateway.svg`
                    },
                    {
                        'component': 'virtual-service',
                        'label': 'VirtualService',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-vsvc.svg`
                    },
                    {
                        'component': 'destination-rule',
                        'label': 'DestinationRule',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`
                    },
                    {
                        'component': 'service-entry',
                        'label': 'ServiceEntry',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-svcentry.svg`
                    },
                    {
                        'component': 'sidecar',
                        'label': 'Sidecar',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-sidecar.svg`
                    },
                    {
                        'component': 'quota',
                        'label': 'Quota',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                    {
                        'component': 'rule',
                        'label': 'Rule',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                    {
                        'component': 'quota-spec',
                        'label': 'QuotaSpec',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                    {
                        'component': 'quota-spec-binding',
                        'label': 'QuotaSpecBinding',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                    {
                        'component': 'memquota',
                        'label': 'MemQuota',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                ]
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


