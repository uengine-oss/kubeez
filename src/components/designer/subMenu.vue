<template>
    <v-menu
        transition="slide-x-transition"
        right
        offset-x
        :close-on-content-click="false"
        :persistent="true"
        v-model="openMenu"
    >
        <template v-slot:activator="{ on }">
            <v-list-item
                v-if="isSubMenu"
                class="d-flex justify-space-between"
            >
                <v-list-item-content class="base-template-in-list-style">
                    <v-list-item-title>{{ copyTemplateInfo.display }}</v-list-item-title>
                    <v-list-item-subtitle style="font-size: small;">
                        <v-icon small style="margin-right: 5px;">mdi-star-outline</v-icon>Star: {{ copyTemplateInfo.starCount }}
                        <v-icon small style="margin-left: 10px; margin-right: 5px;">mdi-source-fork</v-icon>Fork: {{ copyTemplateInfo.forkCount }}
                        <v-icon small style="margin-left: 10px; margin-right: 5px;">mdi-update</v-icon>Update: {{ copyTemplateInfo.updateTimeStamp }}
                    </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action style="flex-flow: row;">
                    <v-chip x-small :style="forkedRepoList.length > 0 ? 'margin-bottom: 8.5px;':'margin-bottom: 0px;'" variant="elevated" @click="selectTemplate(copyTemplateInfo)">
                        Select
                    </v-chip>
                    <v-btn icon @click="openForkedRepo(copyTemplateInfo.template)"><v-icon>mdi-open-in-new</v-icon></v-btn>
                    <v-btn v-on="on" @click="openMenu = true" icon><v-icon>mdi-chevron-right</v-icon></v-btn>
                </v-list-item-action>
            </v-list-item>
            <v-list-item
                v-else
                text
            >
                <v-list-item-content class="base-template-in-list-style">
                    <v-list-item-title>{{ copyTemplateInfo.display }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action style="flex-flow: row;">
                    <v-chip x-small :style="forkedRepoList.length > 0 ? 'margin-bottom: 8.5px;':'margin-bottom: 0px;'" variant="elevated" @click="selectTemplate(copyTemplateInfo)">
                        Select
                    </v-chip>
                    <v-btn v-if="forkedRepoList.length > 0" style="margin-right: -20px;" @click="openMenu = true" v-on="on" icon><v-icon>mdi-chevron-right</v-icon></v-btn>
                </v-list-item-action>
            </v-list-item>
        </template> 
        <v-list style="width: 550px;">
            <div style="margin-top: -10px;" :key="renderKey">
                <v-btn style="margin-bottom: -15px;" icon @click="closeMenu"><v-icon>mdi-chevron-left</v-icon></v-btn>
                <template v-for="(repo, index) in forkedRepoList">
                    <subMenu
                        v-if="repo.subMenu"
                        :is-sub-menu="true"
                        :key="index"
                        :isBaseTemplate="isBaseTemplate"
                        :treeItem="treeItem"
                        :menu-items="repo.subMenu"
                        :templateInfo="repo"
                        @selectTemplate="emitEventChangedTemplate"
                    />
                    <v-list-item
                        v-else
                        :key="index"
                        @mouseenter="getForkedList(repo.template, 'isForkedRepo')"
                    >
                        <v-list-item-content class="base-template-in-list-style">
                            <v-list-item-title>{{ repo.display }}</v-list-item-title>
                            <v-list-item-subtitle style="font-size: small;">
                                <v-icon small style="margin-right: 5px;">mdi-star-outline</v-icon>Star: {{ repo.starCount }}
                                <v-icon small style="margin-left: 10px; margin-right: 5px;">mdi-source-fork</v-icon>Fork: {{ repo.forkCount }}
                                <v-icon small style="margin-left: 10px; margin-right: 5px;">mdi-update</v-icon>Update: {{ repo.updateTimeStamp }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action style="flex-flow: row;">
                            <v-chip x-small :style="forkedRepoList.length > 0 ? 'margin-bottom: 8.5px;':'margin-bottom: 0px;'" variant="elevated" @click="selectTemplate(repo)">
                                Select
                            </v-chip>
                            <v-btn icon @click="openForkedRepo(repo.template)"><v-icon>mdi-open-in-new</v-icon></v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </template>
            </div>
        </v-list>
        <v-dialog v-model="showLoginCard"><Login :onlyGitLogin="true" @login="showLoginCard = false" /></v-dialog>
    </v-menu>
</template>

<script>
    const axios = require('axios');
    import Login from "../oauth/Login";
    export default {
        name: 'subMenu',
        mixins: [],
        components: {
            Login
        },
        props: {
            treeItem: Object,
            isBaseTemplate: Boolean,
            menuItems: Array,
            templateInfo: Object,
            isSubMenu: { type: Boolean, default: false },
        },
        data() {
            return {
                showLoginCard: false,
                openMenu: false,
                renderKey: 0,
                closeDelayTime: 0,
                githubHeaders: {},
                copyTemplateInfo: [],
                forkedRepoList: [],
            }
        },
        computed: {},
        created: async function () {},
        mounted: function () {
            var me = this
            me.githubHeaders = {
                Authorization: 'token ' + localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken'),
                Accept: 'application/vnd.github+json'
            }
            me.copyTemplateInfo = JSON.parse(JSON.stringify(me.templateInfo))
            if(me.menuItems && me.menuItems.length > 0) {
                me.forkedRepoList = me.menuItems
            }
            if(me.forkedRepoList.length > 0){
                me.forkedRepoList.forEach(function (repo) {
                    me.getForkedList(repo.template)
                })
            } else {
                me.getForkedList(me.copyTemplateInfo.template)
            }
        },
        beforeDestroy() {},
        watch: {},
        methods: {
            alertReLogin(){
                alert("You need to re-login because session is expired")
                this.showLoginCard = true
            },
            closeMenu(){
                var me = this
                me.openMenu = false
                me.renderKey++;
            },
            emitEventChangedTemplate(item){
                this.$emit("selectTemplate", item)
            },
            selectTemplate(item){
                var me = this
                me.$emit("selectTemplate", { tmp: item.template, isBaseTemplate: me.isBaseTemplate ? true:false, treeItem: me.treeItem ? me.treeItem:null })
            },
            openForkedRepo(gitPath){
                window.open(gitPath, '_blank');
            },
            async getForkedList(repoUrl){
                var me = this
                if(!repoUrl.includes("Custom Template")){
                    var repoPath = repoUrl.split('/')
                    let forkedList = await axios.get(`https://api.github.com/repos/` + repoPath[3] + "/" + repoPath[4] + "/" + 'forks', { headers: me.githubHeaders })
                        .catch(function (error) {
                            if(error.response.status === 401){
                                me.alertReLogin()
                            }
                            console.log(error)
                        });

                    if(forkedList && forkedList.data && forkedList.data.length > 0){
                        forkedList.data.forEach(function (repoInfo){
                            var repoObj = {
                                display: repoInfo.html_url.split("/")[3] + "/" + repoInfo.html_url.split("/")[4],
                                template: repoInfo.html_url,
                                starCount: repoInfo.stargazers_count,
                                forkCount: repoInfo.forks_count,
                                updateTimeStamp: repoInfo.updated_at
                            }
                            var idx = me.forkedRepoList.findIndex(x => x.template == repoUrl)
                            if(idx != -1){
                                if(!me.forkedRepoList[idx].subMenu){
                                    me.forkedRepoList[idx].subMenu = []
                                }
                                if(!me.forkedRepoList[idx].subMenu.find(x => x.template == repoObj.template)){
                                    me.forkedRepoList[idx].subMenu.push(repoObj)
                                    me.renderKey++;
                                }
                            } else {
                                if(!me.forkedRepoList.find(x => x.template == repoObj.template)){
                                    me.forkedRepoList.push(repoObj)
                                }
                            }
                        })
                    }
                }
                if(me.forkedRepoList.length > 0){
                    me.closeDelayTime = 5000
                }
            },
        }
    }
</script>


<style scoped>

</style>
