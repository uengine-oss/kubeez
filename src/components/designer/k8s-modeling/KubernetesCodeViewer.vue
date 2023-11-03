<template>
    <div></div>
</template>
<script>
    import CodeViewer from "../CodeViewer";

    export default {
        name:'kubernetes-code-viewer',
        mixins: [CodeViewer],
        props: {
            value: Array
        },
        data() {
            return {}
        },
        computed: {},
        watch: {},
        methods: {}
    }
</script>
