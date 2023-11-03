<template>
    <div :style="isSIgpt ? 'display: none;':'' ">
        <v-snackbar class="snackbar-style"
            v-model="gitSnackBar.show"
            auto-height 
            :color="gitSnackBar.Color"
            multi-line
        >
            <v-layout style="top: -170px;" align-center pr-4>
                <v-icon v-if="gitSnackBar.icon" class="pr-3" dark large>{{ gitSnackBar.icon }}</v-icon>
                <v-layout column>
                <div v-if="gitSnackBar.title"> 
                    <strong>{{ gitSnackBar.title }}</strong>
                </div>
                <div>{{ gitSnackBar.Text }}</div>
                <div v-if="gitSnackBar.multiLineText">{{ gitSnackBar.multiLineText }}</div>
                </v-layout>
            </v-layout>
            <template v-slot:action="{ attrs }">
                <v-btn
                    v-if="gitSnackBar.title == 'Warning' && gitSnackBar.Text == 'Nothing changed' && !isOnPrem"
                    color="white"
                    outlined
                    small
                    v-bind="attrs"
                    @click="forcePush()"
                >
                    force push
                </v-btn>
                <v-btn
                    color="white"
                    text
                    small
                    v-bind="attrs"
                    @click="gitSnackBar.show = false, gitSnackBar.multiLineText = null"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
        <v-card v-if="gitMenuMode == 'push'" :disabled="!isListSettingDone" style="width: 666px;">
            <!-- <v-icon v-if="!isGitLogin" small @click="gitMenuMode = 'settings'" 
                style="font-size: 18px; margin-right: 25px; margin-top: 3px; position: absolute; right: 0px; z-index: 1;">mdi-account-key</v-icon> -->
            <v-icon small @click="closeMenu()" 
                style="font-size: 18px; margin-right: 3px; margin-top: 3px; position: absolute; right: 0px; z-index: 1;">mdi-close</v-icon>
            <!-- <v-toolbar // git open menu 상단 바
                flat
                :color="isOnPrem ? '#292b60':'#0d1117'"
                dark
            >
                <v-toolbar-title style="width: 40%;"><v-icon>mdi-git</v-icon>
                    <span>&nbsp;Commit to {{ APIType }}</span>
                </v-toolbar-title>
                <div v-if="!isGitLogin && (!gitUserName || !gitToken)" style="width: 65%; text-align: right;">
                    <v-btn @click="gitMenuMode = 'settings'">
                        <v-icon>mdi-account-circle</v-icon>
                        <div style="font-size: 12px;">Sign in or enter your account information</div>
                    </v-btn>
                    <v-icon style="margin-top: -35px; margin-right: -15px;" color="white" @click="closeMenu()">mdi-close</v-icon>
                </div>

                <div v-else style="width: 60%; text-align: right;">
                    <v-badge
                        :value="gitAvatarHover"
                        color="grey"
                        icon="mdi-pencil"
                        right
                        bottom
                        overlap
                        transition="slide-x-transition"
                    >
                        <v-hover v-model="gitAvatarHover">
                            <v-avatar
                                v-if="isGitLogin"
                                @click="gitMenuMode = 'settings'"
                                style="cursor: pointer;"
                                class="ma-0">
                                <img
                                    :src=gitPicture
                                >
                            </v-avatar>
                            <v-icon 
                                v-else
                                x-large
                                @click="gitMenuMode = 'settings'"
                                style="cursor: pointer;"
                            >
                                mdi-account-circle
                            </v-icon>
                        </v-hover>
                    </v-badge>
                    <v-icon style="margin-top: -35px; margin-right: -15px;" color="white" @click="closeMenu()">mdi-close</v-icon>
                </div>
            </v-toolbar> -->
            <v-tabs
                    :key="gitTabKey"
                    v-model="gitTab"
                    vertical
            >
                <v-tab
                        v-for="item in gitTabItems"
                        :key="item.tab"
                        style="justify-content: left;"
                >
                    {{ item.tab }}
                    <v-tooltip right>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" v-if="item.tabKey == 'setAccount' && githubTokenError" end color="error" style="font-size: 18px; margin-left: 3px;">
                                mdi-alert
                            </v-icon>
                        </template>
                        Make sure your github token is correct
                    </v-tooltip>
                </v-tab>
                <v-tab-item
                    v-for="item in gitTabItems"
                    :key="item.tab"
                    style="border-left:1px solid rgba(0,0,0,0.54); padding:10px;"
                >
                    <v-card flat style="padding:10px;">
                        <div>
                            <!-- <v-divider v-if="!isGitLogin && (!gitOrgName || !gitToken)" /> -->
                            <v-radio-group
                                v-if="item.tabKey == 'setFirstRepo'"
                                v-model="gitRadios"
                                mandatory
                            >
                                <v-row no-gutters v-if="gitRefRepoUrl">
                                    <v-col cols="3">
                                        <v-radio
                                            :disabled="isPrivilegedUser && !information.gitOrgName"
                                            label="Fork from"
                                            value="fork"
                                        ></v-radio>
                                    </v-col>
                                    <v-col cols="9">
                                        <v-text-field
                                            readonly
                                            dense
                                            v-model="gitRefRepoUrl"
                                        >
                                            <template v-if="(!isFirstCommit || isExistRepo)" v-slot:append-outer>
                                                <v-tooltip left>
                                                    <template v-slot:activator="{ on }">
                                                        <v-icon v-on="on" @click="openRefGitRepo()">
                                                            mdi-open-in-new
                                                        </v-icon>
                                                    </template>
                                                    open Git Repository
                                                </v-tooltip>
                                            </template>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-radio v-if="!isExistRepo"
                                    :style="gitRadios == 'fork' ? 'position:absolute; top:115px;':''"
                                    label="Create New Repository"
                                    value="createNewRepo"
                                ></v-radio>
                            </v-radio-group>
                            <v-row no-gutters>
                                <!-- <span v-if="(item.tabKey == 'setFirstRepo' || item.tabKey == 'changeRepo') && isExistRepo" 
                                style="width: 100%; font-weight: 500; font-size: 15px; color: darkgray;"
                                :style="editTemplateMode ? 'margin-top: -10px; margin-bottom: 20px':'margin-top: -45px;'"
                                >Existing Repo</span> -->
                                <v-col cols="5" :style="gitRadios == 'createNewRepo' ? 'margin-top: -10px;':'margin-top: -10px;'">  
                                    <v-autocomplete
                                            v-if="item.tabKey == 'setFirstRepo' || item.tabKey == 'changeRepo'"
                                            @click="getGitOrganizations()"
                                            @change="OrgNameChanged()"
                                            v-model="gitOrgName"
                                            :items="gitOrganizations"
                                            label="Organization Name"
                                            outlined
                                            dense
                                            auto-select-first
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="7" :style="gitRadios == 'createNewRepo' ? 'margin-top: -10px;':'margin-top: -10px;'" :key="repoFieldRenderKey">
                                    <v-text-field
                                        v-if="item.tabKey == 'setFirstRepo' || item.tabKey == 'changeRepo'"
                                        style="margin-left:10px; margin-top:-5px;"
                                        v-model="gitRepoName"
                                        :rules="[gitInfoRules.required]"
                                        label="Repository Name"
                                        :error="isExistRepo"
                                        :error-messages="isExistRepoMessage"
                                        >
                                        <template v-if="(!isFirstCommit || isExistRepo)" v-slot:append-outer>
                                            <v-tooltip left>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon v-on="on" @click="openGitRepo()">
                                                        mdi-open-in-new
                                                    </v-icon>
                                                </template>
                                                open Git Repository
                                            </v-tooltip>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        <div :key="copyInfoKey" v-if="item.tabKey == 'info'" style="margin:-10px;">
                            <div>
                                <template>
                                    <v-tabs grow v-model="githubIdeTabs">
                                        <v-tab>
                                            Cloud IDE
                                        </v-tab>
                                        <v-tab>
                                            Local IDE
                                        </v-tab>
                                    </v-tabs>
                                </template>
                                <v-tabs-items style="padding:10px;" v-model="githubIdeTabs">
                                    <v-tab-item>
                                        <v-card flat :key="gitPodError">
                                            <template>
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn
                                                            :disabled="!isReleasedTag && projectVersion"
                                                            style="text-align: center;
                                                            text-align: center;
                                                            height: 40px;
                                                            line-height: 40px;
                                                            margin:10px 0px 10px 0px;
                                                            width:48%;
                                                            margin-right: 10px;"
                                                            color="primary"
                                                            v-on="on" @click="openIDE('gitpod')"
                                                        >
                                                            Open Gitpod
                                                        </v-btn>
                                                        <div v-if="gitPodError" style="margin-top: -10px;margin-bottom: 20px;font-size: 12px;color: #E5393B;">This tag(version) has not been released.</div>
                                                    </template>
                                                    Go to the {{ IdeType }} Link
                                                </v-tooltip>
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn
                                                            style="text-align: center;
                                                            text-align: center;
                                                            height: 40px;
                                                            line-height: 40px;
                                                            margin:10px 0px 10px 0px;
                                                            width:49%;"
                                                            color="primary"
                                                            v-on="on" @click="openIDE('codespace')"
                                                        >
                                                            Open Codespaces
                                                        </v-btn>
                                                    </template>
                                                    Go to the CodeSpace Link
                                                </v-tooltip>
                                            </template>
                                            <span style="font-weight:700; font-size:14px;">Update from model code</span>
                                            <v-text-field
                                                    id="copy-gitMerge-command"
                                                    label="Update from model code"
                                                    :value="gitMergeCommand"
                                                    prepend-inner-icon="mdi-chevron-right"
                                                    solo
                                                    readonly
                                            >
                                                <template v-slot:append>
                                                    <v-icon color="success" v-if="isCopied == 'gitMerge_Command'">
                                                        mdi-check
                                                    </v-icon>
                                                    <v-icon v-else @click="copytoClipBoard('gitMerge_Command')">
                                                        mdi-content-copy
                                                    </v-icon>
                                                </template>
                                            </v-text-field>
                                        </v-card>
                                    </v-tab-item>
                                    <v-tab-item>
                                        <v-card flat>
                                            <v-switch
                                                    v-if="isPrivilegedUser"
                                                    v-model="showOriginMode"
                                                    label="Show Origin"
                                            ></v-switch>
                                            <span style="font-weight:700; font-size:14px;">Clone git Repo firstly</span>
                                            <v-text-field
                                                    id="copy-gitClone-command"
                                                    label="Local IDE"
                                                    :value="showOriginMode ? gitCloneCommandOrigin:gitCloneCommand"
                                                    prepend-inner-icon="mdi-chevron-right"
                                                    solo
                                                    readonly
                                            >
                                                <template v-slot:append>
                                                    <v-icon color="success" v-if="isCopied == 'gitClone_Command'">
                                                        mdi-check
                                                    </v-icon>
                                                    <v-icon v-else @click="copytoClipBoard('gitClone_Command')">
                                                        mdi-content-copy
                                                    </v-icon>
                                                </template>
                                            </v-text-field>
                                            <span style="font-weight:700; font-size:14px;">Update from model code</span>
                                            <v-text-field
                                                    id="copy-gitMerge-command"
                                                    label="Update from model code"
                                                    :value="gitMergeCommand"
                                                    prepend-inner-icon="mdi-chevron-right"
                                                    solo
                                                    readonly
                                            >
                                                <template v-slot:append>
                                                    <v-icon color="success" v-if="isCopied == 'gitMerge_Command'">
                                                        mdi-check
                                                    </v-icon>
                                                    <v-icon v-else @click="copytoClipBoard('gitMerge_Command')">
                                                        mdi-content-copy
                                                    </v-icon>
                                                </template>
                                            </v-text-field>
                                        </v-card>
                                    </v-tab-item>
                                </v-tabs-items>
                            </div>
                            <!--                            <div v-if="(!isFirstCommit || isDuplicate)">-->
                        </div>
                        <div v-if="item.tabKey == 'setAccount'" :disabled="!isListSettingDone">
                            <!-- <v-card-title style="background-color: #0d1117; color: white; margin-left:-10px;">
                                <v-icon color="white" @click="gitMenuMode = 'push'" style="margin-right: 5px;">mdi-arrow-left</v-icon>
                                &nbsp;Settings
                                <v-spacer />
                            </v-card-title> -->
                            <div style="margin: 10px;">
                                <div v-if="isGitLogin" style="width: 100%; text-align: right; margin-bottom: -30px;">
                                    <v-btn small text color="primary" @click="logoutToGit()">sign out</v-btn>
                                </div>
                                <div v-if="!isGitLogin" style="width: 100%; text-align: center; font-size: 20px;">
                                    <login-by-gitlab v-if="isOnPrem"></login-by-gitlab>
                                    <Login v-else :isGitMenu="true" @isGitLogin="isGitLoginComplete()"></Login>
                                </div>
                                <div v-else style="width: 100%; text-align: center; margin-bottom: 10px;">
                                    <v-avatar class="ma-0">
                                        <img
                                                :src=gitPicture
                                        >
                                    </v-avatar>
                                </div>
                                <div v-if="!isGitLogin" style="width: 100%; text-align: center; margin-top: 10px; margin-bottom: -15px;"><b style="color: grey;">or</b></div>
                                <v-text-field
                                        v-model="gitUserName"
                                        :readonly="isGitLogin"
                                        :rules="[gitInfoRules.required]"
                                        label="userName"
                                ></v-text-field>
                                <v-text-field
                                        :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                                        :type="showToken ? 'text' : 'password'"
                                        @click:append="showToken = !showToken"
                                        v-model="gitToken"
                                        :readonly="isGitLogin"
                                        :error="githubTokenError"
                                        :rules="[gitInfoRules.required, !githubTokenError || 'Make sure your github token is correct']"
                                        label="token"
                                >
                                    <template v-slot:label>
                                        Access Token
                                        <v-icon @click="openGuide()" style="vertical-align: middle; margin-top: -3px;">
                                            mdi-help-circle-outline
                                        </v-icon>
                                    </template>
                                </v-text-field>
                                <v-switch
                                        v-model="usegitPod"
                                        label="Using gitpod to open Project IDE"
                                        @change="changedUseGitPodStatus()"
                                ></v-switch>
                            </div>
                        </div>

                        <span v-if="item.tabKey == 'push' || item.tabKey == 'openGithubEditor'" style = "font-weight:500; font-size:16px;">Target Repo</span>
                        <v-text-field
                            v-if="item.tabKey == 'push'"
                            :key="copyPushKey"
                            readonly
                            id="copy-gitRepo-link"
                            solo
                            v-model="gitRepoUrl"
                            label="gitRepo Link"
                        >
                            <template v-if="(!isFirstCommit || isExistRepo)" v-slot:append-outer>
                                <v-tooltip left>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on" @click="openGitRepo()">
                                            mdi-open-in-new
                                        </v-icon>
                                    </template>
                                    open Git Repository
                                </v-tooltip>
                            </template>
                        </v-text-field>

                        <v-text-field
                            v-if="item.tabKey == 'openGithubEditor'"
                            :key="copyPushKey"
                            readonly
                            prepend-inner-icon="mdi-link-variant"
                            solo
                            v-model="openGithubEditorUrl"
                            label="Editor"
                        >
                            <template v-slot:append>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on" @click="openGithubEditorRepo()">
                                            mdi-open-in-new
                                        </v-icon>
                                    </template>
                                    Open Git Editor
                                </v-tooltip>
                            </template>
                        </v-text-field>
                    </div>
                        <div style="float: right;">
                            <div v-if="!isPushing && item.tabKey == 'setFirstRepo' && gitRadios == 'createNewRepo' || item.tabKey == 'changeRepo' && isExistRepoMessage == null">
                                <v-btn :disabled="!gitOrgName || !gitRepoName || isExistRepo" text color="primary" @click="startCommit()">Create</v-btn>
                            </div>
                            <div>
                                <v-btn v-if="item.tabKey == 'changeRepo' && isExistRepoMessage || (item.tabKey == 'setFirstRepo' && isExistRepo)" 
                                    :disabled="!(gitOrgName && gitRepoName)"
                                    text color="primary" @click="gitTab = 1">next
                                </v-btn>
                                <v-btn v-if="!isPushing && item.tabKey == 'setFirstRepo' && gitRadios == 'fork'" 
                                    :disabled="!isListSettingDone || !(gitOrgName && gitRepoName) || isExistRepo || (isPrivilegedUser && !information.gitOrgName)"
                                    text color="primary" @click="startFork()">fork
                                </v-btn>

                                <v-btn-toggle v-if="!isPushing && item.tabKey == 'push'">
                                    <v-checkbox
                                        v-if="editTemplateMode && isTemplate"
                                        v-model="autoApplyTemplate"
                                        label="Apply this template after push"
                                        hide-details
                                        class="shrink mr-2 mt-0"
                                    ></v-checkbox>
                                    <v-btn
                                        :disabled="!isListSettingDone || !(gitOrgName && gitRepoName)"
                                        text color="primary" @click="startCommit()">{{ pushBtnName }}
                                    </v-btn>
                                    <v-menu offset-y v-if="!editTemplateMode">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn icon 
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                                <v-icon>mdi-chevron-down</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-list>
                                            <v-list-item
                                                v-for="(item, index) in pushBtnitems"
                                                :key="index"
                                                @click="pushType = item.title"
                                                :disabled="pushType == item.title"
                                            >
                                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-btn-toggle>
            
                                <span v-if="isPushing && (item.tabKey == 'push' || item.tabKey == 'setFirstRepo')">
                                    <b :key="commitStep" v-if="commitStepText != null">{{ commitStepText }}({{commitStep}}%) ... </b>
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                    ></v-progress-circular>
                                </span>
                            </div>
                        </div>
                    </v-card>
                </v-tab-item>
            </v-tabs>
        </v-card>

        <!-- <v-card v-else :disabled="!isListSettingDone" style="width: 350px; height: 380px;">
            <v-card-title style="background-color: #0d1117; color: white; margin-left:-10px;">
                <v-icon color="white" @click="gitMenuMode = 'push'" style="margin-right: 5px;">mdi-arrow-left</v-icon>
                &nbsp;Settings
                <v-spacer />
            </v-card-title>
            <div style="margin: 10px;">
                <div v-if="isGitLogin" style="width: 100%; text-align: right; margin-bottom: -30px;">
                    <v-btn small text color="primary" @click="logoutToGit()">sign out</v-btn>
                </div>
                <div v-if="!isGitLogin" style="width: 100%; text-align: center; font-size: 20px;">
                    <login-by-gitlab v-if="isOnPrem"></login-by-gitlab>
                    <Login v-else :isGitMenu="true" @isGitLogin="isGitLoginComplete()"></Login>
                </div>
                <div v-else style="width: 100%; text-align: center; margin-bottom: 10px;">
                    <v-avatar class="ma-0">
                        <img
                                :src=gitPicture
                        >
                    </v-avatar>
                </div>
                <div v-if="!isGitLogin" style="width: 100%; text-align: center; margin-top: 10px;"><b style="color: grey;">or</b></div>
                <v-text-field
                        v-model="gitUserName"
                        :readonly="isGitLogin"
                        :rules="[gitInfoRules.required]"
                        label="userName"
                ></v-text-field>
                <v-text-field
                        :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="showToken ? 'text' : 'password'"
                        @click:append="showToken = !showToken"
                        v-model="gitToken"
                        :readonly="isGitLogin"
                        :rules="[gitInfoRules.required]"
                        label="token"
                >
                    <template v-slot:label>
                        Access Token
                        <v-icon @click="openGuide()" style="vertical-align: middle; margin-top: -3px;">
                            mdi-help-circle-outline
                        </v-icon>
                    </template>
                </v-text-field>
                <v-switch
                        v-model="usegitPod"
                        label="Using gitpod to open Project IDE"
                        @change="changedUseGitPodStatus()"
                ></v-switch>
            </div>
        </v-card> -->
        <v-dialog v-model="showLoginCard"><Login :onlyGitLogin="true" @login="showLoginCard = false" /></v-dialog>
    </div>
</template>

<script>
    // import SIGenerator from './modeling/generators/SIGenerator'
    import labBase from "../labs/LabStorageBase"
    import Login from "../oauth/Login";
    import LoginByGitlab from "../oauth/LoginByGitlab";
    const axios = require('axios');
    import CodeGeneratorCore from './modeling/CodeGeneratorCore';
    const _ = require('lodash');
    import Gitlab from "../../utils/Gitlab";
    import GitAPI from "../../utils/GitAPI";
    import Github from "../../utils/Github";

    export default {
        name: 'gitAPIMenu',
        mixins: [labBase],
        components: {
            LoginByGitlab,
            Login,
        },
        props: {
            isSIgpt: Boolean,
            onlyOneBcId: String,
            isOneBCModel: Boolean,
            githubTokenError: Boolean,
            value: Object,
            templateRepoName: String,
            isCustomTemplate: Boolean,
            editTemplateMode: Boolean,
            editTemplateList: Object,
            isOnPrem: Boolean,
            changedPathListsForGit: Array,
            projectId: String,
            projectName: String,
            isListSettingDone: Boolean,
            isOwnModel: Boolean,
            information: Object,
            gitUsers: Object,
            generateCodeLists: Array,
            ShowCreateRepoTab: Boolean,
            isServerModel: Boolean,
        },
        data() {
            return {
                git: null,
                isTemplate: false,
                autoApplyTemplate: true,
                showLoginCard: false,
                core: null,
                repoFieldRenderKey: 0,
                isVersionBranch: false,
                isExistRepoMessage: null,
                isExistRepo: false,
                templateGitPath: null,
                githubIdeTabs: null,
                isBitbucket: false,
                // isOnPrem: true,
                setPrivilegedUserGitInfo: false,
                showOriginMode: false,
                isPrivilegedUser: false,
                firstSetUserName: true,
                pushBtnName: "Force Push",
                pushType: "Force Push",
                pushBtnitems: [
                    { title: 'Push' },
                    { title: 'Force Push' },
                ],
                gitlabGroupIdList: {},
                gitlabDomain: null,
                gitHeaders: {},
                copyChangedPathLists: [],
                gitCommitMessage: null,
                isCopied: null,
                gitRadios: null,
                firstTimeGet: true,
                gitForkOrgName: null,
                gitForkRepoName: null,
                gitOrgName: null,
                gitOrganizations: [],
                copyPushKey: 0,
                copyInfoKey: 0,
                gitTabKey: 0,
                gitTab: 0,
                isGitLogin: false,
                gitMenuMode: 'push',
                gitInfoRules: {
                    required: value => !!value || 'Required.'
                },
                commitStep: 0,
                commitStepSetTimeout: null,
                commitStepText: null,

                parentsCommitSha: null,
                usegitPod: true,
                gitSnackBar: {
                    Text: '',
                    show: false,
                    Color: null,
                    icon: null,
                    title: null,
                    timeout: null,
                },
                firstCommit: false,
                isFirstCommit: true,
                gitMenu: false,
                isPushing: false,
                gitAvatarHover: false,
                gitPicture: null,
                gitToken: null,
                showToken: false,
                gitUserName: null,
                gitRepoName: null,
                getRoofCnt: 0,
                treesha: null,
                pushTree: [],
                removeTree: [],
                gitTreeList: [],
                gitlabFileList: [],
                gitlabFilePathList: [],
                gitLabCommitAction: [],
                isNewProject: false,
                gitLabProjectId: null,
                isReleasedTag: false,
                gitPodError: false,
                generator: null,
                prompt: null,
            }
        },
        computed: {
            releaseTagPath(){
                return !this.editTemplateMode && (this.projectVersion && !this.isFirstCommit) ? `/releases/tag/${this.value.tag}` : ''
            },
            cloneTagPath(){
                return !this.editTemplateMode && (this.projectVersion && !this.isFirstCommit) ? ` -b ${this.value.tag}` : ''
            },
            APIType(){
                return this.git.getType()
            },
            IdeType(){
                // 해당 부분은 수정 안함. (Gitpod)
                return "Gitpod"
            },
            gitpodUrlOrigin(){
                // 해당 부분은 수정 안함. (Gitpod)
                if(this.value.org && this.value.repo){
                    return this.git.getGitpodUrl(this.value.org, this.value.repo, this.releaseTagPath)
                } else {
                    return `The original repository does not exist.`
                }
            },
            gitpodUrl(){
                // 해당 부분은 수정 안함. (Gitpod)
                if(this.isFirstCommit){
                    if(this.value){
                        if((this.value.forkedOrg  && this.value.forkedRepo) && !this.editTemplateMode){
                            return this.git.getGitpodUrl(this.value.forkedOrg, this.value.forkedRepo, this.releaseTagPath)
                        } else {
                            return this.git.getGitpodUrl(this.gitOrgName, this.gitRepoName, this.releaseTagPath)
                        }
                    }
                } else {
                    return this.git.getGitpodUrl(this.gitOrgName, this.gitRepoName, this.releaseTagPath)
                }
            },
            gitCloneCommandOrigin(){
                if(this.value.org && this.value.repo){
                    return this.git.getCloneCommand(this.value.org, this.value.repo, "")
                } else {
                    return `The original repository does not exist.`
                }
            },
            gitCloneCommand(){
                if(this.isFirstCommit){
                    if(this.value){
                        if(!this.value.forkedOrg || !this.value.forkedRepo){
                            return this.git.getCloneCommand(this.gitOrgName, this.gitRepoName, this.cloneTagPath)
                        } else {
                            if(!this.editTemplateMode){
                                return this.git.getCloneCommand(this.value.forkedOrg, this.value.forkedRepo, this.cloneTagPath)
                            }
                        }
                    }
                } else {
                    return this.git.getCloneCommand(this.gitOrgName, this.gitRepoName, this.cloneTagPath)
                }
            },
            gitMergeCommand(){
                return `git pull && git merge origin/template`
            },
            gitTabItems(){
                var me = this
                var setTabItems
                if(!me.isOwnModel){
                    if(me.information && me.information.permissions && me.userInfo && me.userInfo.uid){
                        if(me.information.permissions[me.userInfo.uid]){
                            me.isPrivilegedUser = true
                            if(!me.setPrivilegedUserGitInfo){
                                me.setGitInfo()
                            }
                        }
                    }
                }
                if(!me.isGitLogin){
                    if(me.isFirstCommit){
                        setTabItems = [
                            { tab: 'Account', index: 0, tabKey: 'setAccount' },
                            { tab: 'Repository', index: 1, tabKey: 'setFirstRepo' },
                            { tab: 'Push', index: 2, tabKey: 'push' },
                            { tab: 'IDE', tabKey: 'info', index: 3 },
                        ]
                    } else {
                        setTabItems = [
                            { tab: 'Account', index: 0, tabKey: 'setAccount' },
                            { tab: 'Repository', index: 1, tabKey: 'changeRepo' },
                            { tab: 'Push', index: 2, tabKey: 'push' },
                            { tab: 'IDE', tabKey: 'info', index: 3 }
                        ]
                    }
                } else if(me.editTemplateMode){
                    setTabItems = [
                        { tab: 'Repository', index: 1, tabKey: 'changeRepo' },
                        { tab: 'Push', index: 2, tabKey: 'push' },
                        { tab: 'Editor', index: 3, tabKey: 'openGithubEditor' }
                    ]
                } else {
                    if(me.projectVersion){
                        setTabItems = [
                            { tab: 'IDE', tabKey: 'info', index: 1 },
                        ]
                    } else if(me.isOwnModel){
                        if(me.isFirstCommit){
                            setTabItems = [
                                { tab: 'Repository', index: 1, tabKey: 'setFirstRepo' },
                                { tab: 'Push', index: 2, tabKey: 'push' },
                                { tab: 'IDE', tabKey: 'info', index: 3 },
                            ]
                        } else {
                            setTabItems = [
                                { tab: 'Repository', index: 1, tabKey: 'changeRepo' },
                                { tab: 'Push', index: 2, tabKey: 'push' },
                                { tab: 'IDE', tabKey: 'info', index: 3 }
                            ]
                        }
                    } else if(me.isPrivilegedUser){
                        if(me.information.permissions[me.userInfo.uid].firstCommit == "false"){
                            setTabItems = [
                                { tab: 'Repository', index: 1, tabKey: 'changeRepo' },
                                { tab: 'Push', index: 2, tabKey: 'push' },
                                { tab: 'IDE', tabKey: 'info', index: 3 }
                            ]
                        } else {
                            setTabItems = [
                                { tab: 'Repository', index: 1, tabKey: 'setFirstRepo' },
                                { tab: 'Push', index: 2, tabKey: 'push' },
                                { tab: 'IDE', tabKey: 'info', index: 3 },
                            ]
                        }
                    } else {
                        setTabItems = [
                            { tab: 'IDE', tabKey: 'info', index: 1 }
                        ]
                    }
                    
                }
                return setTabItems
            },
            openGithubEditorUrl() {
                return `https://github.dev/${this.gitOrgName}/${this.gitRepoName}`
            },
            gitRepoUrl() {
                // Test Code
                return this.git.gitRepoUrl(this.gitOrgName, this.gitRepoName, this.releaseTagPath);
            },
            gitRefRepoUrl(){
                if(this.value){
                    if(this.isPrivilegedUser){
                        if(this.value.org && this.value.repo){
                            return `https://github.com/${this.value.org}/${this.value.repo}${this.releaseTagPath}`
                        } else {
                            this.gitRadios = "createNewRepo"
                            return `The original repository does not exist.`
                        }
                    } else if((this.value.forkedOrg && this.value.forkedRepo) && !this.editTemplateMode){
                        return this.git.gitRepoUrl(this.gitOrgName, this.gitRepoName, this.releaseTagPath);
                    }
                }
                this.gitRadios = "createNewRepo"
                return false
            }
        },
        created: async function () {
            this.core = new CodeGeneratorCore({});
            let git;

            if(window.MODE == "onprem") {
                git = new Gitlab();
            } else {
                git = new Github();
            }
            this.git = new GitAPI(git);
        },
        mounted: function () {
            var me = this
            window.addEventListener("message", me.messageProcessing);
            me.setGitInfo()
            me.checkRepoExist()
            if(me.isSIgpt){
                me.startCommitWithGit()
            }
        },
        beforeDestroy() {
            var me = this 
            me.$emit("closeGitMenu")
        },
        watch: {
            pushType(newVal) {
                if(newVal == 'Push'){
                    this.pushBtnName = "Push"
                } else {
                    this.pushBtnName = "Force Push"
                }
            },
            gitUsers(newVal) {
                console.log(newVal);
                this.gitToken = newVal.data.accessToken;
                this.gitUserName = newVal.data.username;
                this.gitPicture = newVal.data.avatar_url;
            },
            gitRepoName: _.debounce(function () {
                var reg = /[\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\"]/gi;
                this.gitRepoName = this.gitRepoName.replaceAll(reg,'');
                this.gitRepoName = this.gitRepoName.replaceAll(' ', '-')

                if(this.gitRepoName.at(-1) == "-"){
                    this.gitRepoName = this.gitRepoName.replace(/.$/, "");
                }
                this.RepoNameChanged()
            }, 1000),
            gitUserName: _.debounce(function () {
                if((this.isOwnModel || this.isPrivilegedUser) && (!this.firstSetUserName || !this.gitOrgName)){
                    this.gitOrganizations = []
                    this.firstTimeGet = true
                    if(this.gitUserName){
                        this.gitOrgName = this.gitUserName
                        this.gitOrganizations.push(this.gitUserName)
                        localStorage.setItem("gitUserName", this.gitUserName);
                    } else {
                        localStorage.removeItem("gitUserName");
                        this.gitOrgName = null
                    }
                } else {
                    this.firstSetUserName = false
                }
            }, 1000),
            gitToken: _.debounce(function (newVal) {
                var me = this
                if(newVal){
                    localStorage.setItem("gitToken", newVal);
                    if(me.isOnPrem){
                        this.gitHeaders = {
                            Authorization: 'Bearer ' + newVal,
                            Accept: 'application/json'
                        }
                    } else {
                        this.gitHeaders = {
                            Authorization: 'token ' + me.gitToken,
                            Accept: 'application/vnd.github+json'
                        }
                    }
                } else {
                    localStorage.removeItem("gitToken");
                }
            }, 1000),
            commitStepText: function (newVal) {
                var me = this
                if(newVal == null){
                    if(me.commitStepSetTimeout){
                        clearTimeout(me.commitStepSetTimeout)
                    }
                    me.commitStep = 0
                } else if(newVal == 'Started Commit'){
                    me.commitStepSetTimeout = setTimeout(function () {
                        if(me.commitStep < 30){
                            me.commitStep++;
                        } else {
                            clearTimeout(me.commitStepSetTimeout)
                        }
                    }, 300)
                } else if(newVal == 'Check Git Repo'){
                    clearTimeout(me.commitStepSetTimeout)
                    me.commitStep = 30
                    me.commitStepSetTimeout = setTimeout(function () {
                        if(me.commitStep < 50){
                            me.commitStep++;
                        } else {
                            clearTimeout(me.commitStepSetTimeout)
                        }
                    }, 300)
                } else if(newVal == 'Set Git Commit Tree'){
                    clearTimeout(me.commitStepSetTimeout)
                    me.commitStep = 50
                    me.commitStepSetTimeout = setTimeout(function () {
                        if(me.commitStep < 70){
                            me.commitStep++;
                        } else {
                            clearTimeout(me.commitStepSetTimeout)
                        }
                    }, 300)
                } else if(newVal == 'Commit to Git'){
                    clearTimeout(me.commitStepSetTimeout)
                    me.commitStep = 70
                    me.commitStepSetTimeout = setTimeout(function () {
                        if(me.commitStep < 90){
                            me.commitStep++;
                        } else {
                            clearTimeout(me.commitStepSetTimeout)
                        }
                    }, 300)
                } else if(newVal == 'Push to Git'){
                    clearTimeout(me.commitStepSetTimeout)
                    me.commitStep = 90
                    me.commitStepSetTimeout = setTimeout(function () {
                        if(me.commitStep < 100){
                            me.commitStep++;
                        } else {
                            clearTimeout(me.commitStepSetTimeout)
                        }
                    }, 300)
                }
            },
        },
        methods: {
            async messageProcessing(e) {
                var me = this;
                if (e.data.message === "gitlab-login") {
                    var getUsers = e.data.data;
                    // window.localStorage.setItem("gitAuthor", getUsers.data.email);
                    // window.localStorage.setItem(
                    //     "gitUserName",
                    //     getUsers.data.username
                    // );
                    // window.localStorage.setItem("gitEmail", getUsers.data.email);
                    // window.localStorage.setItem(
                    //     "gitToken",
                    //     getUsers.data.accessToken
                    // );
                    me.gitUserName = getUsers.data.username
                    me.gitToken = getUsers.data.accessToken
                    // me.gitUsers = getUsers;
                    me.$emit("update:gitUsers", getUsers.data)
                }
            },
            async getActionLogs(){
                var me = this
                await me.git.getActionLogs(me.value.org, me.value.repo)
                .then((result) => {
                    me.$EventBus.$emit('getActionLogs', result)
                })
                .catch((e) => {
                    if(e.response.status === 401){
                        me.alertReLogin()
                    }
                    console.log(e)
                })
            },
            // sendFileToAi(){
            //     let me = this;
            //     let prompt
                
            //     let codeGenerator = getParent(me.$parent, "code-generator")

            //     var filteredCode = []
            //     codeGenerator.treeLists.forEach((item) => {
            //         if(item.bcId != null){
            //             filteredCode.push(item)
            //         }
            //     })

            //     let collectedCodes = codeGenerator.getSelectedFilesDeeply(filteredCode,{keyword: "si"})
                
            //     if(Array.isArray(collectedCodes) && collectedCodes.length > 0){
            //         prompt = collectedCodes.join("\n\n");
            //     }
                
            //     me.testFile = codeGenerator.testFile

            //     me.openAiMessageList.push({
            //         role: 'user',
            //         content: 'Here is the list of configuration code for my project: \n' + prompt
            //     })
            // },
            commonError(error) {
                let me = this;
                console.log(error)
                if(error && error.response && error.response.data && error.response.data.message){
                    if(error.response.status === 401){
                        me.alertReLogin()
                    }
                    var errText = error.response.data.message
                    if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                        errText = errText + ', ' + error.response.data.errors[0].message
                    }
                    me.showErrSnackBar(errText)
                } else {
                    me.showErrSnackBar(error.message)
                }
            },
            alertReLogin(){
                alert("You need to re-login because session is expired")
                this.showLoginCard = true
            },
            async validateRepoBranch(){
                var me = this
                const branches = await me.git.getBranch(me.value.org, me.value.repo, me.value.forkedTag)
                .then((result) => {
                    me.isVersionBranch = true;
                })
                .catch((e) => {
                    if(e.response.status === 401){
                        me.alertReLogin()
                    }
                    me.isVersionBranch = false;
                })
            },
            async createNewBranchByTagName(){
                var me = this
                if(me.value.org && me.value.repo){
                    const tagList = await me.git.getTags(me.value.org, me.value.repo)
                    .then((result) => {
                        // console.log(tagList)
                        result.data.forEach(async function (tag) {
                            if(me.value.forkedTag && tag.name == me.value.forkedTag){
                                let templateBranchData = {
                                    ref: `refs/heads/branch-${tag.name}`,
                                    sha: tag.commit.sha
                                }
                                let createBranchResult = await me.git.createBranch(me.value.org, me.value.repo, templateBranchData)
                                me.isFirstCommit = false
                                me.gitTabKey++;
                                me.gitTab = 2
                                me.gitCommitMessage = null
                                me.isPushing = false
                                me.isVersionBranch = true 

                                me.gitSnackBar = {
                                    show: true,
                                    timeout: 3000,
                                    Text: "Fork 완료되었습니다.",
                                    Color: "success",
                                    icon: "check_circle",
                                    title: "Success"
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        me.commonError(error)
                        me.isVersionBranch = false;
                    })
                }
            },
            async checkReleasedTags(){
                var me = this
                if(me.projectVersion){
                    let result = await me.git.getReleasedTag(me.value.org, me.value.repo, me.value.tag)
                    .then(() => {
                        me.isReleasedTag = true; 
                    })
                    .catch((error) => {
                        if(error.response.status === 401){
                            me.alertReLogin()
                        }
                        me.isReleasedTag = false;
                        me.gitPodError = true
                    })
                }
            },
            closeMenu(){
                this.$emit("closeMenu")
            },
            async startCommitTemplate(){
                var me = this
                me.isPushing = true
                me.commitStepText = 'Check Git Repo'
                let gitRepoMainInfo = await me.git.getMainRepo(me.gitOrgName, me.gitRepoName)
                .then((result) => {
                    setTimeout(function () {
                        me.startCommitTemplateList(me.gitRepoName)
                    }, 1000)
                })
                .catch(async (error) => {
                    if (error.response) {
                        if(error.response.data.message == "Not Found" || error.response.status == 404){
                            me.commitStepText = 'Create New Repo'
                            // let newRepoData = {
                            //     name: me.gitRepoName,
                            //     auto_init: true
                            // }
                            let addNewRepo = await me.git.createRepo(me.gitOrgName, me.gitRepoName, me.gitUserName)
                            .then(() => {
                                setTimeout(function () {
                                    me.startCommitTemplateList(me.gitRepoName)
                                }, 3000)
                            })
                            .catch((error) => {
                                me.commonError(error)
                            })
                        } else {
                            me.commonError(error)
                        }
                    }
                })
            },
            async startCommitTemplateList(forkedRepoName) {
                var me = this
                me.commitStepText = 'Started Commit'
                me.getRoofCnt = 0
                me.commitStepText = 'Check Git Repo'
                let gitRepoInfo = await me.git.getMainRepo(me.gitOrgName, me.gitRepoName)
                .then((result) => {
                    me.treesha = result.data.sha
                    me.setPushTemplateList()
                })
                .catch((error) => {
                    if (error.response) {
                        if(error.response.data.message == "Not Found" || error.response.status == 404){
                            if(forkedRepoName){
                                me.gitSnackBar.show = true
                                me.gitSnackBar.timeout = -1
                                me.gitSnackBar.Text = "A forked repository already exists. The name of the configured repository is changed to the name of the forked repository. If you want to push, proceed to push again"
                                me.gitSnackBar.Color = "warning"
                                me.gitSnackBar.icon="warning"
                                me.gitSnackBar.title="Warning"
                                me.gitRepoName = forkedRepoName
                                me.isPushing = false
                                me.commitStepText = null
                            }
                        } else {
                            me.commonError(error)
                        }
                    }
                })
            },
            async startCommitWithBitBucket(){
                var me = this
            },
            async startCommitWithGitLab(){
                var me = this
                try {
                    me.commitStepText = 'Started Commit'
                    me.isPushing = true
                    me.gitLabProjectId = null
                    me.gitLabCommitAction = []
                    if(me.projectId){
                        if(me.isServerModel){
                            if(!me.isPrivilegedUser){
                                me.value.org = me.gitOrgName
                                me.value.repo = me.gitRepoName
                                // me.setString(`db://definitions/${me.projectId}/information/gitOrgName`, me.gitOrgName)
                                // me.setString(`db://definitions/${me.projectId}/information/gitRepoName`, me.gitRepoName)
                            } else {
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitOrgName`, me.gitOrgName)
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitRepoName`, me.gitRepoName)
                            }
                        }
                    }
                    // var config = {headers: {Authorization: 'Bearer ' + me.gitToken}};
                    // Go to Gitlab

                    // 1. 유저 id 값 받아오기
                    var response1 = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/users?username=${me.gitUserName}`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                        .catch(function (error) {
                            me.commonError(error)
                        });

                    // 2. Project List
                    if(response1.data.length > 0) {
                        me.commitStepText = 'Check Git Repo'
                        var response2 = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/users/${response1.data[0].id}/projects`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                            .catch(function (error) {
                                me.commonError(error)
                            });
                        console.log(response2);

                        var dataArry = response2.data

                        dataArry.some(function (data) {
                            // console.log(data.name)
                            // repoName
                            if(data.name == me.gitRepoName) {
                                me.gitLabProjectId = data.id
                                return true;
                            }
                        })

                        if(!me.gitLabProjectId){
                            me.commitStepText = 'Create New Repo'
                            me.isNewProject = true

                            let newProjectData = {
                                name: me.gitRepoName,
                                description: me.gitRepoName,
                                path: me.gitRepoName,
                                visibility: "public",
                                // namespace_id: "42",
                                initialize_with_readme: "true"
                            }
                            console.log(me.gitHeaders);
                            var createProjectRes = await me.$http.post(`https://gitlab.${me.gitlabDomain}/api/v4/projects`, newProjectData, {headers: {Authorization: 'Bearer ' + me.gitToken}});
                            me.gitLabProjectId = createProjectRes.data.id
                        }
                        if(me.gitLabProjectId){
                            var branchName
                            if(me.isNewProject){
                                branchName = "main"
                            } else{
                                branchName = "template"
                            }
                            var getFilePathList = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/projects/${me.gitLabProjectId}/repository/tree?ref=${branchName}&id=${me.gitLabProjectId}&page=1&per_page=100&pagination=keyset&recursive=true`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                                .catch(function (error) {
                                    me.commonError(error)
                                });
                            me.gitlabFileList = me.gitlabFileList.concat(getFilePathList.data)
                            var totalPage = parseInt(getFilePathList.headers['x-total-pages'])

                            for(var i = 2; i <= totalPage; i++){
                                var getMoreFilePathList = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/projects/${me.gitLabProjectId}/repository/tree?ref=${branchName}&id=${me.gitLabProjectId}&page=${i}&per_page=100&pagination=keyset&recursive=true`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                                    .catch(function (error) {
                                        me.commonError(error)
                                    });
                                me.gitlabFileList = me.gitlabFileList.concat(getMoreFilePathList.data)
                                console.log(me.gitlabFileList)
                            }

                            me.setPushListWithGitLab()
                        }
                    } else {
                        me.showErrSnackBar(`userName Error, "${me.gitUserName}" does not exist`)
                    }
                } catch (error) {
                    console.error(error);
                }
            },
            async setPushListWithGitLab() {
                var me = this
                me.commitStepText = 'Set Git Commit Tree'
                me.gitlabFilePathList = []
                me.gitlabFileList.forEach(function (data) {
                    if(data.type == "blob"){
                        me.gitlabFilePathList.push(data.path)
                    }
                })
                console.log(me.gitlabFilePathList)
                // var config = {headers: {Authorization: 'Bearer ' + me.gitToken}};
                me.gitlabFilePathList.forEach(function (elData) {
                    if(!me.generateCodeLists.find(element => element.fullPath == elData)){
                        var action = {
                            action: "delete",
                            file_path: elData,
                        }
                        me.gitLabCommitAction.push(action)
                    }
                })
                me.generateCodeLists.forEach(function (elData) {
                    if(!me.gitlabFilePathList.find(element => element == elData.fullPath)){
                        var code
                        if(elData.code){
                            code = elData.code
                        }

                        if(!code){
                            code = 'undefined'
                        }
                        var action = {
                            action: "create",
                            file_path: elData.fullPath,
                            content: code
                        }
                        me.gitLabCommitAction.push(action)
                    } else if(!me.isNewProject && ((me.copyChangedPathLists && me.copyChangedPathLists.find(element => element.replace("for-model/","") == elData.fullPath)) || me.pushType != "Push")){
                        var code
                        if(elData.code){
                            code = elData.code
                        }

                        if(!code){
                            code = 'undefined'
                        }
                        var action = {
                            action: "update",
                            file_path: elData.fullPath,
                            content: code
                        }
                        me.gitLabCommitAction.push(action)
                    }
                })
                console.log(me.gitLabCommitAction)

                var setCommitActionList
                me.gitLabCommitAction.reduce(function(acc, current) {
                    if (acc.findIndex(({ file_path }) => file_path === current.file_path) === -1) {
                        acc.push(current);
                    }
                    setCommitActionList = acc
                    return acc;
                }, []);

                if(setCommitActionList) {
                    me.commitStepText = 'Push to Git'
                    var commitMsg
                    if(me.gitCommitMessage){
                        commitMsg = me.gitCommitMessage
                    } else {
                        commitMsg = "commit"
                    }
                    if(me.isNewProject){
                        let committoMainData = {
                            branch: "main",
                            commit_message: commitMsg,
                            actions: setCommitActionList,
                        }
                        var pushtoMainRes = await axios.post(`https://gitlab.${me.gitlabDomain}/api/v4/projects/${me.gitLabProjectId}/repository/commits`, committoMainData, { headers: me.gitHeaders })
                            .catch(function (error) {
                                me.commonError(error)
                            });
                        console.log(pushtoMainRes)
                        if(pushtoMainRes){
                            var createBranchRes = await axios.post(`https://gitlab.${me.gitlabDomain}/api/v4/projects/${me.gitLabProjectId}/repository/branches?branch=template&ref=main`, {}, { headers: me.gitHeaders })
                                .catch(function (error) {
                                    me.commonError(error)
                                });
                            console.log(createBranchRes)
                        }
                    } else {
                        let commitData = {
                            branch: "template",
                            commit_message: commitMsg,
                            actions: setCommitActionList,
                        }
                        var response4 = await axios.post(`https://gitlab.${me.gitlabDomain}/api/v4/projects/${me.gitLabProjectId}/repository/commits`, commitData, { headers: me.gitHeaders })
                            .catch(function (error) {
                                if(error.response && error.response.data && error.response.data.message){
                                    var errText = error.response.data.message
                                    if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                                        errText = errText + ', ' + error.response.data.errors[0].message
                                    }
                                    me.showErrSnackBar(errText)
                                } else {
                                    me.showErrSnackBar(error.message)
                                }
                            });
                        console.log(response4)
                    }
                    if(me.isServerModel){
                        if(!me.isPrivilegedUser){
                            me.setString(`db://definitions/${me.projectId}/information/firstCommit`, "false")
                        } else {
                            me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/firstCommit`, "false")
                        }
                    }
                    me.isPushing = false
                    me.isNewProject = false
                    me.isFirstCommit = false
                    me.gitTabKey++;
                    me.gitTab = 2
                    me.commitStepText = null
                    me.gitCommitMessage = null
                    me.gitlabFileList = []
                    me.gitlabFilePathList = []
                    me.gitLabCommitAction = []
                    me.copyChangedPathLists = []
                    me.gitSnackBar.show = true
                    me.gitSnackBar.timeout = 3000
                    me.gitSnackBar.Text = "Commit/Push 완료되었습니다."
                    me.gitSnackBar.Color = "success"
                    me.gitSnackBar.icon="check_circle"
                    me.gitSnackBar.title="Success"
                } else {
                    me.isPushing = false
                    me.commitStepText = null
                    me.gitSnackBar.show = true
                    me.gitSnackBar.timeout = -1
                    me.gitSnackBar.Text = "Nothing changed"
                    me.gitSnackBar.Color = "warning"
                    me.gitSnackBar.icon="warning"
                    me.gitSnackBar.title="Warning"
                }
            },
            async startForkTemplate() {
                var me = this
                me.isPushing = true
                try {
                    let forkData
                    if(me.gitOrgName != me.gitUserName){
                        forkData = {
                            organization: me.gitOrgName,
                            name: me.gitRepoName
                        };
                    } else {
                        forkData = {
                            name: me.gitRepoName
                        };
                    }

                    let forkRes = await axios.post(`https://api.github.com/repos/${me.templateGitPath[3]}/${me.templateGitPath[4]}/forks`, forkData, { headers: me.gitHeaders })
                        .catch(async function (error) {
                            me.commonError(error)
                        });
                    console.log(forkRes)
                    if(forkRes){
                        var forkedRepoName
                        if(forkRes.data && forkRes.data.name){
                            forkedRepoName = forkRes.data.name
                        }

                        me.startCommitTemplateList(forkedRepoName)
                    }
                } catch(e) {
                    me.showErrSnackBar(e.message)
                }
            },
            async startForkWithGitHub(){
                var me = this
                me.isPushing = true
                try {
                    if(me.projectId){
                        if(me.isServerModel){
                            if(!me.isPrivilegedUser){
                                me.value.org = me.gitOrgName
                                me.value.repo = me.gitRepoName
                                // me.setString(`db://definitions/${me.projectId}/information/gitOrgName`, me.gitOrgName)
                                // me.setString(`db://definitions/${me.projectId}/information/gitRepoName`, me.gitRepoName)
                            } else {
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitOrgName`, me.gitOrgName)
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitRepoName`, me.gitRepoName)
                            }
                        }
                    }
                    let forkData
                    if(me.gitOrgName != me.gitUserName){
                        forkData = {
                            organization: me.gitOrgName,
                            name: me.gitRepoName
                        };
                    } else {
                        forkData = {
                            name: me.gitRepoName
                        };
                    }

                    let forkRes = await axios.post(`https://api.github.com/repos/${me.gitForkOrgName}/${me.gitForkRepoName}/forks`, forkData, { headers: me.gitHeaders })
                        .catch(async function (error) {
                            me.commonError(error)
                        });
                    console.log(forkRes)
                    if(forkRes){
                        if(me.isServerModel){
                            if(!me.isPrivilegedUser){
                                me.setString(`db://definitions/${me.projectId}/information/firstCommit`, "false")
                            } else {
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/firstCommit`, "false")
                            }
                        }
                        if(me.isExistRepo){
                            me.isFirstCommit = false
                            me.gitTabKey++;
                            me.gitTab = 2
                            me.gitCommitMessage = null
                            me.isPushing = false

                            me.gitSnackBar.show = true
                            me.gitSnackBar.timeout = -1
                            me.gitSnackBar.Text = "Forked repository already exists on currently org."
                            me.gitSnackBar.Color = "warning"
                            me.gitSnackBar.icon="warning"
                            me.gitSnackBar.title="Warning"
                            me.gitRepoName = forkRes.data.name

                            if(me.projectId){
                                if(me.isServerModel){
                                    if(!me.isPrivilegedUser){
                                        me.value.repo = me.gitRepoName;
                                        // me.setString(`db://definitions/${me.projectId}/information/gitRepoName`, me.gitRepoName)
                                    } else {
                                        me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitRepoName`, me.gitRepoName)
                                    }
                                }
                            }
                        } else {
                            if(me.value.forkedTag){
                                setTimeout(() => {
                                    me.createNewBranchByTagName()
                                }, 5000)
                            } else {
                                me.isFirstCommit = false
                                me.gitTabKey++;
                                me.gitTab = 2
                                me.gitCommitMessage = null
                                me.isPushing = false

                                me.gitSnackBar.show = true
                                me.gitSnackBar.timeout = 3000
                                me.gitSnackBar.Text = "Fork 완료되었습니다."
                                me.gitSnackBar.Color = "success"
                                me.gitSnackBar.icon="check_circle"
                                me.gitSnackBar.title="Success"
                            }
                        }
                    }
                } catch(e) {
                    me.showErrSnackBar(e.message)
                }
            },
            async startForkWithGitLab(){
                var me = this
                try {
                    me.isPushing = true
                    if(me.projectId){
                        if(me.isServerModel){
                            if(!me.isPrivilegedUser){
                                me.value.org = me.gitOrgName
                                me.value.repo = me.gitRepoName
                                // me.setString(`db://definitions/${me.projectId}/information/gitOrgName`, me.gitOrgName)
                                // me.setString(`db://definitions/${me.projectId}/information/gitRepoName`, me.gitRepoName)
                            } else {
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitOrgName`, me.gitOrgName)
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitRepoName`, me.gitRepoName)
                            }
                        }
                    }
                    let forkData = {
                        path: me.gitRepoName,
                        name: me.gitRepoName
                    };

                    let forkRes = await axios.post(`https://gitlab.${me.gitlabDomain}/api/v4/projects/13/fork`, forkData, { headers: me.gitHeaders })
                        .catch(function (error) {
                            me.commonError(error)
                        });
                    console.log(forkRes)
                    if(forkRes){
                        if(me.isServerModel){
                            if(!me.isPrivilegedUser){
                                me.setString(`db://definitions/${me.projectId}/information/firstCommit`, "false")
                            } else {
                                me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/firstCommit`, "false")
                            }
                        }
                        me.isFirstCommit = false
                        me.gitTabKey++;
                        me.gitTab = 2
                        me.gitCommitMessage = null
                        me.isPushing = false
                        me.gitSnackBar.show = true
                        me.gitSnackBar.timeout = 3000
                        me.gitSnackBar.Text = "Fork 완료되었습니다."
                        me.gitSnackBar.Color = "success"
                        me.gitSnackBar.icon="check_circle"
                        me.gitSnackBar.title="Success"
                    }
                } catch(e) {
                    me.showErrSnackBar(e.message)
                }
            },
            async setGitInfo(){
                var me = this
                if(me.isOnPrem){
                    me.gitlabDomain = window.GITLAB ? window.GITLAB : window.location.host.replace("www.", "")
                    // me.gitlabDomain = "msastudy.io"

                    if(localStorage.getItem('gitToken')){
                        me.gitToken = localStorage.getItem('gitToken')
                    }

                    me.gitHeaders = {
                        Authorization: 'Bearer ' + me.gitToken,
                        Accept: 'application/json'
                    }

                    if(localStorage.getItem('gitUserName')){
                        me.gitUserName = localStorage.getItem('gitUserName')
                    }

                    if(localStorage.getItem('picture')){
                        me.gitPicture = localStorage.getItem('picture')
                    }

                    if(localStorage.getItem('loginType') && localStorage.getItem('loginType') == 'gitlab'){
                        me.isGitLogin = true
                    }
                } else {
                    if(localStorage.getItem('gitToken')){
                        me.gitToken = localStorage.getItem('gitToken')
                    }

                    me.gitHeaders = {
                        Authorization: 'token ' + me.gitToken,
                        Accept: 'application/vnd.github+json'
                    }

                    if(localStorage.getItem('gitUserName')){
                        me.gitUserName = localStorage.getItem('gitUserName')
                    }

                    if(localStorage.getItem('picture')){
                        me.gitPicture = localStorage.getItem('picture')
                    }

                    if(localStorage.getItem('loginType') && localStorage.getItem('loginType') == 'github'){
                        me.isGitLogin = true
                    }

                }
                if(!me.gitUserName || !me.gitToken){
                    if(!me.isGitLogin) me.gitTab = 0
                    // me.gitMenuMode = "settings"
                }
                if(localStorage.getItem("forkedModelInfo")){
                    if(localStorage.getItem("forkedModelInfo").includes('gitOrgName')){
                        var beforeModelInfo = JSON.parse(JSON.parse(localStorage.getItem("forkedModelInfo")))
                        if(beforeModelInfo && beforeModelInfo.org != null){
                            me.gitForkOrgName = beforeModelInfo.org
                            me.gitForkRepoName = beforeModelInfo.repo
                            if(me.isServerModel){
                                me.value.forkedOrg = me.gitForkOrgName
                                me.value.forkedRepo = me.gitForkRepoName
                                // me.setString(`db://definitions/${me.projectId}/information/forkedByModelGitOrgName`, me.gitForkOrgName)
                                // me.setString(`db://definitions/${me.projectId}/information/forkedByModelGitRepoName`, me.gitForkRepoName)
                            }
                        }
                    }

                    localStorage.removeItem("forkedModelInfo")
                }

                me.copyChangedPathLists = JSON.parse(JSON.stringify(me.changedPathListsForGit))
                me.gitRepoName = me.core.filterProjectName (me.projectName);
                //
                if(me.value && !me.isPrivilegedUser){
                    if(me.value.repo){
                        me.gitRepoName = me.value.repo
                        me.gitForkRepoName = me.value.repo
                    } else if(me.projectName){
                        me.gitRepoName = me.core.filterProjectName (me.projectName);
                    }

                    me.gitOrganizations.push(me.gitUserName)

                    if(me.value.org){
                        me.gitOrgName = me.value.org
                        if(me.gitOrgName != me.gitUserName){
                            me.gitOrganizations.push(me.gitOrgName)
                        }
                    } else {
                        me.gitOrgName = me.gitUserName
                    }

                    if(me.information.firstCommit == "false"){
                        me.isFirstCommit = false
                    }

                    if(me.isFirstCommit){
                        if(me.information.forkOrigin){
                            if(me.value.forkedOrg && me.value.forkedRepo){
                                me.gitForkOrgName = me.value.forkedOrg
                                me.gitForkRepoName = me.value.forkedRepo
                            }
                        }
                    }
                    if(!me.information.useIdeItem){
                        if(me.isServerModel){
                            me.setString(`db://definitions/${me.projectId}/information/useIdeItem`, 'gitpod')
                        }
                    } else if(me.information.useIdeItem == 'theia'){
                        me.usegitPod = false
                    }
                } else if(me.isPrivilegedUser){
                    if(me.information.permissions[me.userInfo.uid].firstCommit == "false"){
                        me.gitOrgName = me.information.permissions[me.userInfo.uid].gitOrgName
                        me.gitOrganizations.push(me.gitOrgName)
                        if(me.information.permissions[me.userInfo.uid].gitRepoName){
                            me.gitRepoName = me.information.permissions[me.userInfo.uid].gitRepoName
                        }
                    } else {
                        me.gitOrganizations = []
                        me.gitOrgName = me.gitUserName
                        me.gitOrganizations.push(me.gitOrgName)
                        if(me.information && me.projectName){
                            me.gitRepoName = me.core.filterProjectName (me.projectName);
                        }
                        if(me.information.firstCommit == "false"){
                            me.gitForkOrgName = me.value.org
                            me.gitForkRepoName = me.value.repo
                        }
                    }
                    me.setPrivilegedUserGitInfo = true
                } else {
                    me.gitOrgName = me.gitUserName
                    me.gitOrganizations.push(me.gitOrgName)
                    me.gitRepoName = me.core.filterProjectName (me.projectName);

                    if(me.isServerModel){
                        me.setString(`db://definitions/${me.projectId}/information/useIdeItem`, 'gitpod')
                    }
                }
                if(me.value){
                    me.value.org = me.gitOrgName
                    me.value.repo = me.gitRepoName
                }

                me.gitTabKey++;
                if(((me.isOwnModel || me.isPrivilegedUser) && !me.isFirstCommit) || me.editTemplateMode){
                    me.gitTab = 1
                } else {
                    me.gitTab = 0
                }

                if(me.githubTokenError){
                    me.gitTab = 0
                }

                if(me.gitUserName && me.gitOrgName && me.gitToken){
                    me.checkRepoExist()
                    me.checkReleasedTags();
                    me.validateRepoBranch();
                }
                if(me.editTemplateMode){
                    me.templateGitPath = me.templateRepoName.split('/')
                    if(me.templateRepoName.includes('/')){
                        me.gitRepoName = me.templateGitPath[4]
                    } else {
                        me.gitRepoName = me.templateRepoName
                    }
                    if(me.isCustomTemplate){
                        me.gitOrganizations.push(me.templateGitPath[3])
                        me.gitOrgName = me.templateGitPath[3]
                    } else {
                        me.gitOrgName = this.gitUserName
                        // me.gitRepoName = me.templateRepoName
                    }
                    if(me.gitRepoName.includes("template-")){
                        me.isTemplate = true
                    } else {
                        me.isTemplate = false
                        me.autoApplyTemplate = false
                    }
                }
                if(me.ShowCreateRepoTab){
                    me.gitSnackBar.show = true
                    me.gitSnackBar.timeout = -1
                    me.gitSnackBar.Text = "The target repository does not exist."
                    me.gitSnackBar.multiLineText = "Click the Create button to create the github repository and push your code."
                    me.gitSnackBar.Color = "info"
                    me.gitSnackBar.icon="info"
                    me.gitSnackBar.title="Instruction"
                    me.$emit("settingDone")
                }
            },
            openGuide(){
                window.open(`https://github.com/TheOpenCloudEngine/msaschool/wiki/Github-Personal-Access-Token-%EB%B0%9C%ED%96%89-%EB%B0%A9%EB%B2%95`, '_blank');
            },
            async checkRepoExist(){
                var me = this
                
                let gitRepo = await me.git.getRepo(me.gitOrgName, me.gitRepoName)
                    .then((result) => {
                        me.isExistRepo = true
                        me.isExistRepoMessage = "The repository name already exist"
                    })
                    .catch(async function (error) {
                        if(error.response.status === 401){
                            me.alertReLogin()
                        }
                        me.isExistRepo = false
                        me.isExistRepoMessage = null
                    }); 

                // TODO: Gitlab 부분 -> 작업 예정
                // if(me.isOnPrem){
                //     var gitRepoList
                //     if((this.gitOrgName != this.gitUserName) && this.gitlabGroupIdList[this.gitOrgName]){
                //         gitRepoList = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/groups/${this.gitlabGroupIdList[this.gitOrgName]}/projects`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                //             .catch(function (error) {
                //                 if(error.response && error.response.data && error.response.data.message){
                //                     var errText = error.response.data.message
                //                     if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                //                         errText = errText + ', ' + error.response.data.errors[0].message
                //                     }
                //                     me.showErrSnackBar(errText)
                //                 } else {
                //                     me.showErrSnackBar(error.message)
                //                 }
                //             });
                //     } else {
                //         gitRepoList = await axios.get(`https://gitlab.${me.gitlabDomain}/api/v4/users/${this.gitOrgName}/projects`, {headers: {Authorization: 'Bearer ' + me.gitToken}})
                //             .catch(function (error) {
                //                 if(error.response && error.response.data && error.response.data.message){
                //                     var errText = error.response.data.message
                //                     if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                //                         errText = errText + ', ' + error.response.data.errors[0].message
                //                     }
                //                     me.showErrSnackBar(errText)
                //                 } else {
                //                     me.showErrSnackBar(error.message)
                //                 }
                //             });
                //     }
                //     if(gitRepoList){
                //         var repoList = []
                //         gitRepoList.data.forEach(function (repoInfo) {
                //             repoList.push(repoInfo.name)
                //         })
                        
                //         if(repoList.length > 0){
                //             if(repoList.find(repo => repo == this.gitRepoName)){
                //                 me.isExistRepo = true
                //                 me.isExistRepoMessage = "The repository name already exist"
                //             } else {
                //                 me.isExistRepo = false
                //                 me.isExistRepoMessage = null
                //             }
                //         }
                //     }

                // }
                // me.repoFieldRenderKey++;
            },
            async RepoNameChanged(){
                this.gitTreeList = []
                this.checkRepoExist()
            },
            async OrgNameChanged(){
                var me = this
                me.checkRepoExist()
            },
            async getGitOrganizations(){
                var me = this
                if(me.firstTimeGet){
                    // After
                    let gitOrgList = me.git.getOrgList()
                    .then((result) => {
                        me.gitOrganizations = result.gitOrganizationsList;
                        me.gitlabGroupIdList = result.gitlabGroupIdList
                    })
                    .catch((error) => {
                        me.commonError(error)
                    })
                    me.firstTimeGet = false
                }
            },
            showErrSnackBar(err){
                var me = this
                me.isPushing = false
                me.commitStepText = null
                me.gitSnackBar.timeout = -1
                me.gitSnackBar.show = true
                me.gitSnackBar.Text = err
                me.gitSnackBar.Color = "error"
                me.gitSnackBar.icon="error"
                me.gitSnackBar.title="Error"
            },
            writeUserData(userId, name, email, imageUrl, provider) {
                // var database = firebase.database();
                var authorized = 'admin';
                if (email.includes('@uengine.org')) {
                    authorized = 'admin'
                } else {
                    authorized = 'student'
                }

                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                    authorized: authorized,
                    loginDate: Date.now()
                }
                var eObj = {
                    uid: userId,
                    userName: name,
                    profile_picture: imageUrl,
                    email: email,
                }

                this.putObject(`db://users/${userId}`, obj)
                //새로운 로그인 유저
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    this.putObject(`db://enrolledUsers/${convertEmail}`, eObj)
                }

            },
            isGitLoginComplete(){
                var me = this
                me.gitUserName = localStorage.getItem('gitUserName')
                me.gitToken = localStorage.getItem('gitToken')
                me.gitPicture = localStorage.getItem('picture')
                me.isGitLogin = true
                // me.gitMenuMode = "push"
                if(!me.isGitLogin) me.gitTab = 1
            },
            copytoClipBoard(paramKeys) {
                var me = this
                let copyValue
                if(paramKeys == "gitRepo_link"){
                    copyValue = document.querySelector("#copy-gitRepo-link")
                } else if(paramKeys == "gitMerge_Command"){
                    copyValue = document.querySelector("#copy-gitMerge-command")
                } else if(paramKeys == "gitpod_url"){
                    copyValue = document.querySelector("#copy-gitpod-url")
                } else if(paramKeys == "gitClone_Command"){
                    copyValue = document.querySelector("#copy-gitClone-command")
                } 
                document.body.appendChild(copyValue);
                copyValue.select();
                var successful = document.execCommand('copy');
                if(successful) {
                    me.isCopied = paramKeys
                    setTimeout(() => {
                        me.isCopied = null
                    }, 1500)
                }
                if(paramKeys == 'gitRepo_link'){
                    me.copyPushKey++;
                } else {
                    me.copyInfoKey++;
                }
            },
            openRefGitRepo(){
                window.open(this.gitRefRepoUrl, '_blank');
            },
            openGitRepo(){
                window.open(this.gitRepoUrl, '_blank');
            },
            openGithubEditorRepo() {
                window.open(this.openGithubEditorUrl, '_blank');
            },
            openIDE(type) {
                // TODO: 추후 gitpod 설치 시 확인
                var me = this
                if (me.isLogin) {
                    var targetUrl
                    if(type == 'gitpod'){
                        if(me.showOriginMode){
                            targetUrl = me.isVersionBranch ? (me.releaseTagPath == '' ? `${me.gitpodUrlOrigin}/tree/branch-${me.value.forkedTag}` : `${me.gitpodUrlOrigin.replace(me.releaseTagPath, "")}/tree/branch-${me.value.forkedTag}`) : me.gitpodUrlOrigin
                            window.open(targetUrl, '_blank');
                        } else {
                            targetUrl = me.isVersionBranch ? (me.releaseTagPath == '' ? `${me.gitpodUrl}/tree/branch-${me.value.forkedTag}` : `${me.gitpodUrl.replace(me.releaseTagPath, "")}/tree/branch-${me.value.forkedTag}`) : me.gitpodUrl 

                            window.open(targetUrl, '_blank');
                        }
                    } else {
                        if(this.isFirstCommit && this.value){
                            if(me.value.forkedOrg  && me.value.forkedRepo){
                                targetUrl = `https://github.com/codespaces/new?template_repository=${me.value.forkedOrg}/${me.value.forkedRepo}`
                            } else {
                                targetUrl = `https://github.com/codespaces/new?template_repository=${me.gitOrgName}/${me.gitRepoName}`
                            }
                        } else {
                            targetUrl = `https://github.com/codespaces/new?template_repository=${me.gitOrgName}/${me.gitRepoName}`
                        }
                        window.open(targetUrl, '_blank');
                    }
                } else {
                    me.$EventBus.$emit('showLoginDialog')
                }
            },
            changedUseGitPodStatus(){
                var me = this
                if(me.isServerModel){
                    if(me.usegitPod){
                        me.setString(`db://definitions/${me.projectId}/information/useIdeItem`, 'gitpod')
                    } else {
                        me.setString(`db://definitions/${me.projectId}/information/useIdeItem`, 'theia')
                    }
                }
            },
            openIdeAccept(){
                var me = this
                me.openIde = true
            },
            logoutToGit(){
                var me = this
                localStorage.removeItem("gitOrgName");
                localStorage.removeItem("gitUserName");
                localStorage.removeItem("gitToken");
                localStorage.removeItem("loginType");

                me.isGitLogin = false
                me.gitOrgName = null
                me.gitUserName = null
                me.gitToken = null
                me.gitPicture = null
            },
            startFork(){
                var me = this
                if(me.isOnPrem){
                    me.startForkWithGitLab()
                } else {
                    me.startForkWithGitHub()
                }
            },
            startCommit(){
                var me = this
                if(me.editTemplateMode){
                    if(me.templateGitPath && me.templateGitPath.length > 1){
                        me.startForkTemplate()
                    } else {
                        // 새로 생성한 템플릿 푸시 로직 
                        me.startCommitTemplate()
                    }
                } else {
                    // TODO: 통합으로 변경
                    // if(me.isOnPrem){
                    //     me.startCommitWithGitLab()
                    // } else if(me.isBitbucket){
                    //     me.startCommitWithBitBucket()
                    // } else {
                    //     me.startCommitWithGitHub()
                    // }
                    me.startCommitWithGit()
                }
            },
            async startCommitWithGit() {
                var me = this
                me.gitTreeList = []
                let gitTreeList = []
                me.commitStepText = 'Started Commit'

                if(me.projectId){
                    if(me.isServerModel){
                        if(!me.isPrivilegedUser){
                            me.value.org = me.gitOrgName
                            me.value.repo = me.gitRepoName
                            me.setString(`db://definitions/${me.projectId}/information/firstCommit`, "false")
                            // me.setString(`db://definitions/${me.projectId}/information/gitOrgName`, me.gitOrgName)
                            // me.setString(`db://definitions/${me.projectId}/information/gitRepoName`, me.gitRepoName)
                        } else {
                            me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitOrgName`, me.gitOrgName)
                            me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/gitRepoName`, me.gitRepoName)
                            me.setString(`db://definitions/${me.projectId}/information/permissions/${me.userInfo.uid}/firstCommit`, "false")
                        }
                    }
                }
                me.isPushing = true
                me.firstCommit = false
                me.pushTree = []
                me.removeTree = []
                me.getRoofCnt = 0
                me.commitStepText = 'Check Git Repo'
                let gitRepoInfo = await me.git.getTemplateBranch(me.gitOrgName, me.gitRepoName)
                .then(async (result) => {
                    if(!me.firstCommit && result) {
                        me.commitStepText = 'Get Git Repo'
                        me.treesha = result.data.sha
                        if(result.data.tree) {
                            let treeOptions = {
                                tree: result.data.tree,
                                name: result.data.name,
                                repo: me.gitRepoName,
                                org: me.gitOrgName
                            }
                            gitTreeList = await me.git.getFiles(treeOptions)
                            .then(async function(files) {
                                me.commitStepText = 'Set Git Commit Tree'
                                let options = {
                                    gitTree: files,
                                    generateCodeLists: me.generateCodeLists,
                                    copyChangedPathLists: me.copyChangedPathLists,
                                    pushType: me.pushType,
                                    isOne: me.isOneBCModel,
                                    onlyOneBcId: me.onlyOneBcId,
                                    org: me.gitOrgName,
                                    repo: me.gitRepoName
                                }
                                let setTreeList = await me.git.setPushList(options)
                                .then(async function (list) {
                                    me.commitStepText = 'Commit to Git'
                                    if(!list) {
                                        me.isPushing = false
                                        me.commitStepText = null
                                        me.gitSnackBar.show = true
                                        me.gitSnackBar.timeout = -1
                                        me.gitSnackBar.Text = "Nothing changed"
                                        me.gitSnackBar.Color = "warning"
                                        me.gitSnackBar.icon="warning"
                                        me.gitSnackBar.title="Warning"
                                    } else {
                                        let commitResult = await me.git.commit(me.gitOrgName, me.gitRepoName, "template", list, me.firstCommit)
                                        .then(async (commit) => {
                                            me.commitStepText = 'Push to Git'
                                            let options = {
                                                org: me.gitOrgName, 
                                                repo: me.gitRepoName, 
                                                commitData: commit, 
                                                list: list,
                                                branch: "template"
                                            }
                                            let pushResult = await me.git.push(options)
                                            .then(function () {
                                                me.commitStepText = null
                                                me.isPushing = false
                                                me.firstCommit = false
                                                me.gitTab = 1
                                                me.gitCommitMessage = null
                                                me.copyChangedPathLists = []
                                                me.gitSnackBar.show = true
                                                me.gitSnackBar.timeout = 3000
                                                me.gitSnackBar.Text = "Commit/Push 완료되었습니다."
                                                me.gitSnackBar.Color = "success"
                                                me.gitSnackBar.icon="check_circle"
                                                me.gitSnackBar.title="Success"
                                                setTimeout(() => {
                                                    me.getActionLogs()
                                                }, 5000)
                                            })
                                        })
                                        .catch((error) =>{
                                            me.commonError(error)
                                        })
                                    }
                                })
                            })
                            .catch(error => {
                                me.commonError(error)
                            })
                        }
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        if(error.response.data.message == "Not Found" || error.response.status == 404) {
                            me.isFirstCommit = true
                            me.firstCommit = true
                            let gitRepoMainInfo = me.git.getMainRepo(me.gitOrgName, me.gitRepoName)
                            .then((result) => {
                                setTimeout(function () {
                                    me.setPushListWithGit(gitTreeList)
                                }, 1000)
                            })
                            .catch(async (error) => {
                                if (error.response) {
                                    if(error.response.data.message == "Not Found" || error.response.status == 404) {
                                        me.commitStepText = 'Create New Repo'
                                        let newRepoData = {
                                            name: me.gitRepoName,
                                            auto_init: true
                                        }
                                        let addNewRepo = await me.git.createRepo(me.gitOrgName, me.gitRepoName, me.gitUserName)
                                        .then((result) => {
                                            setTimeout(function () {
                                                me.setPushListWithGit()
                                            }, 3000)
                                        })
                                        .catch((error) => {
                                            me.commonError(error)
                                        })
                                    } else {
                                        me.commonError(error)
                                    }
                                }
                            })
                        } else {
                            me.commonError(error)
                        }
                    }
                })
            },
            async setPushTemplateList(){
                var me = this
                me.commitStepText = 'Set Git Commit Tree'
                var pushTemplatTree = []
                var pushCnt = 0
                Object.keys(me.editTemplateList).forEach(async function (tmpPath) {
                    var code
                    if(me.editTemplateList[tmpPath]){
                        code = me.editTemplateList[tmpPath].code
                    }
                    if(!code){
                        code = 'undefined'
                    }
                    let data = {
                        content: code,
                        encoding: 'utf-8',
                    };
                    pushCnt++;
                    let res = me.git.pushFile()
                    .then(async result => {
                        let pushData = {
                            path: tmpPath,
                            mode:"100644",
                            type:"blob",
                            sha: result.data.sha
                        }
                        pushTemplatTree.push(pushData)
                        pushCnt--;
                        if(pushCnt == 0){
                            me.pushTemplateListTo(pushTemplatTree)
                        }
                    })
                    .catch((error) => {
                        me.commonError(error)
                    })
                });
            },
            async setPushListWithGit(gitTreeList) {
                var me = this
                if(gitTreeList == null) {
                    gitTreeList = []
                }
                let options = {
                    gitTree: gitTreeList,
                    generateCodeLists: me.generateCodeLists,
                    copyChangedPathLists: me.copyChangedPathLists,
                    pushType: me.pushType,
                    isOne: me.isOneBCModel,
                    onlyOneBcId: me.onlyOneBcId,
                    org: me.gitOrgName,
                    repo: me.gitRepoName
                }
                let setTreeList = await me.git.setPushList(options)
                .then(async function (list) {
                    console.log(list)
                    me.commitStepText = 'Commit to Git'
                    if(!list) {
                        me.isPushing = false
                        me.commitStepText = null
                        me.gitSnackBar.show = true
                        me.gitSnackBar.timeout = -1
                        me.gitSnackBar.Text = "Nothing changed"
                        me.gitSnackBar.Color = "warning"
                        me.gitSnackBar.icon="warning"
                        me.gitSnackBar.title="Warning"
                    } else {
                        let commitResult = await me.git.commit(me.gitOrgName, me.gitRepoName, "main", list, me.firstCommit)
                        .then(async (commit) => {
                            me.commitStepText = 'Push to Git'
                            let options = {
                                org: me.gitOrgName, 
                                repo: me.gitRepoName, 
                                commitData: commit, 
                                list: list,
                                branch: "main"
                            }
                            let pushResult = await me.git.push(options)
                            me.isPushing = false
                            me.firstCommit = false
                            me.gitTab = 1
                            me.gitCommitMessage = null
                            me.copyChangedPathLists = []
                            me.gitSnackBar.show = true
                            me.gitSnackBar.timeout = 3000
                            me.gitSnackBar.Text = "Commit/Push 완료되었습니다."
                            me.gitSnackBar.Color = "success"
                            me.gitSnackBar.icon="check_circle"
                            me.gitSnackBar.title="Success"
                            setTimeout(() => {
                                me.getActionLogs()
                            }, 5000)
                        })
                        .catch((error) =>{
                            me.commonError(error)
                        })
                    }
                })
            },
            async forcePush(){
                var me = this
                me.gitSnackBar.show = false
                me.isPushing = true
                me.pushType = 'Force Push'
                me.setPushListWithGit()
            },
            async pushTemplateList(treeList) {
                var me = this
                me.commitStepText = 'Commit to Git'
                let commitResult = await me.git.commit(me.gitOrgName, me.gitRepoName, "main", treeList, me.firstCommit)
                .then(async commit => {
                    me.commitStepText = 'Push to Git'
                    let options = {
                        org: me.gitOrgName, 
                        repo: me.gitRepoName, 
                        commitData: commit, 
                        list: list,
                        branch: "template"
                    }
                    let pushResult = await me.git.push(options)
                    .then(function(push) {
                        console.log(patchMainResult)

                        me.commitStepText = null
                        me.isPushing = false
                        me.gitTab = 1
                        me.gitCommitMessage = null
                        me.copyChangedPathLists = []
                        me.gitSnackBar.show = true
                        me.gitSnackBar.timeout = 3000
                        me.gitSnackBar.Text = "Commit/Push 완료되었습니다."
                        me.gitSnackBar.Color = "success"
                        me.gitSnackBar.icon="check_circle"
                        me.gitSnackBar.title="Success"

                        if(me.autoApplyTemplate){
                            var platformPath = me.git.getUrl(me.gitOrgName, me.gitRepoName)
                            me.$emit("successToPush", platformPath)
                        } else {
                            if(me.isTemplate){
                                me.autoApplyTemplate = true 
                            }
                        }
                    })
                    .catch(error => {
                        me.commonError(error)
                    })
                })
                .catch(error => {
                    me.commonError(error)
                })
            },
        }
    }
</script>


<style>
.snackbar-style .v-sheet{
    top:-170px;
}
</style>