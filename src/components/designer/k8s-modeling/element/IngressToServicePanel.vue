<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right>
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-tabs v-model="activeTab">
                    <v-tab
                        v-for="(tab, idx) in tabItems"
                        :key="idx"
                        @click="changeType(idx)">
                        <v-list-item-title>{{ tab }}</v-list-item-title>
                    </v-tab>
                </v-tabs>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-layout v-if="activeTab == 0" wrap>
                    <v-card-text>
                        <v-text-field
                            label="Service Path"
                            hint="ex) /foo"
                            v-model="path"
                        ></v-text-field>
                    </v-card-text>
                </v-layout>
                <v-layout v-else wrap>
                    <v-card-text>
                        <v-text-field
                            label="Host"
                            hint="ex) foo.bar.com"
                            v-model="host"
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
                    var me = this
                    me.value.path = val
                    me.value.targetElement.path = val
                    me.updateSourceElement()
                }
            },
            host: {
                get() {
                    return this.value.host
                },
                set(val) {
                    var me = this
                    me.value.host = val
                    me.value.targetElement.host = val
                    me.updateSourceElement()
                }
            },
        },
        data() {
            return {
                activeTab: 0,
                tabItems: [ "Path", "Virtual Host" ]
            }
        },
        watch: {
        },
        mounted() {
            var me = this
            if(me.value.routeType == 'path') {
                me.activeTab = 0
            } else if(me.value.routeType == 'host') {
                me.activeTab = 1
            }
        },
        beforeDestroy() {
            var me = this
            var obj = {}
            me.updateSourceElement()
        },
        methods: {
            updateSourceElement() {
                var me = this
                var obj = {}
                obj.state = 'updateType'
                obj.targetElement = me.value.targetElement
                me.$EventBus.$emit(`${me.value.sourceElement.elementView.id}`, obj)
            },
            changeType(val) {
                var me = this
                me.activeTab = val
                if(val == 0) {
                    me.value.routeType = "path"
                } else if(val == 1) {
                    me.value.routeType = "host"
                }
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
