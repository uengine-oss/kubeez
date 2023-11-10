<template>
    <div>
        <slot>
        </slot>
    </div>
</template>

<script>
    import OpengraphElement from './OpengraphElement'

    export default {
        mixins: [OpengraphElement],
        name: 'image-element',
        props: {
            image: String
        },
        computed: {},
        data: function () {
            return {}
        },
        watch: {
            "image": function (newVal) {
                // console.log(newVal)
            }
        },
        mounted: function () {

        },
        methods: {
            generateShape: function () {
                var me = this;
                return new OG.shape.ImageShape(me.image, me.label);
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

