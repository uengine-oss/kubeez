<template>

    <v-card
            v-if="information == null || information.lastModifiedDate == null "
            outlined
            class="mx-auto"
            style="width: 400px; height: 300px; justify-content: center"
            align="center"
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
            max-width="400"
            max-height="400"
    >
        <v-img
                :src="img"
                max-width="400"
                max-height="300"
        >

            <slot name="chips">
                <v-row justify="end" style="margin-right: 1px">
                    <v-chip
                            v-if="checkNewChip"
                            class="ma-2"
                            color="red"
                            text-color="white"
                            style="margin-right: 10px"
                    >
                        NEW
                    </v-chip>
                    <v-chip
                            class="ma-2"
                            :color="displayChip.color"
                            text-color="white"
                    >
                        {{displayChip.display}}
                    </v-chip>
                    <v-chip
                            v-if="information.shared && information.location == 'mine'"
                            class="ma-2"
                            color="orange"
                            text-color="white"
                    >
                        shared
                    </v-chip>
                </v-row>
            </slot>

        </v-img>

        <v-list-item three-line>
            <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{ projectName }}
                </v-list-item-title>
                <v-list-item-subtitle>Author : {{ hiddenEmail }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>Created Date : {{createdTime }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>LastModified Date : {{ lastModifiedTime }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>Comment : {{information.comment}}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-card-actions>

            <slot name="action" :project="information">

                <v-btn text
                       :to="enterUrl()">
                    {{enterText}}
                </v-btn>

                <v-btn
                        v-if="information.location == 'mine' ||information.location == 'local' "
                        color="red"
                        text
                        @click="deleteListsPage()"
                >
                    Delete
                </v-btn>
            </slot>

        </v-card-actions>
    </v-card>

</template>

<script>
    export default {
        name: "list-card",
        props: {
            information: Object,
        },
        data() {
            return {}
        },
        computed: {
            projectName() {
                return this.information.projectName
            },
            img() {
                return this.information.img
            },
            hiddenEmail() {
                return this.information.authorEmail ? this.information.authorEmail.split('@')[0] : 'undefined'
            },
            createdTime() {
                return this.information.date ? this.convertTimeStampToDate(this.information.date) : ''
            },
            lastModifiedTime() {
                return this.information.lastModifiedDate ? this.convertTimeStampToDate(this.information.lastModifiedDate) : ''
            },
            enterText() {
                var me = this
                if (me.information.author == localStorage.getItem('uid')) {
                    return 'Edit'
                }
                return 'View'
            },
            checkNewChip() {
                var me = this
                var yesterdayTimeStamp = new Date().getTime() - (1 * 24 * 60 * 60 * 1000)
                if (yesterdayTimeStamp < me.information.lastModifiedDate) {
                    return true
                }
                return false
            },
            displayChip() {
                var me = this
                if (me.information.type == 'k8s') {
                    return {display: 'Kubernetes', color: 'blue'}
                }
            },
        },
        methods: {
            deleteListsPage() {
                this.$emit('delete', this.information)
            },
            enterUrl() {
                var me = this
                var author = me.information.author
                var projectType = me.information.location ? me.information.location : 'local'
                var projectId = me.information.projectId
                var projectVersion = me.information.lastVersionName ? me.information.lastVersionName : 'init'
                
                return "kubernetes/" + author + "/" + projectType + "/" + projectId + "/" + projectVersion
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },

        },
    }

</script>