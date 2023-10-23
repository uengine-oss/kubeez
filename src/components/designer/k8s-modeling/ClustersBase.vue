<template>

</template>

<script>

    export default {
        name: 'clusters-base',
        props: {
            value: Object,
        },
        data() {
            return {
                clustersList: [],
                tokenDialog: false,
                clusterName: '',
                clusterAddress: '',
                kuberToken: '',
                connectable: false,
                waitConnetionTest: false,
                namespace: ""

            }
        },
        created() {
        },
        mounted() {
            var me = this;
            me.getData();
        },
        watch: {},
        methods: {
            getTenantId() {
                var urlStr = window.location;
                var url = new URL(urlStr);

                var tenantId = url.hostname;
                if (tenantId.includes(".")) {
                    tenantId = tenantId.substring(tenantId.indexOf(".") + 1);
                }

                return tenantId;
            },
            getProtocol() {
                return window.location.protocol;
            },
            getData() {
                var me = this;
            },
            save() {
                var me = this;
            },
            deleteCluster(val) {
                var me = this;
            },
            selectCluster(val) {
                var me = this;
                localStorage.setItem('clusterName', val.name);
                localStorage.setItem('clusterAddress', val.apiServer);
                localStorage.setItem('kuberToken', val.token);
                me.$emit('input', val);
                me.$emit('close');
            },
            closeToken() {
                var me = this;
                me.clusterName = '';
                me.clusterAddress = '';
                me.kuberToken = '';
                me.tokenDialog = false;
            },
        },
    }
</script>

<style>

</style>