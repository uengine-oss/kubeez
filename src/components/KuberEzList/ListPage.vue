<template>
    <v-container style="max-width: 1500px">
        <slot name="header">
            <v-row>
                <v-text-field
                        v-model="delaySearch"
                        outlined
                        style="max-width: 1300px; margin-right: 10px;margin-left: 12px;"
                ></v-text-field>
                <v-btn
                        color="green lighten-2" x-large
                        @click.native="checkNewProject">
                    New Project
                </v-btn>
            </v-row>

            <div v-if="search" style="margin-bottom: 10px">
                검색 결과 : 총 {{ filterListsCount }} 건
                검색 되었습니다.
            </div>
        </slot>

        <slot name="body">
            <div>
                <v-row>
                    <v-col
                            v-for="project in lists"
                            :key="project.projectId"
                            cols="6" md="4">
                        <list-card
                                :information="project"
                                @delete="deleteListsPage">
                            <template slot="chips">
                                <slot name="chips"></slot>
                            </template>
                            <template slot="action" slot-scope="project">
                                <slot name="action" :project="project"></slot>
                            </template>
                        </list-card>
                    </v-col>
                </v-row>
            </div>
        </slot>

        <v-dialog v-model="deleteDialog" v-if="deleteItem" persistent max-width="450">
            <v-card>
                <v-card-title class="headline">삭제 알림</v-card-title>
                <v-img :src="deleteItem.img"></v-img>
                <v-card-text>AuthorEmail: {{deleteItem.authorEmail.split('@')[0] }}</v-card-text>
                <v-card-text>ProjectName: {{deleteItem.projectName}}</v-card-text>
                <v-card-text>date: {{convertTimeStampToDate(deleteItem.date)}}</v-card-text>
                <v-card-text>LastModifiedDate: {{convertTimeStampToDate(deleteItem.lastModifiedDate)}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deleteProject()">삭제</v-btn>
                    <v-btn color="green darken-1" text @click="deleteDialogClose()">닫기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>

</template>

<script>
    import StorageBase from "../designer/modeling/StorageBase";
    import ModelCard from "./ListCard";

    export default {
        mixins: [StorageBase],
        name: 'list-pages',
        components: {
            'list-card': ModelCard
        },
        data() {
            return {
                user: null,
                lists: [],
                count: 0,
                selectedTab: 'every',
                delaySearch: '',
                search: '',
                deleteItem: null,
                deleteDialog: false,
            }
        },
        created() {
            this.init()
        },
        watch: {
            "delaySearch":
                _.debounce(
                    function (newVal) {
                        var me = this
                        me.search = newVal
                    }, 400
                ),
        },
        mounted() {
        },
        computed: {
            myUid() {
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            isLogin() {
                if (window.localStorage.getItem('accessToken')) {
                    return true
                }
                return false
            },
            filterListsCount() {
                var me = this
                var count = 0
                if (me.filteredLists) {
                    count = me.filteredLists.length
                }
                return count
            },
            filteredLists() {
                var me = this
                var filterLists = []
                me.lists.sort(function (a, b) {
                    return b.lastModifiedDate - a.lastModifiedDate;
                })

                if (me.search) {
                    filterLists = JSON.parse(JSON.stringify(me.lists))
                    filterLists.filter(information => {
                        if (information.projectName)
                            return information.projectName.toLowerCase().includes(me.search.toLowerCase())
                    })
                    return filterLists
                } else {
                    filterLists = me.lists
                    return filterLists
                }
            },
        },
        methods: {
            async init() {
                var me = this
                me.$EventBus.$emit('progressValue', true)
                await this.getModelLists();
                me.$EventBus.$emit('progressValue', false)
            },
            deleteListsPage(information) {
                var me = this
                me.deleteItem = information
                me.deleteDialog = true
            },
            async deleteProject() {
                var me = this
                if (me.deleteItem.location == 'local') {
                    me.delete(`localstorage://${me.deleteItem.projectId}`)
                    var localLists = await me.getObject(`localstorage://localLists`)
                    var index = localLists.findIndex(info => info.projectId == me.deleteItem.projectId)
                    if (index != -1)
                        localLists.splice(index, 1)
                    await me.putObject(`localstorage://localLists`, localLists)

                    me.count = localLists.length
                    me.lists = localLists
                }
                me.deleteDialogClose()
            },
            deleteDialogClose() {
                this.deleteDialog = false
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
            getModelLists() {
                var me = this
                return new Promise(async function (resolve) {
                    var modelLocalPath = `localstorage://localLists`

                    //local data 저장후 업데이트된 리스트 가져오지 못해서. 시간차 리스트 get
                    setTimeout(async function () {
                        var localModel = await me.getObject(modelLocalPath);
                        if (localModel) {
                            me.count = localModel.length
                            localModel.forEach(function (info) {
                                info.location = 'local'
                                me.lists.push(info)
                            })
                        } else {
                            localStorage.setItem('localLists', JSON.stringify([]))
                            me.count = 0
                            me.lists = []
                        }
                    }, 300)

                    resolve();
                })
            },
            async saveLocalToMine(loadedFile) {
                var me = this
                var uid = me.myUid ? me.myUid : localStorage.getItem('uid')
                var email = localStorage.getItem('email')
                var userName = localStorage.getItem('userName')
                var userProfile = localStorage.getItem('picture')
                var img, date, projectName, value, comment, type


                // date: 1601878490405
                // elements: {66ff3719-6cd8-1553-a18d-5125f3242c16: {…}, dbb73549-d58f-c640-b014-0cf9d4e3a397: {…}}
                // img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB9AA"
                // projectName: "Test3"
                // relations: {9ae83165-1b13-a059-194d-6ffae8ee35e5: {…}}
                // type: "es"
                // version: 3


                if (!uid || !window.localStorage.getItem('accessToken')) {
                    me.$EventBus.$emit('showLoginDialog')
                } else {

                    if (loadedFile) {
                        date = loadedFile.date ? loadedFile.date : new Date().getTime()
                        img = loadedFile.img ? loadedFile.img : 'https://github.com/sooheon45/eventstorming/blob/master/docs/media/evtstrm.jpg?raw=true'
                        projectName = loadedFile.projectName ? loadedFile.projectName : 'undefined'
                        type = loadedFile.type ? loadedFile.type : 'es'
                        var setValue = {
                            elements: loadedFile.elements ? loadedFile.elements : {},
                            relations: loadedFile.relations ? loadedFile.relations : {}
                        }

                        value = JSON.stringify(setValue)

                        var newProjectKey = me.dbuid()
                        var newVersionKey = await me.pushString(`${me.storage}://definitions/${newProjectKey}/versionLists`)


                        var putInfo = {
                            author: uid,
                            authorEmail: email,
                            lastVersionName: newVersionKey,
                            comment: '',
                            date: Number(date),
                            img: img,
                            lastModifiedDate: new Date().getTime(),
                            lastModifiedUser: uid,
                            lastModifiedEmail: email,
                            projectName: projectName,
                            type: type,
                        }
                        var pushSnap = {
                            value: value,
                        }

                        var putUser = {
                            uid: uid,
                            name: userName,
                            picture: userProfile
                        }

                        var putMine = {
                            projectId: newProjectKey
                        }


                        me.putString(`${me.storage}://definitions/${newProjectKey}/information`, putInfo)
                        me.putString(`${me.storage}://definitions/${newProjectKey}/versionLists/${newVersionKey}/versionValue`, pushSnap)
                        me.putString(`${me.storage}://userLists/${uid}`, putUser)
                        me.putString(`${me.storage}://userLists/${uid}/mine/${newProjectKey}`, putMine)

                        setTimeout(function () {
                            var pathName = type == 'es' ? 'storming' : (type == 'k8s' ? 'kubernetes' : 'business-model-canvas')
                            me.$router.push({path: `${pathName}/${uid}/mine/${newProjectKey}/${newVersionKey}`});
                        }, 500)
                    }
                }
            },
            checkNewProject() {
                var me = this
                me.$router.push({path: `kubernetes/${me.myUid}/local/${me.dbuid()}/init`});
            },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
        },

    }
</script>

<style scoped>
    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }
</style>