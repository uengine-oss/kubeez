<template>
    <v-dialog v-if="condition" v-model="showDialog" max-width="370" @click.once="close()" persistent>
            <v-card>
                <v-card-title class="headline">{{condition.title}}</v-card-title>
                <v-card-text>
                    <div v-if="condition.action == 'fork' && condition.isForkModel"
                         style="font-size: 15px;">
                        <span class="mdi mdi-alert-outline" style="color: #FFA726; font-weight: 700; font-size:20px;"></span> You've already FORKED this model.<br>
                        Click the arrow to access the model
                        <v-btn v-if="condition.action == 'fork' && condition.isForkModel"
                               color="primary"
                               text small
                               @click="changedModel()">
                            <v-icon>
                                mdi-arrow-right-bold-circle-outline
                            </v-icon>
                        </v-btn>
                    </div>
                    <br>
                    <v-text-field
                            v-if="condition.action != 'backup'"
                            v-model="condition.projectId"
                            label="* Project ID(Unique ID)"
                            style="font-weight: 900;"
                            :error-messages="condition.error && condition.error['projectId']"
                    ></v-text-field>
                    <v-text-field
                            v-if="condition.action == 'fork' || condition.type == 'project'"
                            :disabled="condition.type == 'project' ? false : true"
                            v-model="condition.projectName"
                            :label="condition.type == 'project' ? 'Project Name' : 'Project Name(Origin)'"
                    ></v-text-field>
                    <v-text-field
                            v-if="condition.action == 'fork'"
                            v-model="condition.editProjectName"
                            label="* Project Name(Edit)"
                    ></v-text-field>
                    <v-text-field
                            v-if="condition.action != 'fork' && condition.type != 'project'"
                            v-model="condition.version"
                            label="Version Name"
                            :style="condition.action == 'save' ? '' :'margin-top: -20px; font-weight: 900;'"
                            :error-messages="condition.error && condition.error['version']"
                    ></v-text-field>


                    <v-checkbox
                            v-if="condition.isReplay"
                            v-model="condition.usedSCM"
                            dense
                            style="margin-top: -10px;"
                    >
                        <template v-slot:label>
                            Attach SCM version
                        </template>
                    </v-checkbox>
                    <v-text-field
                            v-if="condition.usedSCM"
                            v-model="condition.scmUrl"
                            dense
                            label="Url"
                            style="width: 97%; margin-left: 3%;"
                            :error-messages="condition.error && condition.error['scmUrl']"
                    ></v-text-field>
                    <v-text-field
                            v-if="condition.usedSCM"
                            v-model="condition.scmVersion"
                            dense
                            label="Tag Name"
                            style="width: 97%; margin-left: 3%; margin-top: 12px;"
                    ></v-text-field>

                    <v-textarea
                            outline
                            v-model="condition.comment"
                            name="input-7-4"
                            label="Comment"
                            :counter="255"
                            rows="4"
                    ></v-textarea>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="close()">close</v-btn>
                    <v-progress-circular
                            v-if="condition.loading"
                            indeterminate
                            color="primary"
                    ></v-progress-circular>
                    <v-btn  v-else color="primary" text @click="submit()">{{submitText}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</template>

<script>
    export default {
        name: 'model-storage-dialog',
        components: {},
        props: {
            condition: {
                type: Object,
                default: function () {
                    return null
                }
            },
            showDialog: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
            isClazzModeling:{
                type: Boolean,
                default: function () {
                    return false
                }
            },

        },
        created() {
        },
        data() {
            return {
                key: 0,
            }
        },
        watch: {
            "condition.loading":{
                deep: true,
                handler: function (newVal, oldVal) {
                    this.key ++;
                }
            },
        },
        computed: {
            submitText() {
                if (this.condition.action == 'fork') {
                    return 'FORK'
                }

                return this.condition.isReplay ? 'CREATE' : 'SAVE'
            }
        },
        methods: {
            async submit() {
                this.condition.loading = true
                 if (this.condition.action == 'save') {
                     this.$emit('save', this.condition.type)
                } else if (this.condition.action == 'fork') {
                    localStorage.setItem("forkedModelInfo", JSON.stringify(this.condition.forkedModelInfo))
                    this.$emit('fork')
                } else if (this.condition.action == 'backup') {
                    this.$emit('backup')
                }
            },
            close() {
                this.$emit('close')
            },
            changedModel(){
                var me = this
                this.$emit('close')

                if(me.isClazzModeling){
                    me.$emit('updateClassModelingId',me.condition.isForkModel)
                } else{
                    me.$router.push({path: `/storming/${me.condition.isForkModel}`});
                    setTimeout(function () {
                        window.location.reload(true)
                    }, 100)
                }
            },

        }
        ,
    }
</script>

<style>
    .v-messages__message{
        white-space: pre-line;
    }

</style>