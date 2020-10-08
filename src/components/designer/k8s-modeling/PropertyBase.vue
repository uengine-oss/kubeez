<template>
</template>

<script>
    export default {
        name: "property-base",
        computed: {
            propVal: {
                get() {
                    return null
                },
                set(val) {
                    var me = this;
                    me.findAttribute(val)
                }
            }
        },
        data() {
            return {
                isPropBox: false,
                propList: [],
            }
        },
        mounted() {
            var me = this;
            var keyArr = Object.keys(me.value.advancedAttributePaths);
            var valArr = Object.values(me.value.advancedAttributePaths);
            me.getPropList(keyArr, valArr);
        },
        methods: {
            getPropList(keyArr, valArr) {
                var me = this;
                valArr.forEach(function (val) {
                    if(typeof val == "object") {
                        if(Array.isArray(val)) {
                            return me.getPropList(keyArr, val);
                        } else {
                            var arr = Object.keys(val);
                            arr.forEach(function (item) {
                                keyArr = keyArr.concat(item)
                            })
                            return me.getPropList(keyArr, Object.values(val));
                        }
                    } else {
                        me.propList = keyArr;
                        return;
                    }
                })
            },
            findAttribute(val) {
                var me = this;
                var attrList = Object.entries(me.value.advancedAttributePaths);
                attrList.forEach(([key, value]) => {
                    if(key == val) {
                        _.set(me.value.object, key, value);
                        console.log(me.value.object);
                    }
                });
            }
        }
    }
</script>

<style>

</style>