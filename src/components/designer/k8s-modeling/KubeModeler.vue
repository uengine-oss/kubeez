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
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`,
                    },
                    {
                        'component': 'namespace',
                        'label': 'Namespace',
                        'width': '400',
                        'height': '400',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ns-palette.svg`,
                        description: 'Kubernetes supports multiple virtual clusters backed by the same physical cluster. These virtual clusters are called namespaces.'
                    },
                    {
                        'component': 'deployment',
                        'label': 'Deployment',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`,
                        description: 'A Deployment provides declarative updates for Pods ReplicaSets. You describe a desired state in a Deployment, and the Deployment Controller changes the actual state to the desired state at a controlled rate. You can define Deployments to create new ReplicaSets, or to remove existing Deployments and adopt all their resources with new Deployments.'
                    },
                    {
                        'component': 'replicaSet',
                        'label': 'ReplicaSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs-palette.svg`,
                        description: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time. As such, it is often used to guarantee the availability of a specified number of identical Pods."

                    },
                    {
                        'component': 'pod',
                        'label': 'Pod',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pod-palette.svg`,
                        description: "Pods are the smallest deployable units of computing that you can create and manage in Kubernetes."
                    },
                    {
                        'component': 'statefulSet',
                        'label': 'StatefulSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sts-palette.svg`,
                        description: "StatefulSet is the workload API object used to manage stateful applications. Manages the deployment and scaling of a set of Pods, and provides guarantees about the ordering and uniqueness of these Pods."
                    },
                    {
                        'component': 'daemonSet',
                        'label': 'DaemonSet',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ds-palette.svg`,
                        description: "A DaemonSet ensures that all (or some) Nodes run a copy of a Pod. As nodes are added to the cluster, Pods are added to them. As nodes are removed from the cluster, those Pods are garbage collected. Deleting a DaemonSet will clean up the Pods it created."
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
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-palette.svg`,
                        desc: "An abstract way to expose an application running on a set of Pods as a network service."
                    },
                    {
                        'component': 'ingress',
                        'label': 'Ingress',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ing-palette.svg`,
                        desc: "An API object that manages external access to the services in a cluster, typically HTTP. Ingress may provide load balancing, SSL termination and name-based virtual hosting."
                    },
                ],
                [
                    {
                        'component': 'Persistence',
                        'label': 'Persistence',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                    },
                    {
                        'component': 'persistentVolume',
                        'label': 'PersistentVolume',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                    },
                    {
                        'component': 'persistentVolumeClaim',
                        'label': 'PersistentVolumeClaim',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pvc-palette.svg`
                    },
                    {
                        'component': 'storageClass',
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
                        'component': 'roleBinding',
                        'label': 'RoleBinding',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rb-palette.svg`
                    },
                    {
                        'component': 'clusterRole',
                        'label': 'ClusterRole',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/c-role-palette.svg`
                    },
                    {
                        'component': 'clusterRoleBinding',
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
                        'component': 'virtualService',
                        'label': 'VirtualService',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-vsvc.svg`
                    },
                    {
                        'component': 'destinationRule',
                        'label': 'DestinationRule',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`
                    },
                    {
                        'component': 'serviceEntry',
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
                        'component': 'quotaSpec',
                        'label': 'QuotaSpec',
                        'width': '100',
                        'height': '100',
                        'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                    },
                    {
                        'component': 'quotaSpecBinding',
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


