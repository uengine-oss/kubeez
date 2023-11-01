<template>
    <div style="height: 94vh;">
        <v-card flat style="height: 100vh; z-index:2;">
            <v-card-title style="min-height: 65px;">
                <v-row style="margin:-30px 0px 0px 1px;">
                    <div v-if="!isGeneratorDone">
                        <v-progress-circular
                                size="15"
                                :width="3"
                                style="margin:-4px 0px 0px 0px;"
                                indeterminate
                                color="primary"
                        ></v-progress-circular>
                    </div>
                    <div v-else>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-on="on"
                                        v-bind="attrs"
                                        icon 
                                        class="code-preview-left-re-size-btn"
                                        @click="refreshCallGenerate()"
                                        style="z-index:1; "
                                >
                                    <v-icon size="20" style="margin-left: -5px;">mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>Refresh</span>
                        </v-tooltip>
                    </div>
                    <div v-if="isGeneratorDone" class="gs-code-title">
                        - {{ openCodeFileName }}
                    </div>
                </v-row>
                
                <v-row v-if="isGeneratorDone"
                        style="z-index: 1;
                            position: absolute;
                            top: 20px;
                            left: 29px;"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="code-preview-left-re-size-btn"
                                    fab
                                    icon 
                                    @click="codePreviewLeftReSize()"
                                    v-bind="attrs"
                                    v-on="on"
                            >
                                <v-icon size="22">mdi-menu</v-icon>
                            </v-btn>
                        </template>
                        <span>left menu fold & unfold</span>
                    </v-tooltip>
                    <div>
                        <v-menu v-model="gitMenu"
                                :close-on-click="false"
                                :close-on-content-click="false"
                                offset-y
                        >
                            <template v-slot:activator="{ on: menu, attrs }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-btn
                                                :disabled="!isGeneratorDone"
                                                class="code-preview-left-re-size-btn"
                                                icon x-small
                                                v-bind="attrs"
                                                v-on="{ ...tooltip, ...menu }"
                                                style="margin:-5px 0px 0px 5px;"
                                        >
                                            <v-icon size="20" :color="gitMenu ? 'primary':''">
                                                mdi-git
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Push to Git</span>
                                </v-tooltip>
                            </template>

                            <div v-if="gitMenu" :key="gitMenuRenderKey">
                                <gitAPIMenu
                                        v-model="value.scm"
                                        :editTemplateMode="false"
                                        @closeMenu="gitMenu = false"
                                        @openIDE="openProjectIDE($event)"
                                        @settingDone="ShowCreateRepoTab = false"
                                        @closeGitMenu="closeGitMenu"
                                        :information="projectInformation"
                                        :isOnPrem="isOnPrem"
                                        :projectId="modelingProjectId"
                                        :projectName="projectName"
                                        :git-users="gitUsers"
                                        :isListSettingDone="isGeneratorDone"
                                        :isMineProject="isMineProject"
                                        :changedPathListsForGit="changedPathListsForGit"
                                        :generateCodeLists="filteredPrettierCodeLists"
                                        :ShowCreateRepoTab="ShowCreateRepoTab"
                                        :isServerModeling="isServerModeling"
                                        :isVersionMode="isVersionMode"
                                        :githubTokenError="githubTokenError"
                                        :isOneBCModel="isOneBCModel"
                                        :onlyOneBcId="onlyOneBcId"
                                />
                            </div>
                        </v-menu>
                    </div>

                    <div>
                        <v-menu v-model="openaiPopup"
                                :close-on-click="false"
                                :close-on-content-click="false"
                                offset-y
                        >
                            <template v-slot:activator="{ on: menu, attrs }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-btn :loading="startGenerate"
                                                @click="stopGenerate()"
                                                :disabled="!isGeneratorDone"
                                                class="code-preview-left-re-size-btn"
                                                icon x-small
                                                v-bind="attrs"
                                                v-on="{ ...tooltip, ...menu }"
                                                style="margin:-9px 0px 0px 6px;"
                                        >
                                            <v-icon size="20" :color="openaiPopup ? 'primary':''">
                                                mdi-auto-fix
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <span>input openai token</span>
                                </v-tooltip>
                            </template>
                        </v-menu>
                    </div>

                    <v-tooltip bottom v-if="editableTemplate">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on"
                                    v-bind="attrs"
                                    icon 
                                    fab 
                                    @click="openTemplateEditor()"
                                    :color="editTemplateMode ? 'primary' : ''"
                                    class="code-preview-left-re-size-btn"
                                    style="margin-left:5px;"
                            >
                                <v-icon size="20">mdi-code-braces</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Template</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="editableTemplate">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" 
                                    v-bind="attrs"
                                    :disabled="isLoadingExpectedTemplate"
                                    icon 
                                    fab 
                                    @click="testTemplateModel()"
                                    :color="openExpectedTemplateTestDialog ? 'primary' : ''"
                                    class="code-preview-left-re-size-btn"
                                    style="margin-left:5px;"
                            >
                                <v-icon v-if="!startCheckDiff" size="20">mdi-code-tags-check</v-icon>
                                <v-icon v-else size="20">mdi-spin mdi-loading</v-icon>
                            </v-btn>
                        </template>
                        <span>Test actual template using expected template</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" 
                                    v-bind="attrs"
                                    :disabled="!existChangedFile || !isGeneratorDone"
                                    icon
                                    fab 
                                    @click="onOffChangedPathLists()"
                                    class="code-preview-left-re-size-btn"
                                    style="margin-top:-3px;"
                            >
                                <div>
                                    <v-icon size="20" :color="showChangedPathLists ? 'primary':''"
                                    >mdi-filter</v-icon>
                                </div>
                            </v-btn>
                        </template>
                        <span>Changed File</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" 
                                    v-bind="attrs"
                                    icon fab
                                    @click="onOffDesignPatterns()"
                                    class="code-preview-left-re-size-btn"
                                    style="margin:-2px 0px 0px 4px;"
                            >
                                <div>
                                    <Icon :color="showDesignPatterns ? 'rgb(25,118,210)' : '' "
                                            style = "width:20px; height:20px;"
                                            icon="mdi:file-document-check-outline"
                                    />
                                </div>
                            </v-btn>
                        </template>
                        <span>Design Patterns</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <div>
                                <v-btn v-on="on" class="code-preview-left-re-size-btn"
                                        icon fab @click="downloadArchive()"
                                        style="margin:-12px 0px 0px 8px;"
                                >
                                    <div>
                                        <slot name="downloadArchive">
                                            <v-icon size="22">
                                                mdi-folder-download
                                            </v-icon>
                                        </slot>
                                    </div>
                                </v-btn>
                            </div>
                        </template>
                        <span>Download Archive</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on"
                                    v-bind="attrs" 
                                    fab
                                    icon 
                                    class="code-preview-left-re-size-btn"
                                    @click="searchForContent.onOff = !searchForContent.onOff"
                                    style="margin:-3px 0px 0px 8px;"
                            >
                                <v-icon size="22">mdi-magnify</v-icon>
                            </v-btn>
                        </template>
                        <span>Search</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on"
                                    v-bind="attrs"
                                    fab
                                    icon
                                    class="code-preview-left-re-size-btn"
                                    @click="onDiffMode()"
                                    style="margin:0px 0px 0px 8px;"
                            >
                                <Icon icon="codicon:diff" 
                                        style="font-size: smaller;"
                                        :color="diffMode ? 'rgb(25,118,210)' : '' "
                                />
                            </v-btn>
                        </template>
                        <span>Diff Mode</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on"
                                    v-bind="attrs"
                                    fab
                                    icon
                                    class="code-preview-left-re-size-btn"
                                    @click="showGptDialog()"
                                    style="margin:-3px 0px 0px 8px;"
                            >
                                <v-icon size="22">mdi-file-send</v-icon>
                            </v-btn>
                        </template>
                        <span>Explain Project</span>
                    </v-tooltip>
                </v-row>
            </v-card-title>
            
            <v-divider></v-divider>

            <v-card-text style="height: 100%;">
                <separate-panel-components
                        :min="separatePanelInfo.min"
                        :max="separatePanelInfo.max"
                        :triggerLength="2"
                        :paneLengthPercent.sync="separatePanelInfo.current"
                        :inBoundSeparatePanel="true"
                >
                    <template v-slot:one>
                        <div style="height: 100%; margin-top: 7px;">
                            <!-- TREE  -->
                            <v-col id="scroll-target"
                                    class="code-preview-left-re-size"
                                    style="display: flex; margin-top:-15px; height: 100%; margin: 0; padding: 0;"
                                    :style="editTemplateMode ? 'overflow-x:hidden !important;':''"
                            >
                                <div class="event-storming-treeview-height"
                                        style="min-width: 0px;
                                            margin-right: 0px;
                                            width: 100%;
                                            margin-left: -15px;
                                            overflow-y: auto;
                                            padding-right: 15px;"
                                >
                                    <v-menu v-model="showTemplateTypeList"
                                            offset-y
                                            class="my-2"
                                            :close-on-content-click="false"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-row style="position: relative; top: 0; margin: 0px 0px 5px 12px; color:gray;">
                                                <div>Type: </div>
                                                <v-chip x-small
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        style="left: 40px; top:3px; position: absolute;"
                                                        @click="showTemplateTypeList = !showTemplateTypeList"
                                                >
                                                    {{ defaultTemplate }}
                                                </v-chip>
                                            </v-row>
                                        </template>
                                        <v-list>
                                            <v-list-item-group v-model="selectedTemplateType">
                                                <v-list-item
                                                        v-for="(tempItem, index) in templateTypeList"
                                                        :key="index"
                                                        link
                                                        @click="changeTemplate(tempItem)"
                                                >
                                                    {{ tempItem }}
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-menu>

                                    <div v-if="isGeneratorDone">
                                        <v-list nav dense style="margin:-15px -30px 0px -10px;">
                                            <v-list-group :class="editTemplateMode ? 'gs-source-tree-v-list-group' : ''" :value="true">
                                                <template v-slot:activator>
                                                    <div style="width: 100%; min-width: 0px;  margin-left: 6px;">
                                                        <v-list-item-title>Source Tree</v-list-item-title>
                                                    </div>
                                                </template>

                                                <v-treeview
                                                        ref="codeTrees"
                                                        v-if="filteredTreeLists"
                                                        :items.sync="filteredTreeLists"
                                                        :active.sync="openCode"
                                                        activatable
                                                        item-key="key"
                                                        return-object
                                                        dense
                                                        style="text-overflow: clip !important; margin-right:-50px;"
                                                        class="gs-v-treeview-width"
                                                >
                                                    <template v-slot:prepend="{ item, open }">
                                                        <v-icon v-if="!item.file">
                                                            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                        </v-icon>
                                                        <v-icon v-else>
                                                            {{ icon[item.file] }}
                                                        </v-icon>
                                                    </template>
                                                    <!-- <template v-slot:prepend="{ item, open }">
                                                        <v-icon v-if="isChangedCode(item)"
                                                                color="#00B0FF"
                                                                x-small
                                                                style="position: absolute; z-index:9999; font-size: 1px;"
                                                        >fiber_manual_record
                                                        </v-icon>
                                                        <div v-if="isNotFolderIcon">
                                                            <v-icon size="20" :style="templatePathStyle(item)">
                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                            </v-icon>
                                                        </div>
                                                        <div v-else>
                                                            <v-icon v-if="item.children && item.children.length > 0" size="20" :style="templatePathStyle(item)">
                                                                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                            </v-icon>
                                                            <v-icon v-else size="20" :style="templatePathStyle(item)">
                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                            </v-icon>
                                                        </div>
                                                    </template>
                                                    <template v-slot:label="{ item, open }">
                                                        <div v-if="isNotFolderIcon">
                                                            <div v-if="item.children && item.children.length > 0" > {{item.name}} </div>
                                                            <div v-else style="font-size:13px; cursor: pointer;" :style="templatePathStyle(item)"> {{item.searchContentLine}} </div>
                                                        </div>
                                                        <div v-else>
                                                            <div v-if="showTemplatePath || showChangedPathLists" style="font-size: 1px; margin-top: 5px;" >
                                                                {{convertTemplatePath (item)}}
                                                            </div>
                                                            <div style="font-size:13px; cursor: pointer;" :style="templatePathStyle(item)"> {{item.name}} </div>
                                                        </div>
                                                    </template>
                                                    <template v-slot:append="{ item, open }">
                                                        <v-row style="align-items: center; justify-content: flex-end; margin-right: 0px;">
                                                            <div v-if="showChangedPathLists && !item.file && item.name == 'Changed Files' ">
                                                                <v-icon style="font-size: 16px; position: absolute;left: 270px;top: 15px;"
                                                                        @click="clearChangedPathListsBucket()"
                                                                >mdi-delete
                                                                </v-icon>
                                                            </div>

                                                            <div v-else>
                                                                <v-menu v-if="item.showTemplateChip && !isOneBCModel"
                                                                        v-model="menuOpen[item.bcId]"
                                                                        offset-y
                                                                        :close-on-content-click="false"
                                                                        direction="top"
                                                                >
                                                                    <template v-slot:activator="{ on, attrs}" >
                                                                        <v-chip
                                                                                @mouseenter="showFullNameforSelectedTemplateKey = item.key"
                                                                                @mouseleave="showFullNameforSelectedTemplateKey = null"
                                                                                x-small
                                                                                v-bind="attrs"
                                                                                v-on="on"
                                                                                style="position:absolute; left:190px; top:7px;"
                                                                        >
                                                                            {{item.preferredPlatform ? (showFullNameforSelectedTemplateKey == item.key ? getPreferredPlatformName(item.preferredPlatform, true):getPreferredPlatformName(item.preferredPlatform, false)):'selected'}}
                                                                        </v-chip>
                                                                    </template>

                                                                    <v-tabs style="max-height:450px; overflow-x:scroll;">
                                                                        <v-tab> {{editableTemplate ? 'Change Template' : 'Cannot be changed.' }} </v-tab>
                                                                        <v-btn style="margin: 5px 0px 0px 10px;" text @click="marketplaceDialog = true">
                                                                            <v-icon style="margin-right: 5px;" small>mdi-cart</v-icon>
                                                                            Marketplace
                                                                        </v-btn>
                                                                        <v-tab v-if="isExistConfTemplate('TEMPLATE', item.preferredPlatform)"> Configuration </v-tab>

                                                                        <v-tab-item>
                                                                            <v-list v-if="editableTemplate">
                                                                                <v-list-item
                                                                                    v-for="(tempItem, index) in templateList"
                                                                                    :key="index"
                                                                                >
                                                                                    <subMenu 
                                                                                        :templateInfo="tempItem"
                                                                                        :isBaseTemplate="true" 
                                                                                        @selectTemplate="openTemplateDialog('TEMPLATE', $event.tmp, item)"
                                                                                    />
                                                                                </v-list-item>
                                                                            </v-list>
                                                                        </v-tab-item>

                                                                        <v-tab-item>
                                                                            <CodeConfiguration
                                                                                :instruction="configurationTemplate('TEMPLATE', item)"
                                                                                @apply="applyCodeConfiguration"
                                                                                @close="closeCodeConfiguration"
                                                                            ></CodeConfiguration>
                                                                        </v-tab-item>
                                                                    </v-tabs>
                                                                </v-menu>

                                                                <div style="color:red;">
                                                                    {{item.changed == 0 ? "" : item.changed}}
                                                                </div>
                                                            </div>
                                                        </v-row>
                                                        <div style="margin-top: 8px;">
                                                            <v-divider v-if="item.divisionLine && showBaseTemplate && !isOneBCModel"
                                                                    style="margin-left: -96%;
                                                                        width: 90vw;
                                                                        position: absolute;"
                                                            />
                                                        </div>
                                                    </template> -->
                                                </v-treeview>
                                            </v-list-group>
                                        </v-list>
                                    </div>
                                </div>
                            </v-col>
                        </div>
                    </template>
                    <template v-slot:two>
                        <div>
                            <v-row>
                                <v-col>
                                    <v-dialog persistent no-click-animation v-if="editTemplateMode" v-model="editTemplateMode">
                                        <div v-if="editTemplateMode" :key="editModeCodeViewerRenderKey">
                                            <v-card flat style="height: 90vh; z-index:2;">
                                                <div style="display: flex;">
                                                    <div style="width: 400px; height: 850px; overflow-y: scroll;">
                                                        <!-- <div @click="cssUpateinVueObjViewer()" style="width: 400px; font-size: 11px;">	
                                                            <vue-object-view	
                                                                    v-model="modelData"	
                                                                    :nowrap="false"	
                                                                    style="max-height: 500px; overflow: scroll; max-width: 400px;"	
                                                            ></vue-object-view>	 -->
                                                        <v-card-title style="margin-top: -10px; margin-bottom: -15px;">
                                                            Model Explorer
                                                        </v-card-title>
                                                        <div style="width: 400px;" :key="modelDataTreeKey">
                                                            <v-treeview
                                                                :active.sync="active_tree"
                                                                :items="treeData"
                                                                :load-children="fetchChildren"
                                                                :open.sync="open_tree"
                                                                activatable
                                                                dense
                                                                style="text-overflow: clip
                                                                !important;
                                                                margin-right:-50px;
                                                                max-height: 70%;
                                                                font-size:12px;
                                                                cursor: pointer;"
                                                                class="gs-v-treeview-width"
                                                                open-on-click
                                                                transition
                                                            >
                                                                <template slot="label" slot-scope="{ item }">

                                                                    <!-- if(val.innerText.includes("/[0-9]/")){
                                                                        val.style.color = '#9682f8'
                                                                    } else if(val.innerText == 'true' || val.innerText == 'false'){
                                                                        val.style.color = '#e28e9c'
                                                                    } else if(val.innerText == "null") {
                                                                        val.style.color = '#70b1ca'
                                                                    } else {
                                                                        val.style.color = '#0f7f12'
                                                                    } -->
                                                                    <span>{{ item.name }}</span>
                                                                    <span  id="treeValue" v-if="item.value" 
                                                                        :style="item.value == 'true' || item.value == 'false' ? 
                                                                        'color: #e28e9c' : 
                                                                        item.value == 'null' ? 'color: #70b1ca' : 
                                                                        /[0-9]/.test(item.value) ? 'color: #9682f8':'color: #0f7f12'"
                                                                    >
                                                                        {{ item.value }}
                                                                    </span>
                                                                    <!-- <v-btn v-if="item.value && (active_tree && active_tree[0] == item.id)" icon @click="openModelDataEditor(item)"><v-icon small>mdi-pencil</v-icon></v-btn> -->
                                                                    <v-btn v-if="item.value && (active_tree && active_tree[0] == item.id)" icon @click="pasteModelValue(item)"><v-icon small>mdi-share</v-icon></v-btn>
                                                                </template>
                                                            </v-treeview>

                                                            <div v-if="editTemplateMode" style="width: 100%; position: relative; margin-top: 10px; margin-bottom: 10px;">
                                                                <v-divider />
                                                            </div>
                                                        </div>

                                                        <v-list nav dense style="margin:-15px -30px 0px -10px;">
                                                            <v-list-group :value="true">
                                                                <template v-slot:activator>
                                                                    <div style="width: 74%; min-width: 0px;  margin-left: 6px; display: inline-flex;">
                                                                        <v-list-item-title>Template Explorer</v-list-item-title>
                                                                        <v-btn
                                                                            style="position: absolute; right: 55%; top: 3px;"
                                                                            icon 
                                                                            @click="openTemplateTreeEditor(null, 'add New')"
                                                                        >
                                                                            <v-icon small>mdi-folder-plus</v-icon>
                                                                        </v-btn>
                                                                    </div>
                                                                </template>
                                                                <div v-for="(platform, index) in Object.keys(templateTreeList)" :key="index">
                                                                    <v-list-group
                                                                            :value="true"
                                                                            style="margin-left: -15px;"
                                                                            no-action
                                                                            sub-group
                                                                    >
                                                                        <template v-slot:activator>
                                                                            <v-list-item-content style="margin-left: -10px;">
                                                                                <v-list-item-subtitle v-if="platform.includes('https://github.com/')" style="margin-top: -20px; font-size: x-small;">https://github.com/</v-list-item-subtitle>
                                                                                <v-list-item-title v-if="platform.includes('https://github.com/')" style="margin-left: -100%; margin-top:5px;">{{ platform.replace('https://github.com/', '') }}</v-list-item-title>
                                                                                <v-list-item-title v-else>{{ platform }}</v-list-item-title>
                                                                            </v-list-item-content>
                                                                            <v-btn
                                                                                style="left: -10px;"
                                                                                icon 
                                                                                @click="openTemplateTreeEditor(platform, 'add file')"
                                                                            >
                                                                                <v-icon small>mdi-file-plus</v-icon>
                                                                            </v-btn>
                                                                            <v-btn
                                                                                style="left: -10px;"
                                                                                icon 
                                                                                @click="openTemplateTreeEditor(platform, 'add folder')"
                                                                            >
                                                                                <v-icon small>mdi-folder-plus</v-icon>
                                                                            </v-btn>
                                                                        </template>

                                                                        <v-list-item>
                                                                            <div :key="templateTreeRenderkey">
                                                                                <v-treeview
                                                                                    v-if="templateTreeList[platform]"
                                                                                    ref="codeTrees"
                                                                                    :items.sync='templateTreeList[platform]'
                                                                                    :open="selectedTemplateTreePathList[platform]"
                                                                                    :active.sync="selectedTemplateFileName[platform]"
                                                                                    @update:active="setTemplateFramework"
                                                                                    @update:open="setOpenedFolderList"
                                                                                    activatable
                                                                                    item-key="currentPath"
                                                                                    return-object
                                                                                    hoverable
                                                                                    dense
                                                                                    style="text-overflow: clip
                                                                                    !important;
                                                                                    margin-right:-50px;
                                                                                    max-height: 70%;
                                                                                    margin-top: -5px;
                                                                                    margin-left: -55px;
                                                                                    font-size:12px;
                                                                                    cursor: pointer;"
                                                                                    class="gs-v-treeview-width"
                                                                                    open-on-click
                                                                                >
                                                                                    <template v-slot:prepend="{ item, open }">
                                                                                        <div v-if="isNotFolderIcon">
                                                                                            <v-icon size="20" :style="templatePathStyle(item)">
                                                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-else>
                                                                                            <v-icon v-if="item.children && item.children.length > 0" size="20" :style="templatePathStyle(item)">
                                                                                                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                                                            </v-icon>
                                                                                            <v-icon v-else size="20" :style="templatePathStyle(item)">
                                                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                                                            </v-icon>
                                                                                        </div>
                                                                                    </template>
                                                                                    <template v-slot:label="{ item }">
                                                                                        <div :key="treeItemRenderKey" @click="setSelectedTempTreePath(item)" :style="templatePathStyle(item)"> {{item.name}} 
                                                                                            <span v-if="selectedTempTreePath[platform] && selectedTempTreePath[platform] == item.currentPath">
                                                                                                <v-btn 
                                                                                                    v-if="!item.children"
                                                                                                    icon 
                                                                                                    @click="openTemplateTreeEditor(item, 'edit')"
                                                                                                >
                                                                                                    <v-icon small>mdi-pencil</v-icon>
                                                                                                </v-btn>
                                                                                                <span v-if="item.children">
                                                                                                    <v-btn
                                                                                                        icon 
                                                                                                        @click="openTemplateTreeEditor(item, 'add file')"
                                                                                                    >
                                                                                                        <v-icon small>mdi-file-plus</v-icon>
                                                                                                    </v-btn>
                                                                                                    <v-btn
                                                                                                        icon 
                                                                                                        @click="openTemplateTreeEditor(item, 'add folder')"
                                                                                                    >
                                                                                                        <v-icon small>mdi-folder-plus</v-icon>
                                                                                                    </v-btn>
                                                                                                </span>
                                                                                                <v-btn
                                                                                                    icon 
                                                                                                    @click="openTemplateTreeEditor(item, 'delete')"
                                                                                                >
                                                                                                    <v-icon small>mdi-delete</v-icon>
                                                                                                </v-btn>
                                                                                            </span>
                                                                                        </div>
                                                                                    </template>
                                                                                </v-treeview>
                                                                            </div>
                                                                        </v-list-item>
                                                                    </v-list-group>
                                                                </div>
                                                            </v-list-group>
                                                        </v-list>

                                                        <div style="height: 330px;">
                                                            <div v-if="editTemplateMode" style=" width: 100%; position: relative; margin-top: -10px;">
                                                                <v-divider />
                                                            </div>
                                                            <v-list v-if="editTemplateMode" :key="editTemplateListRenderKey"
                                                                    nav dense
                                                                    style="width:105%; min-width: 390px; margin:-5px -30px 0px -10px;"
                                                            >
                                                                <v-list-group :class="editTemplateMode ? 'gs-edited-template-files-v-list-group' : ''" :value="true">
                                                                    <template v-slot:activator>
                                                                        <div style="width: 100%;  margin-left: 6px; min-width: 0px;">
                                                                            <v-list-item-title>Edited Template Files</v-list-item-title>
                                                                        </div>
                                                                    </template>
                                                                    <div v-for="(platform, index) in Object.keys(editTemplateFrameWorkList)" :key="index">
                                                                        <v-list-group
                                                                                v-if="Object.keys(editTemplateFrameWorkList[platform]).length != 0"
                                                                                :value="true"
                                                                                style="margin-left: -15px;"
                                                                                no-action
                                                                                sub-group
                                                                        >
                                                                            <template v-slot:activator>
                                                                                <v-list-item-content style="margin-left: -10px;">
                                                                                    <v-list-item-subtitle v-if="platform.includes('https://github.com/')" style="margin-top: -20px; font-size: x-small;">https://github.com/</v-list-item-subtitle>
                                                                                    <v-list-item-title v-if="platform.includes('https://github.com/')" style="margin-left: -100%; margin-top:5px;">{{ platform.replace('https://github.com/', '') }}</v-list-item-title>
                                                                                    <v-list-item-title v-else>{{ platform }}</v-list-item-title>
                                                                                </v-list-item-content>
                                                                                <div style="position: absolute; right: 15%;">
                                                                                    <v-menu
                                                                                            v-model="templatePushDialog"
                                                                                            :close-on-click="false"
                                                                                            :close-on-content-click="false"
                                                                                            offset-x
                                                                                            transition="slide-x-transition"
                                                                                    >
                                                                                        <template v-slot:activator="{ on: menu, attrs }">
                                                                                            <v-tooltip bottom>
                                                                                                <template v-slot:activator="{ on: tooltip }">
                                                                                                    <v-btn v-bind="attrs" v-on="{ ...tooltip, ...menu }" @click="pushTemplateToGit(platform)" icon>
                                                                                                        <v-icon :color="oldPlatform == platform ? 'primary':''" small>mdi-git</v-icon>
                                                                                                    </v-btn>
                                                                                                </template>
                                                                                                <span>open git Menu</span>
                                                                                            </v-tooltip>
                                                                                        </template>
                                                                                        <div v-if="templatePushDialog && oldPlatform == platform" :key="gitMenuRenderKey">
                                                                                            <gitAPIMenu
                                                                                                    v-model="value.scm"
                                                                                                    v-if="templatePushDialog"
                                                                                                    @closeMenu="templatePushDialog = false"
                                                                                                    @successToPush="changePlatform"
                                                                                                    @closeGitMenu="closeGitMenu"
                                                                                                    :templateRepoName="templateRepoName"
                                                                                                    :isCustomTemplate="isCustomTemplate"
                                                                                                    :editTemplateMode="true"
                                                                                                    :editTemplateList="editTemplateList"
                                                                                                    :information="projectInformation"
                                                                                                    :isOnPrem="isOnPrem"
                                                                                                    :projectId="modelingProjectId"
                                                                                                    :projectName="projectName"
                                                                                                    :git-users="gitUsers"
                                                                                                    :isListSettingDone="isGeneratorDone"
                                                                                                    :isMineProject="isMineProject"
                                                                                                    :changedPathListsForGit="changedPathListsForGit"
                                                                                                    :generateCodeLists="filteredPrettierCodeLists"
                                                                                                    :ShowCreateRepoTab="ShowCreateRepoTab"
                                                                                                    :isServerModeling="isServerModeling"
                                                                                                    @pushSuccessed="pushSuccessed"
                                                                                            />
                                                                                        </div>
                                                                                    </v-menu>
                                                                                </div>
                                                                            </template>
                                                                            <v-list-item v-for="(template, i) in Object.keys(editTemplateFrameWorkList[platform])" :key="i"
                                                                                         :style="selectedEditTemplateName == platform + '/' + template ? 'background-color: #e4eef9; color: #2277cf;' : ''"
                                                                            >
                                                                                <div style="cursor: pointer;"
                                                                                     @click="setTemplateFramework(editTemplateFrameWorkList[platform][template].element)"
                                                                                     @mouseenter="setHover(platform, template)"
                                                                                     @mouseleave="setHover()"
                                                                                >
                                                                                    <v-row :style="editTemplateFrameWorkList[platform][template].isPushed ? 'color: darkgray;':''">
                                                                                        <Icon v-if="editTemplateFrameWorkList[platform][template].isPushed"
                                                                                              icon="mdi:file-document-arrow-right-outline" width="20" height="20"
                                                                                              style="color: darkgray; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isFixed"
                                                                                              icon="mdi:file-document-check-outline" width="20" height="20"
                                                                                              style="color: green; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].failedGenerate"
                                                                                              icon="mdi:file-document-alert-outline" width="20" height="20"
                                                                                              style="color: red; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isAdded"
                                                                                              icon="mdi:file-document-plus-outline" width="20" height="20"
                                                                                              style="color: #2278cf; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isDeleted"
                                                                                              icon="mdi:file-document-minus-outline" width="20" height="20"
                                                                                              style="color: red; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <Icon v-else
                                                                                              icon="mdi:file-document-edit-outline" width="20" height="20"
                                                                                              style="color: #2278cf; position: relative; left: -30px; top: 20px;"
                                                                                        />
                                                                                        <v-col style="margin-left:-35px; margin-right: 25px;">
                                                                                            <v-list-item-subtitle v-if="editTemplateFrameWorkList[platform][template].element[0].computedSubFileName"
                                                                                                                  style="font-size: x-small;">
                                                                                                {{ editTemplateFrameWorkList[platform][template].element[0].computedSubFileName }}
                                                                                            </v-list-item-subtitle>
                                                                                            <v-list-item-title :style="!editTemplateFrameWorkList[platform][template].element[0].computedSubFileName ? 'margin-top:10px;' : ''"
                                                                                                               v-text="editTemplateFrameWorkList[platform][template].element[0].computedFileName">
                                                                                            </v-list-item-title>
                                                                                        </v-col>
                                                                                        <v-btn icon
                                                                                               v-if="isHoveredTemplateFilePath == platform + '/' + template"
                                                                                               @click="deleteModifiedTemplate(platform, template)"
                                                                                               style="color: darkgray; position: relative; top: 13px; margin-left: -35px;"
                                                                                        >
                                                                                            <v-icon small>mdi-close</v-icon>
                                                                                        </v-btn>
                                                                                    </v-row>
                                                                                </div>
                                                                            </v-list-item>
                                                                        </v-list-group>
                                                                    </div>
                                                                </v-list-group>
                                                            </v-list>
                                                            <div v-if="editTemplateMode" style="width: 100%; margin-top: -10px;">
                                                                <v-divider />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <v-divider vertical />
                                                    <v-card-text style="margin-top: -15px;">
                                                        <v-btn style="float: right; margin-top: -6px; margin-right: -22px;" icon @click="editTemplateMode = false, defaultCodeViewerRenderKey++;">
                                                            <v-icon small>mdi-close</v-icon>
                                                        </v-btn>
                                                        <v-tabs
                                                                v-model="editTemplateTabNumber"
                                                        >
                                                            <v-tabs-slider></v-tabs-slider>

                                                            <v-progress-circular
                                                                    v-if="startReGenerateCode"
                                                                    indeterminate
                                                                    :size="20"
                                                                    style="margin-top: 15px;"
                                                                    color="primary"
                                                            ></v-progress-circular>

                                                            <v-tab v-for="item in editTemplateTabItems" :key="item.tab">{{ item.tab }}</v-tab>

                                                            <v-divider vertical inset />
                                                            <v-btn v-if="!startReGenerateCode" style="margin-top: 5px;" icon @click="reGenerateTemplateCode()"><v-icon>mdi-play</v-icon></v-btn>

                                                            <v-tab-item
                                                                    v-for="item in editTemplateTabItems"
                                                                    :key="item.tab"
                                                            >
                                                                <div style="height: 850px;" :key="editModeResultViewerRenderKey">
                                                                    <v-card flat v-if="item.tabKey == 'edit'">
                                                                        <separate-panel-components
                                                                                :min="codeSeparatePanelInfo.min"
                                                                                :max="codeSeparatePanelInfo.max"
                                                                                :triggerLength="2"
                                                                                :paneLengthPercent.sync="codeSeparatePanelInfo.current"
                                                                                :inBoundSeparatePanel="true"
                                                                        >
                                                                            <template v-slot:one>
                                                                                <div>
                                                                                    <div v-if="opennedTemplateFramework && opennedTemplateFramework[0].templateErrMsg" style="min-width: 100px; margin-top: 10px; margin-bottom: -15px; margin-right: 15px;">
                                                                                        <v-tooltip top color="error" style="z-index: 9999;">
                                                                                            <template v-slot:activator="{ on, attrs }">
                                                                                                <v-chip
                                                                                                    v-bind="attrs"
                                                                                                    v-on="on"
                                                                                                    class="ma-2"
                                                                                                    small
                                                                                                    color="red"
                                                                                                    text-color="white"
                                                                                                >
                                                                                                    <v-icon left small>
                                                                                                        mdi-alert-circle-outline
                                                                                                    </v-icon>
                                                                                                    {{ opennedTemplateFramework[0].templateErrMsg }} 
                                                                                                </v-chip>
                                                                                            </template>
                                                                                            <span><v-icon color="white" style="margin-right: 10px;">mdi-alert-circle-outline</v-icon>{{ opennedTemplateFramework[0].templateErrMsg }}</span>
                                                                                        </v-tooltip>
                                                                                    </div>
                                                                                    <code-viewer
                                                                                            v-model="opennedTemplateFramework"
                                                                                            :editMode="true"
                                                                                            :readOnly="false"
                                                                                            :codeSuggestionObj="opennedTemplateFramework ? opennedTemplateFramework[0].eleKeys:{}"
                                                                                            style="padding: 0 !important; height: 100%; float: left; width:100%; margin-left:2px;"
                                                                                            @update="updatePathTmp"
                                                                                            @editCode="editCode"
                                                                                            @editBreakPoint="editBreakPoint"
                                                                                    ></code-viewer>
                                                                                </div>
                                                                            </template>
                                                                            <template v-slot:two>
                                                                                <div style="width: 500px; margin-left: 15px; margin-top: 10px;"
                                                                                     :style="opennedTemplateFramework && opennedTemplateFramework[0].refList && opennedTemplateFramework[0].refList.length > 0 ? 'margin-bottom: -30px;':''"
                                                                                >
                                                                                    <v-select v-if="opennedTemplateFramework && opennedTemplateFramework[0].refList && opennedTemplateFramework[0].refList.length > 0"
                                                                                        v-model="templateResultPath"
                                                                                        @change="setTemplateResult"
                                                                                        style="font-size: 13px;"
                                                                                        variant="solo"
                                                                                        label="Selected file"
                                                                                        :items="opennedTemplateFramework[0].refList"
                                                                                    ></v-select>
                                                                                </div>
                                                                                <v-chip
                                                                                        v-if="neverUsedTmp"
                                                                                        class="ma-2"
                                                                                        color="red"
                                                                                        text-color="white"
                                                                                >
                                                                                    <v-icon left small>
                                                                                        mdi-alert-circle-outline
                                                                                    </v-icon>
                                                                                    Selected template file never used on this model
                                                                                </v-chip>
                                                                                <v-chip
                                                                                        v-else-if="isErrTempResult"
                                                                                        class="ma-2"
                                                                                        color="red"
                                                                                        text-color="white"
                                                                                >
                                                                                    <v-icon left small>
                                                                                        mdi-alert-circle-outline
                                                                                    </v-icon>
                                                                                    {{ isErrTempResult }}
                                                                                </v-chip>
                                                                                <div v-else>
                                                                                    <!-- <code-viewer
                                                                                            v-if="filteredOpenCode"
                                                                                            v-model="filteredOpenCode"
                                                                                            :editMode="true"
                                                                                            :readOnly="true"
                                                                                            style="padding: 0 !important; height: 100%; float: left;"
                                                                                            @update="updatePathTmp"
                                                                                            @editCode="editCode"
                                                                                    ></code-viewer> -->
                                                                                    <code-viewer
                                                                                            v-model="openCode"
                                                                                            :editMode="true"
                                                                                            :readOnly="true"
                                                                                            style="padding: 0 !important; height: 100%; float: left;"
                                                                                            @update="updatePathTmp"
                                                                                            @editCode="editCode"
                                                                                    ></code-viewer>
                                                                                </div>
                                                                            </template>
                                                                        </separate-panel-components>
                                                                    </v-card>
                                                                    <!-- GPT -->
                                                                    <v-card flat v-if="item.tabKey == 'autoGen'">
                                                                        <separate-panel-components
                                                                                :min="codeSeparatePanelInfo.min"
                                                                                :max="codeSeparatePanelInfo.max"
                                                                                :triggerLength="2"
                                                                                :paneLengthPercent.sync="codeSeparatePanelInfo.current"
                                                                                :inBoundSeparatePanel="true"
                                                                        >
                                                                            <template v-slot:one>
                                                                                <div :key="editModeResultViewerRenderKey">
                                                                                    <code-viewer
                                                                                            v-model="originMustacheTemplate"
                                                                                            :editMode="true"
                                                                                            :readOnly="false"
                                                                                            style="padding: 0 !important; height: 100%; float: left;"
                                                                                            @update="updatePathTmp"
                                                                                            @editCode="editMustacheCode"
                                                                                    ></code-viewer>
                                                                                    <v-btn color="primary" :loading="startGenerate" :disabled="startGenerate || startGenerateUseOpenAI" style="margin-top: -280px; margin-left: 3px;" @click="startAutoGenerateCode('mustache')">Start Generate</v-btn>
                                                                                    <v-btn color="primary" :loading="startGenerateUseOpenAI" :disabled="startGenerate || startGenerateUseOpenAI" style="margin-top: -280px; margin-left: 3px;" @click="startAutoGenerateCode('openAI')">Start Generate use OpenAI</v-btn>
                                                                                </div>
                                                                            </template>
                                                                            <template v-slot:two>
                                                                                <div :key="editModeResultViewerRenderKey">
                                                                                    <code-viewer
                                                                                            v-model="modifiedMustacheTemplate"
                                                                                            :editMode="true"
                                                                                            :readOnly="true"
                                                                                            style="padding: 0 !important; height: 100%; float: left;"
                                                                                            @update="updatePathTmp"
                                                                                    ></code-viewer>
                                                                                </div>
                                                                            </template>
                                                                        </separate-panel-components>
                                                                    </v-card>
                                                                </div>
                                                            </v-tab-item>
                                                        </v-tabs>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </div>
                                    </v-dialog>
                                    <v-dialog no-click-animation v-model="openExpectedTemplateTestDialog">
                                        <!-- :actualTreeList="treeLists"  -->
                                        <ExpectedTemplateTestDialog 
                                            :actualCodeList="codeLists" 
                                            :templateFrameWorkList="templateFrameWorkList"
                                            :existOnlyExpected="existOnlyExpected"
                                            :existOnlyActual="existOnlyActual"
                                            :diffList="diffList"
                                            :templateMetaData="templateMetaData"
                                            :modelingProjectId="modelingProjectId"
                                        />
                                    </v-dialog>
                                    <!-- <div v-if="changedModifying">
                                        <h2 v-if="openCodeWeb.length > 0"
                                            style="float:left; margin-left: 27px">IDE Exist
                                            Code</h2>
                                        <h2 v-if="openCodeWeb.length > 0"
                                            style="float:right; margin-right: 27px">Merged
                                            Code</h2>
                                        <code-viewer
                                                v-if="openCodeWeb.length > 0"
                                                v-model="openCodeMerge"
                                                :type="'diff'"
                                                :readOnly="true"
                                                :diff-value="openCodeWeb"
                                                :create-value="passValue"
                                                @update="updatePathTmp"
                                                style="padding: 0 !important;"
                                        ></code-viewer>
                                    </div>
                                    <div v-else-if="isDiffMode" style="height: 100%;">
                                        <code-viewer
                                                :type="'diff'"
                                                :readOnly="true"
                                                v-model="filteredOpenCode"
                                                :create-value="changedDiffCode"
                                                style="padding: 0 !important;"
                                                @update="updatePathTmp"
                                        ></code-viewer>
                                    </div>
                                    <div v-else style="height: 100%;" :key="defaultCodeViewerRenderKey">
                                        <code-viewer
                                                ref="codeViewer"
                                                :key="docsRenderKey"
                                                v-model="filteredOpenCode"
                                                style="padding: 0 !important;"
                                                :readOnly="false"
                                                :showGpt="showGpt"
                                                @editCode="setCurrentCodeForAutoCodeGenerate"
                                                @startAutoGenerate="startAutoGenerateCode"
                                                @update="updatePathTmp"
                                        ></code-viewer>
                                    </div> -->
                                    <!-- <kubernetes-code-viewer
                                            v-if="isDiffMode"
                                            :diff-value="existYaml"
                                            v-model="filteredOpenCode"
                                            :type="'diff'"
                                            :create-value="existYaml"
                                            @update="updatePathTmp"
                                            style="padding: 0 !important;"
                                    ></kubernetes-code-viewer> -->
                                    <kubernetes-code-viewer
                                            v-model="filteredOpenCode"
                                            style="padding: 0 !important;"
                                    ></kubernetes-code-viewer>
                                </v-col>
                            </v-row>
                        </div>
                        <v-snackbar
                                v-model="gitSnackBar.show"
                                :timeout="gitSnackBar.timeout"
                                auto-height
                                :color="gitSnackBar.Color"
                                multi-line
                        >
                            <v-layout align-center pr-4>
                                <v-icon v-if="gitSnackBar.icon" class="pr-3" dark large>{{ gitSnackBar.icon }}</v-icon>
                                <v-layout column>
                                    <div v-if="gitSnackBar.title">
                                        <strong>{{ gitSnackBar.title }}</strong>
                                    </div>
                                    <div>{{ gitSnackBar.Text }}</div>
                                </v-layout>
                            </v-layout>
                            <template v-slot:action="{ attrs }">
                                <v-btn
                                        color="white"
                                        text
                                        small
                                        v-bind="attrs"
                                        @click="gitSnackBar.show = false"
                                >
                                    Close
                                </v-btn>
                            </template>
                        </v-snackbar>
                    </template>
                </separate-panel-components>
            </v-card-text>

            <v-card-actions>
                <slot name="structural-bottom"></slot>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="templateDialog.show"
                persistent
                width="500"
        >
            <v-card>
                <v-card-title class="headline">
                    Template from Git
                </v-card-title>
                
                <v-card-text>
                    <v-text-field
                            v-model="templateDialog.url"
                            label="Git Repo URL"
                            autofocus
                    ></v-text-field>
                    <v-text-field
                            v-if="!gitAccessToken"
                            disabled-v-if="!gitAccessTokenIs"
                            v-model="gitAccessToken"
                            label="Github AccessToken"
                    ></v-text-field>
                    <a href="https://intro-kor.msaez.io/custom-template/tutorial/#%EC%BB%A4%EC%8A%A4%ED%85%80-%ED%85%9C%ED%94%8C%EB%A6%BF-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0"
                       target="_blank">Custom Template 튜토리얼</a>
                </v-card-text>
                
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="dimgray"
                            text
                            @click="closeTemplateDialog()"
                    >
                        Cancel
                    </v-btn>
                    <v-btn color="primary"
                            text
                            @click="applyTemplateDialog()"
                    >
                        Apply
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showApplyBaseTemplateDialog" max-width="370" ref="all-apply-dialog" persistent>
            <v-card>
                <v-card-title class="headline">
                    Apply Base Template To All?
                </v-card-title>
                <v-card-text> Do you want to change other template settings also to default template settings values? </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="applyBaseTemplateDialog(true)">YES</v-btn>
                    <v-btn color="red darken-1"   text @click="applyBaseTemplateDialog(false)">NO</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="isCustomTemplateForLoad" width="480">
            <Login :onlyGitLogin="true" />
        </v-dialog>

        <v-dialog v-model="startGenerate"
                :scrim="false"
                persistent
                width="auto"
        >
            <v-card>
                <v-progress-linear
                        indeterminate
                        color="primary"
                        class="mb-0"
                        style="height: 6px;"
                ></v-progress-linear>
                <v-card-text style="text-align-last: center;">
                    <div style="margin-top: 5px;">
                        Waiting for code to be generated
                    </div>
                    <v-btn color="primary" 
                            style="margin-top: 5px; margin-bottom: -10px;" 
                            @click="stopGenerate()"
                    >
                        cancel
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        
        <v-dialog v-model="showLoginCard">
            <Login :onlyGitLogin="true" @login="showLoginCard = false" />
        </v-dialog>
        
        <v-dialog v-if="showModelDataEditor" v-model="showModelDataEditor" width="auto">
            <v-card style="width: 500px;">
                <v-card-subtitle>{{ currentModelData.subPath }}</v-card-subtitle>
                <v-card-title style="margin-top: -35px; margin-bottom: -20px;">{{ currentModelData.name }}</v-card-title>
                <v-card-text>
                    <v-text-field autofocus v-model="currentModelData.value"></v-text-field>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-if="selectedTreeItem && showTemplateTreeEditor" 
                v-model="showTemplateTreeEditor" 
                width="auto"
        >
            <v-card style="width: 500px;">
                <div v-if="selectedTreeItem.editMode == 'add New'" style="padding: 10px;">
                    <v-chip small @click="newTemplateType = 'template'" 
                        style="margin-right: 5px;"
                        :style="newTemplateType == 'template' ? '' : 'color: darkgray;'"
                        :color="newTemplateType == 'template' ? 'black' : ''"
                        :outlined="newTemplateType == 'template' ? true : false"
                    >
                        <v-icon color="green" left v-if="newTemplateType == 'template'">
                            mdi-check
                        </v-icon>
                        Template
                    </v-chip>
                    <v-chip small @click="newTemplateType = 'topping'"
                        :style="newTemplateType == 'topping' ? '' : 'color: darkgray;'"
                        :color="newTemplateType == 'topping' ? 'black' : ''"
                        :outlined="newTemplateType == 'topping' ? true : false"
                    >
                        <v-icon color="green" left v-if="newTemplateType == 'topping'">
                            mdi-check
                        </v-icon>
                        Topping
                    </v-chip>
                </div>
                <v-card-subtitle v-if="selectedTreeItemPath && selectedTreeItem.subPath" style="margin-bottom: -35px;">{{ selectedTreeItemPath }}{{ selectedTreeItem.subPath }}</v-card-subtitle>
                <v-card-subtitle v-else-if="selectedTreeItemPath" style="margin-bottom: -35px;">{{ selectedTreeItemPath }}</v-card-subtitle>
                <v-card-title style="margin-bottom: -20px;">{{ selectedTreeItem.name }}<span v-if="selectedTreeItem.editMode.includes('add')">/</span></v-card-title>
                <v-card-text>
                    <v-text-field v-if="selectedTreeItem.editMode == 'edit' || selectedTreeItem.editMode.includes('add')" autofocus v-model="selectedTreeItem.newName"></v-text-field>
                </v-card-text>
                <v-card-actions style="justify-content: right;">
                    <v-btn style="margin-top: -30px;" color="primary" @click="editTreeItem()">{{ selectedTreeItem.editMode }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    /*
      코드생성 공통 기능.
   */
    //From: https://github.com/vuetifyjs/vuetify/issues/1877    
    import StorageBase from "../modeling/StorageBase";
    import CodeConfiguration from "../modeling/CodeConfiguration";
    import CodeGeneratorCore from '../modeling/CodeGeneratorCore';
    import ExpectedTemplateTestDialog from "../modeling/ExpectedTemplateTestDialog";

    import AIGenerator from '../modeling/generators/AIGenerator';
    
    import CodeViewer from "../CodeViewer";
    import gitAPIMenu from "../gitAPIMenu";
    import subMenu from '../subMenu.vue';

    import SeparatePanelComponents from "../../SeparatePanelComponents";
    
    import Login from "../../oauth/Login";
    import getParent from "../../../utils/getParent";

    import 'core-js';
    import json2yaml from 'json2yaml';


    const axios = require('axios');
    const prettier = require("prettier");
    const plugins = require("prettier-plugin-java");
    const JSZip = require('jszip');
    const changeCase = require('change-case');
    const pluralize = require('pluralize');
    const path = require('path')
    const yamlpaser = require('js-yaml');

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'kube-code-generator',
        mixins:[StorageBase],
        components: {
            subMenu,
            CodeConfiguration,
            'separate-panel-components':SeparatePanelComponents,
            'code-viewer': CodeViewer,
            gitAPIMenu,
            Login,
            ExpectedTemplateTestDialog
        },
        props: {
            value: Object,
            isMineProject: Boolean,
            projectName: String,
            projectInformation :Object,
            selectedElements: Array,
            modelInitLoad: Boolean,
            modelingProjectId: String,
            isServerModeling: Boolean,
            asyncCodeForValue: Boolean,
            callCodeForValue: Boolean,
            newTreeHashLists: Object,
            oldTreeHashLists: Object,
            isVersionMode: Boolean,
            canvasName: String,
            defaultTemplate: String,
        },
        data() {
            return {
                isLoadingExpectedTemplate: true,
                startCheckDiff: false,
                templateMetaData: null,
                existOnlyExpected: [],
                existOnlyActual: [],
                diffList: [],
                openExpectedTemplateTestDialog: false,
                isOneBCModel: false,
                onlyOneBcId: null,
                marketplaceDialog: false,
                // tempTreeEditor
                selectedTreeItemPath: null,
                newTemplateType: 'template',
                treeItemRenderKey: 0,
                selectedTempTreePath: {},
                selectedTreeItem: null,

                // modelData
                treePathList: {},
                active_tree: [],
                open_tree: [],
                treeData: [],
                treeDataCnt: 1,
                showTemplateTreeEditor: false,
                showModelDataEditor: false,
                currentModelData: null,
                modelDataTreeKey: 0,

                // err
                errTempResultList: {},
                isErrTempResult: null,

                // regen
                reGenerateOnlyModifiedTemplate: false,
                rootModelAndElementMap: null,
                rootModelBoundedContexts: null,

                showLoginCard: false,
                selectedFile: null,
                selectedFileList: [],
                codeContent: '',
                showGpt: false,
                messageList: [],
                chatPrompt: '',
                answerProject:'',
                editCodeOption: {},
                startReGenerateCode: false,
                neverUsedTmp: false,
                startTemplateGenerate: false,
                isListening: false,
                openAiResult: null,
                speechRecognition: null,
                openAiPrompt: "",
                openAiMenu: false,
                forkedListRenderKey: 0,
                templateTreeRenderkey: 0,
                selectedEditTemplateName: null,
                selectedTemplateFileName: {},
                selectedTemplateTreePathList: {},
                isHoveredTemplateFilePath: null,
                firstSetEditTemplateList: true,
                githubTokenError: false,
                defaultCodeViewerRenderKey: 0,
                templateResultPath: null,
                templateTreeList: {},
                stopAutoGenerate: false,
                convertedObj: {},
                recursiveCount: 0,
                originMustacheTemplate: null,
                modifiedMustacheTemplate: null,
                editTemplateTabItems: [
                    { tab: 'Edit Template', index: 1, tabKey: 'edit' },
                    { tab: 'Generate from expected result', index: 2, tabKey: 'autoGen' },
                ],
                setAutoGenerateCodetoList: null,
                editTemplateTabNumber: 0,
                modelData: {},
                sampleData: {"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}},
                openaiContent: null,
                showOpenaiToken: false,
                openaiToken: (new AIGenerator()).openaiToken,
                copyKey: 0,
                isCopied: false,
                startGenerate: false,
                startGenerateUseOpenAI: false,
                autoGenerateResponse: null,
                autoGenerateCodeValue: "",
                openaiPopup: false,
                modelForElement: {},
                isComputeTreeListSwitch: false,
                debuggerPoint: [],

                // Template
                newTreeList: null,
                // defaultTemplate: 'Separate File',
                templateTypeList: [ 'Separate File', 'Single File', 'Separate File per kind', 'Helm' ],
                showTemplateTypeList: false,
                
                // preferredToppingPlatforms: [],
                // Toppings
                showTopping: false,
                selectedVersion: 'java8',
                isJava15: false,
                // selectedSecurity: null,
                // isSpringSecurity: false,
                // isKeycloakSecurity: false,
                // isServiceMesh: false,
                // isRollout: false,
                // isIngress: false,
                // isVanillaK8s: false,
                // isApolloGraphQL: false,
                // isJavaGraphQL: false,

                // GIT
                ShowCreateRepoTab: false,
                gitUsers: null,
                changedModifying: false,
                showTemplatePath: false,
                gitMenu: false,
                gitMenuRenderKey: 0,
                gitCodeUrl: {},
                forkedRepoList: [],
                oldPlatform: null,
                mouseEnteredPlatform: null,
                changedValueCustomTemplate: false,
                isCustomTemplateForLoad: false,
                diffMode: false,
                changedDiffCodeViewer: false,
                changedDiffCode: null,
                openCodeWeb: [],
                showApplyBaseTemplateDialog: false,

                // ???
                passValue: [],
                openCodeMerge: [],
                templateRepoName: null,
                isCustomTemplate: null,
                editTemplateList: null,
                changedPathListsForGit: [],
                changedTmp: [],
                pathTmp: [],

                codeGenTimeout: null,
                // Main(Tree || Code)
                separatePanelInfo:{
                    min:1,
                    max:90,
                    current: 25
                },
                // Code(left || right)
                codeSeparatePanelInfo:{
                    min:1,
                    max:90,
                    current:50
                },
                // GIT
                templateDialog:{
                    show: false,
                    url: null,
                    division: 'BASE',
                    elementId: null
                },
                githubHeaders: null,
                gitAccessToken: null,
                templateFrameWorkList: {},
                gitSnackBar: {
                    Text: '',
                    show: false,
                    Color: null,
                    icon: null,
                    title: null,
                    timeout: null,
                },

                // Topping
                gitToppingList: {},

                //Edit Template
                editTemplateMode: false,
                editTemplateListRenderKey: 0,
                editTemplateFrameWorkList: {},
                templatePushDialog: false,

                //??
                editModeCodeViewerRenderKey: 0,
                editModeResultViewerRenderKey: 0,
                opennedTemplateFramework: null,

                // List
                // isListSettingDone: false,
                isFirstGenerate: false,
                isGeneratorDone : false,

                showBaseTemplate: true,
                treeOpenLists: null,
                treeLists: null,
                codeLists: null,
                _templateLists: null,

                showDesignPatterns: false,
                designPatterns: {},

                // code ???
                openCode: [],
                selectedElementIds:[],

                showChangedPathLists: false,
                changedPathLists: [],
                changedPathListsBucket: [],

                searchForFile:{
                    onOff: false,
                    search: null,
                },
                searchForContent:{
                    onOff: false,
                    search: '',
                },
                //icon
                icon: {
                    version: 'mdi-server',
                    code: 'mdi-code-array',
                    save: 'mdi-content-save',
                    open: 'mdi-book-open',
                    md: 'mdi-language-markdown',
                    txt: 'mdi-file-document-outline',
                    java: 'mdi-language-java',
                    xml: 'mdi-xml',
                    shell: 'mdi-powershell',
                    docker: 'mdi-docker',
                    png: 'mdi-file-image',
                    json: 'mdi-code-json',
                    python: 'mdi-language-python',
                    fork: ' mdi-silverware-fork',
                    share: 'mdi-share-variant',
                    join: 'mdi-account-multiple-plus',
                    vue: 'mdi-vuejs',
                    js: 'mdi-language-javascript',
                    html: 'mdi-language-html5',
                    go: 'mdi-language-go',
                    properties: 'mdi-cog'
                },
                docsNavigator: [
                    { text: 'Object 생성', anchor: '#1' },
                    { text: 'Object 목록 조회', anchor: '#2' },
                    { text: 'Object 상태 조회', anchor: '#3' },
                    { text: '접속 및 동작테스트', anchor: '#4' },
                    { text: '외부 IP traffic 설정', anchor: '#5' },
                    { text: 'Object 삭제', anchor: '#6' },
                ],
                docsRenderKey: 0,
                rootModelAndElementMap: null,
                codeGeneratorCore: null
            }
        },
        watch: {
            "editTemplateTabNumber":_.debounce(function (val) {
                this.editModeResultViewerRenderKey++;
            }, 500),
            "showModelDataEditor": function(newVal){
                var me = this
                if(!newVal){
                    if(!me.currentModelData.subPath && me.currentModelData.subPath == ""){
                        if(me.modelData[me.currentModelData.name.replace(": ", "")]){
                            me.modelData[me.currentModelData.name.replace(": ", "")] = me.currentModelData.value
                        }
                    } else {
                        me.setModelData(me.modelData, 0)
                    }
                    me.$emit("editModelData", me.modelData)
                    me.active_tree[0] = me.currentModelData.id
                    me.modelDataTreeKey++;
                }
            },
            value: {
                deep: true,
                handler:
                    _.debounce(function (newVal, oldVal) {
                        var me = this
                        if( !me.asyncCodeForValue )
                            return false;
                        var options ={
                            applyCodeStyle : false
                        }
                        me.callGenerate(options);
                    }, 400)
            },
            "callCodeForValue": function(newVal){
                var me = this
                if( me.asyncCodeForValue )
                    return false;

                if(newVal){
                    var options ={
                        applyCodeStyle : false
                    }
                    me.callGenerate(options);
                }
            },
            "oldTreeHashLists": function () {
                this.isChangedPathLists = true
            },
            "isGeneratorDone":{
                handler: _.debounce(function (newVal) {
                    if (newVal) {
                        if (!this.isFirstGenerate) {
                            this.isFirstGenerate = true;
                        }
                        
                        this.startReGenerateCode = false;
                        this.setTemplateTreeList();

                        if (this.reGenerateOnlyModifiedTemplate) {
                            this.setTemplateFramework(this.opennedTemplateFramework);
                        }
                        
                        this.isLoadingExpectedTemplate = true;

                        console.log('>>> Generate Code] End Main <<<', Date.now());
                    }
                }, 500),
            },
            "selectedVersion": function (newVal, oldVal) {
                if (newVal == 'java15') {
                    this.isJava15 = true
                    // this.changedTopping('java15')
                } else {
                    this.isJava15 = false
                    // this.changedTopping('java8')
                }

            },
            "openCodeWeb":function() {
                var localCode = this.openCode[0] && this.openCode[0].code ? this.openCode[0].code : null
                if (this.openCodeWeb[0]) {
                    var ideCode = this.openCodeWeb[0].code
                    var result = this.diff_lineMode(localCode, ideCode)
                    var tmp = JSON.parse(JSON.stringify(this.openCodeWeb))
                    var tmpCode = ""
                    result.forEach(function (data) {
                        /*
                            0: 유지 / 1: 추가 / -1: 제거
                        * */
                        tmpCode = tmpCode.concat(data[1])
                    })
                    tmp[0].code = tmpCode
                    this.openCodeMerge = tmp
                } else {
                    this.openCodeMerge = localCode
                }
            },
            openCode(newVal){
                var me = this;
                if(newVal){
                    me.selectedFile = newVal
                    //me.gptCodes = []
                    //me.collectSelectedFileContents(newVal)
                }
            },
            defaultTemplate: {
                deep: true,
                async handler(newVal, oldVal) {
                    var me = this;
                    if (newVal !== oldVal) {
                        me.isGeneratorDone = false;
                        me.showTemplateTypeList = false;
                        await me.callGenerate();
                    }
                }
            }
            // "changedModifying": async function(newVal) {
            //     var me = this
            //     if (newVal) {
            //         var parser = new ConfigIniParser("\n")
            //         var initContent = await me.getGitConfig()
            //         var parseConfig = parser.parse(initContent);
            //         parseConfig._ini.sections.forEach(function (section) {
            //             if (section.name.includes('origin')) {
            //                 section.options.forEach(function (option) {
            //                     if (option.name == 'url') {
            //                         me.linkedSCM = true;
            //                         me.scmUrl = option.value
            //                     }
            //                 })
            //
            //             }
            //         })
            //     }
            // },
        },
        computed: {
            isDiffMode(){
              if(this.diffMode && this.changedDiffCodeViewer){
                  return true;
              }
              return false;
            },
            basePlatform(){
                if(this.value && this.value.basePlatform){
                    return this.value.basePlatform
                }
                return this.defaultTemplate;
            },
            basePlatformConf(){
                if(this.value && this.value.basePlatformConf){
                    return this.value.basePlatformConf
                }
                return {};
            },
            toppingPlatforms(){
                if(this.value && this.value.toppingPlatforms){
                    return this.value.toppingPlatforms;
                }
                return [];
            },
            toppingPlatformsConf(){
                if(this.value && this.value.toppingPlatformsConf){
                    return this.value.toppingPlatformsConf;
                }
                return {};
            },
            toppingBaseUrl(){
              return 'https://github.com/msa-ez/topping-'
            },
            filteredCustomToppingLists(){
                try{
                    let obj = {};
                    let list = this.tempToppingPlatforms.filter(toppingPlatform => /^http[s]?\:\/\//i.test(toppingPlatform));
                    let localLists = localStorage.getItem('customToppingLists');
                    localLists = localLists ? JSON.parse(localLists) : []

                    list = Array.from(new Set([...list,...localLists]));
                    localStorage.setItem('customToppingLists', JSON.stringify(list));

                    list.forEach(function(str){
                        const match = str.match(/^http[s]?\:\/\/github.com\/([-_A-Za-z0-9\s]+)\//i);
                        obj[match[0]] = list.filter(x=>x.includes(match[0]));
                    });
                    return obj
                }catch(e){
                    console.log(`ERROR] Custom Toppings: ${e}`)
                    return {}
                }
            },
            existChangedFile() {
                if ((this.changedPathLists.length > 0 && this.changedPathListsBucket.length == 0)
                    || (this.changedPathListsBucket && this.changedPathListsBucket.length > 0)
                ) {
                    return true
                }
                return false
            },
            isClosedSeparatePanel() {
                if (this.separatePanelInfo.current > 98) {
                    return true
                }
                return false
            },
            isOnPrem() {
                if (window.MODE == "onprem") {
                    return true
                } else {
                    return false
                }
            },
            isNotFolderIcon(){
                return this.searchForContent.onOff
            },
            filteredTreeOpenList(){
                return this.treeOpenLists ? this.treeOpenLists : []
            },
            // filteredSelectedElementIds() {
            //     var me = this
            //     var eleObj = me.selectedElementIds[0] ? me.selectedElementIds[0] : null
            //     var isEmbedded = eleObj ? eleObj.isEmbedded : false
            //     var eleId = eleObj ? eleObj.id : null
            //
            //     if (eleId) {
            //         var findIdx = me.selectedElementIds.findIndex(obj => obj.id == eleId)
            //         if (findIdx != -1) {
            //             me.selectedElementIds.splice(findIdx, 1);
            //         }
            //     }
            //     return me.selectedElementIds ? me.selectedElementIds : null
            // },
            openCodeFileName(){
                if(this.filteredOpenCode && this.filteredOpenCode.length > 0){
                    return  this.filteredOpenCode[0].name
                }
                return null;
            },
            filteredOpenCode() {
                var me = this;
                if (me.isGeneratorDone) {
                    return me.openCode;

                    // if (me.openCode.length == 0) {
                    //     var getCodePath = localStorage.getItem('openCodePath')
                    //     if (getCodePath) {
                    //         me.openCode[0] = me.codeLists.find(x => x.fullPath == getCodePath)
                    //     } 
                    // }
                    // //done
                    // if (me.openCode.length > 0 && me.openCode[0]) {
                    //     var openCodePath = me.openCode[0].fullPath ? me.openCode[0].fullPath : me.openCode[0].path
                    //     if(!localStorage.getItem('openCodePath')){
                    //         localStorage.setItem('openCodePath', openCodePath)
                    //     }
                    //     if (openCodePath && openCodePath.includes('.java')) {
                    //         setTimeout(()=>{   //TODO: temporal 
                    //             me.openCode[0].code = me.codeAlign(me.openCode[0].code)
                    //         }, 0)
                            
                    //     }
                    //     return me.openCode
                    // }

                    // if (me.treeLists && me.treeLists.length > 0 && !me.editTemplateMode) {
                    //     return me.treeLists[0].children
                    // }

                    // return []
                }
            },
            getDiffTreeLists() {
                var me = this
                // var list = {}
                var newList = []
                if (me.oldTreeHashLists && Object.keys(me.oldTreeHashLists) && Object.keys(me.oldTreeHashLists).length > 0) {

                    var diffArr = Object.keys(me.newTreeHashLists).filter((hash, index) => {
                        if (me.oldTreeHashLists && Object.keys(me.oldTreeHashLists).indexOf(hash) == -1) {
                            return true
                        }
                    });

                    const diffArrSet = new Set(diffArr);
                    var diffHash = [...diffArrSet];

                    if (diffHash.length > 0) {
                        diffHash.forEach(function (hash) {
                            var path = me.newTreeHashLists[hash]
                            newList.push(path)
                        })
                    }


                    if (!me.changedPathLists) me.changedPathLists = []
                    if (newList.length > 0 && me.isChangedPathLists) {
                        // me.changedPathLists = me.changedPathLists.concat(newList)
                        me.changedPathLists = [
                            ...me.changedPathLists,
                            ...newList,
                        ];

                        const setse = new Set(me.changedPathLists);
                        me.changedPathLists = [...setse];
                        me.isChangedPathLists = false


                        me.changedPathListsForGit = [
                            ...me.changedPathListsForGit,
                            ...me.changedPathLists,
                        ];
                        const setsegit = new Set(me.changedPathListsForGit);
                        me.changedPathListsForGit = [...setsegit];
                        me.gitMenuRenderKey++;
                    }

                    return me.changedPathLists
                }
                return []
            },
            onlyJava15() {
                if (this.defaultTemplate == 'https://github.com/msa-ez/template-spring-boot-mybatis') {
                    this.selectedVersion = 'java15';
                    return true
                }
                return false
            },
            editableTemplate(){
                // return this.isMineProject
                return true
            },
            filteredTreeLists(){
                var me = this
                // me.showTemplatePath = false;
                return me.newTreeList;

                if (!me.isClosedSeparatePanel && me.isGeneratorDone) {
                    try {
                        return me.newTreeList;
                    } catch (e) {
                        console.log(`ERROR] Filtered TreeLists:: ${e}`)
                        return [];
                    }
                }
                return [];
            },
            filteredCodeLists() {
                var me = this;
                var codeList = me.setAutoGenerateCodetoList ? me.setAutoGenerateCodetoList : me.codeLists;
                // var copyCodeLists = JSON.parse(JSON.stringify(codeList));

                // try{
                //     copyCodeLists = me.clearDesignPatterns(copyCodeLists);
                // } catch (e) {
                //     console.log(`ERROR] Filtered CodeLists:: ${e}`)
                // } finally {
                //     me.setAutoGenerateCodetoList = null;
                //     return copyCodeLists
                // }
                return codeList;
            },
            filteredPrettierCodeLists() {
                var me = this;
                let copyCodeLists = me.filteredCodeLists;

                try{
                    if (copyCodeLists && copyCodeLists.length > 0) {
                        copyCodeLists.forEach(codeObj => {
                            if (codeObj && codeObj.fullPath.includes('.java')) {
                                codeObj.code = me.codeAlign(codeObj.code);
                            }
                        })
                    }
                    return copyCodeLists;
                }catch (e) {
                    console.log(`ERROR] Prettier CodeLists ${e}`);
                    return  me.filteredCodeLists;
                }
            },
            selectedTemplateType() {
                return this.templateTypeList.indexOf(this.defaultTemplate)
            }
        },
        created() {
            // let canvas = getParent(this.$parent, this.canvasName);
            // this.core = new CodeGeneratorCore({
            //     canvas: canvas,
            //     projectName: this.projectName,
            //     gitURLforModel: this.gitURLforModel,
            //     defaultTemplate: 'https://github.com/msa-ez/template-spring-boot'
            // });
            
            this.openCodeGenerator();
            this.settingGithub();
            this.initHandleBars(window.$HandleBars);
            this.callGenerate();

        },
        beforeDestroy: function () {
            this.closeCodeViewer();
        },
        mounted() { 
            var me = this;

            if (localStorage.getItem("editTemplateList") && me.firstSetEditTemplateList) {
                var CircularJSON = require('circular-json');
                var obj = CircularJSON.parse(localStorage.getItem("editTemplateList"));
                if (obj && obj.projectId == me.modelingProjectId) {
                    me.editTemplateFrameWorkList = obj.editTemplateList;
                }
                me.firstSetEditTemplateList = false;
            }
            Object.keys(me.editTemplateFrameWorkList).forEach(key => {
                Object.keys(me.editTemplateFrameWorkList[key]).forEach(filePath => {
                    if (!me.editTemplateFrameWorkList[key][filePath].failedGenerate) {
                        if (!me.templateFrameWorkList[key]) {
                            me.templateFrameWorkList[key] = {};
                        }
                        if (me.editTemplateFrameWorkList[key][filePath].isDeleted) {
                            me.templateFrameWorkList[key][filePath] = {
                                isDeleted: true
                            };
                        } else {
                            me.templateFrameWorkList[key][filePath] = {
                                content: me.editTemplateFrameWorkList[key][filePath].code,
                                refList: [],
                                requestUrl: null
                            };
                        }
                    }
                });
            });

            
            if(localStorage.getItem("openaiToken")){
                me.openaiToken = localStorage.getItem("openaiToken")
            }

            // EventBus
            me.$EventBus.$on('deploy', async function (boundedId) {
                await me.callGenerate();
            });

            me.$EventBus.$on('downloadCode',function () {
                me.downloadArchive();
            });

            me.$EventBus.$on('selectedElementObj', function (selectedObj) {
                var id = selectedObj.id

                if (selectedObj['selected']) {
                    me.selectedElementIds.push(selectedObj)
                } else {
                    var fidx = me.selectedElementIds.findIndex(obj => obj.id == id)
                    if (fidx != -1) {
                        me.selectedElementIds.splice(fidx, 1);
                    }
                }
            });


            $(document).keydown((evt) => {
                var FkeyCode = 70;
                var PkeyCode = 80;
                var ESCKeyCode = 27;

                if (evt.keyCode == PkeyCode && (evt.metaKey || evt.ctrlKey)) {
                    var result = me.searchForReady('files')
                    return result  == true ? true : false;
                } else if (evt.keyCode == FkeyCode && (evt.metaKey || evt.ctrlKey)) {
                    var result = me.searchForReady('contents')
                    return result == true ? true : false;
                } else if(evt.keyCode == ESCKeyCode){
                    if( me.searchForFile.onOff || me.searchForContent.onOff){
                        me.searchForContent.onOff = false
                        me.searchForFile.onOff = false
                        return false;
                    }
                }
            });
        },
        methods: {
            testTemplateModel(){
                var me = this
                me.startCheckDiff = true
                var template = me.openCode[0].template ? me.openCode[0].template : me.defaultTemplate

                if(me.templateFrameWorkList[template]['.template/metadata.yml']){
                    me.templateMetaData = YAML.parse(me.templateFrameWorkList[template]['.template/metadata.yml'].content)
                    me.templateMetaData.testModel = me.templateMetaData.testModel.replace('storming/', '')
                    me.templateMetaData.testModel = me.templateMetaData.testModel.replaceAll('/', '')
    
                    me.existOnlyExpected = []
                    me.existOnlyActual = []
                    me.diffList = []
    
                    var diffFile
                    Object.keys(me.templateFrameWorkList[template]).forEach(function (key){
                        if(key.includes('.template/')){
                            var filePath = key.replace('.template/test/expected/', '').replace(`${me.templateMetaData.testModel}/`, `${me.modelingProjectId}/`)
                            diffFile = me.codeLists.find(x => x.fullPath == filePath)
                            if(diffFile){
                                var actualCode = me.codeAlign(diffFile.code)
                                var expectedCode = me.templateFrameWorkList[template][key].content
                                let diff = jsondiffpatch.diff(actualCode.replaceAll(me.modelingProjectId, me.templateMetaData.testModel), expectedCode)
                                if(diff){
                                    me.diffList.push(filePath)
                                }
                            } else {
                                me.existOnlyExpected.push(filePath)
                            }
                        }
                    })
    
                    me.codeLists.forEach(function (file){
                        diffFile = me.templateFrameWorkList[template][`.template/test/expected/${file.fullPath.replace(`${me.modelingProjectId}/`, `${me.templateMetaData.testModel}/`)}`]
                        if(!diffFile){
                            me.existOnlyActual.push(file.fullPath)
                        } 
                    })
                    if(me.diffList.length > 0 || me.existOnlyExpected.length > 0 || me.existOnlyActual.length > 0){
                        me.openExpectedTemplateTestDialog = true
                    } else {
                        alert("Every files are identical")
                    }
    
                    me.startCheckDiff = false
                }
            },
            setModelData(modelData, roofNumber){
                var me = this
                var pathList = me.treePathList[me.currentModelData.id].split("/")
                Object.keys(modelData).some(function (key){
                    if(pathList.length < roofNumber){
                        return true;
                    } else {
                        if(key == pathList[roofNumber]){
                            if(key == pathList[pathList.length - 1]){
                                modelData[key] = me.currentModelData.value 
                            } else {
                                console.log(key)
                                roofNumber++;
                                me.setModelData(modelData[key], roofNumber)
                            }
                        }
                    }
                })
            },  
            setSelectedTempTreePath(item){
                if(item && item.currentPath && item.platform){
                    this.selectedTempTreePath[item.platform] = item.currentPath
                    this.treeItemRenderKey++;
                }
            },
            openTemplateTreeEditor(item, mode){
                this.showTemplateTreeEditor = true
                this.selectedTreeItemPath = null
                if(item){
                    if(typeof item == "object"){
                        this.selectedTreeItem = item
                        this.selectedTreeItemPath = item.platform.replace("https://github.com/", "") + "/"
                        this.selectedTreeItem.subPath = item.currentPath.replace(item.name, "")
                    } else {
                        this.selectedTreeItemPath = item.replace("https://github.com/", "")
                        var obj = {
                            children: [],
                            code: "",
                            currentPath: "",
                            file: null,
                            name: "",
                            path: "",
                            platform: item,
                            isNew: true,
                        }
                        this.selectedTreeItem = obj
                    }
                } else {
                    this.templateTreeList['New_Template'] = []
                    var readmeFile = {
                        children: null,
                        code: "New Template",
                        currentPath: "README.md",
                        file: "md",
                        name: "README.md",
                        path: "README.md",
                        platform: "https://github.com/jhyg/template-spring-boot"
                    }
                    this.templateTreeList['New_Template'].push(readmeFile)

                    this.selectedTreeItem = this.templateTreeList['New_Template']
                }
                this.selectedTreeItem.editMode = mode
                if(mode.includes("add")){
                    this.selectedTreeItem.newName = ""
                } else if(mode == 'edit'){
                    this.selectedTreeItem.newName = this.selectedTreeItem.name
                }
            },  
            editTreeItem() {
                var me = this;
                if(me.selectedTreeItem.editMode.includes('add')) {
                    if(me.selectedTreeItem.editMode == 'add New') {
                        me.selectedTreeItem.newName = me.newTemplateType + '-' + me.selectedTreeItem.newName
                        me.templateTreeList[me.selectedTreeItem.newName] = me.templateTreeList['New_Template']
                        delete me.templateTreeList['New_Template']
                    } else {
                        var currentPath = me.selectedTreeItem.currentPath && me.selectedTreeItem.currentPath != "" ? me.selectedTreeItem.currentPath + '/' + me.selectedTreeItem.newName : me.selectedTreeItem.newName
                        var obj = {
                            children: null,
                            code: "",
                            currentPath: currentPath,
                            file: null,
                            name: me.selectedTreeItem.newName,
                            path: currentPath,
                            platform: me.selectedTreeItem.platform,
                        }
                        if(me.selectedTreeItem.editMode == 'add file'){
                            var fileName = me.selectedTreeItem.newName.split('.')
                            obj.file = fileName[1]
                            obj.computedFileName = me.selectedTreeItem.newName
                            obj.computedSubFileName = me.selectedTreeItem.currentPath + '/'

                            if(!me.editTemplateFrameWorkList[obj.platform]){
                                me.editTemplateFrameWorkList[obj.platform] = {}
                            }
                            if(!me.templateFrameWorkList[obj.platform]){
                                me.templateFrameWorkList[obj.platform] = {}
                            }
                            
                            me.editTemplateFrameWorkList[obj.platform][obj.currentPath] = {
                                code: "// new",
                                element: [
                                    obj
                                ],
                                isAdded: true,
                            }
                            me.templateFrameWorkList[obj.platform][obj.currentPath] = {
                                content: "// new",
                                refList: [],
                                requestUrl: null
                            }
                        } else if(me.selectedTreeItem.editMode == 'add folder'){
                            obj.children = []
                        } 
                        if(me.selectedTreeItem.isNew){
                            me.templateTreeList[me.selectedTreeItem.platform].push(obj)
                        } else {
                            me.selectedTreeItem.children.push(obj)
                        }
                    }
                } else {
                    if(me.selectedTreeItem.editMode == 'edit'){
                        var fileName = me.selectedTreeItem.newName.split('.')
                        var obj = {
                            children: null,
                            code: me.selectedTreeItem.code,
                            currentPath: me.selectedTreeItem.currentPath.replace(me.selectedTreeItem.name, me.selectedTreeItem.newName),
                            computedFileName: me.selectedTreeItem.newName,
                            computedSubFileName: me.selectedTreeItem.currentPath.replace(me.selectedTreeItem.name, ""),
                            file: fileName[1],
                            name: me.selectedTreeItem.newName,
                            path: me.selectedTreeItem.currentPath.replace(me.selectedTreeItem.name, me.selectedTreeItem.newName),
                            platform: me.selectedTreeItem.platform,
                        }

                        me.editTemplateFrameWorkList[obj.platform][obj.currentPath] = {
                            code: obj.code,
                            element: [
                                obj
                            ],
                            isEditted: true,
                        }
                        me.templateFrameWorkList[obj.platform][obj.currentPath] = {
                            content: obj.code,
                            refList: [],
                            requestUrl: null
                        }
                    }

                    if(me.selectedTreeItem.editMode == 'edit' || me.selectedTreeItem.editMode == 'delete'){ 
                        me.selectedTreeItem.computedFileName = me.selectedTreeItem.name,
                        me.selectedTreeItem.computedSubFileName = me.selectedTreeItem.currentPath.replace(me.selectedTreeItem.name, "")
                        
                        me.editTemplateFrameWorkList[me.selectedTreeItem.platform][me.selectedTreeItem.currentPath] = {
                            code: me.selectedTreeItem.code,
                            element: [
                                me.selectedTreeItem
                            ],
                            isDeleted: true
                        }
                        me.templateFrameWorkList[me.selectedTreeItem.platform][me.selectedTreeItem.currentPath] = {
                            isDeleted: true
                        }
                    }
                    me.setTemplateTreeList()
                }

                me.showTemplateTreeEditor = false
                me.templateTreeRenderkey++;

                var obj = {
                    projectId: me.modelingProjectId,
                    editTemplateList: me.editTemplateFrameWorkList
                }
                var CircularJSON = require('circular-json');
                var str = CircularJSON.stringify(obj);
                localStorage.setItem("editTemplateList", str)

            },
            pasteModelValue(item) {
                if (this.treePathList[item.id]) {
                    var subPath = this.treePathList[item.id].replace(item.name.replace(": ", ""), "")
                    console.log(subPath + item.name.replace(": ", ""))
                    this.$EventBus.$emit('pasteModelValue', subPath + item.name.replace(": ", ""))
                }
            },
            openModelDataEditor(item) {
                this.showModelDataEditor = true
                this.currentModelData = item
                if(this.treePathList[item.id]){
                    this.currentModelData.subPath = this.treePathList[item.id].replace(item.name.replace(": ", ""), "")
                }
            },  
            fetchChildren(obj){
                var me = this
                var data = me.modelData
                me.treePathList[obj.id].split("/").forEach(function (key){
                    data = data[key]
                })
                if(data == "" || data == null || typeof data == 'string' || typeof data == 'boolean' || typeof data == 'number'){
                    obj.name = obj.name + ': '
                    if(data == null){
                        obj.value = "null"
                    } else if(data == ""){
                        obj.value = '""'
                    } else {
                        obj.value = typeof data == 'boolean' || typeof data == 'number' ? JSON.stringify(data) : data
                    }
                    delete obj.children
                } else {
                    Object.keys(data).forEach(function (childrenKey){
                        me.treeDataCnt++;
                        if(data[childrenKey] == "" || data[childrenKey] == null || typeof data[childrenKey] == 'string' || typeof data[childrenKey] == 'boolean' || typeof data[childrenKey] == 'number'){
                            var childrenData = {
                                id: me.treeDataCnt,
                                name: childrenKey + ': ',
                                value: null
                            }
                            if(data[childrenKey] == null){
                                childrenData.value = "null"
                            } else if(data[childrenKey] == ""){
                                childrenData.value = '""'
                            } else {
                                childrenData.value = typeof data[childrenKey] == 'boolean' || typeof data[childrenKey] == 'number' ? JSON.stringify(data[childrenKey]) : data[childrenKey]
                            }
                        } else {
                            var childrenData = {
                                id: me.treeDataCnt,
                                name: childrenKey,
                                value: null,
                                children: [],
                            }
                        }
                        me.treePathList[me.treeDataCnt] = me.treePathList[obj.id] + "/" + childrenKey
                        obj.children.push(childrenData)
                    })
                }
            },
            alertReLogin() {
                alert("You need to re-login because session is expired");
                this.showLoginCard = true;
            },
            showTemplateListChip(obj) {
                if (obj.showTemplateChip) {
                    return true;
                }
                return false;
            },
            async processTemplateUseOpenAi(modifiedValueList) {
                var me = this;
                me.startTemplateGenerate = true;
                var content;
                var startGen = false;
                // if(prompt == "autoGen"){
                    Object.keys(modifiedValueList).forEach(function (key){
                        if(modifiedValueList[key] != {}){
                            Object.keys(modifiedValueList[key]).forEach(function (val){
                                let path = modifiedValueList[key][val]
                                let value = val
                                me.convertStringToObj(path, value);
                            })
                        }
                    })
                    var CircularJSON = require('circular-json');
                    var str = CircularJSON.stringify(me.convertedObj);

                    content = `If I have this model in json: ${str}
                    I want to make a mustache template that generating following source code:` 
                    + me.originMustacheTemplate[0].code

                    startGen = true;
                // } else {
                //     if(prompt != '' && prompt != null){
                //         console.log(prompt)
                //         content = prompt + "that response must be Java code without natural language."
                //         startGen = true
                //     }
                // }
                if (me.openaiToken && startGen) {
                    let tokenLength = 4092 - Math.round(content.length/3.5)
                    let data = {
                        model: "text-davinci-003",
                        prompt: content,
                        temperature: 0.5,
                        max_tokens: tokenLength ? tokenLength : 3000, 
                    }
                    let header = {
                        Authorization: `Bearer ${me.openaiToken}`,
                        'Content-Type': 'application/json'
                    }

                    let respones = await axios.post(`https://api.openai.com/v1/completions`, data, { headers: header })
                    .catch(function (error) {
                        me.startGenerateUseOpenAI = false
                        if(error.response && error.response.data && error.response.data.message){
                            var errText = error.response.data.message
                            if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                                errText = errText + ', ' + error.response.data.errors[0].message
                            }
                            alert(errText)
                        } else {
                            alert(error.message)
                        }
                    }); 
                    if(respones.data.choices[0].text){
                        // if(prompt == "autoGen"){
                            me.modifiedMustacheTemplate[0].code = respones.data.choices[0].text
                            me.startGenerateUseOpenAI = false
                        // } else {
                        //     // console.log(respones.data.choices[0].text)
                        //     me.openAiResult = me.codeAlign(respones.data.choices[0].text)
                        // }
                        me.startTemplateGenerate = false
                    }

                } else {
                    me.startGenerateUseOpenAI = false
                    if(!me.openaiToken){
                        alert("input Token")
                    }
                }
            },
            emitEventChangedTemplate(tmpObj){
                this.changePlatformToForkedRepo(tmpObj.tmp, tmpObj.isBaseTemplate, tmpObj.treeItem)
            },
            setOpenedFolderList(item){
                if(item && item.length > 0){
                    var platform = item[0].platform
                    if(this.selectedTemplateTreePathList[platform]){
                        this.selectedTemplateTreePathList[platform] = item
                    }
                }
            },
            setTemplateFileName(platform, template){
                var me = this
                me.selectedEditTemplateName = platform + '/' + template
                me.selectedTemplateFileName = {}
                me.selectedTemplateFileName[platform] = []
                if(!me.selectedTemplateTreePathList[platform]){
                    me.selectedTemplateTreePathList[platform] = []
                }
                var splitTemplatePath = template.split("/")
                var currentPath = ""
                var addOpenPath = false
                splitTemplatePath.forEach(function (path, idx){
                    if(idx != splitTemplatePath.length - 1){
                        if(currentPath != ""){
                            currentPath = currentPath + "/" + path
                        } else {
                            currentPath = path
                        }
                        var obj = { currentPath: currentPath }
                        if(!me.selectedTemplateTreePathList[platform].find(x => x.currentPath == currentPath)){
                            me.selectedTemplateTreePathList[platform].push(obj)
                            addOpenPath = true
                        }
                    } else {
                        currentPath = currentPath + '/' + path
                        var obj = { currentPath: currentPath }
                        me.selectedTemplateFileName[platform].push(obj)
                    }
                })
                if(addOpenPath){
                    me.templateTreeRenderkey++;
                }
            },
            setHover(platform, template){
                var me = this
                if(platform){
                    me.isHoveredTemplateFilePath = platform + '/' + template
                } else {
                    me.isHoveredTemplateFilePath = null
                }
            },
            deleteModifiedTemplate(plf, tmp){
                var me = this
                delete me.editTemplateFrameWorkList[plf][tmp]
                var obj = {
                    projectId: me.modelingProjectId,
                    editTemplateList: me.editTemplateFrameWorkList
                }
                var CircularJSON = require('circular-json');
                var str = CircularJSON.stringify(obj);
                localStorage.setItem("editTemplateList", str)
            },
            closeGitMenu(){
                var me = this
                me.githubTokenError = false 
            },
            reGenerateTemplateCode(){
                var me = this
                me.startReGenerateCode = true
                me.reGenerateOnlyModifiedTemplate = true
                var option = {
                    editCode: true,
                    platform: me.getPlatformPath(),
                    filePath: me.getFilePath()
                }

                me.callGenerate(option)
                me.codeGenTimeout = null
                // var obj = {
                //     projectId: me.modelingProjectId,
                //     editTemplateList: me.editTemplateFrameWorkList
                // }
                // var CircularJSON = require('circular-json');
                // var str = CircularJSON.stringify(obj);
                // localStorage.setItem("editTemplateList", str)
            },
            getPlatformPath(){
                var me = this
                let platformPath
                if(me.opennedTemplateFramework[0].template){
                    platformPath = me.opennedTemplateFramework[0].template
                } else {
                    if(me.opennedTemplateFramework[0].platform){
                        platformPath = me.opennedTemplateFramework[0].platform
                    } else {
                        platformPath = me.opennedTemplateFramework[0].preferredPlatform
                    }
                }
                return platformPath
            },
            getTempPath(){
                var me = this
                let tempPath
                if(me.opennedTemplateFramework[0].templatePath){
                    tempPath = me.opennedTemplateFramework[0].templatePath
                } else {
                    tempPath = me.opennedTemplateFramework[0].path
                }
                return tempPath
            },
            getFilePath(){
                var me = this
                let filePath
                if(me.opennedTemplateFramework[0].fullPath){
                    filePath = me.opennedTemplateFramework[0].fullPath
                } 
                if(me.opennedTemplateFramework[0].refList && me.opennedTemplateFramework[0].refList.length > 0){
                    if(!filePath || !me.opennedTemplateFramework[0].refList.find(x => x == filePath)){
                        filePath = me.opennedTemplateFramework[0].refList[0]
                    }
                } 
               
                return filePath
            },
            setTemplateResult(ref){
                var me = this
                let opennedReferenceFile
                let code
                let platform = me.getPlatformPath();
                let tempPath = me.getTempPath();
                let filePath = ref

                me.isErrTempResult = null

                if(me.errTempResultList[platform] && me.errTempResultList[platform][tempPath] && me.errTempResultList[platform][tempPath][filePath]){
                    me.isErrTempResult = me.errTempResultList[platform][tempPath][filePath]
                }

                if(me.editTemplateFrameWorkList[platform] && me.editTemplateFrameWorkList[platform][tempPath] && me.editTemplateFrameWorkList[platform][tempPath].errorMessage){
                    me.opennedTemplateFramework[0].templateErrMsg = me.editTemplateFrameWorkList[platform][tempPath].errorMessage
                    me.openCode[0] = null
                    me.editModeResultViewerRenderKey++;
                } else {
                    if(ref == null){
                        me.openCode[0] = undefined
                    } else {
                        if(me.openCode && me.openCode[0] && me.openCode[0].fullPath == ref){
                            opennedReferenceFile = me.openCode[0]
                        } else {
                            // if(me.editTemplateFrameWorkList[platform][tempPath] && me.editTemplateFrameWorkList[platform][tempPath].elementResult && me.editTemplateFrameWorkList[platform][tempPath].elementResult.fullPath == ref){
                            //     opennedReferenceFile = me.editTemplateFrameWorkList[platform][tempPath].elementResult
                            // }  
        
                            if(!opennedReferenceFile || opennedReferenceFile.code == ""){
                                if(!opennedReferenceFile){
                                    opennedReferenceFile = me.filteredPrettierCodeLists.find(x => x.fullPath == ref)
                                } else {
                                    code = me.filteredPrettierCodeLists.find(x => x.fullPath == ref)
                                    if(code && code.code != ""){
                                        opennedReferenceFile.code = code.code
                                    }
                                }
                                if(!opennedReferenceFile || opennedReferenceFile.code == ""){
                                    if(!opennedReferenceFile){
                                        opennedReferenceFile = me.filteredPrettierCodeLists.find(x => x.templatePath == ref)
                                    } else {
                                        code = me.filteredPrettierCodeLists.find(x => x.templatePath == ref)
                                        if(code && code.code != ""){
                                            opennedReferenceFile.code = code.code
                                        }
                                    }
                                    if(!opennedReferenceFile || opennedReferenceFile.code == ""){
                                        if(!opennedReferenceFile){
                                            opennedReferenceFile = me.codeLists.find(x => x.fullPath == ref)
                                        } else {
                                            code = me.codeLists.find(x => x.fullPath == ref)
                                            if(code && code.code != ""){
                                                opennedReferenceFile.code = code.code
                                            }
                                        }
                                        if(!opennedReferenceFile || opennedReferenceFile.code == ""){
                                            if(!opennedReferenceFile){
                                                opennedReferenceFile = me.codeLists.find(x => x.templatePath == ref)
                                            } else {
                                                code = me.codeLists.find(x => x.templatePath == ref)
                                                if(code && code.code != ""){
                                                    opennedReferenceFile.code = code.code
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
    
    
                        if(opennedReferenceFile){
                            if(me.templateFrameWorkList[platform][tempPath] && me.templateFrameWorkList[platform][tempPath].refList){
                                opennedReferenceFile.refList = me.templateFrameWorkList[platform][tempPath].refList
                            }
                            me.openCode[0] = opennedReferenceFile
                            
                            if(opennedReferenceFile){
                                var obj = null
                                if(tempPath.includes('for-model/')){
                                    obj = me.rootModelAndElementMap.rootModel
                                } else if(me.modelForElement[platform] && me.modelForElement[platform][tempPath] && me.modelForElement[platform][tempPath][filePath]){
                                    obj = me.modelForElement[platform][tempPath][filePath]
                                } 

                                if(!obj){
                                    obj = me.rootModelAndElementMap.rootModel
                                }

                                me.modelData = obj
                                me.treePathList = {}
                                me.treeData = []
                                me.treeDataCnt = 1
                                Object.keys(obj).forEach(function (key){
                                    if(obj[key] == "" || obj[key] == null || typeof obj[key] == 'string' || typeof obj[key] == 'boolean' || typeof obj[key] == 'number'){
                                        var data = {
                                            id: me.treeDataCnt,
                                            name: key + ': ',
                                            value: null
                                        }
                                        if(obj[key] == null){
                                            data.value = 'null'
                                        } else if(obj[key] == ""){
                                            data.value = '""'
                                        } else {
                                            data.value = typeof obj[key] == 'boolean' || typeof obj[key] == 'number' ? JSON.stringify(obj[key]) : obj[key]
                                        }
                                        me.treePathList[me.treeDataCnt] = key
                                    } else {
                                        var data = {
                                            id: me.treeDataCnt,
                                            name: key,
                                            children: [],
                                            value: null
                                        }
                                        me.treePathList[me.treeDataCnt] = key
                                        Object.keys(obj[key]).forEach(function (childrenKey){
                                            me.treeDataCnt++;
                                            if(obj[key][childrenKey] == "" || obj[key][childrenKey] == null || typeof obj[key][childrenKey] == 'string' || typeof obj[key][childrenKey] == 'boolean' || typeof obj[key][childrenKey] == 'number'){
                                                var childrenData = {
                                                    id: me.treeDataCnt,
                                                    name: childrenKey + ': ',
                                                    value: null
                                                }
                                                if(obj[key][childrenKey] == null){
                                                    childrenData.value = 'null'
                                                } else if(obj[key] == ""){
                                                    childrenData.value = '""'
                                                } else {
                                                    childrenData.value = typeof obj[key][childrenKey] == 'boolean' || typeof obj[key][childrenKey] == 'number' ? JSON.stringify(obj[key][childrenKey]) : obj[key][childrenKey]
                                                }
                                            } else {
                                                var childrenData = {
                                                    id: me.treeDataCnt,
                                                    name: childrenKey,
                                                    children: [],
                                                    value: null
                                                }
                                            }
                                            me.treePathList[me.treeDataCnt] = key + "/" + childrenKey
                                            data.children.push(childrenData)
                                        })
                                    }
                                    me.treeData.push(data)
                                    me.treeDataCnt++;
                                })

                                me.opennedTemplateFramework[0].eleKeys = obj
                                me.editTemplateTabNumber = 0
                            }
                        }
                    }
                    if(ref == null || !opennedReferenceFile){
                        if(me.editTemplateFrameWorkList[platform] && me.editTemplateFrameWorkList[platform][tempPath]){
                            if(me.editTemplateFrameWorkList[platform][tempPath].failedGenerate){
                                // me.loadEditTemplate(platform, tempPath, "click")
                            } else {
                                if(!me.editTemplateFrameWorkList[platform][tempPath].isFixed){
                                    me.neverUsedTmp = true
                                }
                            }
                        } else {
                            me.neverUsedTmp = true
                        }
                    } else {
                        me.neverUsedTmp = false
                    }
                    me.editModeResultViewerRenderKey++;
                }
            },
            setTemplateTreeList(){
                var me = this
                me.templateTreeList = {} 
                let editTemplateFrameWorkList = {}

                Object.keys(me.templateFrameWorkList).forEach(function (platform){
                    me.templateTreeList[platform] = []
                    if(me.editTemplateFrameWorkList[platform]){
                        editTemplateFrameWorkList[platform] = me.editTemplateFrameWorkList[platform]
                    }

                    var lists = JSON.parse(JSON.stringify(me.templateFrameWorkList[platform]))

                    if(lists){
                        Object.keys(lists).forEach(function (key){
                            if(!lists[key].isDeleted){
                                // var currentFolder = treeLists; 
                                var currentFolder = me.templateTreeList[platform]; 
                                var currentPath = "";
    
                                key.split('/').forEach(fileName => {
                                    currentPath = currentPath + "/" + fileName;
    
                                    var isFolder = !(("/" + key) === currentPath);
    
                                    var fileObj = currentFolder.find(x => x.name === fileName.trim());
                                    if(!fileObj){
                                        var fileType = me.fileType(fileName)
                                        fileObj = {
                                            platform: platform,
                                            name: fileName.trim(),
                                            children: isFolder ? [] : null,
                                            file: fileType,
                                            code: fileType ? lists[key].content : null,
                                            path: key,
                                            currentPath: currentPath.replace('/', ''),
                                        };
    
                                        currentFolder.push(fileObj);
                                    }
                                    currentFolder = fileObj.children;
                                })
                            }
                        })
                    }
                })

                me.editTemplateFrameWorkList = editTemplateFrameWorkList
                var obj = {
                    projectId: me.modelingProjectId,
                    editTemplateList: me.editTemplateFrameWorkList
                }
                var CircularJSON = require('circular-json');
                var str = CircularJSON.stringify(obj);
                localStorage.setItem("editTemplateList", str)
            },
            isUsedTopping(topping){
                return this.tempToppingPlatforms.includes(topping)
            },
            removeCustomTopping(topping) {
                let apply = this.tempToppingPlatforms.includes(topping);
                let list = localStorage.getItem('customToppingLists')
                list = list ? JSON.parse(list) : []

                if (apply) {
                    let applyIndex = this.tempToppingPlatforms.indexOf(topping);
                    this.tempToppingPlatforms.splice(applyIndex, 1)
                }

                if (list.includes(topping)) {
                    let index = list.indexOf(topping);
                    list.splice(index, 1)
                    localStorage.setItem('customToppingLists', JSON.stringify(list));
                }

            },
            stopGenerate(){
                var me = this
                if(me.startGenerate) {
                    me.stopAutoGenerate = true
                    me.startGenerate = false
                }
            },
            onDiffMode(){
                this.diffMode = !this.diffMode
            },
            isExistConfTemplate(division, template, isTopping){
                var me = this

                if( division == 'BASE' && me.$manifestsPerBaseTemplate[template] ){
                    return me.$manifestsPerBaseTemplate[me.basePlatform].find(x=>x.includes('for-model/_template/')) ? true : false
                }else if( division == 'TEMPLATE' && me.$manifestsPerTemplate[template] ){
                    return me.$manifestsPerTemplate[template].find(x=> x.includes('_template') && !x.includes('for-model/_template')) ? true : false
                }else if( division == 'TOPPING' && me.$manifestsPerToppings[template] ){
                    return me.$manifestsPerToppings[template].find(x=> x.includes('_template') && x.includes('for-model/_template')) ? true : false
                }
                return false;
            },
            configurationTemplate(division , codeObj){
                var me = this

                try {
                    var elementId = codeObj;
                    var template = null;
                    var templateKey = null;
                    var conf = null;

                    if(!me._templateLists){
                        return null;
                    }

                    if(division == 'BASE'){
                        templateKey = Object.keys(me._templateLists).find(x=>x.includes(codeObj.split('/')[codeObj.split('/').length-1]));
                        conf = me.basePlatformConf[codeObj] ? JSON.parse(JSON.stringify(me.basePlatformConf[codeObj])) : null;
                    } else if(division == 'TEMPLATE'){
                        elementId = codeObj.bcId;
                        if(me.value.elements[elementId]){
                            templateKey = Object.keys(me._templateLists).find(x=>x.includes(me.value.elements[elementId].name));

                            conf =
                                me.value.elements[elementId].preferredPlatformConf
                                && me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform]
                                    ? me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform]
                                    : null;
                        }

                        if(!conf) {
                            conf = me.basePlatformConf[me.basePlatform] ? JSON.parse(JSON.stringify(me.basePlatformConf[me.basePlatform])) : null;
                        }
                    } else if(division == 'TOPPING'){
                        elementId = codeObj.includes(me.toppingBaseUrl) ? codeObj.split(me.toppingBaseUrl)[1] : codeObj
                        templateKey = Object.keys(me._templateLists).find(x=>x.includes(codeObj.split('/')[codeObj.split('/').length-1]));
                        conf = me.value.toppingPlatformsConf && me.value.toppingPlatformsConf[elementId]
                            ? me.value.toppingPlatformsConf[elementId]
                            : null;
                    }


                    conf = conf ? JSON.parse(JSON.stringify(conf)) : null;
                    template = templateKey && me._templateLists[templateKey] ? me._templateLists[templateKey] : null;
                    if(template){
                        return { division: division, template: template, configuration: conf, elementId: elementId };
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
            // configurationTemplate(codeObj){
            //     var me = this
            //
            //     try {
            //         var elementId = codeObj == 'BASE' ? codeObj : codeObj.bcId;
            //         var template = null;
            //         var templateKey = null;
            //         var conf = null;
            //
            //         if( !codeObj ){
            //             return null;
            //         }
            //         if(!me._templateLists){
            //             return null;
            //         }
            //         if(elementId == 'BASE'){
            //             templateKey = Object.keys(me._templateLists).find(x=>x.includes('for-model'));
            //         } else {
            //             if(me.value.elements[elementId]){
            //                 templateKey = Object.keys(me._templateLists).find(x=>x.includes(me.value.elements[elementId].name));
            //
            //                 conf =
            //                     me.value.elements[elementId].preferredPlatformConf
            //                     && me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform]
            //                     ? me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform]
            //                     : null;
            //             }
            //         }
            //
            //         if( !conf ){
            //             conf = me.value.basePlatform ? JSON.parse(JSON.stringify(me.value.basePlatformConf[me.value.basePlatform])) : null;
            //         }
            //         conf = conf ? JSON.parse(JSON.stringify(conf)) : null;
            //
            //         template = me._templateLists[templateKey] && templateKey ? me._templateLists[templateKey] : null;
            //         if(template){
            //             return { template: template, configuration: conf, elementId: elementId };
            //         }
            //         return null;
            //     } catch (e) {
            //         return null;
            //     }
            // },
            applyCodeConfiguration(division, elementId , configuration){
                var me = this
                let conf = null;

                if(division == 'BASE'){
                    conf = me.basePlatformConf[me.basePlatform];
                }else if(division == 'TOPPING'){
                    conf = me.value.toppingPlatformsConf[elementId]
                } else if(division == 'TEMPLATE'){
                    conf = me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform]
                }

                var isEquals = JSON.stringify(conf) == JSON.stringify(configuration);

                if( !isEquals ){
                    if(configuration.package){
                        configuration.package = configuration.package.replace(/ /gi, "/").replace("-", "");
                        configuration.packagePath = `src/main/java/${configuration.package}`
                    }
                    me.$emit('changedByMe', true);
                    if(division == 'BASE'){
                        me.basePlatformConf[me.basePlatform] = JSON.parse(JSON.stringify(configuration));
                        me.basePlatformConf.__ob__.dep.notify();
                    } else if(division == 'TOPPING'){
                        me.value.toppingPlatformsConf[elementId] = JSON.parse(JSON.stringify(configuration));
                        me.value.toppingPlatformsConf.__ob__.dep.notify();
                    } else if(division == 'TEMPLATE'){
                        me.value.elements[elementId].preferredPlatformConf[me.value.elements[elementId].preferredPlatform] = JSON.parse(JSON.stringify(configuration));
                        me.value.elements[elementId].preferredPlatformConf.__ob__.dep.notify();
                    }
                    me.refreshCallGenerate();
                }
                me.closeCodeConfiguration(division, elementId);
            },
            closeCodeConfiguration(division, elementId) {
                this.menuOpen[elementId] = false
            },
            // cssUpateinVueObjViewer(){	
            //     var keyElementArray = document.querySelectorAll(".key")	
            //     keyElementArray.forEach(function (element){	
            //         element.style.fontWeight = "bolder";	
            //     })	
            //     var keyElementArray = document.querySelectorAll(".vue-object-view-primitive.vue-object-view-string")	
            //     keyElementArray.forEach(function (element){	
            //         element.style.color = "green";	
            //     })	
            //     var keyElementArray = document.querySelectorAll(".vue-object-view-primitive.vue-object-view-null")	
            //     keyElementArray.forEach(function (element){	
            //         element.style.color = "dodgerblue";	
            //     })	
            //     var keyElementArray = document.querySelectorAll(".vue-object-view-primitive.vue-object-view-number")	
            //     keyElementArray.forEach(function (element){	
            //         element.style.color = "purple";	
            //     })	
            //     var keyElementArray = document.querySelectorAll(".vue-object-view-primitive.vue-object-view-boolean")	
            //     keyElementArray.forEach(function (element){	
            //         element.style.color = "rgb(255, 35, 0)";	
            //     })	
            // },
            editMustacheCode(code){
                var me = this
                me.originMustacheTemplate[0].code = code
            },
            settingPlatform(division, platform, elementId){
                var me = this
                me.$emit('changedByMe', true)
                if(division == 'BASE'){
                    me.value.basePlatform = platform
                } else if( division == 'TOPPING'){
                    me.value.toppingPlatforms = platform
                } else if( division == 'TEMPLATE'){
                    if(me.value && me.value.elements[elementId]){
                        me.value.elements[elementId].preferredPlatform = platform;
                    }
                }
            },
            updatePathTmp(update) {},
            editBreakPoint(debuggerPoint){
                var me = this
                // console.log(debuggerPoint, me.opennedTemplateFramework[0])
                me.debuggerPoint = debuggerPoint
            },
            editCode(code) {
                var me = this
                var tempPath = me.getTempPath()
                var platform = me.getPlatformPath()

                if(!me.editTemplateFrameWorkList[platform]){
                    me.editTemplateFrameWorkList[platform] = {}
                }
                if(!me.editTemplateFrameWorkList[platform][tempPath]) {
                    me.editTemplateFrameWorkList[platform][tempPath] = {
                        code: null,
                        element: null
                    }
                }

                me.editTemplateFrameWorkList[platform][tempPath].code = code;
                me.editTemplateFrameWorkList[platform][tempPath].element = me.opennedTemplateFramework
                me.editTemplateFrameWorkList[platform][tempPath].element[0].code = code;

                me.editTemplateFrameWorkList[platform][tempPath].isEditted = true
                var fileName = tempPath.split('/')
                var subFileName = tempPath.replace(fileName.at(-1), "")
                me.editTemplateFrameWorkList[platform][tempPath].element[0].computedFileName = fileName.at(-1)
                if(subFileName){
                    me.editTemplateFrameWorkList[platform][tempPath].element[0].computedSubFileName = subFileName
                } else {
                    me.editTemplateFrameWorkList[platform][tempPath].element[0].computedSubFileName = null
                }
            },
            clearChangedPathListsBucket(){
                this.changedPathListsBucket = []
                this.showChangedPathLists = false
            },
            templatePathStyle(item){
                if(!item.file && item.children && item.children.length == 0){
                    return 'color: darkgrey;'
                }
                return ''
            },
            openCodeGenerator() {
                var me = this;
                var separatePanel = localStorage.getItem("separatePanel");
                var separatePanelInfo = null;
                if(separatePanel) {
                    separatePanelInfo = JSON.parse(separatePanel);
                }
                me.separatePanelInfo.current = separatePanelInfo && separatePanelInfo.separatePanelInfo ? separatePanelInfo.separatePanelInfo : 30;
                me.codeSeparatePanelInfo.current = separatePanelInfo && separatePanelInfo.codeSeparatePanelInfo ? separatePanelInfo.codeSeparatePanelInfo :50;
            },
            closeCodeGenerator(){
                var me = this
                var separatePanel = localStorage.getItem("separatePanel")
                var separatePanelInfo = {}
                if(separatePanel){
                    separatePanelInfo = JSON.parse(separatePanel);
                }

                separatePanelInfo.separatePanelInfo =  me.separatePanelInfo.current
                separatePanelInfo.codeSeparatePanelInfo =  me.codeSeparatePanelInfo.current

                var objString = JSON.stringify(separatePanelInfo)
                me.putObject(`localstorage://separatePanel`, objString)

                me.separatePanelInfo.current = 100
                me.codeSeparatePanelInfo.current = 100
            },
            closeCodeViewer() {
                var me = this
                if (me.openCode[0] && !me.openCode[0].code.includes("<!-- Is Not Template -->")) {
                    var openCodePath = me.openCode[0].fullPath ? me.openCode[0].fullPath : me.openCode[0].path
                    localStorage.setItem('openCodePath', openCodePath)
                }

                me.closeCodeGenerator()
                me.closeSearchForFiles()
                me.closeSearchForContents()
            },
            onOffDesignPatterns(){
                this.showChangedPathLists = false
                this.showDesignPatterns = !this.showDesignPatterns
            },
            onOffChangedPathLists(){
                this.showDesignPatterns = false;
                this.showChangedPathLists = !this.showChangedPathLists
            },
            codePreviewLeftReSize() {
                var me = this
                try {
                    if(me.separatePanelInfo.current > 0) {
                        me.separatePanelInfo.current = 0
                    } else if(me.separatePanelInfo.current == 0) {
                        me.separatePanelInfo.current = 25
                    }
                } catch(e) {

                }
            },
            codeAlign(code) {
                var me = this

                var parsers = {
                    tabWidth: 4,
                    parser: 'java',
                    plugins: [plugins]
                }

                if (code.includes('<function>')) {
                    code = code.replace('<function>', '')
                }
                try {
                    var formatted = prettier.format(code, parsers)
                    return formatted
                } catch (e) {
                    // console.log(e)
                    return code; //if fail return original
                }
            },
            fileType(file) {
                var type;
                if (file.includes('.java')) {
                    type = 'java'
                } else if (file.includes('Dockerfile')) {
                    type = 'docker'
                } else if (file.includes('.xml')) {
                    type = 'xml'
                } else if (file.includes('.yaml') || file.includes('.yml') || file.includes('.properties') || file.includes('mvnw') || file.includes('.groovy')) {
                    type = 'txt'
                } else if (file.includes('md')) {
                    type = 'md'
                } else if (file.includes('.jpg') || file.includes('.png') || file.includes('.jpeg') || file.includes('.svg')) {
                    type = 'png'
                } else if (file.includes('.json')) {
                    type = 'json'
                } else if (file.includes('.py')) {
                    type = 'python'
                } else if (file.includes('.vue')) {
                    type = 'vue'
                } else if (file.includes('.js')) {
                    type = 'js'
                } else if (file.includes('.html')) {
                    type = 'html'
                } else if (file.includes('.go')) {
                    type = 'go'
                } else if (file.includes('.msaez')) {
                    type = 'properties'
                } else if(file.includes('.sh')){
                    type = 'shell'
                }
                return type
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            settingGithub(){
                var me = this
                if(localStorage.getItem('gitAccessToken') || localStorage.getItem('gitToken')){
                    me.gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
                    me.githubHeaders = {
                        Authorization: 'token ' + me.gitAccessToken,
                        Accept: 'application/vnd.github+json'
                    }
                }
            },
            clearDesignPatterns(codeLists){
                if(codeLists && codeLists.length > 0){
                    let patterns = [{start: '//<<<', end:'//>>>'}, {start: '#<<<', end:'#>>>'}];
                    codeLists.forEach(function (codeObj) {
                        if(codeObj && codeObj.code){
                            patterns.forEach(function (pattern) {
                                if(codeObj.code.indexOf(pattern.start) > 0) {
                                    var matchPatternLen =  codeObj.code.split('\n').filter(x=>x.includes(pattern.start)).length;
                                    for ( var matchNum = 0; matchNum < matchPatternLen; matchNum ++ ) {
                                        var patternName = codeObj.code.split(pattern.start)[1].split('\n')[0]
                                        codeObj.code = codeObj.code.replace(`${pattern.start}${patternName}\n`, '')
                                        var endLineNumber =  codeObj.code.substring(0,codeObj.code.indexOf(`${pattern.end}${patternName}`)).split('\n').length
                                        if(codeObj.code.split('\n').length  ==  endLineNumber){
                                            codeObj.code = codeObj.code.replace(`${pattern.end}${patternName}`, '')
                                        }else{
                                            codeObj.code = codeObj.code.replace(`${pattern.end}${patternName}\n`, '')
                                        }
                                    };
                                }
                            })
                        }
                    });
                }

                return codeLists
            },
            clearDesignPattern(value){
                let code = JSON.parse(JSON.stringify(value));
                let patterns = [{start: '//<<<', end:'//>>>'}, {start: '#<<<', end:'#>>>'}];
                patterns.forEach(function (pattern) {
                    if(code.indexOf(pattern.start) > 0) {
                        var matchPatternLen =  code.split('\n').filter(x=>x.includes(pattern.start)).length;
                        for ( var matchNum = 0; matchNum < matchPatternLen; matchNum ++ ) {
                            var patternName = code.split(pattern.start)[1].split('\n')[0]
                            code = code.replace(`${pattern.start}${patternName}\n`, '')
                            var endLineNumber = code.substring(0,code.indexOf(`${pattern.end}${patternName}`)).split('\n').length
                            if(code.split('\n').length  ==  endLineNumber){
                                code = code.replace(`${pattern.end}${patternName}`, '')
                            }else{
                                code = code.replace(`${pattern.end}${patternName}\n`, '')
                            }
                        };
                    }
                });

                return code;
            },
            async downloadArchive(){
                var me = this
                if(this.$parent.downloadArchive){
                    me.$parent.downloadArchive(me);
                    return true;
                }
                var copyCodeLists = me.filteredPrettierCodeLists;
                var filteredProjectName = me.core.filterProjectName(me.projectName)
                var zip = new JSZip();

                copyCodeLists.forEach(function (generateData) {
                    if(!generateData.fullPath.includes("kubernetes/docs/")){
                        zip.file(generateData.fullPath, generateData.code)
                    }
                })

                await zip.generateAsync({type: "blob"})
                    .then(function (content) {
                        saveAs(content, `${filteredProjectName}.zip`);
                        return true
                    }).catch(function (error) {
                        return false
                    })

            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            selectedOpen(newVal) {
                var me = this
                var itemLists = JSON.parse(JSON.stringify(newVal))
                var filteredProjectName = me.core.filterProjectName(me.projectName)

                // open 할 File Path 경로.
                var autoOpenLists = [
                    {'src': `main/java/${filteredProjectName}`}
                ]

                function children(items, subItems) {
                    if (items) {
                        if (Array.isArray(items)) {
                            // folder lists
                            items.forEach(function (item) {
                                if (item.key == item.hash && item.children) {
                                    children(item, subItems)
                                }
                            })
                        } else {
                            // folder Inner
                            items.children.forEach(function (item, index) {
                                if (item.key == item.hash && item.children) {
                                    var existOpenList = subItems.findIndex(subKey => subKey == item.name) == -1 ? false : true
                                    if (existOpenList) {
                                        if (itemLists.findIndex(i => i.hash == item.hash) == -1) {
                                            itemLists.push(item)
                                        }
                                    }
                                    children(item, subItems)
                                }
                            })
                        }
                    }
                }

                try {
                    if (itemLists.length > 0) {
                        autoOpenLists.forEach(function (openItem) {
                            var mainPathKey = Object.keys(openItem)[0]
                            var subPathKeys = openItem[mainPathKey].split('/')
                            var findItems = itemLists.filter((item) => item.name == mainPathKey)
                            if (findItems) {
                                children(findItems, subPathKeys)
                            }
                        })
                    }

                    me.treeOpenLists = itemLists
                } catch (e) {
                    console.log('Selected Open[Error] : ', e)
                    me.treeOpenLists = newVal
                }

            },
            getSelectedFilesDeeply(){
                let codeBag = []
                this._collectSelectedFileContents(this.selectedFile, codeBag)

                return codeBag
            },
            _collectSelectedFileContents(root, codeBag){
                var me = this;
                var set = new Set();

                root.forEach((item) => {
                    if(Array.isArray(item.children)) {
                        me._collectSelectedFileContents(item.children, codeBag);
                    }
                    if(item.code != null && (item.name.endsWith(".vue") || item.name.endsWith(".java") || item.name.endsWith(".yaml") || item.name.endsWith(".yml")) && !item.path.includes("/test")){
                        if (!set.has(item.code)) {
                            codeBag.push("#"+ item.name + "\n" + item.code);
                            set.add(item.code);
                        }
                    }
                });
            },
            showGptDialog() {
                var me = this;
                me.showGpt = !me.showGpt
            },
            searchForReady(onOff) {
                this.closeSearchForFiles();
                this.closeSearchForContents();

                if (onOff == 'files') {
                    this.searchForFile.onOff = true;
                    this.searchForFiles();
                    return false
                } else if(onOff == 'contents') {
                    this.searchForContent.onOff = true;
                    this.searchForContents();
                    return false;
                }
            },
            closeSearchForFiles(){
                this.searchForFile.onOff = false;
                this.searchForFile.search = null;

            },
            closeSearchForContents(){
                this.searchForContent.onOff = false;
                this.searchForContent.search = '';
            },
            searchForFiles(){
                var me = this
                try {
                    if(me.searchForFile.onOff){
                        var searchFileObj = me.searchForFile.search
                        if(searchFileObj){
                            function findById(array, fullPath) {
                                for (const item of array) {
                                    if (item.children && item.children.length > 0) {
                                        const innerResult = findById(item.children, fullPath);
                                        if (innerResult) return innerResult;
                                    }
                                    if (item.path === fullPath) return item;
                                }
                            }
                            var findOpenCode = findById(me.treeLists, searchFileObj.fullPath);
                            if( findOpenCode ){
                                me.openCode = []
                                me.openCode.push(findOpenCode)
                                if( !me.treeOpenLists ) me.treeOpenLists = []
                                me.treeOpenLists.push(findOpenCode)
                                me.closeSearchForFiles()
                            }
                        }
                    }
                } catch (e) {
                }
            },
            searchForContents(){
                var me = this
                var resultLists = []

                try{
                    if(me.searchForContent.onOff){
                        var codeLists = JSON.parse(JSON.stringify(me.codeLists));
                        var search = me.searchForContent.search

                        if(search){
                            search = search.toLowerCase()

                            resultLists = codeLists.map(function(codeObj) {
                                if(codeObj){
                                    codeObj.name = codeObj.fileName
                                    codeObj.path = codeObj.fullPath
                                    var copyCodeObj = JSON.parse(JSON.stringify(codeObj));

                                    var codeSplit = codeObj.code.split('\n');
                                    codeSplit = codeSplit.filter(x=> x && x.toLowerCase().includes(search));
                                    if(codeSplit.length > 0){
                                        codeObj.children = codeSplit.map(function(line){
                                            var obj = copyCodeObj
                                            line = line.trim();
                                            obj.searchContentLine = line
                                            return obj;
                                        });
                                        codeObj.children = _.uniqBy(codeObj.children, "hash");
                                    }

                                    return codeObj;
                                }
                            });
                            resultLists = resultLists.filter(x=> x && x.code.toLowerCase().includes(search));

                            resultLists = _.uniqBy(resultLists, "hash");
                        }
                    }
                }catch (e) {
                    console.log(`Error] Search Contents:${e} `)
                }

                return resultLists;
            },
            refreshCallGenerate(){
                var me = this
                // me.isListSettingDone = false
                me.codeLists = [];
                me.templateFrameWorkList = {};
                me.modelForElement = {};
                me.settingGithub();
                me.callGenerate();
            },
            setCurrentCodeForAutoCodeGenerate(value){
                var me = this
                me.openaiContent = value

                if(me.codeGenTimeout){
                    clearTimeout(me.codeGenTimeout)
                    me.codeGenTimeout = null
                }
                me.codeGenTimeout = setTimeout(function () {
                    me.setAutoGenerateCodetoList = JSON.parse(JSON.stringify(me.codeLists))
                    me.setAutoGenerateCodetoList.some(function (element, index){
                        if(me.filteredOpenCode[0].path == element.fullPath){
                            me.setAutoGenerateCodetoList[index].code = value
                            return true;
                        }
                    })
                    me.codeGenTimeout = null
                }, 2000)
                // me.filteredOpenCode[0].code = value
                // console.log(me.filteredOpenCode[0].code)
            },
            closeOpenaiPopup(){
                var me = this
                me.openaiPopup = false
                me.showOpenaiToken = false
            },
            startAutoGenerateCode(idx, id){
                var me = this
                if(idx == "openAI"){
                    me.startGenerateUseOpenAI = true
                } else {
                    me.startGenerate = true
                }
                if(idx == "mustache" || idx == "openAI"){
                    me.autoGenerateMustacheTemplate(me.modelData, null, null, idx)
                } else if(me.openaiToken){
                    me.autoGenerateCode(idx, id)
                } else {
                    me.openaiPopup = true
                }
            },
            async autoGenerateCode(idx, id){
                var me = this
                try {
                    var moreHintMode = false
                    if(id == '2'){
                        moreHintMode = true 
                    }
                    if(moreHintMode){
                        var inputSwitch
                        var testA = []
                        me.filteredCodeLists.forEach(function (file){
                            if(file.fileName != file.fullPath && file.fullPath != me.filteredOpenCode[0].path){
                                if(file.fullPath.replace(file.fileName, "") == me.filteredOpenCode[0].path.replace(me.filteredOpenCode[0].name, "")){
                                    file.code.split('\n').forEach(function (line){
                                        inputSwitch = false
                                        if(!line.includes("package ") && !line.includes("import ") && line != "" && line != "    "){
                                            inputSwitch = true
                                        }
                                        if(inputSwitch){
                                            testA.push(line)
                                        }
                                    })
                                }
                            } 
                        })
                    }
                    if(me.openaiToken){
                        var content
                        if(me.openaiContent){
                            content = me.openaiContent
                        } else {
                            content = me.filteredOpenCode[0].code
                        }
    
                        var splitContent = null
                        var promptValue = []
                        var suffixValue = []
                        splitContent = content.split("\n")
                        splitContent.forEach(function (content, contentIndex){
                            if(contentIndex <= idx){
                                promptValue.push(splitContent[contentIndex])
                            } else if(contentIndex > idx) {
                                suffixValue.push(splitContent[contentIndex])
                            }
                        })
                        promptValue = promptValue.join("\n")
                        suffixValue = suffixValue.join("\n")
                        
                        let tokenLength
                        if(moreHintMode){
                            tokenLength = 4092 - Math.round(`${content}\n${testA.join('\n')}`.length/3.5)
                        } 

                        let data = {
                            model: "text-davinci-003",
                            prompt: promptValue,
                            suffix: moreHintMode ? `${suffixValue}\n${testA.join('\n')}` : suffixValue,
                            temperature: 0.5,
                            max_tokens: moreHintMode ? tokenLength : 3000, 
                        }
                        let header = {
                            Authorization: `Bearer ${me.openaiToken}`,
                            'Content-Type': 'application/json'
                        }
    
                        let respones = await axios.post(`https://api.openai.com/v1/completions`, data, { headers: header })
                        .catch(function (error) {
                            me.startGenerate = false
                            if(me.openaiContent){
                                me.filteredOpenCode[0].code = me.openaiContent
                            }
                            if(error.response && error.response.data && error.response.data.message){
                                var errText = error.response.data.message
                                if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
                                    errText = errText + ', ' + error.response.data.errors[0].message
                                }
                                alert(errText)
                            } else {
                                alert(error.message)
                            }
                        });
                        if(respones && !me.stopAutoGenerate){
                            if(respones.data.choices[0].text){
                                var autoGenerateResult = promptValue + respones.data.choices[0].text + suffixValue
                                me.autoGenerateResponse = autoGenerateResult
        
                                me.changedDiffCodeViewer = true
                                me.changedDiffCode = JSON.parse(JSON.stringify(me.filteredOpenCode))
                                me.changedDiffCode[0].code = content
                                me.filteredOpenCode[0].code = me.autoGenerateResponse
        
                                localStorage.setItem('openaiToken', me.openaiToken)
                                me.startGenerate = false
        
                                me.setAutoGenerateCodetoList = JSON.parse(JSON.stringify(me.codeLists))
                                me.setAutoGenerateCodetoList.some(function (element, index){
                                    if(me.filteredOpenCode[0].path == element.fullPath){
                                        me.setAutoGenerateCodetoList[index].code = me.filteredOpenCode[0].code
                                        return true;
                                    }
                                })
        
                                me.refreshCallGenerate();
                            }
                        } else {
                            me.stopAutoGenerate = false
                        }
    
                    } else {
                        me.stopAutoGenerate = false
                        alert("input Token")
                    }
                } catch(e) {
                    me.startGenerate = false
                    if(me.openaiContent){
                        me.filteredOpenCode[0].code = me.openaiContent
                    }
                    console.log(e)
                }
            },
            async autoGenerateMustacheTemplate(modelData, path, convertModelData, mode){
                var me = this
                var convertModelData = convertModelData ? convertModelData:{}
                me.recursiveCount++;
                for (let key in modelData) { 
                    if (typeof modelData[key] === "string") {
                        var beforePath = path ? path + '.' : ''
                        convertModelData[beforePath + key] = modelData[key]
                    } else if (typeof modelData[key] === "object" || typeof modelData[key] === "array") {
                        if(!path || !path.includes(key)){
                            var beforePath = path ? `${path}.${key}`:`${key}`
                            me.autoGenerateMustacheTemplate(modelData[key], beforePath, convertModelData, mode);
                        }
                    } else {
                        if(!beforePath){
                            var beforePath = path ? path + '.' : ''
                        }
                        convertModelData[beforePath + key] = null
                    }
                }
                me.recursiveCount--; 

                if(me.recursiveCount == 0) {
                    var modifiedValueList = {}
                    var words = [ "public", "private", "class", "package", "import", "void", "static" ];
                    var content = me.originMustacheTemplate[0].code.split('\n')
                    const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
                    let isAnnotation = false
                    let dataIncludeUnderBar 
                    let replacedData 

                    content.forEach(function (code, idx){
                        if(code.includes('/**')){
                            isAnnotation = true
                        } 
                        if(code.includes('*/')){
                            isAnnotation = false
                        }
                        if(code != "" && !code.includes('//') && !isAnnotation){
                            // var isOverlap
                            // const code1 = 'function add(a, b) { return a + b; }';
                            // const code2 = 'function multiply(a, b) { return a * b; }';
                            // const threshold=0.9
                            // // Tokenize the code
                            // const regex = /\b\w+\b|[^\s\w]+/g;

                            // const tokens1 = new Set(code1.match(regex));
                            // const tokens2 = new Set(code2.match(regex));
                            
                            // const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
                            // const overlap = intersection.size / Math.min(tokens1.size, tokens2.size);
                            
                            // isOverlap = overlap >= threshold;

                            modifiedValueList[idx] = {}

                            var splitSpace = code.split(" ")
                            splitSpace.forEach(function (data, index){
                                var firstGenerate = true
                                dataIncludeUnderBar = null
                                replacedData = null
                                if(!data.includes(".")){
                                    if(data != "" && !data.includes("@")){
                                        if(!words.find(x => x == data)){
                                            Object.keys(convertModelData).forEach(function (key){
                                                if(convertModelData[key] && !convertModelData[key].includes("+")){
                                                    if(data.includes("_")){
                                                        dataIncludeUnderBar = data.split("_")
                                                        replacedData = dataIncludeUnderBar[0]
                                                    } 
                                                    if(data.includes('()')){
                                                        replacedData = data.replace('on', '')
                                                    }
                                                    if(data.includes('(this)')){
                                                        replacedData = data.replace('(this)', '')
                                                    }
                                                    if(data.replaceAll(reg, '') == convertModelData[key] || (replacedData && replacedData.replaceAll(reg, '') == convertModelData[key])){
                                                        var originValuePriority = splitSpace[index].replaceAll(/.[0-9]./g, ".*.").split(".*.")
                                                        var changeValuePriority = key.replaceAll(/.[0-9]./g, ".*.").split(".*.")
                                                        
                                                        if(firstGenerate || originValuePriority.length >= changeValuePriority.length){
                                                            var isValueUpdate = true
                                                            if(!firstGenerate && originValuePriority.length == changeValuePriority.length){
                                                                if(splitSpace[index].length < key.length){
                                                                    isValueUpdate = false
                                                                } 
                                                            }

                                                            if(isValueUpdate){
                                                                if(dataIncludeUnderBar){
                                                                    dataIncludeUnderBar[0] = `"{{${key}}}`
                                                                    splitSpace[index] = dataIncludeUnderBar.join("_")
                                                                } else {
                                                                    splitSpace[index] = `{{${key}}}`
                                                                }
                                                                modifiedValueList[idx][convertModelData[key]] = key
                                                                firstGenerate = false
                                                            }
                                                        } 
                                                    }
                                                }
                                            })
                                        }
                                    }
                                } else {
                                    var splitDot = data.split(".")
                                    splitDot.forEach(function (data2, index2){
                                        var firstGenerateInDot = true
                                        if(!words.find(x => x == data2)){
                                            Object.keys(convertModelData).forEach(function (key){
                                                if(convertModelData[key] && !convertModelData[key].includes("+")){
                                                    if(data2.replaceAll(reg, '') == convertModelData[key]){
                                                        if(firstGenerateInDot || splitDot[index2].length > key.length){
                                                            splitDot[index2] = `{{${key}}}`
                                                            modifiedValueList[idx][convertModelData[key]] = key
                                                            firstGenerateInDot = false
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                    splitSpace[index] = splitDot.join(".")
                                }
                            })
                            splitSpace = splitSpace.join(" ")
                            content[idx] = splitSpace
                        }
                    })
                    me.modifiedMustacheTemplate[0].code = ''

                    if(mode =="openAI"){
                        me.processTemplateUseOpenAi(modifiedValueList)
                    } else {
                        // implement logic
                        let isAnnotation = false
                        content.forEach(function (line, lineNumber){
                            if(line.includes('/**')){
                                isAnnotation = true
                            } 
                            if(line.includes('*/')){
                                isAnnotation = false
                            }
                            if(line != "" && !line.includes('//') && !isAnnotation){
                                content[lineNumber] = line.replaceAll(/.[0-9]./g, ".*.")
                            }
                        })

                        var testArr = []
                        var text = null
                        var isMethod = false
                        var isModeLine
                        content.forEach(function (line, idx){
                            if(line != ""){
                                isModeLine = false
                                var token = line.replaceAll("{{", "")
                                token = token.replaceAll("}}", "")
    
                                if(token.includes("{") && !token.includes(" class ")){
                                    isMethod = true
                                    if(content[idx - 1].includes("@")){
                                        isModeLine = true
                                    }
                                } 
                                if(token.includes("}")){
                                    isMethod = false
                                } 
                                
                                text = text ? text + '\n' + line : line
                                
                                if(isModeLine){ 
                                    var mode = content[idx - 1].split("@")
                                    testArr[testArr.length - 1] = content[idx - 1].replace(mode[1], "mode")
                                }
    
                                if(!isMethod){
                                    testArr.push(text)
                                    text = null
                                } 
                            }
                        })

                        const set = new Set(testArr);
                        const uniqueArr = [...set];

                        var splitSpace
                        var splitDot

                        var valueName
                        var text
                        var endText
                        var fixedText
                        var space
                        var loopCount

                        uniqueArr.forEach(function (val, idx){
                            if(val.includes('.*.') && !val.includes("@") && !val.includes("import ")){
                                valueName = null
                                text = null
                                endText = null
                                splitSpace = val.split(" ")
                                splitSpace.forEach(function (val2, idx2){
                                    if(val2.includes("{{")){
                                        val2 = val2.replaceAll("{{", "")
                                        val2 = val2.replaceAll("}}", "")
                                        splitDot = val2.split(".*.")
                                        splitDot.forEach(function (val3, idx3){
                                            if(idx3 == splitDot.length - 1){
                                                valueName = valueName ? `${valueName}{{${val3}}} ` : `{{${val3}}} `
                                            } else {
                                                text = text ? `${text}{{#${val3}}}\n` : `{{#${val3}}}\n`
                                                endText = endText ? `\n{{/${val3}}}${endText}` : `\n{{/${val3}}}`
                                            }
                                        })
                                    } else {
                                        fixedText = null
                                        if(val2 == ""){
                                            fixedText = ""
                                        } else {
                                            fixedText = val2 + " "
                                        }
                                        valueName = valueName ? valueName + fixedText : fixedText
                                    }
                                    if(text){
                                        const setText = new Set(text.split('\n'));
                                        const uniqueArrText = [...setText];
                                        const setEndText = new Set(endText.split('\n'));
                                        const uniqueArrEndText = [...setEndText];
                                        
                                        loopCount = 0
                                        space = null 
                                        uniqueArrText.forEach(function (line, lineIdx){
                                            while(loopCount == lineIdx){
                                                space = space ? space + "    " : "    "
                                                loopCount++;
                                            }
                                            uniqueArrText[lineIdx] = space + line
                                            uniqueArrEndText[(uniqueArrText.length - 1) - lineIdx] = space + uniqueArrEndText[(uniqueArrText.length - 1) - lineIdx]
                                        })
                                        uniqueArr[idx] = uniqueArrText.join('\n') + valueName + uniqueArrEndText.join('\n')
                                    }
                                })  
                            }
                        })
                        me.modifiedMustacheTemplate[0].code = uniqueArr.join("\n")
                        // content = content.join("\n")
                        // me.modifiedMustacheTemplate[0].code = content
                        me.startGenerate = false
                    }
                }

            },
            convertStringToObj(path, value) {
                var me = this    
                var container =  me.convertedObj;
                path.split('.').map((k, i, values) => {
                    container = (container[k] = (i == values.length - 1 ? value : (container[k] ? container[k]:{})))
                });

            },
            asyncHandleBars(){

                let obj = {}
                return new Promise(async function (resolve, reject) {
                    if(localStorage.getItem('gitAccessToken') || localStorage.getItem('gitToken')){
                        var gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
                        var githubHeaders = {
                            Authorization: 'token ' + gitAccessToken,
                            Accept: 'application/vnd.github+json'
                        }
                        var result = await axios.get(`https://api.github.com/repos/msa-ez/topping-isVanillaK8s/contents/for-model/kubernetes/docs/common/Pod.md`, { headers: githubHeaders })
                        .catch(function (error) {
                            if(error.response.status === 401){
                                me.alertReLogin()
                            }
                            alert(error)
                        })
                        obj['include'] = decodeURIComponent(escape(atob(result.data.content)));
                        resolve(obj);
                    }
                    // let result = await axios.get("https://raw.githubusercontent.com/msa-ez/topping-isVanillaK8s/main/isVanillaK8s/for-model/kubernetes/docs/common/Pod.md")
                })
            },
            async initHandleBars(handleBars){
                var me = this
                var commonTemplate = await me.asyncHandleBars()

                window.$HandleBars.registerHelper('ifNotNull', function (displayName, name) {
                    if(displayName){
                        return displayName;
                    }else{
                        return name;
                    }
                })



                window.$HandleBars.registerHelper('map', function (mappings, value) {
                    for(var index in mappings){
                        var map = mappings[index]
                        if(map.if && map.if.includes(value)){
                            return map.then;
                        }
                        
                        if(map.default)
                        return map.default
                    }

                    return '';
                
                })

                window.$HandleBars.registerHelper('checkVO', function (className, options) {
                    if(className.endsWith("Address") || className.endsWith("Photo") || className.endsWith("User") || className.endsWith("Email") 
                            || className.endsWith("Payment") || className.endsWith("Money") || className.endsWith("Weather") || className.endsWith("Rating") 
                            || className.endsWith("Likes")|| className.endsWith("Tags")|| className.endsWith("Comment") ){
                        return options.fn(this);
                    }
                })

                window.$HandleBars.registerHelper('checkEntityMember', function (className, options) {
                    if(!(className.endsWith("Address") || className.endsWith("Photo") || className.endsWith("User") || className.endsWith("Email") 
                            || className.endsWith("Payment") || className.endsWith("Money") || className.endsWith("Weather") || className.endsWith("Rating")) 
                            || className.endsWith("Likes")|| className.endsWith("Tags")|| className.endsWith("Comment") && className.indexOf("java.") == -1 && className.indexOf("List") == -1){
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                })

                window.$HandleBars.registerHelper("include", function(str){
                    return commonTemplate['include'];
                });

                window.$HandleBars.registerHelper("url", function(str){
                    return  str ? str.toLowerCase().replaceAll(" ", "-") : str;
                });

                window.$HandleBars.registerHelper("camelCase", function(str){
                    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                });

                window.$HandleBars.registerHelper("pascalCase", function(str){
                    return (str.match(/[a-zA-Z0-9]+/g) || []).map(w => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('');
                });

                window.$HandleBars.registerHelper('a', function (arg1, arg2, options) {
                    return "{{" + (Object.keys(this).join("}} {{"))
                });


                window.$HandleBars.registerHelper('ifEquals', function (arg1, arg2, options) {
                    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
                });

                window.$HandleBars.registerHelper('ifContains', function (jsonPath, value, options) {

                    var evaluatedVal = window.jp.query(this, jsonPath);
                    if(evaluatedVal.length && evaluatedVal.length == 1){
                        evaluatedVal = evaluatedVal[0];
                    }
                    if( evaluatedVal == value || evaluatedVal.includes(value)

                    ){
                        return options.fn(this)
                    }else{
                        return options.inverse(this)
                    }

                });

                window.$HandleBars.registerHelper('jp', function (jsonPath, options) {

                    try{
                        var evaluatedVal = window.jp.query(this, jsonPath);
                        if(evaluatedVal){

                            return options.fn(evaluatedVal)
                        }else{
                            return options.inverse(this)
                        }

                    } catch(e) {
                        return options.inverse(this)
                    }
                });


                window.$HandleBars.registerHelper('outgoing', function (type, value, options) {
                    if(value==null)
                        value = this;

                    var evaluatedVal = window.jp.query(value, `$.outgoingRelations[?(@.target.type=='${type}')]`);
                    if(evaluatedVal && evaluatedVal.length){
                        let result = "";
                        evaluatedVal.forEach((item, index) => {
                            result += options.fn(item.target);
                        })

                        return result;
                    }else{
                        return options.inverse(value)
                    }

                });

                window.$HandleBars.registerHelper('incoming', function (type, value, options) {

                    var evaluatedVal = window.jp.query(value, `$.incomingRelations[?(@.source.type=='${type}')]`);
                    if(evaluatedVal && evaluatedVal.length){
                        let result = "";
                        evaluatedVal.forEach((item, index) => {
                            result += options.fn(item.source);
                        })

                        return result;
                    }else{
                        return options.inverse(this)
                    }

                });

                window.$HandleBars.registerHelper('attached', function (type, value, options) {
                    

                    let attachedElementsInTheType
                    
                    if(value.attached)
                        attachedElementsInTheType = value.attached.filter(
                            element => (element._type.endsWith(type) || (type=='ReadModel' && element._type.endsWith('View')))
                        )

                    if(attachedElementsInTheType && attachedElementsInTheType.length){
                        let result = "";
                        attachedElementsInTheType.forEach((item, index) => {
                            result += options.fn(item);
                        })

                        return result;
                    }else{
                        return options.inverse(this)
                    }

                });

                
                window.$HandleBars.registerHelper('attachedOrIncoming', function (type, value, options) {
                    var attachedElements = window.$HandleBars.helpers.attached(type, value, options)
                    var incomingElements = window.$HandleBars.helpers.incoming(type, value, options)

                    // var attachedOrIncoming = attachedElements.concat(incomingElements)
                    var attachedOrIncoming = attachedElements+incomingElements

                    return attachedOrIncoming
                })

                window.$HandleBars.registerHelper('attachedOrOutgoing', function (type, value, options) {
                    var attachedElements = window.$HandleBars.helpers.attached(type, value, options)
                    var outgoingElements = window.$HandleBars.helpers.outgoing(type, value, options)

                    // var attachedOrOutgoing = attachedElements.concat(outgoingElements)
                    var attachedOrOutgoing = attachedElements+outgoingElements

                    return attachedOrOutgoing
                })

                window.$HandleBars.registerHelper('reaching', function (type, value, options) {
                    let result = "";
                    
                    var attachedOrOutgoing = window.$HandleBars.helpers.attachedOrOutgoing(type, value, options)
                    
                    if(attachedOrOutgoing==""){
                        var attachedElements
                        attachedElements = value.attached.filter(
                            (element => (element._type.endsWith("Command")))
                        )
                        if(attachedElements[0] && attachedElements[0].outgoingRelations){
                            result += options.fn(attachedElements[0].outgoingRelations[0].target)
                            return result
                        }else{
                            return options.inverse(this)
                        }
                    }else{
                        return attachedOrOutgoing
                    }
                })

                window.$HandleBars.registerHelper('importTypes', function (fieldDescriptors) {
                    var imports = "";

                    var typeMappings = {
                        "Date": "java.util.Date",
                        "BigDecimal": "java.math.BigDecimal"
                    };

                    if(fieldDescriptors)
                        for(var i = 0; i < fieldDescriptors.length; i ++ ){
                            if(fieldDescriptors[i]){
                                var fullTypeName = typeMappings[fieldDescriptors[i].className];

                                if(fullTypeName){
                                    imports += "import " + fullTypeName + ";\n";
                                    typeMappings[fieldDescriptors[i].className] = null;
                                }
                            }
                        }

                    return imports;
                });


                window.$HandleBars.registerHelper('keyFieldOf', function (value) {
                    if(value.fieldDescriptors){
                        var keyField = value.fieldDescriptors.find(function (item) {
                            return item.isKey;
                        });

                        if(keyField){
                            return keyField.namePascalCase;
                        }
                    }

                    return null;
                });


                window.$HandleBars.registerHelper('websocketPort', function (httpPort) {
                    return parseInt(httpPort) - 1000;
                })

                window.$HandleBars.registerHelper('breakpoint', function (value, value2) {
                    if(value == value2)
                        debugger;
                })

                window.$HandleBars.registerHelper('wrap', function (exp) {
                    return '{'+exp+'}';
                })

            },
            reverse(item, path) {
                var me = this

                if (item)
                    item.forEach(function (list) {
                        if (list.children) {
                            //폴더 생성하기
                            var tmpPath = path + '/' + list.name

                            me.reverse(list.children, tmpPath);
                        } else {
                            //파일생성하
                            if (list.code) {
                                // if (list.name.includes('indexedfile'))
                                if (list.changed > 0) {
                                    me.pathTmp.push({
                                        name: list.name,
                                        path: list.name,
                                        code: list.code,
                                        changed: list.changed,
                                        key: list.key,
                                        path: list.path
                                    })
                                    me.changedTmp.push({
                                        name: list.name,
                                        path: list.name,
                                        code: list.code,
                                        changed: list.changed,
                                        key: list.key,
                                        path: list.path
                                    })
                                    me.changedCount++
                                } else if (list.isNew) {
                                    me.pathTmp.push({
                                        name: list.name,
                                        path: list.name,
                                        code: list.code,
                                        isNew: true,
                                        key: list.key,
                                        path: list.path
                                    })
                                    me.changedTmp.push({
                                        name: list.name,
                                        path: list.name,
                                        code: list.code,
                                        isNew: true,
                                        key: list.key,
                                        path: list.path
                                    })
                                    me.changedCount++
                                } else {
                                    me.pathTmp.push({
                                        name: list.name,
                                        key: list.key,
                                        path: path + '/' + list.name,
                                        code: list.code,
                                        path: list.path
                                    })
                                }
                            }
                        }
                    })
            },
            getGitConfig() {
                var me = this
                return new Promise(function (resolve, reject) {
                    var gitParams = new URLSearchParams();
                    var projectId = 'untitled'
                    if (me.isClazzModeling) {
                        projectId = me.$route.params.labId
                    } else {
                        projectId = me.$route.params.projectId;
                    }
                    var userName = localStorage.getItem("email").split('@')[0].toLowerCase();
                    var userGroup = localStorage.getItem("email").split('@')[1].split('.')[0].toLowerCase();
                    gitParams.append('filePath', `labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("author")}`);
                    gitParams.append('lab', `${projectId}`);
                    var hashName;
                    if (me.$route.params.labId) {
                        if (me.$parent.labInfo.independent) {
                            var hashPath = me.getClassPath('labs/' + me.$route.params.labId + '/' + me.$route.params.userId);
                        } else {
                            var hashPath = me.getClassPath(me.$route.params.userId);
                        }
                        hashName = "labs-" + me.hashCode(hashPath);
                    } else {
                        hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`
                    }

                    me.$http.get(`${me.getProtocol()}//file.kuberez.io/api/getGitConfig`, {
                        params: {
                            "hashName": hashName,
                            "filePath": `labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("author")}`,
                            'lab': `${projectId}`
                        }
                    }).then(function (result) {
                        resolve(result.data)
                    }).catch(error => alert(error))
                })
            },
            updatePathTmp(update) {
                var me = this
                me.pathTmp.forEach(function (item) {
                    if (item.hash == update.hash) {
                        item.code = update.code
                    }
                })
            },
            async onLoadInitTemplate(){
                var me = this
                try {
                    if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){
                        if(Object.values(me.value.elements).filter(x=>x._type.endsWith('BoundedContext')).length > 0){
                            var templateList =  Object.values(me.value.elements).filter(x=>x._type.endsWith('BoundedContext')).map((x) => x.preferredPlatform)
                            templateList.push(me.basePlatform)
                            var preferredTemplateLists = new Set(templateList);
                            preferredTemplateLists = [...preferredTemplateLists];

                            // 1. 기본적인 for문을 활용한 순회
                            for(let index = 0; index < preferredTemplateLists.length; index++) {
                                let preferredTemplate = preferredTemplateLists[index];
                                preferredTemplate = preferredTemplate.trim()
                                if(preferredTemplate == 'Custom Template'){
                                    preferredTemplate = "https://github.com/msa-ez/template-spring-boot"
                                }
                                if(preferredTemplate && !preferredTemplate.includes("http")){
                                    preferredTemplate = "https://github.com/msa-ez/template-" + preferredTemplate
                                }
                                await me.gitTemplate('TEMPLATE', preferredTemplate)
                            }
                        }
                    }
                    console.log('onLoadInitTemplate] END')
                } catch(e) {
                    console.log(e)
                }
            },
            setNames(value){
                if(value && value.name){
                    value.namePascalCase = changeCase.pascalCase(value.name)
                    value.nameCamelCase = changeCase.camelCase(value.name)
                }
            },
            applyBaseTemplateDialog( applyAll ){
                var me = this
                me.showApplyBaseTemplateDialog = false
                // BC Apply
                if(applyAll && me.filteredTreeLists.length > 0){
                    me.$emit('changedByMe', true);
                    me.filteredTreeLists.filter(tree=>tree.bcId).forEach(function(item){
                        var bcId = item ? item.bcId : null
                        if(bcId && me.value.elements[bcId]){
                            me.value.elements[bcId].preferredPlatform = JSON.parse(JSON.stringify(me.basePlatform));
                        }
                    })
                    me.editTemplateFrameWorkList = {}
                }
                me.refreshCallGenerate();
            },
            pushTemplateToGit(platform) {
                var me = this;
                if (platform.includes("http") && !platform.includes("msa-ez/")) {
                    me.isCustomTemplate = true;
                }
                me.oldPlatform = me.basePlatform;
                me.templateRepoName = platform;
                me.editTemplateList = me.editTemplateFrameWorkList[platform];
                me.templatePushDialog = true;
            },
            changePlatformToForkedRepo(repoPath, isChangeBaseTemplate, item) {
                var me = this;
                if (isChangeBaseTemplate) {
                    me.openTemplateDialog('BASE', repoPath);
                } else {
                    if (item) {
                        me.openTemplateDialog('TEMPLATE', repoPath, item);
                    }
                }
            },
            changePlatform(platform) {
                var me = this;
                var isChanged = false;
                me.newTreeList = JSON.parse(JSON.stringify(me.filteredTreeLists));

                Object.keys(me.value.elements).forEach(eleId => {
                    if (me.value.elements[eleId] && 
                            me.value.elements[eleId].preferredPlatform && 
                            me.value.elements[eleId].preferredPlatform == me.oldPlatform
                    ) {
                        me.$emit('changedByMe', true);
                        me.value.elements[eleId].preferredPlatform = platform;
                        me.newTreeList.some((arr, index) => {
                            if (arr.bcId == eleId) {
                                me.newTreeList[index].preferredPlatform = platform
                                return true
                            }
                        });

                        isChanged = true;
                        
                        if ((me.openCode[0] && 
                                (eleId == me.openCode[0].bcId)) &&
                                !me.openCode[0].code.includes("<!-- Is Not Template -->")
                        ) {
                            var openCodePath = me.openCode[0].fullPath ? 
                                me.openCode[0].fullPath : me.openCode[0].path;
                            localStorage.setItem('openCodePath', openCodePath);
                        }
                    }
                });

                if (isChanged) {
                    me.isComputeTreeListSwitch = true;
                }

                if (me.basePlatform == me.oldPlatform) {
                    if (me.basePlatform != platform) {
                        me.settingPlatform('BASE', platform);
                        delete me.templateFrameWorkList[me.oldPlatform];
                    }
                }

                Object.keys(me.editTemplateFrameWorkList[me.oldPlatform]).forEach(function (filePath){
                    if(!me.editTemplateFrameWorkList[me.oldPlatform][filePath].failedGenerate){
                        me.editTemplateFrameWorkList[me.oldPlatform][filePath].isPushed = true
                    }
                    if(!me.editTemplateFrameWorkList[platform]){
                        me.editTemplateFrameWorkList[platform] = {}
                    }
                    me.editTemplateFrameWorkList[platform][filePath] = me.editTemplateFrameWorkList[me.oldPlatform][filePath]
                })
                if(platform != me.oldPlatform){
                    me.editTemplateFrameWorkList[me.oldPlatform] = {}
                }
                me.templatePushDialog = false
                me.editTemplateListRenderKey++;

                me.gitSnackBar.show = true
                me.gitSnackBar.timeout = 3000
                me.gitSnackBar.Text = "Push 완료되었습니다."
                me.gitSnackBar.Color = "success"
                me.gitSnackBar.icon="check_circle"
                me.gitSnackBar.title="Success"

                this.refreshCallGenerate()
            },
            setMustacheTemplate(openCode){
                this.originMustacheTemplate = openCode
                this.modifiedMustacheTemplate = JSON.parse(JSON.stringify(openCode))
                if(this.modifiedMustacheTemplate && this.modifiedMustacheTemplate[0]){
                    this.modifiedMustacheTemplate[0].code = ""
                }
            },
            openTemplateEditor(){
                this.editTemplateMode = !this.editTemplateMode
                this.setTemplateFramework(this.openCode)
                // this.setMustacheTemplate(this.openCode)
                // this.prettierTreeView()
                // this.cssUpateinVueObjViewer()
            },
            setTemplateFramework(item){
                var me = this
                if(!item){
                    if(me.filteredOpenCode){
                        item = me.filteredOpenCode
                    } else {
                        item = []
                        item[0] = me.codeLists.find(x => x.code != "")
                        me.openCode = item
                    }
                }
                
                if(item && item.length > 0){
                    me.templateResultPath = null
                    if(item[0].eleKeys){
                        item[0].eleKeys = {}
                    }
                    me.opennedTemplateFramework = JSON.parse(JSON.stringify(item))
                    let platform = me.getPlatformPath();
                    let tempPath = me.getTempPath();
                    // let filePath = me.getFilePath();

                    
                    if(me.editTemplateFrameWorkList[platform] && me.editTemplateFrameWorkList[platform][tempPath]){
                        me.opennedTemplateFramework[0].code = me.editTemplateFrameWorkList[platform][tempPath].code
                    } else {
                        if(me.templateFrameWorkList[platform] && me.templateFrameWorkList[platform][tempPath]){
                            me.opennedTemplateFramework[0].code = me.templateFrameWorkList[platform][tempPath].content
                        } 
                    } 
                    if(me.templateFrameWorkList[platform] && me.templateFrameWorkList[platform][tempPath] && me.templateFrameWorkList[platform][tempPath].refList){
                        me.opennedTemplateFramework[0].refList = me.templateFrameWorkList[platform][tempPath].refList
                        if(me.openCode && me.openCode[0] && me.openCode[0].fullPath && me.opennedTemplateFramework[0].refList.find(x => x == me.openCode[0].fullPath)){
                            me.templateResultPath = me.openCode[0].fullPath
                        } else if(me.opennedTemplateFramework[0].fullPath && me.opennedTemplateFramework[0].refList.find(x => x == me.opennedTemplateFramework[0].fullPath)){
                            me.templateResultPath = me.opennedTemplateFramework[0].fullPath
                        } else {
                            me.templateResultPath = me.opennedTemplateFramework[0].refList[0]
                        }
                        // if(me.templateFrameWorkList[platform][tempPath].refList){
                        //     // if(!me.templateFrameWorkList[platform][path].refList.find(x => x == path)){
                        //     //     me.templateFrameWorkList[platform][path].refList.push(path)
                        //     // }
                        //     if(me.templateFrameWorkList[platform][tempPath].refList.find(x => x.includes("undefined/"))){
                        //         me.templateFrameWorkList[platform][tempPath].refList.forEach(function (data, idx){
                        //             if(data.includes("undefined/")){
                        //                 console.log("before/" + me.templateFrameWorkList[platform][tempPath].refList)
                        //                 delete me.templateFrameWorkList[platform][tempPath].refList[idx]
                        //                 console.log("after/" + me.templateFrameWorkList[platform][tempPath].refList)
                        //             }
                        //         })
                        //     }
                        // }
                    }
                    
                    me.setTemplateFileName(platform, tempPath)
                    if(!me.reGenerateOnlyModifiedTemplate){
                        me.setTemplateResult(me.templateResultPath)
                    }

                    me.reGenerateOnlyModifiedTemplate = false;
                    me.editTemplateTabNumber = 0
                }
                me.setMustacheTemplate(me.openCode)
            },
            convertTemplatePath(item) {
                if(item.file){
                    return item.path != '/' ? item.path.replace(`/${item.name}`, '/') : ''
                }
                return ''
            },
            generateDesignPatterns(featuresLists){
                var me = this;
                try{
                    let filteredResults = [];
                    let codeLists = JSON.parse(JSON.stringify(me.codeLists));
                    let lists = featuresLists ? featuresLists : me.treeLists
                    lists = JSON.parse(JSON.stringify(lists));

                    // root folder
                    lists.forEach(function(list){
                        if(list.bcId){
                            list.children = []
                            filteredResults.push(list)
                        }
                    });

                    filteredResults.forEach(function(rootObj){

                        Object.keys(me.designPatterns).forEach(function(patternName){
                            var patternLists = me.designPatterns[patternName];
                            var equalsBCLists = patternLists.filter(patternObj => patternObj.path.startsWith(rootObj.name))
                            if( equalsBCLists.length > 0){
                                var filterArray = [];

                                equalsBCLists.forEach(function(matchItem){
                                    var codeObj = codeLists.find(x=>x.fullPath == matchItem.path)

                                    if(codeObj){
                                        codeObj.patternRef = matchItem;
                                        if(!codeObj.highlightLists) {
                                            codeObj.highlightLists = {}
                                        }
                                        if(!codeObj.highlightLists[patternName]){
                                            codeObj.highlightLists[patternName] = []
                                        }
                                        codeObj.name = codeObj.fileName
                                        codeObj.path = codeObj.fullPath

                                        codeObj.highlightLists[patternName].push({start: matchItem.start , end: matchItem.end})
                                        var before = filterArray.find(x=>x.fullPath == codeObj.fullPath)
                                        if(before){
                                            before = codeObj
                                        }else{
                                            filterArray.push(codeObj)
                                        }
                                    }
                                })

                                if(filterArray.length > 0 ){
                                    // children 0 으로 상위 호환.
                                    var firstItem = filterArray[0]
                                    var mainData = {}

                                    // 2 depth
                                    Object.keys(firstItem).forEach(function(itemkey){
                                        var key = JSON.parse(JSON.stringify(itemkey))
                                        var value = null
                                        if(itemkey == 'key' || itemkey == 'hash' || itemkey=='name'){
                                            value = patternName
                                        } else if(itemkey == 'file'){
                                            value = null
                                        }else  {
                                            value = firstItem[itemkey]
                                        }
                                        mainData[key] = value
                                    })
                                    mainData.children = filterArray

                                    // 1 depth
                                    Object.keys(rootObj).forEach(function(itemkey){
                                        var key = JSON.parse(JSON.stringify(itemkey))
                                        var value = null
                                        if(key == 'path' || key == 'code'){
                                            rootObj[key] = mainData[key]
                                        }
                                    })

                                    // folder 별 패턴 분류.
                                    mainData.children.forEach(function(child){
                                        child.pattern = mainData.key
                                        child.hash = `${child.pattern}-${child.hash}`
                                    })
                                    mainData = JSON.parse(JSON.stringify(mainData));

                                    rootObj.children.push(mainData)
                                }else{
                                    rootObj.code = ''
                                }

                            }
                        });
                    });
                    return filteredResults
                } catch(e) {
                    logger.error(`Error] Generate Design Patterns :${e}`)
                    return []
                }
            },
            async openTemplateDialog(division, template, element){
                var me = this
                try {
                    // division : Base, Template, Topping
                    if(me.editableTemplate){
                        me.templateDialog.division = division;

                        if(division == 'BASE'){
                            if(template == 'Custom Template'){
                                me.templateDialog.url = JSON.parse(JSON.stringify(me.basePlatform));
                                me.templateDialog.show = true
                            } else {
                                me.showApplyBaseTemplateDialog = true;
                                me.settingPlatform('BASE', template);
                            }
                        }else if(division == 'TEMPLATE'){
                            if (template == 'Custom Template') {
                                me.templateDialog.elementId = element.bcId
                                me.templateDialog.url = JSON.parse(JSON.stringify(element.preferredPlatform));

                                /* Prompt -> Dialog  */
                                if (me.templateDialog.url.length < 3) {
                                    if (!window.localStorage.getItem("gitAccessToken")) {
                                        me.gitAccessTokenIs = false
                                    } else {
                                        me.gitAccessTokenIs = true
                                    }
                                    me.codeModalWidth = '90%';
                                }

                                me.templateDialog.show = true;
                            } else {
                                if (element && element.bcId && me.value.elements[element.bcId]) {
                                    me.$emit('changedByMe', true)
                                    me.value.elements[element.bcId].preferredPlatform = template
                                }
                                var options={
                                    applyCodeStyle : false
                                }
                                await me.callGenerate(options)
                            }
                        }else if(division == 'TOPPING'){
                            me.templateDialog.show = true
                        }
                    }
                } catch(e){
                    console.log(`Error] Open Template Dialog: ${e}`)
                }
            },
            closeTemplateDialog(){
                var me = this
                me.templateDialog.show = false;
                me.templateDialog.division = 'BASE';

                me.changedValueCustomTemplate = false;
            },
            applyTemplateDialog(){
                var me = this
                try {
                    if (me.gitAccessToken.length > 1) {
                        if(me.templateDialog.division == 'BASE'){
                            me.settingPlatform('BASE', me.templateDialog.url);
                            me.showApplyBaseTemplateDialog = true;
                        } else if (me.templateDialog.division == 'TEMPLATE'){
                            me.settingPlatform('TEMPLATE', me.templateDialog.url, me.templateDialog.elementId);
                            me.$http.defaults.headers.common['Authorization'] = `token ${me.gitAccessToken}`;
                            localStorage.setItem('gitAccessToken', me.gitAccessToken);
                            me.githubHeaders = {
                                Authorization: 'token ' + me.gitAccessToken,
                                Accept: 'application/vnd.github+json'
                            }
                            me.codeModalWidth = '80%';
                        } else if (me.templateDialog.division == 'TOPPING'){
                            if(me.templateDialog.url &&  !me.tempToppingPlatforms.includes(me.templateDialog.url)){
                                me.tempToppingPlatforms.push(me.templateDialog.url)
                            }
                            me.settingPlatform('TOPPING', me.tempToppingPlatforms)
                        }
                        me.templateDialog.show = false;
                        me.refreshCallGenerate();
                    } else{
                        me.closeCodeViewer();
                        me.alertInfo.show = true
                        me.alertInfo.text = "Github Persenal Access Token을 입력해주세요."
                        me.alertInfo.link = "https://github.com/TheOpenCloudEngine/msaschool/wiki/Github-Personal-Access-Token-%EB%B0%9C%ED%96%89-%EB%B0%A9%EB%B2%95"
                    }
                } catch (e) {
                    console.log(`Error] Apply Template Dialog: ${e}`)
                }
            },
            cancelModify() {
                var me = this
                this.cancelModifying = false
                me.$EventBus.$emit("openProgressing");
                me.closeCodeViewer()
            },
            endModify() {
                var me = this
                this.changedModifying = false
                me.$EventBus.$emit("openProgressing");
                me.closeCodeViewer()
            },
            findBeforeCodeByPath(obj) {
                var me = this
                // var beforeFullPath = obj.beforeFullPath
                var beforeFullPath = obj.path

                try {
                    if (beforeFullPath) {
                        var getBeforeCodeStr = localStorage.getItem('beforeCode')
                        if (getBeforeCodeStr) {
                            var getBeforeCodeObj = JSON.parse(getBeforeCodeStr)
                            var getBeforeCodeLists = getBeforeCodeObj.codeLists
                            var f = getBeforeCodeLists.find(codeObj => codeObj.fullPath == beforeFullPath)
                            var fIndex = getBeforeCodeLists.findIndex(codeObj => codeObj.fullPath == beforeFullPath)
                            var after = obj

                            var setValue = {
                                bcId: after.bcId,
                                code: after.code,
                                fullPath: after.path,
                                hash: after.hash,
                                key: after.key
                            }

                            if (f && fIndex != -1) {
                                // 기존 파일 대체.
                                // var before = getBeforeCodeLists[fIndex]
                                // element: before.element,
                                getBeforeCodeLists[fIndex] = setValue
                            } else {
                                // new File
                                getBeforeCodeLists.push(setValue)
                            }
                            localStorage.setItem('beforeCode', JSON.stringify(getBeforeCodeObj))

                            return f ? f : null
                        }
                        return null;
                    }
                    return null;
                } catch (e) {
                    console.log('findBeforeCodeByPath[Error] : ', e)
                    return null;
                }
            },
            loadHandleBarHelper(handler){
                try{
                    if( !handler ){
                        return;
                    }
                    (new Function(handler))();
                }catch(e){
                    console.log(`Error] Load HandleBar Helper.js: ${e} `)
                }
            },
            async gitTemplate(division, gitRepoUrl) {
                var me = this
                // division : Base, Template, Topping
                try{

                    if( me.templateFrameWorkList[gitRepoUrl] && Object.keys(me.templateFrameWorkList[gitRepoUrl]).length > 0 ){
                        // console.log(`>>> Generate Code] DONE Template(${gitRepoUrl})`);
                        // return;
                    }

                    if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){
                        // let first = false;
                        let templateUrl = gitRepoUrl ? gitRepoUrl : me.basePlatform

                        // if( !(me.templateFrameWorkList[templateUrl] && Object.keys(me.templateFrameWorkList[templateUrl]).length > 0) ){
                            // first = true
                            me.$manifestsPerTemplate[templateUrl] = [];
                        // }

                        // if(first){
                            let gitRepository = templateUrl.split('/')[templateUrl.split('/').length - 2].trim()
                            let gitProject = templateUrl.split('/')[templateUrl.split('/').length - 1].trim()
                            let commitRes = await axios.get(`https://api.github.com/repos/` + gitRepository + '/' + gitProject + `/commits`, { headers: me.githubHeaders })
                            .catch(function (error) {
                                if(error.response.status === 401){
                                    me.alertReLogin()
                                }
                                alert(error)
                            })
                            if(commitRes){
                                let res = await axios.get(`https://api.github.com/repos/` + gitRepository + '/' + gitProject + `/git/trees/` + commitRes.data[0].sha, { headers: me.githubHeaders })
                                .catch(function (error) {
                                    if(error.response.status === 401){
                                        me.alertReLogin()
                                    }
                                    alert(error)
                                })
                                if(res){
                                    await me.setGitList(res.data, gitRepository, templateUrl)
                                }
                            }
                        // }
                    }
                }catch (e) {
                    console.log(`Error] Load Git Template: ${e}`)
                    if(e.response.data.message.includes("Bad credentials")){
                        me.githubTokenError = true
                        me.gitMenu = true
                        return false
                    }
                }
            },
            async setGitList(element, repository, gitRepoUrl) {
                var me = this

                var isToppingSetting = false
                if(element.url.includes("topping-")){
                    isToppingSetting = true
                }

                var toppingName = ""
                if(isToppingSetting){
                    toppingName = repository
                }

                return new Promise(async (resolve, reject) => {
                    let gitTemplateContents = {};
                    let result = null;
                    try{
                        result = await axios.get(element.url + '?recursive=1', { headers: me.githubHeaders });
                    }catch (e) {
                        console.log(`Error] Set GitList: ${e}`)
                        resolve();
                    }

                    if( result && result.data && result.data.tree.length > 0 ){
                        let callCnt = 0;

                        result.data.tree.forEach(async function (ele, idx) {
                            if(isToppingSetting){
                                try{
                                    if (ele.type != 'tree') {
                                        //var elePath = ele.path.replace(`${toppingName}/`, '')
                                        var elePath = ele.path
                                        me.$manifestsPerToppings[gitRepoUrl].push(elePath)

                                        if(!me.gitToppingList[gitRepoUrl]){
                                            me.gitToppingList[gitRepoUrl] = {}
                                        }
                                        if(!me.gitToppingList[gitRepoUrl][elePath]){
                                            me.gitToppingList[gitRepoUrl][elePath] = {}
                                        }
                                        me.gitToppingList[gitRepoUrl][elePath].requestUrl = ele.url

                                        var gitSha = await axios.get(ele.url, { headers: me.githubHeaders })
                                        if(!gitTemplateContents[elePath]) gitTemplateContents[elePath] = null
                                        gitTemplateContents[elePath] = Base64.decode(gitSha.data.content);
                                    }
                                }catch(e){
                                    console.log(`Error] Set ToppingLists: ${e}`)
                                }finally {
                                    callCnt ++ ;
                                    if(result.data.tree.length == callCnt) {
                                        Object.keys(gitTemplateContents).forEach(function (fileName) {
                                            if(!me.gitToppingList[gitRepoUrl][fileName]){
                                                me.gitToppingList[gitRepoUrl][fileName] = {}
                                            }
                                            me.gitToppingList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                        });
                                        console.log(`>>> Generate Code] Topping(${gitRepoUrl}) DONE`)
                                        resolve();
                                    }

                                    var gitSha = await axios.get(ele.url, { headers: me.githubHeaders });
                                    if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                                    gitTemplateContents[ele.path] = Base64.decode(gitSha.data.content);
                                    if(ele.path.includes("helper.js")){
                                        me.loadHandleBarHelper(Base64.decode(gitSha.data.content));
                                    }
                                }
                            }else{
                                try{
                                    if (ele.type != 'tree') {
                                        if(gitRepoUrl){
                                            me.$manifestsPerTemplate[gitRepoUrl].push('./' + ele.path)
                                        }

                                        if(!me.templateFrameWorkList[gitRepoUrl]){
                                            me.templateFrameWorkList[gitRepoUrl] = {}
                                        }
                                        if(!me.templateFrameWorkList[gitRepoUrl][ele.path]){
                                            me.templateFrameWorkList[gitRepoUrl][ele.path] = {}
                                        }
                                        me.templateFrameWorkList[gitRepoUrl][ele.path].requestUrl = ele.url

                                        var gitSha = await axios.get(ele.url, { headers: me.githubHeaders });
                                        if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                                        gitTemplateContents[ele.path] = Base64.decode(gitSha.data.content);
                                    }
                                } catch (e) {
                                    console.log(`Error] Set GitLists: ${e}`)
                                } finally {
                                    callCnt ++;
                                    if(result.data.tree.length == callCnt) {
                                        me.$manifestsPerBaseTemplate[gitRepoUrl] = me.$manifestsPerTemplate[gitRepoUrl];
                                        Object.keys(gitTemplateContents).forEach(function (fileName) {
                                            if(!me.templateFrameWorkList[gitRepoUrl][fileName]){
                                                me.templateFrameWorkList[gitRepoUrl][fileName] = {}
                                            }
                                            me.templateFrameWorkList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                        });
                                        console.log(`>>> Generate Code] Template(${gitRepoUrl}) DONE`);
                                        resolve();
                                    }
                                }
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            },
            async setToppingList(template) {
                var me = this
                
                let fullUrl = null;
                if(/^http[s]?\:\/\//i.test(template)){
                    fullUrl = template;
                } else {
                    fullUrl = "https://github.com/msa-ez/topping-" + template;
                }
                let gitRepository = fullUrl.split('/')[fullUrl.split('/').length -2];
                let gitProject = fullUrl.split('/')[fullUrl.split('/').length -1];
                let toppingName = gitProject.replace('topping-','');


                if( me.gitToppingList[fullUrl] && Object.keys(me.gitToppingList[fullUrl]).length > 0 ){
                    return;
                }

                if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){

                    if( !(me.gitToppingList[fullUrl] && Object.keys(me.gitToppingList[fullUrl]).length > 0) ){
                        me.$manifestsPerToppings[fullUrl] = [];

                        let commitRes = null;
                        let res = null;

                        try{
                            commitRes = await axios.get(`https://api.github.com/repos/` + gitRepository + '/' + gitProject + `/commits`, { headers: me.githubHeaders })
                            .catch(function (error) {
                                if(error.response.status === 401){
                                    me.alertReLogin()
                                }
                                alert(error)
                            })
                            res = await axios.get(`https://api.github.com/repos/` + gitRepository + '/' + gitProject + `/git/trees/` + commitRes.data[0].sha, { headers: me.githubHeaders })
                            .catch(function (error) {
                                if(error.response.status === 401){
                                    me.alertReLogin()
                                }
                                alert(error)
                            })

                            if(res && res.data){
                                await me.setGitList(res.data, toppingName, fullUrl)
                            }

                        }catch (e) {
                            console.log(`Error]  Commit Res : ${e}`)
                        }finally {
                            if(! (commitRes && res)){
                                Promise.resolve();
                            }
                        }
                    }else{
                        Promise.resolve();
                    }
                } else {
                    Promise.resolve();
                }
            },
            changedTopping(topping) {
                var me = this

                // << security
                if(topping == 'spring-security'){
                    if(me.tempToppingPlatforms.includes('keycloak-security')){
                        let index = me.tempToppingPlatforms.indexOf('keycloak-security');
                        me.tempToppingPlatforms.splice(index,1)
                    }
                }
                if(topping == 'keycloak-security'){
                    if(me.tempToppingPlatforms.includes('spring-security')){
                        let index = me.tempToppingPlatforms.indexOf('spring-security');
                        me.tempToppingPlatforms.splice(index,1)
                    }
                }
                // >> security
                //<< java
                // if(topping == 'java8'){
                //     if(me.tempToppingPlatforms.includes('java15')){
                //         let index = me.tempToppingPlatforms.indexOf('java15');
                //         me.tempToppingPlatforms.splice(index,1)
                //     }
                // }
                // if(topping == 'java15'){
                //     if(me.tempToppingPlatforms.includes('java8')){
                //         let index = me.tempToppingPlatforms.indexOf('java8');
                //         me.tempToppingPlatforms.splice(index,1)
                //     }
                // }
                //>> java

                if(me.tempToppingPlatforms.includes(topping)){
                    let index = me.tempToppingPlatforms.indexOf(topping);
                    me.tempToppingPlatforms.splice(index,1)
                }else{
                    me.tempToppingPlatforms.push(topping);
                }

                // << !!Remove
                // me.tempToppingPlatforms = []
                //
                // if (me.isApolloGraphQL) {
                //     me.tempToppingPlatforms.push('apollo-graphql')
                // }
                // if (me.isSpringSecurity) {
                //     me.tempToppingPlatforms.push('spring-security')
                // }
                // if (me.isKeycloakSecurity) {
                //     me.tempToppingPlatforms.push('keycloak-security')
                // }
                // if (me.isRollout) {
                //     me.tempToppingPlatforms.push('argo')
                // }
                // if (me.isServiceMesh) {
                //     me.tempToppingPlatforms.push('istio')
                // }
                // if (me.isIngress) {
                //     me.tempToppingPlatforms.push('ingress')
                // }
                // if(me.isVanillaK8s){
                //     me.tempToppingPlatforms.push('isVanillaK8s')
                // }
                // //java version
                // if (me.isJava15) {
                //     me.tempToppingPlatforms.push('java15')
                // }
                // me.settingPlatform('Topping',me.tempToppingPlatforms)
                // me.value.toppingPlatforms = me.tempToppingPlatforms
                // me.refreshCallGenerate();
                // >> !!Remove

            },
            setBeforeCode() {
                var me = this
                try {
                    var isExistCode = localStorage.getItem('beforeCode') ? true : false

                    function saveCode() {
                        var obj = {
                            projectId: me.modelingProjectId,
                            codeLists: me.filteredCodeLists
                            // codeLists: me.fullPathList
                        }
                        // localStorage.setItem('beforeCode', JSON.stringify(obj))
                    }

                    if (isExistCode) {
                        let projectId = null;
                        var getBeforeCodeStr = localStorage.getItem('beforeCode')
                        if(getBeforeCodeStr){
                            var getBeforeCodeObj = JSON.parse(getBeforeCodeStr)
                            projectId = getBeforeCodeObj.projectId
                        }

                        if (projectId != me.modelingProjectId) {
                            //다른 프로젝트
                            saveCode()
                        }
                    } else {
                        if (me.filteredCodeLists.length > 0) {
                            saveCode()
                        }
                    }
                } catch (e) {
                    console.log('setBeforeCode[Error] : ', e)
                }

            },
            generateTree(options){
                var me = this
                var treeLists = []

                try{
                    var applyCodeStyle = options ? options.applyCodeStyle : true
                    // var lists = JSON.parse(JSON.stringify(me.filteredCodeLists))
                    var lists = me.filteredCodeLists

                    if(lists){
                        lists.forEach(codeObj => {
                            var currentFolder = treeLists; // start from top
                            var currentPath = "";

                            // Embedded K8s Model Code Tree Filtering
                            codeObj.fullPath.split('/').forEach(fileName => {
                                if(me.embeddedK8s){
                                    if(!codeObj.template.includes('topping-isVanillaK8s')){
                                        return;
                                    }
                                }

                                currentPath = currentPath + "/" + fileName;

                                var isFolder = !(("/" + codeObj.fullPath) === currentPath);

                                var fileObj = currentFolder.find(x => x.name === fileName.trim());
                                if(!fileObj){
                                    fileObj = {
                                        bcId: codeObj.bcId,
                                        name: fileName.trim(),
                                        key: codeObj.key,
                                        file: codeObj.file,
                                        code: codeObj.code,
                                        hash: codeObj.hash,
                                        path: codeObj.fullPath,
                                        changed: 0,
                                        children: isFolder ? [] : null,

                                        // codeRef: codeObj,
                                        templatePath: codeObj.templatePath,
                                        fullPath: codeObj.fullPath,
                                        template: codeObj.template,
                                        generatedType: codeObj.generatedType,
                                        isMirrorElement: codeObj.isMirrorElement
                                    };
                                    if(codeObj.hash == fileObj.hash && codeObj.fileName != fileObj.name){
                                        fileObj.hash = fileObj.hash + 1
                                    }
                                    if( codeObj.generatedType.includes('MAIN') ){
                                        currentFolder.push(fileObj);
                                    }else {
                                        currentFolder.unshift(fileObj);
                                    }
                                }
                                currentFolder = fileObj.children;
                            })
                        });
                    }

                    // treeLists = treeLists.sort((a, b) => a.isPBCModel && b.isPBCModel ? (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1) : 0);

                    //me.codeStatus = true;

                    // Root Folder Setting preferredPlatform
                    treeLists.forEach(function (treeList ,index){
                        let bcId = treeList.bcId && me.value.elements[treeList.bcId] ? me.value.elements[treeList.bcId] : treeList.bcId
                        var bcObj = bcId ? JSON.parse(JSON.stringify(bcId)) : null
                        var isFolder = treeList.children ? true : false

                        if(isFolder){
                            treeList.file = null;
                        }


                        if( treeList.generatedType.includes('BASE') ){
                            // base
                            treeList.preferredPlatform = me.basePlatform
                            treeList.isBasePlatform = true
                        } else if(treeList.generatedType.includes('TOPPING')){
                            // topping
                            treeList.preferredPlatform = treeList.template
                        } else if(bcObj){
                            // template (main)
                            bcObj.preferredPlatform = bcObj.preferredPlatform && bcObj.preferredPlatform.includes("http") ? bcObj.preferredPlatform : 'https://github.com/msa-ez/template-spring-boot'
                            treeList.preferredPlatform = bcObj.preferredPlatform
                        }
                    })


                } catch(e) {
                    console.log(`Error] GenerateTree :  ${e}`);
                } finally {
                    me.showBaseTemplate = true
                    if(me.isOneBCModel && me.canvasName != "context-mapping-model-canvas"){
                        var idx = treeLists.findIndex(x => x.bcId === me.onlyOneBcId)
                        if(treeLists[idx] && treeLists[idx].children){
                            return treeLists[idx].children
                        } else {
                            return treeLists
                        }
                    } else {
                        return treeLists
                    }
                }
            },
            createPathsFromObject(obj, prefix){
                var me = this
                let paths = {};

                for (let key in obj) {
                    let path = prefix ? `${prefix}\\${key}`: `${key}`

                    if ( typeof obj[key] === 'object' && !Array.isArray(obj[key]) ) {

                        if(  prefix &&  Object.values(obj).length  == 1 ) {
                            // Only one Array or Object
                            paths[path] = obj[key];
                            break;
                        }

                        let nestedPaths = me.createPathsFromObject(obj[key], path);
                        paths = { ...paths, ...nestedPaths };
                            } else {
                        paths[path] = obj[key];
                    }
                            }

                return paths;
            },
            createObjectFromPaths(paths, separator) {
                let obj = {};

                for (let path in paths) {
                    let keys = path.split(separator);
                    let value = paths[path];

                    let currentObj = obj;

                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];

                        if (i === keys.length - 1) {
                            currentObj[key] = value;
                    } else {
                            if (!currentObj[key]) {
                                currentObj[key] = {};
                            }

                            currentObj = currentObj[key];
                        }
                    }
                }

                return obj;
            },
            findIsKeyAttrByObj(values){
                let result = []

                const findObject = (values) => {
                    let value = JSON.parse(JSON.stringify(values));
                    for (const key in value) {
                        const objects = value[key];
                        if( typeof objects == 'object') {
                            if( !objects.$ ) {
                                return findObject(objects);
                            } else if (objects.$ && objects.$.isKey === 'true') {
                                value[key] = objects._
                                return {key: key, value: objects._ , item: value};
                            }
                        }
                    }
                };

                if( typeof values == 'object' ){
                    if(Array.isArray(values)){
                        values.forEach(function(obj){
                            let item = findObject(obj);
                            item && result.push(item);
                        });
                    } else {
                        let item = findObject(values);
                        item && result.push(item);
                    }
                }

                return result;
            },
            _codeMerger(code1, code2, fileName) {
                var me = this
                // code1 - compare
                // code2 - origin

                if( fileName.endsWith('java') ){
                    // Split the codes into lines and remove whitespace
                    const code1Lines = code1.split(/\r?\n/).filter(string => string.trim() !== "");//.map(line => line.trim());
                    const code2Lines = code2.split(/\r?\n/).filter(string => string.trim() !== "");//.map(line => line.trim());


                    // Find the index of the class/interface definition of each code
                    let code1ClassIndex = -1;
                    let code2ClassIndex = -1;
                    let code1PackageIndex = -1;
                    let code2PackageIndex = -1;

                    const getAnnotationName = (javaCodeLine) => {
                        let annotationName;
                        const annotationPrefix = "@";
                        const annotationEndIndex = javaCodeLine.lastIndexOf(annotationPrefix);
                        if (annotationEndIndex > -1) {
                            annotationName = javaCodeLine.substring(annotationEndIndex + annotationPrefix.length);
                        }
                        return annotationName;
                    };

                    const isJavaClassOrInterface = (str) => {
                        return /^(public|protected|private|abstract|static)?\s?(class|interface)\s/.test(str);
                    };

                    const isPackageDef = (str) =>{
                        return /^package\s+[A-Za-z_]+(\.[A-Za-z_]+)*;$/.test(str);
                    }

                    for (let i = 0; i < code1Lines.length; i++) {
                        if (getAnnotationName(code1Lines[i])!=null || isJavaClassOrInterface(code1Lines[i])) {
                            code1ClassIndex = i;
                            break;
                        }
                    }
                    for (let i = 0; i < code2Lines.length; i++) {
                        if (getAnnotationName(code2Lines[i])!=null || isJavaClassOrInterface(code2Lines[i])) {
                            code2ClassIndex = i;
                            break;
                        }
                    }
                    for (let i = 0; i < code1Lines.length; i++) {
                        if (isPackageDef(code1Lines[i])) {
                            code1PackageIndex = i;
                            break;
                        }
                    }
                    for (let i = 0; i < code2Lines.length; i++) {
                        if (isPackageDef(code2Lines[i])) {
                            code2PackageIndex = i;
                            break;
                        }
                    }

                    // Merge the lines of code
                    let mergedLines = [];

                    if (code1PackageIndex !== -1 && code2PackageIndex !== -1) {
                        // Merge the class/interface definitions
                        mergedLines.push(code1Lines[code1PackageIndex]);

                        // Merge the methods
                        for (let i = code1PackageIndex+1; i < code1ClassIndex; i++) {
                            mergedLines.push(code1Lines[i]);
                        }
                        for (let i = code2PackageIndex + 1; i < code2ClassIndex; i++) {
                            if(!mergedLines.includes(code2Lines[i]))
                                mergedLines.push(code2Lines[i]);
                        }
                    }

                    if (code1ClassIndex !== -1 && code2ClassIndex !== -1) {
                        // Merge the class/interface definitions
                        mergedLines.push(code1Lines[code1ClassIndex].length > code2Lines[code2ClassIndex].length ? code1Lines[code1ClassIndex] : code2Lines[code2ClassIndex]);

                        // Merge the methods
                        for (let i = code1ClassIndex + 1; i < code1Lines.length -1; i++) {
                            mergedLines.push(code1Lines[i]);
                        }
                        for (let i = code2ClassIndex + 1; i < code2Lines.length; i++) {
                            if(!isJavaClassOrInterface(code2Lines[i]))
                                mergedLines.push(code2Lines[i]);
                        }
                    }

                    // Join the lines of code
                    return mergedLines.join('\n');
                } else if( fileName.endsWith('xml') ){
                    try {
                        // code1 - compare
                        // code2 - origin
                        const xml2js = require('xml2js');
                        const parser = new xml2js.Parser({explicitArray: false});
                        let originObj, mergerObj;

                        // xml -> object
                        parser.parseString(code1, (err, result) => {
                            if (err) throw err;
                            mergerObj = result;
                        });

                        parser.parseString(code2, (err, result) => {
                            if (err) throw err;
                            originObj = result;
                        });

                        // merge
                        const mergedObject = me.mergeDeepObjectXml(originObj, mergerObj);

                        // object -> xml
                        const builder = new xml2js.Builder({explicitArray: false});
                        return builder.buildObject(mergedObject);
                    } catch (e) {
                        return code2;
                    }
                } else if( fileName.endsWith('yml') || fileName.endsWith('yaml') ){
                    try {
                        // code1 - compare
                        // code2 - origin
                        const yaml = require('js-yaml');
                        code1 = me.clearDesignPattern(code1);
                        code2 = me.clearDesignPattern(code2);

                        // yaml -> object
                        let originFiles = yaml.safeLoadAll(code2);
                        const mergerFiles = yaml.safeLoadAll(code1);
                        // merge
                        const mergedFiles = me.mergeDeepObjectYaml(originFiles, mergerFiles)

                        // object -> yml
                        return yaml.safeDump(mergedFiles, { noRefs: true, lineWidth: -1,}).replace(/^(-\s*)+/gm, '---\n').replace(/^ {2}/gm, '');
                    } catch (e){
                        console.info(`[Merge DeepObject Yaml]:${e}`);
                        return code2;
                    }
                }
            },
            mergeDeepObjectYaml(originFiles, mergerFiles){
                var me = this

                try {
                    if( typeof originFiles == 'object' && Array.isArray(originFiles[0]) ){
                        // refactoring: --- 으로 구분시 Array로 감싸지는 문제.
                        originFiles = originFiles[0]
                    }

                    // obj -> path (find merger Objects)
                    let returnFiles = [];
                    let merger = {};
                    mergerFiles.forEach(function(obj){
                        let pathObj = me.findIsKeyAttrByYamlObj(obj)
                        Object.assign(merger, pathObj);
                    });
                    let mergerKeyPath = me.createPathsFromObject(merger, '');


                    originFiles.forEach(function(originFile, originIndex){
                        // origin per file
                        let returnFile = {};
                        let originFileKeyPath = me.createPathsFromObject(originFile, '');
                        let changed = false


                        Object.keys(mergerKeyPath).forEach(function(mergerKey){
                            let originKeys = Object.keys(originFileKeyPath).filter(k => k.includes(mergerKey));
                            if( originKeys.length > 0 ){
                                // Match merge key this File.
                                originKeys.forEach(function(key){
                                    if( mergerKey.split('\\').length  == 1 ){
                                        // new root
                                        let newObj = {};
                                        newObj[mergerKey] = merger[mergerKey]
                                        // returnFile = newObj;
                                        returnFiles.push(newObj);
                                    } else {
                                        // delete origin
                                        delete originFileKeyPath[key];
                                        // replace merge value.

                                        originFileKeyPath[mergerKey] = mergerKeyPath[mergerKey];
                                        // returnFile = me.createObjectFromPaths(originFileKeyPath, '/');
                                        returnFiles[originIndex] = me.createObjectFromPaths(originFileKeyPath, '\\');
                                    }
                                });
                                changed = true;
                            }
                        });

                        if(!changed) {
                            // Not match this origin file.
                            /*
                               originFiles: 원본 목록(array)
                               originFile: 원본 파일.
                               originIndex: 원본 파일 index
                               originFileKeyPath: 'originFile value'  key:path, value 형식.


                               mergerFiles: merge목록 (array)
                               mergerValue : 원본 목록과 머지목록을  모두 합친 파일(array)
                               mergerValuePath: 'mergeValue' key:path, value 형식. (Object)
                               mergerKeyPath : 현재 원본파일과 합치려고하는  현재 머지정보.(object)
                           */

                            const mergerValue = [];
                            originFiles.forEach(function(originDoc){
                                let mergedDoc = {};
                                mergerFiles.forEach(function(mergeDoc){
                                    mergedDoc =  Object.assign(mergedDoc, me.recursiveYamlMerge(mergeDoc, originDoc));
                                });
                                mergerValue.push(mergedDoc);
                            });


                            let mergerValuePath  = me.createPathsFromObject(mergerValue, '');
                            for (const key in mergerValuePath) {
                                if (key.includes('_key')) {
                                    delete mergerValuePath[key];
                                }
                            }

                            // set origin.
                            // returnFiles[originIndex] = originFile;

                            // set merge.
                            returnFiles[originIndex] = me.createObjectFromPaths(mergerValuePath, '\\')[originIndex]
                        }

                    });

                    return returnFiles;
                } catch (e){
                    console.info(`[Yaml Merger]:${e}`);
                    return originFiles;
                }
            },
            recursiveYamlMerge(objA, objB) {
                var me = this
                if (!me.isObject(objA) || !me.isObject(objB)) {
                    return objB;
                }

                const merged = { ...objA };

                for (const key in objB) {
                    if (objB.hasOwnProperty(key)) {
                        if (merged.hasOwnProperty(key)) {
                            merged[key] = me.recursiveYamlMerge(merged[key], objB[key]);
                        } else {
                            merged[key] = objB[key];
                        }
                    }
                }

                return merged;
            },
            mergeDeepObjectXml(originObj, mergerObj){
                var me = this

                try {
                    // object -> path
                    let originPaths = me.createPathsFromObject(originObj, '');
                    let mergePaths = me.createPathsFromObject(mergerObj, '');

                    Object.keys(mergePaths).forEach(function(path){
                        if( typeof mergePaths[path] == 'string' ){
                            // only string
                            originPaths[path] = mergePaths[path];
                        } else {
                            let findKeyArray = me.findIsKeyAttrByXmlObj(mergePaths[path])
                            if( findKeyArray.length > 0 ){
                                // isKey
                                findKeyArray.forEach(function(items){
                                    var array = Array.isArray(originPaths[path]) ? originPaths[path] : Object.values(originPaths[path])[0];

                                    let index = array.findIndex(x=> x[items.key] == items.value )
                                    if( index == -1 ){
                                        array.push(items.item)
                                    } else {
                                        array[index] = items.item
                                    }
                                });
                            } else {
                                // just Object
                                Object.assign(originPaths, mergePaths)
                            }
                        }
                    });


                    // path -> object
                    let mergedObject = me.createObjectFromPaths(originPaths, '\\');

                    return mergedObject;
                } catch(e) {
                    console.error(`[XML Merger]:${e}`);
                    return originObj;
                }
            },
            isObject(value) {
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            },
            findIsKeyAttrByXmlObj(values){
                let result = []

                const findObject = (values) => {
                    let value = JSON.parse(JSON.stringify(values));
                    for (const key in value) {
                        const objects = value[key];
                        if( typeof objects == 'object') {
                            if( !objects.$ ) {
                                return findObject(objects);
                            } else if (objects.$ && objects.$.isKey === 'true') {
                                value[key] = objects._
                                return {key: key, value: objects._ , item: value};
                            }
                        }
                    }
                };

                if( typeof values == 'object' ){
                    if(Array.isArray(values)){
                        values.forEach(function(obj){
                            let item = findObject(obj);
                            item && result.push(item);
                        });
                    } else {
                        let item = findObject(values);
                        item && result.push(item);
                    }
                }

                return result;
            },

            findIsKeyAttrByYamlObj(obj){
                var me = this
                let results = [];
                let resultObj = {};
                let suffix = '_key'
                let copyObj = JSON.parse(JSON.stringify(obj));
                let values = me.createPathsFromObject(obj, '')

                const deleteKeyStartsWith = (obj, word) => {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key) && key.startsWith(word)) {
                            obj[key] = null;
                        }
                    }
                }

                const findObject = (values, paths, originPath) => {
                    let value = JSON.parse(JSON.stringify(values));
                    for (const key in value) {
                        const objects = value[key];
                        originPath = originPath ? originPath : key
                        paths = paths ? `${paths}\\${key}` : key

                        if( typeof objects == 'object' ) {
                            if( !objects[suffix] ) {
                                return findObject(objects, paths, originPath);
                            } else if ( objects[suffix] ) {
                                delete value[key][suffix]
                                return {originPath : originPath, changedPath : paths , item: objects};
                            }
                        } else if( typeof objects == 'string' ) {
                            let stopKey = originPath.replaceAll(`${suffix}`,`${objects}`);
                            if( originPath.includes(suffix)){
                                // let rootKey = key.replaceAll(`/${suffix}`,'');
                                let rootKey = key.replaceAll(`\\${suffix}`,'')

                                // deleteKeyStartsWith(value, rootKey);
                                delete copyObj[rootKey][suffix];
                                return {originPath: originPath, changedPath: rootKey , item: copyObj[rootKey]};
                            }
                        }
                    }
                };

                let originPath = ''
                let paths = ''
                if( typeof values == 'object' ){
                    if(Array.isArray(values)){
                        values.forEach(function(obj){
                            let item = findObject(obj, paths, originPath);
                            item && results.push(item);
                        });
                    } else {
                        let item = findObject(values, paths, originPath);
                        item && results.push(item);
                    }
                }

                if( results.length > 0){
                    results.forEach(function(result){
                        resultObj[result.changedPath] = result.item;
                    });
                } else {
                    // nothing just origin
                    resultObj = values
                }

                return resultObj;
            },
            getPreferredPlatformName(name, mouseOver, isTopping){
                if(name.includes("http")){
                    if(!mouseOver){
                        var platform = name.split('/')[name.split('/').length - 1]
                        if(platform.includes(isTopping ? 'topping': 'template')){
                            if(isTopping){
                                platform = platform.startsWith("topping-") ? platform.replace('topping-', "") : platform
                            } else {
                                platform = platform.startsWith("template-") ? platform.replace('template-', ""): platform
                            }
                        }
                        return platform
                    } else {
                        return name
                    }
                } else {
                    return name
                }
            },
            addTemplateCode() {
                var me = this
                var uuid = me.uuid();
                var valueObj = {
                    'element': null,
                    'fileName': 'test.yml',
                    'key': uuid,
                    'code': 'test  ',
                    'file': 'txt',
                    'boundedContext': 'for-model',
                    'representativeFor': null,
                    'forEach': 'for-model',
                    'bcId': null,
                    'fullPath': 'kubernetes/test.yml',
                    'hash': 11111,
                    'generatedType': "BASE"
                }
                me.codeLists.push(valueObj);
            },
            async openProjectIDE(gitUrl) {
                var me = this
                if(gitUrl && gitUrl.target && gitUrl.target.value){
                    gitUrl = gitUrl.target.value
                }
                me.changedTmp = []
                me.codeStatus = false
                me.ideCheckDialog = false;
                me.$EventBus.$emit("progressing", {
                    progressing: true,
                    type: 'K8S'
                })

                var userName = localStorage.getItem("email").split('@')[0].toLowerCase();
                var userGroup = localStorage.getItem("email").split('@')[1].split('.')[0].toLowerCase();
                var projectName = me.projectName.toLowerCase();
                var projectId = 'untitled'

                if (me.isClazzModeling) {
                    projectId = me.$route.params.labId
                } else {
                    projectId = me.$route.params.projectId;
                }

                var podStatus = await me.getPodStatus(userName, userGroup, projectName);
                var hashName;

                await me.callGenerate()

                while (!me.codeStatus) {
                    await sleep(3000);
                }


                // if (me.ideUpdateCheck) {
                //     await me.deleteIdeFile(userGroup, userName, projectId);
                // }
                if (me.$route.params.labId) {
                    if (me.$parent.labInfo.independent) {
                        var hashPath = me.getClassPath('labs/' + me.$route.params.labId + '/' + me.$route.params.userId);
                        var filePath = hashPath

                    } else {
                        var hashPath = me.getClassPath(me.$route.params.userId);
                        var filePath = me.getClassPath('labs/' + me.$route.params.userId);

                    }
                    hashName = "labs-" + me.hashCode(hashPath);
                } else {
                    hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`
                }

                me.$EventBus.$emit("hashName", {
                    hashName: hashName,
                })

                if (me.projectName.length < 1) {
                    var tempProjectName = window.prompt('Project Name을 입력하여 주세요.');
                    projectName = tempProjectName;
                    me.projectName = tempProjectName
                }

                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms))
                }

                // me.mergeStatus = false;

                me.changedCount = 0;
                if (me.filteredTreeLists.length > 0) {
                    me.filteredTreeLists.forEach(function (list) {
                        if (!list.file) {
                            me.reverse(list.children, list.name)
                        } else if (list.changed > 0) {
                            me.pathTmp.push({
                                path: list.name,
                                code: list.code,
                                changed: list.changed,
                                key: list.key,
                                path: list.path
                            })
                            me.changedTmp.push({
                                path: list.name,
                                code: list.code,
                                changed: list.changed,
                                key: list.key,
                                path: list.path
                            })
                            me.changedCount++;
                        } else if (list.isNew) {
                            me.pathTmp.push({
                                name: list.name,
                                path: list.name,
                                code: list.code,
                                isNew: true,
                                key: list.key,
                                path: list.path
                            })
                            me.changedTmp.push({
                                name: list.name,
                                path: list.name,
                                code: list.code,
                                isNew: true,
                                key: list.key,
                                path: list.path
                            })
                            me.changedCount++;
                        } else {
                            me.changedTmp.push({path: list.name, code: list.code, key: list.key, path: list.path})
                            me.pathTmp.push({path: list.name, code: list.code, key: list.key, path: list.path})
                        }
                    })

                    // if (me.changedCount > 0) {
                    //     me.changedModifying = true
                    //     me.cancelModifying = true
                    //     me.$EventBus.$emit("hideProgressing");
                    //     me.openCodeViewer()
                    //     // me.$modal.show('code-modal')
                    // }
                    //
                    // while (me.changedModifying && me.cancelModifying) {
                    //     await sleep(3000);
                    // }

                    if (me.changedModifying) {
                        me.changedModifying = false
                        me.$EventBus.$emit("endProgressing");
                        return;
                    }

                    me.$EventBus.$emit("nextStep");
                    var zip = new JSZip();

                    // var parents = [];

                    // Git URL 관련 처리 필요함..
                    // BoundedContext 찾기
                    var gitConnectedBoundedLists = []
                    if( Object.values(me.value.elements).filter(x=>x._type.endsWith('BoundedContext')).length > 0 ){
                        Object.values(me.value.elements).filter(x=>x._type.endsWith('BoundedContext')).forEach(function (bc) {
                            if (bc && bc.gitURL) {
                                gitConnectedBoundedLists.push(bc.name)
                            }
                        });
                    }
                    await me.makeDir(`labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("email")}/${projectId}`)
                    /* me.$http.post(`${me.fileServerUrl}/api/makeDir`, {
                         "hashName": hashName,
                         "path": `home/minio/labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("email")}/${projectId}`
                     }).catch(e => console.log(e));*/
                    me.pathTmp.forEach(function (generateData) {
                        console.log(generateData);
                        if (generateData.path.includes('/')) {
                            // parents.push(generateData.path.split('/')[0])
                        }
                        if (!gitConnectedBoundedLists.includes(generateData.path.split("/")[0]))
                            zip.file(generateData.path, generateData.code)
                    })

                    // parents. forEach(function (prefix) {
                    //     zip.folder(prefix).forEach(function (relativePath, file) {
                    //     });
                    // })


                    zip.generateAsync({type: "nodebuffer"})
                        .then(async function (content) {
                            var metaData = {
                                'Content-Type': 'application/zip',
                            }
                            me.$EventBus.$emit("nextStep")
                            // var minioClient = new Minio.Client({
                            //     endPoint: `minio.${me.getTenantId()}`,
                            //     port: 443,
                            //     useSSL: true,
                            //     accessKey: 'minio',
                            //     secretKey: 'minio123'
                            // });

                            var configPath = `${userGroup}/${userName}/config`
                            var checkConfigFile;
                            try {
                                checkConfigFile = await me.getString('storage://labs-msaez.io/' + configPath + '/config');
                            } catch (e) {
                                checkConfigFile = null
                            }

                            if (podStatus) {
                                me.$EventBus.$emit("nextStep")

                                me.$EventBus.$emit("nextStep");
                                me.$EventBus.$emit("nextStep");
                                // Pod가 존재 한다면 파일만 추가
                                // IdeLoadingPage
                                if (gitUrl)
                                    me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${me.$route.params.labId ? me.$route.params.labId : projectId}&giturl=${encodeURIComponent(gitUrl)}`, '_blank')
                                else
                                    me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${me.$route.params.labId ? me.$route.params.labId : projectId}`, '_blank')
                                me.$EventBus.$emit("nextStep");

                                me.$nextTick(function () {
                                    me.overlayText = null
                                    me.pathTmp = []
                                    me.$EventBus.$emit("endProgressing");
                                })
                                return;
                            } else {
                                me.$EventBus.$emit("nextStep");

                                var convertEmail = me.userInfo.email.replace(/\./gi, '_')

                                if (me.isForeign) {
                                    me.toolResourceQuota.cpu = "4"
                                    me.toolResourceQuota.memory = "8Gi"
                                } else {
                                    me.resourceQuotaDialog = true;
                                    while (!me.setResourceQuota) {
                                        await sleep(1000);
                                    }
                                }
                                me.setResourceQuota = false

                                var setResourceType = me.resourceType

                                if (me.$route.params.labId) {
                                    var course = me.courseId;
                                    var clazz = me.classId;
                                    var clazzName = clazz
                                    var lab = me.labId;
                                }

                                //ide  && k8s setting
                                var spec = {
                                    "apiVersion": "uengine.org/v1alpha1",
                                    "kind": "Ide",
                                    "metadata": {
                                        "name": hashName
                                    },
                                    "spec": {
                                        "hashName": hashName,
                                        "userId": localStorage.getItem("author").replace("@", "_"),
                                        // "templateFile": `${projectId}.zip`,
                                        "image": 'msa-repository.kubeflow.kr/msaez/theia-full-test:v9',
                                        "tenant": me.$route.params.labId ? me.getTenantId() : "eventstorming",
                                        "course": me.$route.params.labId ? course : `${userGroup}`,
                                        "lab": me.$route.params.labId ? lab : `${projectId}`,
                                        "clazz": me.$route.params.labId ? clazzName : `users`,
                                        // "zipUrl": zipUrl,
                                        "status": "running"
                                    }
                                }
                                //set k8s
                                spec.spec.resourceQuota = me.toolResourceQuota;
                                await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides`, spec);

                                if (me.toolResourceType) {
                                    setResourceType = `${setResourceType}@${me.toolResourceType}`
                                }

                                // resourceType
                                var resourceTypeObj = {
                                    resourceType: setResourceType
                                }
                                me.putObject(`db://enrolledUsers/${convertEmail}/usage/${hashName}`, resourceTypeObj)
                            }
                            // ----------- Resource Size basic 설정 END------------->


                            var operatorCheck = await me.checkIdeOperator(hashName);

                            function sleep(ms) {
                                return new Promise(resolve => setTimeout(resolve, ms))
                            }

                            while (!operatorCheck) {
                                operatorCheck = await me.checkIdeOperator(hashName);
                                await sleep(3000)
                            }
                            // me.setResourceQuota = false;
                            var obj = {
                                "course": `${userGroup}`,
                                "lab": `${userName}`,
                                "clazz": `${projectId}`,
                                "userId": localStorage.getItem("author").replace("@", "_")
                            }
                            await me.deleteConfig(hashName, obj)
                            await me.makeConfig(hashName, obj);
// IdeLoadingPage
                            if (gitUrl)
                                me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${projectId}&giturl=${encodeURIComponent(gitUrl)}`, '_blank')
                            else
                                me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${projectId}`, '_blank')
                            if (me.sshUrl) {
                                var commandParams = new URLSearchParams();
                                commandParams.append('filePath', `labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("author")}`);
                                commandParams.append('lab', `${projectId}`);
                                commandParams.append('githubURL', `${me.sshUrl}`);
                                commandParams.append('hashName', `${hashName}`);
                                setTimeout(function () {
                                    me.$http.post(`${me.getProtocol()}//file.kuberez.io/api/runCommand`, commandParams)
                                }, 3000)
                            }
                            me.$EventBus.$emit("nextStep");
                            setTimeout(function () {
                                me.$http.post(`${me.getProtocol()}//file.kuberez.io/api/gitCommit`, gitParams)
                            }, 3000)

                            me.$nextTick(function () {
                                me.overlayText = null
                                me.pathTmp = []
                                me.$EventBus.$emit("endProgressing");
                            })
                            // })
                            me.$EventBus.$emit("nextStep")
                            // var zipUrl = await me.presignedURL(`${userGroup}/${userName}/${projectId}.zip`);
                        })

                } else {
                    await me.callGenerate();
                    me.openProjectIDE();
                }
            },
            isChangedCode(codeItem) {
                var me = this
                
                if (!codeItem) {
                    return false
                }
                if (me.getDiffTreeLists && me.getDiffTreeLists.length == 0) {
                    return false
                }
                var path = codeItem.path
                var isFolder = codeItem.children && !codeItem.code ? true : false

                if (isFolder) {
                    var pathArray = path.split('/')
                    pathArray = pathArray.slice(0, -1);
                    var folderPath = pathArray.join('/')
                    var array = me.getDiffTreeLists.filter((item) => {
                        if (item
                            && item.startsWith(folderPath)
                            && folderPath != ''
                        ) {
                            return true
                        }
                    })
                    if (array.length > 0) {
                        return true
                    }

                } else {
                    if (me.getDiffTreeLists.indexOf(path) != -1) {
                        return true
                    }
                }
                return false
            },
            changeTemplate(template) {
                var me = this;
                me.defaultTemplate = template;
            },
            async callGenerate() {
                var me = this;

                try {
                    console.log('>>> Generate Code] Start Main<<<', Date.now());
                    me.isGeneratorDone = false;
                    me.callGenerateCode();
                } catch (e) {
                    console.log(`ERROR] Generate ${e}`);
                }
            },
            async callGenerateCode() {
                var me = this;

                return new Promise(await function (resolve, reject) {
                    me.newTreeList = [];
                    var copyValue = JSON.parse(JSON.stringify(me.value));

                    if (me.defaultTemplate.length > 0) {
                        var template = me.defaultTemplate;
                    } else {
                        var template = 'Separate File per kind';
                    }

                    if (template == 'Separate File') {
                        var codeValue = {};

                        Object.keys(copyValue.elements).forEach((key) => {
                            var item = copyValue.elements[key];
                            if (item && item._type != "DestinationRuleSubset" && 
                                    item._type != "WorkflowDag" && 
                                    item._type != "WorkflowStep"
                            ) {
                                codeValue = {
                                    'key': item.elementView.id,
                                    'name': item.object.metadata.name + '.yaml',
                                    'code': me.yamlFilter(json2yaml.stringify(item.object)),
                                    'file': me.fileType('.yaml')
                                };
                                me.newTreeList.push(codeValue);
                                resolve();
                            }
                        });
                    } else if (template == 'Single File') {
                        var yaml = '';

                        Object.keys(copyValue.elements).forEach((key) => {
                            var item = copyValue.elements[key]
                            if (item && item._type != "DestinationRuleSubset" &&
                                    item._type != "WorkflowDag" &&
                                    item._type != "WorkflowStep"
                            ) {
                                yaml += '--- \n' + me.yamlFilter(json2yaml.stringify(item.object));
                            }
                        });

                        var codeValue = {
                            'key': 'local',
                            'name': 'local.yaml',
                            'code': yaml,
                            'file': me.fileType('.yaml')
                        };

                        me.newTreeList.push(codeValue);
                        resolve();
                    } else if (template == 'Separate File per kind') {
                        me.setYamlPerKind(me.newTreeList);
                        resolve();
                    } else if (template == 'Helm') {
                        me.setHelmChart();
                        resolve();
                    }
                    
                    me.isGeneratorDone = true;
                });
            },
            setYamlPerKind(treeList) {
                var me = this;
                var copyValue = JSON.parse(JSON.stringify(me.value));

                Object.keys(copyValue.elements).forEach((key) => {
                    var item = copyValue.elements[key];
                    if (item && item._type != "DestinationRuleSubset" && 
                            item._type != "WorkflowDag" && 
                            item._type != "WorkflowStep"
                    ) {
                        var name = (item._type).toLowerCase();
                        var codeValue = {
                            'key': item.elementView.id,
                            'name': name + '.yaml',
                            'code': '--- \n' + me.yamlFilter(json2yaml.stringify(item.object)),
                            'file': me.fileType('.yaml')
                        };

                        var index = treeList.findIndex((val) => {
                            if (val.name == codeValue.name) {
                                val.code += codeValue.code;
                            }
                            return val.name == codeValue.name;
                        });

                        if (index == -1) {
                            treeList.push(codeValue);
                        }
                    }
                });
            },
            setHelmChart() {
                var me = this;
                var templates = [];
                var notes = {
                    'key': 'notes',
                    'name': 'NOTES.txt',
                    'code': '',
                    'file': 'txt'
                };
                templates.push(notes);
                me.setYamlPerKind(templates);

                me.chartJson = {
                    "apiVersion": "v1",
                    "name": me.projectName,
                    "version": "0.1.0",
                    "description": "A Helm chart for Kubernetes"
                };

                var folder = {
                    'name': me.projectName,
                    'children': [
                        {
                            'key': 'chart',
                            'name': 'Chart.yaml',
                            'code': me.yamlFilter(json2yaml.stringify(me.chartJson)),
                            'file': me.fileType('.yaml')
                        },
                        {
                            'name': 'templates',
                            'children': templates
                        },
                        {
                            'key': 'values',
                            'name': 'values.yaml',
                            'code': me.valuesYaml,
                            'file': me.fileType('.yaml')
                        }
                    ]
                };
                me.newTreeList.push(folder);
            },
            yamlFilter(yamlText) {
                let lines = yamlText.split('\n');
                lines.splice(0, 1);
                for (let i in lines) {
                    lines[i] = lines[i].substring(2, lines[i].length);
                }
                yamlText = lines.join('\n');
                yamlText = yamlText.replace(/ null/g, ' ');
                return yamlText;
            },
        }
    }
</script>

<style>
</style>