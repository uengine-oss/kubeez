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
        name: 'geometry-element',
        props: {},
        computed: {},
        data: function () {
            return {}
        },
        mounted: function () {

        },
        methods: {
            generateShape: function () {
                var me = this;
                var shape;
                if ($.isEmptyObject(me.geometrys)) {
                    return null;
                } else {
                    shape = new OG.shape.GeomShape();
                    let keys = Object.keys(me.geometrys);
                    shape.label = me.label;
                    // // console.log("shape",shape);
                    // // console.log("me",me);
                    shape.SHAPE_ID = me.shapdId;

                    //싱글 지오메트리.
                    if (keys.length < 2) {
                        shape.createShape = function () {
                            if (this.geom) {
                                return this.geom;
                            }
                            this.geom = me.geometrys[keys[0]].createGeometry();
                            return this.geom;
                        }
                    } else {
                        shape.createShape = function () {
                            if (this.geom) {
                                return this.geom;
                            }
                            var geomCollection = [];
                            for (var key in me.geometrys) {
                                geomCollection.push(me.geometrys[key].createGeometry());
                            }

                            this.geom = new OG.geometry.GeometryCollection(geomCollection);
                            return this.geom;
                        }

                    }
                }
                return shape;
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
