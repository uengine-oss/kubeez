<template>
    <v-layout wrap>
        <v-navigation-drawer style="z-index:999;" class="hide-scroll" absolute permanent right v-bind:style="{width: 800}">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    
                    <slot name="headline"></slot>

                    <v-tooltip left>
                        <template v-slot:activator="{ on }">
                            <v-btn icon @click.native="closePanel()">
                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                            </v-btn>
                            <v-btn icon v-on="on" @click="openDoc()">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </template>
                        <slot name="descriptionText"></slot>
                    </v-tooltip>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-card-text v-if="isValidationLists">
                    <slot name="md-title">
                        <div style="margin-left: -17px;">
                            <v-list-group
                                    :value="openValidationLists"
                                    @click.native="openValidationLists = !openValidationLists"
                            >
                                <template v-slot:activator>
                                    <v-icon style="margin-right: 2%;" :color="validationLevelIcon[validationLists[0].level].color">{{ validationLevelIcon[validationLists[0].level].icon }}</v-icon>
                                    <v-list-item-title>{{representativeValidation}}</v-list-item-title>
                                </template>

                                <!-- <v-list-item
                                        v-for="item in validationLists"
                                        :key="item.code"
                                        style="margin-left: 5%;"
                                >
                                    <v-icon style="margin-right: 2%;" :color="validationLevelIcon[item.level].color">{{validationLevelIcon[item.level].icon}}</v-icon>
                                    <v-list-item-title>{{item.msg}}</v-list-item-title>
                                </v-list-item> -->
                            </v-list-group>
                        </div>
                    </slot>
                </v-card-text>
                <slot name="edit-layout">
                    <v-layout wrap>
                        <v-flex shrink style="width: 230px;">
                            <v-card flat>
                                <v-card-text>
                                    <v-text-field
                                            label="Name"
                                            v-model="value.object.metadata.name"
                                            autofocus
                                            :disabled="readOnly"
                                    ></v-text-field>

                                    <slot name="edit-property"></slot>
                                    
                                    <kube-attr-field 
                                            v-model="value" 
                                            :readOnly="readOnly"
                                    ></kube-attr-field>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                        <v-flex>
                            <kube-yaml-editor
                                    v-model="value.object"
                                    :readOnly="readOnly"
                            ></kube-yaml-editor>
                        </v-flex>
                    </v-layout>
                </slot>
            </v-list>
            
        </v-navigation-drawer>
    </v-layout>
</template>

<script>

    export default {
        name: 'kubernetes-common-panel',
        props: {
            readOnly: Boolean,
            value: Object,
            img: String,
            validationLists:{
                type: Array,
                default: function () {
                    return []
                }
            },
        },
        computed: {
            descriptionText() {
                return '';
            },
            isValidationLists(){
                if(this.validationLists.length == 0 ){
                    return false
                }
                return  true
            },
            representativeValidation(){
                if(this.isValidationLists){
                    if(this.validationLists.length > 1){
                        return `${this.validationLists[0].msg} (+ ${this.validationLists.length - 1} Others)`
                    }
                    return `${this.validationLists[0].msg}`
                }
                return null
            },
        },
        data: function () {
            return {
                openValidationLists:false,
                validationLevelIcon:
                    {
                      'error' : {icon: 'mdi-close-circle-outline', color:'#E53935'},
                      'warning' : {icon: 'mdi-alert-outline', color:'#FFA726'},
                      'info' : {icon: 'mdi-information-outline', color:'#29B6F6'},
                    },
            }
        },
        methods: {
            closePanel() {
                this.$emit('close')
            },
            openDoc(desDoc) {
                this.$emit('openDesDoc', desDoc)
            },
        }
    }
</script>


