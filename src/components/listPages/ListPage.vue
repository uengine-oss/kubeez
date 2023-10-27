<template>
    <v-container style="max-width: 1500px;">
        <slot name="body">
            <div>
                <v-row class="main-tap-list"
                        style="margin-top:-80px;
                                margin-bottom:10px; 
                                position:absolute; 
                                max-width:60%; 
                                min-width:10%; 
                                z-index:1; 
                                left: 50%; 
                                transform: translate(-50%, 0%);"
                >
                    <v-tabs v-model="selectedIndex"
                            background-color="transparent"
                            color="blue darken-1"
                            show-arrows
                            centered
                    >
                        <div v-for="(tabObj, index) in filterTabLists"
                                :key="tabObj.id"
                                style="align-self: center;"
                        >
                            <v-tab v-if="tabObj.show"
                                    :disabled="showLoading && index != selectedTab"
                                    @click="tabClickHandler(tabObj)"
                                    style="height:45px;"
                            >
                                {{ tabObj.display }}
                                <v-avatar v-if="index != 0 && tabObj.totalCount!=null" 
                                        color="green lighten-5" 
                                        size="30"
                                        style="margin-left: 5px; margin-bottom: 15px; font-size:10px;"
                                >
                                    {{ tabObj.totalCount }}
                                </v-avatar>
                                <v-avatar v-else-if="index != 0 && tabObj.totalCount==null" 
                                        color="green lighten-5"
                                        size="30"
                                        style="margin-left: 5px; margin-bottom: 15px; font-size:10px;"
                                >
                                    ...
                                </v-avatar>
                                <v-avatar v-else-if="index != 0 && tabObj.totalCount==0"
                                        color="green lighten-5" 
                                        size="30"
                                        style="margin-left: 5px; margin-bottom: 15px; font-size:10px;"
                                >
                                    0
                                </v-avatar>
                            </v-tab>
                        </div>
                    </v-tabs>
                </v-row>

                <v-tabs-items v-model="selectedTab">
                    <v-tab-item :value="selectedTab">
                        <v-row style="margin-top:0px;">
                            <v-col v-if="(showLoading && filteredList && filteredList.length < 10) || 
                                    filteredList == undefined && typeof filteredList == 'undefined'"
                                    style="height: 100%;"
                            >
                                <v-row>
                                    <v-col v-for="idx in 9"
                                            :key="idx"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            ></v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;"
                            >
                                No Items
                            </v-col>
                            <v-col v-else
                                    v-for="project in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <ListCard :information="project"
                                        @delete="deleteProjectItem"
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </ListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>

                <div v-if="selectedTab != 0" style="text-align-last: center;">
                    <div v-if="showLoadingForMorePage"
                            class="ticontainer"
                            style="margin-left: 50%; margin-top: 30px;"
                    >
                        <div class="tiblock">
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                        </div>
                    </div>
                    
                    <div v-if="!showLoading && !showMoreButton"
                            block
                            text
                            style="padding:10px 0 10px 0;"
                    >
                        마지막 페이지
                    </div>
                    
                    <v-row v-else-if="showLoading && showMoreButton">
                        <v-col v-for="idx in 9"
                                :key="idx"
                                cols="6"
                                md="4"
                        >
                            <v-card outlined
                                    class="mx-auto"
                                    style="width: 500px; height: 400px; justify-content: center;"
                                    align="center"
                            >
                                <v-skeleton-loader
                                        ref="skeleton"
                                        type="card"
                                        class="mx-auto"
                                ></v-skeleton-loader>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </slot>

        <slot name="footer">
            <div style="min-height: 190px;">
                <v-footer padless></v-footer>
            </div>
        </slot>

        <v-dialog v-if="deleteItem"
                v-model="deleteDialog"
                persistent 
                max-width="470"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('word.deleteNotification') }}
                </v-card-title>
                <v-img :src="deleteItem.img"></v-img>
                <v-card-text>
                    AuthorEmail: {{ deleteItem.authorEmail ? deleteItem.authorEmail.split('@')[0] : 'anyone' }}
                </v-card-text>
                <v-card-text>
                    ProjectName: {{ deleteItem.projectName ? deleteItem.projectName : 'untitled' }}
                </v-card-text>
                <v-card-text>
                    date: {{ convertTimeStampToDate(deleteItem.date) }}
                </v-card-text>
                <v-card-text>
                    LastModifiedDate: {{ convertTimeStampToDate(deleteItem.lastModifiedDate) }}
                </v-card-text>
                <v-card-text>
                    ## 알림 ## "공유"된 파일의 경우 공동작업자가 사본을 생성할 수 있습니다.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDeleteDialog()">
                        {{ $t('word.close') }}
                    </v-btn>
                    <v-btn color="red darken-1" 
                            text
                            @click="deleteProject()"
                    >
                        {{ $t('word.delete') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";

    var _ = require('lodash');

    export default {
        name: 'list-page',
        mixins: [CommonStorageBase],
        components: {
            'ListCard': () => import('./ListCard'),
        },
        data() {
            return {
                showLoadingForMorePage: false,
                //tabs
                selectedIndex: 0,
                tabListIndex: 0,
                tabLists: [
                    {key: 0, id: 'every', display: 'Public', count: 0, totalCount: null, show: true},
                    {key: 1, id: 'mine', display: 'Mine', count: 0, totalCount: null, show: false},
                    {key: 2, id: 'share', display: 'Shared', count: 0, totalCount: null, show: false},
                    {key: 3, id: 'local', display: 'Local', count: 0, totalCount: null, show: true},
                ],
                //list
                every: undefined,
                mine: undefined,
                share: undefined,
                local: undefined,
                
                //mode
                mode: 'k8s',
                mouseOverOpenList: false,
                listMode: [
                    {type: 'k8s', display: 'Kubernetes', color: 'blue'},
                ],

                //delete
                deleteItem: null,
                deleteDialog: false,

                //loading
                showLoading: false,
            }
        },
        beforeDestroy() {
            console.log('Ev beforeDestroy');
        },
        async created() {
            console.log('Ev created:: ');
            this.showLoading = true;
            this.$nextTick(() => {
                this.$EventBus.$emit('showNewButton', true);
            });
            await this.setUserInfo();
            
            this.initPage();
            this.$EventBus.$emit('progressValue', false);

        },
        mounted() {
            var me = this;
            
            $(window).scroll(function () {
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if (!me.showLoading && me.showMoreButton) {
                        if (!me.showLoadingForMorePage) {
                            me.settingMorePage();
                        }
                    }
                }
            });

            for (var i in me.filterTabLists) {
                if (me.filterTabLists[i]['show'] == true) {
                    //find first tab
                    me.tabListIndex = Number(i);
                    me.selectedIndex = me.tabListIndex
                    break;
                }
            }
            
            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal;
            });

        },
        watch: {
            "mode": _.debounce(
                function () {
                    this.settingCount();
                    this.settingFirstPage(true);
                }, 300
            ),
        },
        computed: {
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid;
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            selectedTab() {
                var tabType = null;

                if (this.tabListIndex == 0) {
                    tabType = '#public';
                } else if (this.tabListIndex == 1) {
                    tabType = '#mine';
                } else if (this.tabListIndex == 2) {
                    tabType = '#shared';
                } else if (this.tabListIndex == 3) {
                    tabType = '#local';
                }

                // window.location.href = window.location.href + tabType;

                return this.tabListIndex;
            },
            standardTabCount() {
                return 4;
            },
            filterTabLists() {
                var me = this;
                if (me.isLogin) {
                    me.tabLists[1].show = true;
                    me.tabLists[2].show = true;
                } else {
                    me.tabLists[1].show = false;
                    me.tabLists[2].show = false;
                }
                return me.tabLists;
            },
            showMoreButton() {
                var me = this;
                if (me.filterTabLists && me.selectedTab && me.selectedTab < me.standardTabCount) {
                    if (me.filterTabLists[me.selectedTab].count < 9) {
                        return false;
                    } else if (me.filterTabLists[me.selectedTab].count < me.filterTabLists[me.selectedTab].totalCount) {
                        return true;
                    }
                }
            },
            filteredList() {
                var me = this;
                var lists = undefined;
                if (me.filterTabLists[me.selectedTab].id == 'every') {
                    lists = this.filteredEvery;
                } else if (me.filterTabLists[me.selectedTab].id == 'mine') {
                    lists = this.filteredMine;
                } else if (me.filterTabLists[me.selectedTab].id == 'share') {
                    lists = this.filteredShared;
                } else if (me.filterTabLists[me.selectedTab].id == 'local') {
                    lists = this.filteredLocal;
                }

                if (lists) {
                    if (lists.length == 0) {
                        return lists = null;
                    }
                    if (me.mode == 'all'|| me.mode != 'all') {
                        // serach or mode changed sort(last Modified Date)
                        return lists.sort(function (a, b) {
                            return b.lastModifiedDate - a.lastModifiedDate;
                        });
                    } else {
                        return lists;
                    }
                }
                return lists;
            },
            filteredEvery() {
                var list = undefined;
                if (this.every && this.mode != 'all') {
                    list = this.every.filter(project => project.type == this.mode);
                } else if (this.every) {
                    list = this.every;
                } else if (this.every == null && typeof this.every == 'object') {
                    list = null;
                }
                return list;
            },
            filteredMine() {
                var list = undefined;
                if (this.mode == 'all') {
                    list = this.mine;
                } else if (this.mine) {
                    list = this.mine.filter(project => project.type == this.mode);
                } else if (this.mine == null && typeof this.mine == 'object') {
                    list = null;
                }
                return list;
            },
            filteredShared() {
                var list = undefined;
                if (this.mode == 'all') {
                    list = this.share;
                } else if (this.share) {
                    list = this.share.filter(project => project.type == this.mode);
                } else if (this.share == null && typeof this.share == 'object') {
                    list = null;
                }
                return list;
            },
            filteredLocal() {
                var list = undefined;
                if (this.mode == 'all') {
                    list = this.local;
                } else if (this.local) {
                    list = this.local.filter(project => project.type == this.mode);
                } else if (this.local == null && typeof this.local == 'object') {
                    list = null;
                }
                return list;
            },
        },
        methods: {
            checkNewProject() {
                var me = this;
                try {
                    me.$router.push({path: `kubernetes/${me.dbuid()}`});
                } catch (e) {
                    alert('Error-NewProject', e);
                }

            },
            tabClickHandler(obj) {
                var me = this;
                if (obj.key == 0) {
                    me.tabListIndex = 0;
                } else {
                    me.tabListIndex = me.filterTabLists.indexOf(obj);
                    me.settingFirstPage();
                }
            },
            displayCnt(tabId) {
                var me = this;
                
                if (tabId == 'local' && me.local) {
                    if (me.mode == 'all') {
                        return me.local.length;
                    } else {
                        return me.local.filter(project => project.type == me.mode).length;
                    }

                } else if (tabId == 'mine' && me.mine) {
                    if (me.mode == 'all') {
                        return me.mine.length;
                    } else {
                        return me.mine.filter(project => project.type == me.mode).length;
                    }
                } else if (tabId == 'share' && me.share) {
                    if (me.mode == 'all') {
                        return me.share.length;
                    } else {
                        return me.share.filter(project => project.type == me.mode).length;
                    }
                } else if (tabId == 'every' && me.every) {
                    if (me.mode == 'all') {
                        return me.every.length;
                    } else {
                        return me.every.filter(project => project.type == me.mode).length;
                    }
                } else {
                    return 0;
                }
            },
            initPage() {
                var me = this;
                me.settingCount();
                me.settingFirstPage();
            },
            settingCount() {
                var me = this;
                try {
                    me.filterTabLists.forEach(async function (tab, index) {
                        var tabId = tab.id
                        var path = null
                        var getSnapshotStr = null
                        var option = null
                        if (tabId == 'every') {
                            // path = `db://userLists/everyone/share`
                            path = `db://userLists/everyone/totalCount`
                        } else if (me.isLogin && tabId == 'mine') {
                            path = `db://userLists/${me.userInfo.uid}/mine`
                        } else if (me.isLogin && tabId == 'share') {
                            path = `db://userLists/${me.userInfo.uid}/share`
                        } else if (tabId == 'local') {
                            path = `localstorage://localLists`
                        }

                        if (me.mode != 'all') {
                            option = {
                                sort: "desc",
                                orderBy: 'type',
                                size: null,
                                startAt: `${me.mode}`,
                                endAt: `${me.mode}`,
                            }
                        }


                        if(path && me.mode && me.mode != 'all' && tabId == 'every'){
                            getSnapshotStr = await me.list(`${path}_${me.mode}`)
                        } else if (path){

                            if(tabId == 'every'){
                                getSnapshotStr = await me.getObject(path)
                            } else {
                                getSnapshotStr = await me.list(path, option)
                            }

                            if(tabId == 'local'){
                                getSnapshotStr = JSON.parse(getSnapshotStr)
                            }


                            if(getSnapshotStr && tabId == 'every'){
                                me.filterTabLists[index].totalCount =  getSnapshotStr
                            }else if(getSnapshotStr) {
                                me.filterTabLists[index].totalCount = Array.isArray(getSnapshotStr) ?  getSnapshotStr.length : Object.keys(getSnapshotStr).length
                            }else{
                                me.filterTabLists[index].count = 0
                                me.filterTabLists[index].totalCount = 0
                            }
                        }else{
                            me.filterTabLists[index].count = 0
                            me.filterTabLists[index].totalCount = 0
                        }

                    })
                } catch (e) {
                    alert(`settingCountError::${e}`)
                }
            },
            async settingFirstPage(init) {
                var me = this;
                if (me.selectedTab < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.selectedTab].id;
                    var path = null;
                    var option = null;

                    //path
                    if (tabId == 'local') {
                        path = `localstorage://localLists`;
                    } else if (tabId == 'every') {
                        if (me.mode && me.mode != 'all') {
                            path = `db://userLists/everyone/share_${me.mode}`;
                        } else {
                            path = `db://userLists/everyone/share_first`;
                        }
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`;
                    } else if (me.isLogin && tabId == 'share') {
                        path = `db://userLists/${me.userInfo.uid}/share`;
                    }

                    //setting Option
                    if (me.mode != 'all') {
                        // mode option
                        option = {
                            sort: "desc",
                            orderBy: 'type',
                            size: null,
                            startAt: `${me.mode}`,
                            endAt: `${me.mode}`,
                        };
                    } else {
                        //basic
                        if (me.mode != 'all' && tabId != 'every') {
                            // mode: es, k8s  && tabId : 'mine','shared'
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: null,
                                startAt: null,
                                endAt: null,
                            };
                        } else {
                            // mode: all  && tabId : 'mine','shared'
                            var size = null
                            if (tabId != 'every') {
                                size = 9;
                            }
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: null,
                            };
                        }
                    }

                    // setting list
                    var location = undefined

                    if (tabId == 'every') {
                        location = me.every
                    } else if (me.isLogin && tabId == 'mine') {
                        location = me.mine
                    } else if (me.isLogin && tabId == 'share') {
                        location = me.share
                    } else if (tabId == 'local') {
                        location = me.local
                    }

                    if (!location) me.showLoading = true


                    if (init) {
                        me.showLoading = true
                        me.initLists(tabId)
                    }
                    if (path) {
                        var snapshots = await me.list(path, option)

                        if (snapshots) {
                            if (tabId == 'local') {
                                snapshots = JSON.parse(snapshots);

                                if (snapshots.length == 0) {
                                    me.noItemLists(tabId);
                                } else {
                                    if (!location || location && location.length < me.filterTabLists[me.selectedTab].totalCount) {
                                        
                                        snapshots.forEach((project) => {
                                            if (!location) location = [];
                                            project.isLocalProject = true;

                                            if (me.mode != 'all') {
                                                if (project.type == me.mode) {
                                                    location.push(project);
                                                }
                                            } else {
                                                location.push(project);
                                            }
                                        });
                                        me.filterTabLists[me.selectedTab].count = location.length;
                                        me.local = location;
                                    }
                                }

                            } else {
                                if (location && location.length < Object.keys(snapshots).length) {
                                    me.initLists(tabId);
                                    location = undefined;
                                }

                                if (!location || location && location.length < me.tabLists[me.selectedTab].count) {

                                    snapshots.forEach((projectObj) => {
                                        var project = projectObj;
                                        var projectId = projectObj.projectId;

                                        if (!project.projectId) project.projectId = projectId;
                                        if (!project.authorProfile) project.authorProfile = null;
                                        if (!project.type) project.type = 'es';

                                        if (!location) location = [];

                                        if (location.findIndex(x => x.projectId == projectId) == -1) {
                                            location.push(project)
                                        }
                                    });

                                    if (tabId == 'every') {
                                        me.every = [];
                                        
                                        if (location)
                                            me.every = me.every.concat(location)
                                        if (snapshots.length != 9) {
                                            if (snapshots.length < 9) {
                                                var length = 9 - snapshots.length
                                                me.settingMorePage(length)
                                            } else if (snapshots.length > 9) {
                                                var overCnt = snapshots.length - 9
                                                for (var i = 0; i < overCnt; i++) {
                                                    me.delete(`db://userLists/everyone/share_first/${me.every[9].projectId}`)
                                                    me.every.splice(9, 1)
                                                }
                                            }
                                        }
                                        // console.log(me.every)
                                        me.tabLists[me.selectedTab].count = me.every.length
                                    } else if (me.isLogin && tabId == 'mine') {
                                        if (!me.mine) me.mine = []
                                        if (location)
                                            me.mine = me.mine.concat(location);
                                        me.tabLists[me.selectedTab].count = me.mine.length
                                    } else if (me.isLogin && tabId == 'share') {
                                        if (!me.share) me.share = []
                                        if (location)
                                            me.share = me.share.concat(location)
                                        me.tabLists[me.selectedTab].count = me.share.length
                                    }
                                }
                            }
                        } else {
                            me.settingMorePage(9)
                            me.noItemLists(tabId)
                        }
                    } else {
                        me.noItemLists(tabId)
                    }
                }
                me.showLoading = false
            },
            async settingMorePage(length) {
                var me = this
                if (me.selectedTab && me.selectedTab < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.selectedTab].id
                    var path = null
                    // me.showLoading = true 로딩표시 ui 수정 ... public 의 경우 전체가 로딩되는듯한 ,, 
                    me.showLoadingForMorePage = true

                    if (tabId == 'local') {
                        path = `localstorage://localLists`
                    } else if (tabId == 'every') {
                        path = `db://userLists/everyone/share`
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`
                    } else if (me.isLogin && tabId == 'share') {
                        path = `db://userLists/${me.userInfo.uid}/share`
                    }

                    if (path) {
                        if (tabId == 'local') {
                            me.showLoadingForMorePage = false
                        } else {
                            var lastModelIndex = -1
                            var lastModel = null
                            if (tabId == 'every') {
                                if(me.every){
                                    lastModelIndex = me.every.length - 1
                                    lastModel = me.every[lastModelIndex]
                                } 
                            } else if (me.isLogin && tabId == 'mine' && me.mine !== undefined) {
                                lastModelIndex = me.mine.length - 1
                                lastModel = me.mine[lastModelIndex]
                            } else if (me.isLogin && tabId == 'share' && me.share !== undefined) {
                                lastModelIndex = me.share.length - 1
                                lastModel = me.share[lastModelIndex]
                            }

                        }
                        if (length) {
                            var size = length + 1
                        } else {
                            var size = 10
                        }

                        // if (lastModel) {
                            var option = {
                                sort: 'desc',
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: lastModel && lastModel.lastModifiedDate ? lastModel.lastModifiedDate : null,
                            }
                            if (me.mode && me.mode != 'all' && me.selectedTab == 'every') {
                                var snapshots = await me.list(`${path}_${me.mode}`, option)
                            } else {
                                var snapshots = await me.list(path, option)
                            }

                            if (snapshots) {
                                var moreProject = {}

                                snapshots.forEach(function (projectObj, index) {
                                    if (index != 0) {
                                        var project = projectObj
                                        var projectId = projectObj.projectId

                                        if (!project.projectId) project.projectId = projectId
                                        if (!project.authorProfile) project.authorProfile = null
                                        if (!project.type) project.type = 'es'

                                        if (tabId == 'every') {
                                            if (!me.every) me.every = []
                                            me.every.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.every.length
                                            if (length) {
                                                moreProject[projectId] = project
                                            }
                                        } else if (me.isLogin && tabId == 'mine') {
                                            if (!me.mine) me.mine = []
                                            me.mine.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.mine.length
                                        } else if (me.isLogin && tabId == 'share') {
                                            if (!me.share) me.share = []
                                            me.share.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.share.length
                                        }
                                    }

                                    if (Object.keys(snapshots).length == index + 1) {
                                        me.showLoadingForMorePage = false
                                    }
                                })
                                if (tabId == 'every') {
                                    if (length) {
                                        // console.log(moreProject)
                                        me.putObject('db://userLists/everyone/share_first', moreProject)
                                    }
                                }
                            } else {
                                me.showLoadingForMorePage = false
                            }
                        // }
                    }
                }
            },
            noItemLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = null
                } else if (tabId == 'every') {
                    me.every = null
                } else if (tabId == 'mine') {
                    me.mine = null
                } else if (tabId == 'share') {
                    me.share = null
                }
            },
            initLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = undefined
                } else if (tabId == 'every') {
                    me.every = undefined
                } else if (tabId == 'mine') {
                    me.mine = undefined
                } else if (tabId == 'share') {
                    me.share = undefined
                }
            },
            deleteProjectItem(item) {
                var me = this
                me.deleteItem = item
                me.openDeleteDialog()
            },
            async deleteProject() {
                var me = this

                try {
                    if (me.deleteItem) {
                        var isServer = false
                        var modelSnap = await me.list(`db://definitions/${me.deleteItem.projectId}/information`)
                        if (modelSnap) {
                            isServer = true
                        }
                        if (isServer) {
                            await me.delete(`db://userLists/${me.deleteItem.author}/mine/${me.deleteItem.projectId}`)
                        }
                        me.$EventBus.$emit(`completeDelete_${me.deleteItem.projectId}`)

                        me.delete(`localstorage://${me.deleteItem.projectId}`)
                        var localLists = await me.getObject(`localstorage://localLists`)
                        var index = localLists.findIndex(info => info.projectId == me.deleteItem.projectId)
                        if (index != -1)
                            localLists.splice(index, 1)
                        await me.putObject(`localstorage://localLists`, localLists)
                    }
                    me.closeDeleteDialog()
                } catch (e) {
                    alert('Error:', e)
                }
            },
            openDeleteDialog() {
                this.deleteDialog = true
            },
            closeDeleteDialog() {
                this.deleteItem = null
                this.deleteDialog = false
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
            objectToArray(obj){
                return Object.keys(obj).map(key=> ({ ...obj[key], key }) );
            },
            sortArrayByKey(array, key , asc){
                try{
                    return array.sort(function compare(a, b) {
                        if (a[key] < b[key]) return asc ? -1 : 1;
                        if (a[key] > b[key]) return asc ? 1 : -1;
                        return 0;
                    });
                }catch (e) {
                    return array
                }
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    children.unshift(child);
                });
                return children;
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
    .ytp-chrome-top-buttons {
        display: none;
    }

    .ytp-title {
        display: none;
    }

    .ytp-title-channel {
        display: none;
    }

    .title-page-card-box {
        height: 260px;
        padding: 0;
        margin-bottom: 30px;
        height: 105%;
    }

    .title-card-actions-btn {
        position: absolute;
        right: 0;
        bottom: 0;
    }

    .title-page-title {
        margin: 10px 0 20px 0;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        color: #1E88E5;
    }

    .home-card-title {
        text-align: left;
        display: block;
        line-height: 10px;
        font-size: 15px;
    }

    .introduction-img {
        height: 170px;
        cursor: pointer;
    }

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

    .text-reader:hover {
        background-color: #E0ECF8;
        color: #1565C0;
    }

    .v-pagination__navigation {
        box-shadow: none !important;
    }

    .v-pagination__item {
        box-shadow: 0 0 black;
        color: #8e44ad;
    }

    .x-pagination a, .x-pagination span {
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
        box-shadow: none !important;
        border: 1px solid #eaeaea;
    }

    .tiblock {
        align-items: center;
        display: flex;
        height: 17px;
    }

    .ticontainer .tidot {
        background-color: rgb(215, 215, 215)
    }

    .tidot {
        -webkit-animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
        display: inline-block;
        border-radius: 10px;
        height: 12px;
        width: 12px;
        margin-right: 15px;
    }

    @-webkit-keyframes mercuryTypingAnimation {
        0% {
            -webkit-transform: translateY(0px)
        }
        28% {
            -webkit-transform: translateY(-5px)
        }
        44% {
            -webkit-transform: translateY(0px)
        }
    }

    .tidot:nth-child(1) {
        -webkit-animation-delay: 200ms;
    }

    .tidot:nth-child(2) {
        -webkit-animation-delay: 300ms;
    }

    .tidot:nth-child(3) {
        -webkit-animation-delay: 400ms;
    }

    .title-page-card-box-row {
        margin-bottom:60px;
    }

    @media only screen and (max-width: 1110px) {
        .main-tap-list {
            max-width:50% !important;
        }

    }

    @media only screen and (max-width: 850px) {
        #textsize {
            font-size: 11px;
        }

        #mode_btn {
            margin-left: -10px;
        }
    }

    @media only screen and (max-width: 420px) {
        .main-tap-list {
            margin-left:5%;
        }
    }
</style>
