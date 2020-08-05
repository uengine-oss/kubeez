<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right>
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-title class="headline">{{ titleName }}</v-list-item-title>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout wrap>
                    <v-card-text>
                        <v-text-field
                            label="Service Path"
                            v-model="path"
                        ></v-text-field>
                    </v-card-text>
                </v-layout>
            </v-list>
        </v-navigation-drawer>
    </v-layout>
</template>


<script>

    export default {
        name: 'relation-panel',
        props: {
            value: Object,
            titleName: String,
        },
        computed: {
            path: {
                get() {
                    return this.value.path
                },
                set(val) {
                    this.value.path = val
                    var obj = {
                        "path": val
                    }
                    this.updateSourceElement('updatePath', obj)
                }
            },
        },
        data() {
            return {}
        },
        watch: {
        },
        beforeDestroy() {
            var obj = {
                "path": this.path
            }
            this.updateSourceElement('updatePath', obj)
        },
        methods: {
            updateSourceElement(state, value) {
                var me = this
                var obj = {
                    state: state,
                    value: value
                }
                obj.value.targetElement = me.value.targetElement
                me.$EventBus.$emit(`${me.value.sourceElement.elementView.id}`, obj)
            }
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
