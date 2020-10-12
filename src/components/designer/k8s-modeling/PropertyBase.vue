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
                    me.setAttribute(val);
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
            me.getPropList();
        },
        methods: {
            getPropList(keyArr, valArr) {
                var me = this;
                var keyArr = keyArr || Object.keys(me.value.advancedAttributePaths);
                var valArr = valArr || Object.values(me.value.advancedAttributePaths);
               
                valArr.forEach(function (val) {
                    if(typeof val == "object") {
                        var arr = Object.keys(val);
                        arr.forEach(function (item) {
                            keyArr = keyArr.concat(me.getPath(item, "", me.value.advancedAttributePaths));
                        })
                        return me.getPropList(keyArr, Object.values(val));
                    } else {
                        me.propList = keyArr;
                    }
                })
            },
            getPath(searchKey, parentKey, obj) {
                var me = this;
                var res = "";
                var parentKey = parentKey || "";

                for (var key in obj) {
                    if(key == searchKey) {
                        res = parentKey + key;
                    } else {
                        if(typeof obj[key] == "object") {
                            parentKey += key + '.';
                            return me.getPath(searchKey, parentKey, obj[key]);
                        }
                    }
                }
                return res;
            },
            setAttribute(val) {
                var me = this;
                var attrList = Object.entries(me.value.advancedAttributePaths);
                attrList.forEach(([key, value]) => {
                    if(key == val || val.includes(key)) {
                        _.set(me.value.object, key, value);
                    }
                });
            },
        }
    }
</script>

<style>

</style>