<template>
</template>

<script>
    export default {
        name: 'element-base',
        props: {
            value: Object,
        },
        created: function () {},
        data: function () {
            return {
                _id: null,
                selected: false,
                staySelected: false,
            }
        },
        computed: {
            style: {
                get: function () {
                    var style;
                    //스타일이 없다면 디폴트 스타일을 사용한다.
                    if (this.value) {
                        if (this.value.elementView)
                            style = this.value.elementView.style;
                        else
                            style = this.value.relationView.style;
                    }

                    if (style) {
                        var jsonStyle = JSON.parse(style);
                        if ($.isEmptyObject(jsonStyle)) {
                            return this.defaultStyle;
                        } else {
                            return jsonStyle;
                        }
                    } else {
                        return this.defaultStyle;
                    }
                },
                set: function (val) {
                    if (this.value) {
                        if (this.value.elementView)
                            this.value.elementView.style = JSON.stringify(val);
                        else
                            this.value.relationView.style = JSON.stringify(val);
                    }
                }
            },


        },
        beforeDestroy() {
            // if (this.value.elementView) {
            //     this.$EventBus.$off(`${this.value.elementView.id}`)
            // } else {
            //     this.$EventBus.$off(`${this.value.relationView.id}`)
            // }

        },
        methods: {
            refresh(){
                this.value.__ob__.dep.notify();
            },
            validate() { // validate
                console.log('root-validate')
            },
            deleteActivity() {
                var me = this
                me.$emit('update:value', null);
            },
            difference: _.debounce(
                function (object, base) {
                    function changes(object, base) {
                        return _.transform(object, function (result, value, key) {
                            if (!_.isEqual(value, base[key])) {
                                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                            }
                        });
                    }

                    return changes(object, base);
                }, 100
            ),
            // onLabelChanged: function (be, af) {
            //     console.log("onLabelChanged", be, af);
            // },
            onRotateShape: function (angle) {
                console.log('Element: onRotateShape')
            },
            connected: function () {
                // console.log(this.value)
            },
            onMoveShape: function () {
                // console.log('onMoveShape')
                var positionX = this.value.elementView.x / 1000 * this.canvas.sliderLocationScale;
                var positionY = this.value.elementView.y / 1000 * this.canvas.sliderLocationScale;
                $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                if (this.value.rotateStatus) {
                    // $(`#${this.value.elementView.id}`).css('transform', `rotate(0deg)`);
                    // this.value.rotateStatus = false
                    // this.$emit('update:rotateStatus', this.value)
                } else {
                    $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                    // $(`#${this.value.elementView.id}`).css('transform', `rotate(-30deg)`);
                    // this.value.rotateStatus = true
                    // this.$emit('update:rotateStatus', this.value)
                }
            },
            selectedActivity: function () {
                if (this.value) {
                    this.selected = true
                }
                console.log('root - selected')
            },
            deSelectedActivity: function () {
                var me = this

                if (me.value) {
                    me.selected = false
                }
                console.log('root - deselected')
            },


            /**
             * 자신에게 도형들이 그룹으로 들어왔을때의 이벤트
             * @param groupElement
             * @param elements
             */
            onAddToGroup: function (groupElement, elements, eventOffset) {
                var me = this
                // console.log('onAddToGroup', elements);
            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToGroup: function (groupElement, element, eventOffset) {

            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            
            

        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
