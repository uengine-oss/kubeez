<template>
    <v-card
            v-if="!set"
            outlined
            class="mx-auto"
            style="width: 400px; height: 300px; justify-content: center;"
    >
        <v-skeleton-loader
                ref="skeleton"
                type="card"
                class="mx-auto"
        >
        </v-skeleton-loader>
    </v-card>
    <v-card
            v-else
            outlined
            class="mx-auto"
            max-width="800"
            max-height="500"
    >
        <div :key="renderKey">
            <slot name="image">
                <v-img
                        @click.native="openProject()"
                        style="cursor:pointer;"
                        :src="copyInformation.img"
                        max-width="800"
                        max-height="300"
                >

                    <slot name="chips">
                        <v-row justify="end" style="margin-right: 1px; margin-top:0px;">
                            <v-chip
                                    v-if="copyInformation.isDeleteProject"
                                    class="ma-2"
                                    color="red"
                                    text-color="white"
                                    style="margin-right: 10px;"
                                    small
                            >
                                Deleted
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.isNewProject"
                                    class="ma-2"
                                    color="red"
                                    text-color="white"
                                    style="margin-right: 10px; width: auto; height: 20px; font-size: 10px; font-weight:bold; "
                                    small
                            >
                                NEW
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.chip"
                                    class="ma-2"
                                    :color="copyInformation.chip.color"
                                    text-color="white"
                                    small
                                    style="width: auto; height: 20px; font-size: 10px; font-weight:bold;"
                            >
                                {{copyInformation.chip.display}}
                            </v-chip>
                            <v-chip
                                    v-if="copyInformation.isShared"
                                    class="ma-2"
                                    color="orange"
                                    text-color="white"
                                    small
                            >
                                shared
                            </v-chip>
                        </v-row>
                    </slot>
                </v-img>
            </slot>
        </div>

        <v-list-item style="margin-bottom:10px;" three-line>
            <slot name="body">
                <v-list-item-content style="max-width:18%; margin-left: 1%; margin-right: 3%;">
                    <div style=" text-align: center;">
                        <div style="cursor:pointer;">
                            <v-avatar
                                    size="40"
                                    @click="openUserProfile()"
                            >
                                <div v-if="copyInformation.authorProfile" style="width: 100%;height: 100%;">
                                    <img
                                            :src="copyInformation.authorProfile"
                                    >
                                </div>
                                <div v-else>
                                    <v-icon x-large>mdi-account-circle</v-icon>
                                </div>
                            </v-avatar>
                        </div>
                        <div style="width: 100%; height: 100%; font-size:11px; margin-top:5px;">{{ copyInformation.hiddenEmail }}
                        </div>
                    </div>
                </v-list-item-content>
                <div v-bind:style="isDelete ? 'text-decoration-line: line-through;': ''">
                    <v-card-title style="margin:-10px 0 -10px; 0;">
                        <!--                        {{course}}-->
                        {{ copyInformation.projectName }}
                    </v-card-title>
                    <v-card-text style="color:rgba(0, 0, 0, 0.6)">
                        LastModified Date : {{ copyInformation.lastModifiedTimeStamp }}<br>
                        Created Date : {{copyInformation.createdTimeStamp }}<br>
                        Comment : {{copyInformation.comment}}<br>
                    </v-card-text>
                </div>
            </slot>
        </v-list-item>
        <v-card-actions>
            <slot name="action" :project="copyInformation">
                <div style="position: absolute; bottom:5px; right:5px;">
                    <v-btn
                            v-if="deletedAble"
                            :disabled="isDelete"
                            color="red"
                            text
                            @click.native="deleteProject()"
                    >
                        Delete
                    </v-btn>

                    <v-btn
                            text
                            :disabled="isDelete"
                            @click.native="openProject()"
                            style="color:#1E88E5; font-weight:700;"
                            >
                        {{enterText}}
                    </v-btn>
                </div>
            </slot>
        </v-card-actions>
    </v-card>
</template>

<script>
    import StorageBase from "../CommonStorageBase";
    
    export default {
        mixins: [StorageBase],
        name: "list-card",
        props: {
            information: {
                type: Object,
                default: function () {
                    return null;
                }
            },
        },
        data() {
            return {
                renderKey: 0,
                set: false,
                isDelete: false,
                copyInformation: null,
                projectPath: null,
                defaultImage: 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png',
            }
        },
        created() {
            this.setting();
        },
        computed: {
            deletedAble() {
                if (this.copyInformation) {
                    if (this.copyInformation.isLocalProject) {
                        return true;
                    }

                    if (this.copyInformation.authorId) {
                        if (this.copyInformation.authorId == localStorage.getItem('uid')) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                return false;
            },
            isMineProject() {
                if (this.copyInformation.authorId == localStorage.getItem('uid')) {
                    return true;
                }
                return false;
            },
            enterText() {
                if (this.isMineProject) {
                    return 'Edit';
                }
                return 'Join';
            },
        },
        mounted() {
            var me = this;
            me.$EventBus.$on(`completeDelete_${me.copyInformation.projectId}`, function () {
                me.isDelete = true;
            });
        },
        methods: {
            async setting() {
                var me = this;
                me.copyInformation = JSON.parse(JSON.stringify(me.information));
                if (me.copyInformation && !me.set) {
                    if (!me.copyInformation.img) me.copyInformation.img = me.defaultImage;
                    me.copyInformation.authorId = me.information.authorId ? me.information.authorId : me.information.author;
                    me.copyInformation.projectId = me.information.objectID ? me.information.objectID : me.information.projectId;
                    me.copyInformation.createdTimeStamp = me.information.createdTimeStamp ? me.convertDate(me.information.createdTimeStamp) : me.convertDate(me.information.date);
                    me.copyInformation.lastModifiedTimeStamp = me.information.lastModifiedTimeStamp ? me.convertDate(me.information.lastModifiedTimeStamp) : me.convertDate(me.information.lastModifiedDate);
                    me.copyInformation.hiddenEmail = me.hiddenEmail(me.copyInformation.authorEmail);
                    me.copyInformation.isShared = me.copyInformation.permissions && me.copyInformation.permissions.length > 0 ? true : false;
                    me.copyInformation.isNewProject = me.isNew(me.copyInformation.lastModifiedTimeStamp);
                    me.copyInformation.isDeleteProject = false;
                    me.copyInformation.chip = me.chipSetting();
                    
                    if (me.information.type == 'k8s') {
                        me.projectPath = `/kubernetes/${me.copyInformation.projectId}`;
                    }

                    // lazy image
                    let result;
                   
                    result =  await me.getString(`storage://definitions/${me.copyInformation.projectId}/information/image`);
                    if (result != undefined) {
                        me.copyInformation.img = result;
                    } else {
                        let image = await me.getString(`localstorage://image_${me.copyInformation.projectId}`);
                        if (image) {
                            me.copyInformation.img = image;
                        }
                    }
                    me.set = true;
                }
                me.renderKey++;
            },
            isNew(date) {
                var yesterdayTimeStamp = Date.now() - (1 * 24 * 60 * 60 * 1000);
                if (yesterdayTimeStamp < date) {
                    return true;
                }
                return false;
            },
            chipSetting() {
                var me = this
                if (me.copyInformation) {
                    if (me.copyInformation.type == 'k8s') {
                        return {display: 'KUBERNETES', color: 'blue'}
                    } else {
                        return null
                    }
                }
            },
            openProject(){
                var me = this
                me.$EventBus.$emit('progressValue', true);
                me.$router.push(me.projectPath);
            },
            openUserProfile() {
                this.$router.push(`/userInfo/${this.information.author}`);
            },
            deleteProject() {
                this.$emit('delete', this.information)
            },
            hiddenEmail(email) {
                return email ? email.split('@')[0] : 'undefined'
            },
            convertDate(timeStamp) {
                if (!timeStamp) return null;
                if (typeof timeStamp == 'string') timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
        },
        beforeDestroy() {
            var me = this
            me.$EventBus.$emit('progressValue', false)
        },
    }
</script>
