<template>
    <v-card style="height: 100vh;">
        <v-dialog v-model="openGitActionDialog" :key="gitActionDialogRenderKey">
            <GitActionDialog
                @closeGitActionDialog="openGitActionDialog = false"
                :testFile="testFile"
                :openAiMessageList="openAiMessageList"
                @startCommitWithSigpt="startCommit"
            >

            </GitActionDialog>
        </v-dialog>
        <v-dialog v-model="marketplaceDialog" fullscreen>
            <MarketPlace :marketplaceDialog="marketplaceDialog"
                @applyTemplate="applyTemplateInMarket"
                @applyTopping="applyToppingInMarket"
                @closeMarketplaceDialog="marketplaceDialog = false"
                :selectedBaseTemplateName="selectedBaseTemplateName"
            />
        </v-dialog>
        <v-card style="z-index:2; margin:0px; border-radius: 0px; height:100%;">
            <div style="padding:5px; height:64px;">
                <v-row style="margin:0px 0px 0px 2px;">
                    <span class="headline" v-if="changedModifying">Merge with existing changes</span>
                    <div>
                        <div v-if="!isGeneratorDone">
                            <v-progress-circular
                                    size="15"
                                    :width="3"
                                    indeterminate
                                    color="primary"
                            ></v-progress-circular>
                        </div>
                        <div v-else>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon icon @click="refreshCallGenerate()"
                                        v-on="on"
                                        style="z-index:1;"
                                        size="22"
                                    >mdi-refresh
                                    </v-icon>
                                </template>
                                <span>Refresh</span>
                            </v-tooltip>
                        </div>
                    </div>
                    <div v-if="isGeneratorDone && openCodeFileName" class="gs-code-title"> - {{ openCodeFileName }}</div>
                </v-row>
                <v-row v-if="isGeneratorDone"
                        style="z-index: 1; margin:0px;"
                >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class="code-preview-btn"
                                    fab icon @click="codePreviewLeftReSize()"
                                    v-bind="attrs"
                                    v-on="on"
                            >
                                <v-icon size="22">mdi-menu</v-icon>
                            </v-btn>
                        </template>
                        <span>left menu fold & unfold</span>
                    </v-tooltip>
                    <div>
                        <v-menu
                                v-model="gitMenu"
                                :close-on-click="false"
                                :close-on-content-click="false"
                                offset-y
                        >
                            <template v-slot:activator="{ on: menu, attrs }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-btn
                                                :disabled="!isGeneratorDone"
                                                class="code-preview-btn"
                                                icon x-small
                                                v-bind="attrs"
                                                v-on="{ ...tooltip, ...menu }"
                                        >
                                            <v-icon size="22" :color="gitMenu ? 'primary':''">
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
                                    @update:git-users="val => gitUsers = val"
                                    :information="projectInformation"
                                    :isOnPrem="isOnPrem"
                                    :projectId="modelingProjectId"
                                    :projectName="projectName"
                                    :git-users="gitUsers"
                                    :isListSettingDone="isGeneratorDone"
                                    :isOwnModel="isOwnModel"
                                    :changedPathListsForGit="changedPathListsForGit"
                                    :generateCodeLists="filteredPrettierCodeLists"
                                    :ShowCreateRepoTab="ShowCreateRepoTab"
                                    :isServerModel="isServerModel"
                                    :projectVersion="projectVersion"
                                    :githubTokenError="githubTokenError"
                                    :isOneBCModel="isOneBCModel"
                                    :onlyOneBcId="onlyOneBcId"
                                    :isSIgpt="isSIgpt"
                                />
                            </div>
                        </v-menu>
                    </div>

                    <div>
                        <v-menu
                                v-model="openaiPopup"
                                :close-on-click="false"
                                :close-on-content-click="false"
                                offset-y
                        >
                            <template v-slot:activator="{ on: menu, attrs }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-btn
                                                :loading="startGenerate"
                                                @click="stopGenerate()"
                                                :disabled="!isGeneratorDone"
                                                class="code-preview-btn"
                                                icon x-small
                                                v-bind="attrs"
                                                v-on="{ ...tooltip, ...menu }"
                                        >
                                            <v-icon size="22" :color="openaiPopup ? 'primary':''">
                                                mdi-auto-fix
                                            </v-icon>
                                        </v-btn>
                                        <!-- <div v-else>
                                            <v-progress-circular
                                                size="15"
                                                :width="3"
                                                indeterminate
                                                color="primary"
                                            ></v-progress-circular>
                                        </div> -->
                                    </template>
                                    <span>input openai token</span>
                                </v-tooltip>
                            </template>
                            <!-- <div v-if="openaiPopup">
                                <v-container fluid style="background-color: white;">
                                    <v-btn style="float: right; margin-top: -17px; margin-right: -17px;" icon @click="closeOpenaiPopup()">
                                        <v-icon small>mdi-close</v-icon>
                                    </v-btn>
                                    <v-text-field
                                            v-model="openaiToken"
                                            style="width: 400px; font-size: small;"
                                            :append-icon="showOpenaiToken ? 'mdi-eye' : 'mdi-eye-off'"
                                            :type="showOpenaiToken ? 'text' : 'password'"
                                            name="openaiToken"
                                            label="openAI Token"
                                            @click:append="showOpenaiToken = !showOpenaiToken"
                                    ></v-text-field>
                                    <div style="font-size: small;">
                                        <v-icon small style="margin-right: 5px;">mdi-help-circle-outline</v-icon>
                                        <a href="https://beta.openai.com/account/api-keys" target="_blank">how to get token</a>
                                    </div>
                                </v-container>
                            </div> -->
                        </v-menu>
                    </div>

                    <v-tooltip bottom v-if="editableTemplate">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    icon fab @click="openTemplateEditor()"
                                    :color="editTemplateMode ? 'primary':''"
                            >
                                <v-icon size="22">mdi-code-braces</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Template</span>
                    </v-tooltip>

                    <v-tooltip bottom v-if="editableTemplate">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    :disabled="isLoadingExpectedTemplate"
                                    icon fab @click="testTemplateModel()"
                                    :color="openExpectedTemplateTestDialog ? 'primary':''"
                            >
                                <v-icon v-if="!startCheckDiff" size="22">mdi-code-tags-check</v-icon>
                                <v-icon v-else size="22">mdi-spin mdi-loading</v-icon>
                            </v-btn>
                        </template>
                        <span>Test actual template using expected template</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    :disabled="!existChangedFile || !isGeneratorDone"
                                    icon fab @click="onOffChangedPathLists()"
                            >
                                <div>
                                    <v-icon size="22" :color="showChangedPathLists ? 'primary':''"
                                    >mdi-filter</v-icon>
                                </div>
                            </v-btn>
                        </template>
                        <span>Changed File</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    icon fab
                                    @click="onOffDesignPatterns()"
                            >
                                <Icon :color="showDesignPatterns ? 'rgb(25,118,210)' : '' "
                                        icon="mdi:file-document-check-outline"
                                        size="22"
                                />
                            </v-btn>
                        </template>
                        <span>Design Patterns</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <div>
                                <v-btn v-on="on" class="code-preview-btn"
                                        icon fab @click="downloadArchive()"
                                >
                                    <slot name="downloadArchive">
                                        <v-icon size="22">
                                            mdi-folder-download
                                        </v-icon>
                                    </slot>
                                </v-btn>
                            </div>
                        </template>
                        <span>Download Archive</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    icon fab @click="searchForContent.onOff = !searchForContent.onOff"
                            >
                                <div>
                                    <v-icon size="22"
                                    >mdi-magnify</v-icon>
                                </div>
                            </v-btn>
                        </template>
                        <span>Search</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    icon fab @click="onDiffMode()"
                            >
                                <Icon size="22" icon="codicon:diff" :color="diffMode ? 'rgb(25,118,210)' : '' "/>
                            </v-btn>
                        </template>
                        <span>Diff Mode</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-on="on" class="code-preview-btn"
                                    icon fab @click="showGptDialog()"
                            >
                                <div>
                                    <v-icon size="22"
                                    >mdi-file-send</v-icon>
                                </div>
                            </v-btn>
                        </template>
                        <span>Explain Project</span>
                    </v-tooltip>
                    <v-spacer />
                    <v-menu left :close-on-content-click="false" :close-on-click="false" @input="onClickToppingBox(true)">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn text small
                                v-bind="attrs"
                                v-on="on"
                            >
                                Toppings
                                <v-icon>{{ showTopping ? ' mdi-menu-up' : 'mdi-menu-down' }}</v-icon>
                            </v-btn>
                        </template>
                        <v-card style="width:400px; overflow-y:scroll;" v-if="showTopping">
                            <v-btn @click="onClickToppingBox(false)" small icon style="position:absolute; right:5px; top:5px;">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                            <v-card-text>
                                Java/Spring Version
                                <v-btn style="margin-bottom: 1px; color:gray" text @click="marketplaceDialog = true">
                                    <v-icon style="margin-right: 5px; color:gray" small>mdi-cart</v-icon>
                                    Marketplace
                                </v-btn>

                                <v-divider></v-divider>
                                <div>

                                    <v-radio-group
                                            v-model="selectedVersion"
                                            row
                                            style="font-size: 10px; height: 35px;"
                                    >
                                        <v-radio
                                                label="JAVA 8"
                                                value="java8"
                                                :disabled="onlyJava15"
                                        ></v-radio>
                                        <v-radio
                                                label="JAVA 15"
                                                value="java15"
                                        ></v-radio>
                                    </v-radio-group>
                                </div>


                                <div class="topping-radio-group">
                                    <div v-for="baseToppingGroup in Object.keys(baseToppingPlatforms)">
                                        {{baseToppingGroup}}
                                        <v-divider></v-divider>
                                        <div v-for="baseTopping in baseToppingPlatforms[baseToppingGroup]">
                                            <v-row style="margin: 1px;align-items: center;">
                                                <v-tooltip left>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-row style="margin-top: 1px; margin-left: 1px;" v-bind="attrs"
                                                                v-on="on">
                                                            <v-checkbox
                                                                    class="topping-checkbox"
                                                                    dense
                                                                    :disabled="baseTopping.disable"
                                                                    :label="getPreferredPlatformName(baseTopping.label, false, true)"
                                                                    :input-value="isUsedTopping(baseTopping.value)"
                                                                    @click="changedTopping(baseTopping.value)"
                                                            ></v-checkbox>
                                                        </v-row>
                                                    </template>
                                                    <span>{{`${toppingBaseUrl}${baseTopping.value}`}}</span>
                                                </v-tooltip>

                                                <v-menu v-if="isExistConfTemplate('TOPPING', `${toppingBaseUrl}${baseTopping.value}`)"
                                                        v-model="menuOpen[baseTopping]"
                                                        offset-y top
                                                        :close-on-click="false"
                                                        :close-on-content-click="false"
                                                >
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn
                                                                x-small
                                                                outlined
                                                                v-on="on"
                                                        >
                                                            Configuration
                                                        </v-btn>
                                                    </template>
                                                    <v-card flat v-if="menuOpen[baseTopping]" style="width: 300px;">
                                                        <CodeConfiguration
                                                                :instruction="configurationTemplate('TOPPING', `${toppingBaseUrl}${baseTopping.value}`)"
                                                                @apply="applyCodeConfiguration"
                                                                @close="closeCodeConfiguration"
                                                        ></CodeConfiguration>
                                                    </v-card>
                                                </v-menu>
                                            </v-row>
                                        </div>
                                    </div>
                                    <!--                                                Kubernetes-->
                                    <!--                                                <v-divider></v-divider>-->
                                    <!--                                                <div>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('isVanillaK8s')"-->
                                    <!--                                                            label="Vanilia kubernetes"-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('isVanillaK8s')"-->
                                    <!--                                                            class="topping-checkbox"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                </div>-->

                                    <!--                                                Security - Token based Authentication-->
                                    <!--                                                <v-divider></v-divider>-->
                                    <!--                                                <div>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('spring-security')"-->
                                    <!--                                                            @click="changedTopping('spring-security')"-->
                                    <!--                                                            label="Oauth by Spring Security + Spring GW"-->
                                    <!--                                                            dense-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('keycloak-security')"-->
                                    <!--                                                            @click="changedTopping('keycloak-security')"-->
                                    <!--                                                            label="Oauth by Keycloak + Spring GW"-->
                                    <!--                                                            dense-->
                                    <!--                                                            class="topping-checkbox"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                </div>-->

                                    <!--                                                Service Mesh-->
                                    <!--                                                <v-divider></v-divider>-->
                                    <!--                                                <div>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('istio')"-->
                                    <!--                                                            label="Istio"-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('istio')"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('ingress')"-->
                                    <!--                                                            label="Ingress"-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('ingress')"-->
                                    <!--                                                            class="topping-checkbox"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                </div>-->

                                    <!--                                                DevOps-->
                                    <!--                                                <v-divider></v-divider>-->
                                    <!--                                                <div>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('argo')"-->
                                    <!--                                                            label="Argo + Istio"-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('argo')"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                </div>-->

                                    <!--                                                Data Projection-->
                                    <!--                                                <v-divider></v-divider>-->
                                    <!--                                                <div>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('apollo-graphql')"-->
                                    <!--                                                            label="Apollo GraphQL"-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('apollo-graphql')"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                    <v-checkbox-->
                                    <!--                                                            :input-value="isUsedTopping('java-graphql')"-->
                                    <!--                                                            label="JAVA GraphQL"-->
                                    <!--                                                            disabled-->
                                    <!--                                                            dense-->
                                    <!--                                                            @click="changedTopping('java-graphql')"-->
                                    <!--                                                            class="topping-checkbox"-->
                                    <!--                                                    ></v-checkbox>-->
                                    <!--                                                </div>-->
                                    <div>Custom Toppings</div>
                                    <v-divider></v-divider>
                                    <div v-for="customToppingPath in Object.keys(filteredCustomToppingLists)">
                                        <div v-for="customTopping in filteredCustomToppingLists[customToppingPath]">
                                            <v-row style="margin: 1px;align-items: center;">
                                                <v-tooltip left>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-row style="margin-top: 1px; margin-left: 1px;" v-bind="attrs"
                                                                v-on="on">
                                                            <v-checkbox
                                                                    class="topping-checkbox"
                                                                    dense
                                                                    :label="getPreferredPlatformName(customTopping, false, true)"
                                                                    :input-value="isUsedTopping(customTopping)"
                                                                    @click="changedTopping(customTopping)"
                                                            ></v-checkbox>
                                                        </v-row>
                                                    </template>
                                                    <span>{{customTopping}}</span>
                                                </v-tooltip>

                                                <v-menu v-if="isExistConfTemplate('TOPPING', customTopping)"
                                                        v-model="menuOpen[customTopping]"
                                                        offset-y top
                                                        :close-on-click="false"
                                                        :close-on-content-click="false"
                                                >
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn
                                                                x-small
                                                                outlined
                                                                v-on="on"
                                                        >
                                                            Configuration
                                                        </v-btn>
                                                    </template>
                                                    <v-card flat v-if="menuOpen[customTopping]" style="width: 300px;">
                                                        <CodeConfiguration
                                                                :instruction="configurationTemplate('TOPPING', customTopping)"
                                                                @apply="applyCodeConfiguration"
                                                                @close="closeCodeConfiguration"
                                                        ></CodeConfiguration>
                                                    </v-card>
                                                </v-menu>
                                                <v-btn small icon @click="removeCustomTopping(customTopping)" style="align-self: center;"><v-icon small>mdi-close</v-icon></v-btn>
                                            </v-row>
                                        </div>
                                    </div>
                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn block dark @click="openTemplateDialog('TOPPING')"> Custom Topping </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                </v-row>
            </div>
            <!-- 상단 메뉴 끝 -->
            <v-divider></v-divider>
            <!-- 트리뷰 + code-viewer -->
            <v-card-text style="padding-bottom: 0px;">
                <separate-panel-components
                        :min="separatePanelInfo.min"
                        :max="separatePanelInfo.max"
                        :triggerLength="2"
                        :paneLengthPercent.sync="separatePanelInfo.current"
                        :inBoundSeparatePanel="true"
                        class="fill-height"
                >
                    <template v-slot:one>
                        <div>
                            <!-- TREE  -->
                            <v-col
                                    style="display: flex; height: 100%; margin: 0; padding: 0; overflow:auto; height: calc(100vh - 72px);"
                                    :style="editTemplateMode ? 'overflow-x:hidden !important;':''"
                                    id="scroll-target"
                                    class="code-preview-left-re-size"
                            >
                                <div v-if="changedModifying">
                                    <v-treeview
                                            hoverable
                                            :items.sync='changedTmp'
                                            @update:active="onSelected"
                                            activatable
                                            item-key="hash"
                                            return-object
                                            open-all
                                            transition
                                            dense
                                            style="height:100%; overflow:auto;"
                                    >
                                        <template v-slot:prepend="{ item, open }">
                                            <v-icon v-if="item.changed > 0">
                                                mdi-autorenew
                                            </v-icon>
                                            <v-icon v-if="item.isNew">
                                                mdi-plus
                                            </v-icon>
                                        </template>
                                        <template v-slot:append="{ item, open }" color="red">
                                            {{item.changed == 0 ? "" : item.changed}}
                                        </template>
                                    </v-treeview>
                                </div>
                                <div v-else
                                     class="event-storming-treeview-height"
                                     style="min-width: 0px;
                                        width: 100%;"
                                >
                                    <div  v-if="searchForContent.onOff" style="margin-left: 12px; width: 100%;">
                                        <v-text-field
                                                v-model="searchForContent.search"
                                                append-outer-icon="mdi-close"
                                                label="Search"
                                                type="text"
                                                filled
                                                sole
                                                dense
                                                autofocus
                                                hide-details
                                                @click:append-outer="closeSearchForContents()"
                                        ></v-text-field>
                                        <div v-if="searchForContent.search && filteredTreeLists && filteredTreeLists.length == 0" style="margin-left: 10px;">
                                            No results found.
                                        </div>
                                    </div>
                                    <div
                                        v-if="searchForFile.onOff"
                                        style="position: absolute; top: 0; left: 50%; width: 40%; margin-top: 20px;"
                                    >
                                        <v-autocomplete
                                                v-model="searchForFile.search"
                                                label="Search for files by name"
                                                :items="filteredCodeLists"
                                                item-text="fullPath"
                                                return-object
                                                append-outer-icon="mdi-close"
                                                @update:search-input="searchForFiles"
                                                @click:append-outer="closeSearchForFiles()"
                                                autofocus
                                                dense
                                                style="text-overflow: clip !important; margin-right:-50px;"
                                                :style="editTemplateMode ? 'max-height: 70%;':''"
                                        >
                                            <template v-slot:item="{ item }">
                                                <div style="font-size: 14px;">{{item.fileName}} </div>
                                                <div style="font-size: 10px; color: gray; margin-left: 7px;">
                                                    {{item.fullPath.substring(0,item.fullPath.lastIndexOf("/"))}}
                                                </div>
                                            </template>
                                        </v-autocomplete>
                                    </div>

                                    <!-- BASE  -->
                                    <v-menu v-if="showBaseTemplate"
                                            v-model="menuOpen.BASE"
                                            offset-y
                                            :close-on-content-click="false"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-row style="color:gray; position: relative; margin:5px 0px 0px 13px;">
                                                <div>Base:</div>
                                                <v-chip
                                                        @mouseenter="showFullNameforBaseTemplate = true"
                                                        @mouseleave="showFullNameforBaseTemplate = false"
                                                        x-small
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        style="margin:3px 0px 0px 38px;
                                                            position:absolute;"
                                                >
                                                    {{ selectedBaseTemplateName }}
                                                </v-chip>
                                            </v-row>
                                        </template>
                                        <v-tabs>
                                            <v-tab> {{editableTemplate ? 'Change Template' : 'Cannot be changed.' }} </v-tab>
                                            <v-btn style="margin: 5px 0px 0px 10px;" text @click="marketplaceDialog = true">
                                                <v-icon style="margin-right: 5px;" small>mdi-cart</v-icon>
                                                Marketplace
                                            </v-btn>
                                            <v-tab v-if="isExistConfTemplate('BASE', basePlatform)"> Configuration </v-tab>
                                            <v-tab-item>
                                                <v-list v-if="editableTemplate">
                                                    <v-list-item
                                                            v-for="(tempItem, index) in baseTemplateList"
                                                            :key="index"
                                                    >
                                                        <subMenu :templateInfo="tempItem" :isBaseTemplate="true" @selectTemplate="emitEventChangedTemplate" />
                                                    </v-list-item>
                                                </v-list>
                                            </v-tab-item>
                                            <v-tab-item>
                                                <CodeConfiguration
                                                        :instruction="configurationTemplate('BASE', basePlatform)"
                                                        @apply="applyCodeConfiguration"
                                                        @close="closeCodeConfiguration"
                                                ></CodeConfiguration>
                                            </v-tab-item>
                                            
                                        </v-tabs>
                                    </v-menu>

                                    <div v-if="isGeneratorDone">
                                        <div v-if="embeddedK8s && selectedElementIds.length == 1">
                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-title class="text-h6">
                                                        Docs Navigator
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>

                                            <v-divider></v-divider>
                                            <v-list
                                                    dense
                                                    nav
                                            >
                                                <v-list-item-group
                                                        color="primary"
                                                >
                                                    <v-list-item
                                                            v-for="(item, i) in docsNavigator"
                                                            :key="i"
                                                            link
                                                    >
                                                        <a :href="item.anchor">
                                                            <v-list-item-content>
                                                                <v-list-item-title>
                                                                    {{ item.text }}
                                                                </v-list-item-title>
                                                            </v-list-item-content>
                                                        </a>
                                                    </v-list-item>
                                                </v-list-item-group>
                                            </v-list>
                                            <v-divider></v-divider>
                                        </div>

                                        <v-list v-else nav dense style="padding:0px;">
                                            <v-list-group :class="editTemplateMode ? 'gs-source-tree-v-list-group' : ''" :value="true">
                                                <template v-slot:activator>
                                                    <div style="width: 100%; min-width: 0px; margin-left:6px;">
                                                        <v-list-item-title>Source Tree</v-list-item-title>
                                                    </div>
                                                </template>

                                                <v-treeview
                                                        ref="codeTrees"
                                                        v-if="filteredTreeLists"
                                                        :items.sync='filteredTreeLists'
                                                        @update:active="onSelected"
                                                        :open="filteredTreeOpenList"
                                                        :active="selectedFileList"
                                                        activatable
                                                        item-key="hash"
                                                        return-object
                                                        dense
                                                        style="text-overflow: clip !important;"
                                                        :style="editTemplateMode ? 'max-height: 70%;':''"
                                                        class="gs-v-treeview-width"
                                                >
                                                    <template v-slot:prepend="{ item, open }">
                                                        <v-icon v-if="isChangedCode(item)"
                                                                color="#00B0FF"
                                                                x-small
                                                                style="position: absolute; z-index:9999; font-size: 1px;"
                                                        >fiber_manual_record
                                                        </v-icon>
                                                        <div v-if="isNotFolderIcon">
                                                            <v-icon size="22" :style="templatePathStyle(item)">
                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                            </v-icon>
                                                        </div>
                                                        <div v-else>
                                                            <v-icon v-if="item.children && item.children.length > 0" size="22" :style="templatePathStyle(item)">
                                                                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                            </v-icon>
                                                            <v-icon v-else size="22" :style="templatePathStyle(item)">
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
                                                                <v-divider v-if="item.divisionLine && showBaseTemplate && !isOneBCModel"
                                                                    style="margin-left: -100%;
                                                                        width: 100%;
                                                                        position: absolute;
                                                                        margin-top: -4px;"
                                                                />
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
                                                                            <!-- {{item.preferredPlatform ? item.preferredPlatform:'selected'}} -->
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
                                                    </template>
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
                                            <v-card style="z-index:2;">
                                                <div style="display: flex;">
                                                    <div style="width: 400px; overflow-y: scroll; height:88vh;">
                                                        <!-- <div @click="cssUpateinVueObjViewer()" style="width: 400px; font-size: 11px;">	
                                                            <vue-object-view	
                                                                    v-model="modelData"	
                                                                    :nowrap="false"	
                                                                    style="max-height: 500px; overflow: scroll; max-width: 400px;"	
                                                            ></vue-object-view>	 -->
                                                        <v-card-title>
                                                            Model Explorer
                                                        </v-card-title>
                                                        <div :key="modelDataTreeKey">
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

                                                        <v-list nav dense>
                                                            <v-list-group :value="true">
                                                                <template v-slot:activator>
                                                                    <v-list-item-title style="display: flex; align-items: center;">
                                                                            <div>Template Explorer</div>
                                                                            <v-btn @click="openTemplateTreeEditor(null, 'add New')"
                                                                                icon 
                                                                            >
                                                                                <v-icon small>mdi-folder-plus</v-icon>
                                                                            </v-btn>
                                                                    </v-list-item-title>
                                                                </template>
                                                                <div v-for="(platform, index) in Object.keys(templateTreeList)" :key="index">
                                                                    <v-list-group
                                                                            :value="true"
                                                                            no-action
                                                                            sub-group
                                                                    >
                                                                        <template v-slot:activator>
                                                                            <v-list-item-content>
                                                                                <v-list-item-subtitle v-if="platform.includes('https://github.com/')" style="margin-top: -20px; font-size: x-small;">https://github.com/</v-list-item-subtitle>
                                                                                <v-list-item-title v-if="platform.includes('https://github.com/')" style="margin-left: -100%; margin-top:5px;">{{ platform.replace('https://github.com/', '') }}</v-list-item-title>
                                                                                <v-list-item-title v-else>{{ platform }}</v-list-item-title>
                                                                            </v-list-item-content>
                                                                            <v-btn
                                                                                icon 
                                                                                @click="openTemplateTreeEditor(platform, 'add file')"
                                                                            >
                                                                                <v-icon small>mdi-file-plus</v-icon>
                                                                            </v-btn>
                                                                            <v-btn
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
                                                                                    open-on-click
                                                                                >
                                                                                    <template v-slot:prepend="{ item, open }">
                                                                                        <div v-if="isNotFolderIcon">
                                                                                            <v-icon size="22" :style="templatePathStyle(item)">
                                                                                                {{ icon[item.file] ? icon[item.file] : 'mdi-folder'}}
                                                                                            </v-icon>
                                                                                        </div>
                                                                                        <div v-else>
                                                                                            <v-icon v-if="item.children && item.children.length > 0" size="20" :style="templatePathStyle(item)">
                                                                                                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                                                            </v-icon>
                                                                                            <v-icon v-else size="22" :style="templatePathStyle(item)">
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

                                                        <div style="height: 330px; width:500px;">
                                                            <div v-if="editTemplateMode" style=" width: 100%; position: relative; margin-top: -10px;">
                                                                <v-divider />
                                                            </div>
                                                            <v-list v-if="editTemplateMode" :key="editTemplateListRenderKey"
                                                                    nav dense
                                                            >
                                                                <v-list-group :value="true">
                                                                    <template v-slot:activator>
                                                                        <div style="width: 100%;">
                                                                            <v-list-item-title>Edited Template Files</v-list-item-title>
                                                                        </div>
                                                                    </template>
                                                                    <div v-for="(platform, index) in Object.keys(editTemplateFrameWorkList)" :key="index">
                                                                        <v-list-group
                                                                                v-if="Object.keys(editTemplateFrameWorkList[platform]).length != 0"
                                                                                :value="true"
                                                                                no-action
                                                                                sub-group
                                                                        >
                                                                            <template v-slot:activator>
                                                                                <v-list-item-content>
                                                                                    <v-list-item-subtitle v-if="platform.includes('https://github.com/')" style="margin-top: -20px; font-size: x-small;">https://github.com/</v-list-item-subtitle>
                                                                                    <v-list-item-title v-if="platform.includes('https://github.com/')" style="margin-left: -100%; margin-top:5px;">{{ platform.replace('https://github.com/', '') }}</v-list-item-title>
                                                                                    <v-list-item-title v-else>{{ platform }}</v-list-item-title>
                                                                                </v-list-item-content>
                                                                                <div>
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
                                                                                                        <v-icon :color="oldPlatform == platform ? 'primary':''" size="22">mdi-git</v-icon>
                                                                                                    </v-btn>
                                                                                                </template>
                                                                                                <span>open git Menu</span>
                                                                                            </v-tooltip>
                                                                                        </template>
                                                                                        <div v-if="templatePushDialog && oldPlatform == platform" :key="gitMenuRenderKey">
                                                                                            <gitAPIMenu
                                                                                                    v-model="value.scm"
                                                                                                    v-if="templatePushDialog"
                                                                                                    @update:git-users="val => gitUsers = val"
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
                                                                                                    :isOwnModel="isOwnModel"
                                                                                                    :changedPathListsForGit="changedPathListsForGit"
                                                                                                    :generateCodeLists="filteredPrettierCodeLists"
                                                                                                    :ShowCreateRepoTab="ShowCreateRepoTab"
                                                                                                    :isServerModel="isServerModel"
                                                                                                    @pushSuccessed="pushSuccessed"
                                                                                            />
                                                                                        </div>
                                                                                    </v-menu>
                                                                                </div>
                                                                            </template>
                                                                            <v-list-item v-for="(template, i) in Object.keys(editTemplateFrameWorkList[platform])" :key="i"
                                                                                         :style="selectedEditTemplateName == platform + '/' + template ? 'background-color: #e4eef9; color: #2277cf;' : ''"
                                                                                         style="margin-left:-50px;"
                                                                            >
                                                                                <div style="cursor: pointer;"
                                                                                     @click="setTemplateFramework(editTemplateFrameWorkList[platform][template].element)"
                                                                                     @mouseenter="setHover(platform, template)"
                                                                                     @mouseleave="setHover()"
                                                                                >
                                                                                    <div style="display:flex; align-items: center;" :style="editTemplateFrameWorkList[platform][template].isPushed ? 'color: darkgray;':''">
                                                                                        <Icon v-if="editTemplateFrameWorkList[platform][template].isPushed"
                                                                                              icon="mdi:file-document-arrow-right-outline" width="20" height="20"
                                                                                              style="color: darkgray;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isFixed"
                                                                                              icon="mdi:file-document-check-outline" width="20" height="20"
                                                                                              style="color: green;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].failedGenerate"
                                                                                              icon="mdi:file-document-alert-outline" width="20" height="20"
                                                                                              style="color: red;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isAdded"
                                                                                              icon="mdi:file-document-plus-outline" width="20" height="20"
                                                                                              style="color: #2278cf;"
                                                                                        />
                                                                                        <Icon v-else-if="editTemplateFrameWorkList[platform][template].isDeleted"
                                                                                              icon="mdi:file-document-minus-outline" width="20" height="20"
                                                                                              style="color: red;"
                                                                                        />
                                                                                        <Icon v-else
                                                                                              icon="mdi:file-document-edit-outline" width="20" height="20"
                                                                                              style="color: #2278cf;"
                                                                                        />
                                                                                        <div>
                                                                                            <v-list-item-subtitle v-if="editTemplateFrameWorkList[platform][template].element[0].computedSubFileName"
                                                                                                                  style="font-size: x-small;">
                                                                                                {{ editTemplateFrameWorkList[platform][template].element[0].computedSubFileName }}
                                                                                            </v-list-item-subtitle>
                                                                                            <v-list-item-title :style="!editTemplateFrameWorkList[platform][template].element[0].computedSubFileName ? 'margin-top:10px;' : ''"
                                                                                                               v-text="editTemplateFrameWorkList[platform][template].element[0].computedFileName">
                                                                                            </v-list-item-title>
                                                                                        </div>
                                                                                        <v-btn icon
                                                                                               v-if="isHoveredTemplateFilePath == platform + '/' + template"
                                                                                               @click="deleteModifiedTemplate(platform, template)"
                                                                                               style="color: darkgray;"
                                                                                        >
                                                                                            <v-icon small>mdi-close</v-icon>
                                                                                        </v-btn>
                                                                                    </div>
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
                                                    <v-card-text style="padding:1px;">
                                                        <v-btn icon @click="editTemplateMode = false, defaultCodeViewerRenderKey++;"
                                                            style="position:absolute; right:5px; z-index:1"
                                                        >
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
                                                                <div :key="editModeResultViewerRenderKey">
                                                                    <v-card flat v-if="item.tabKey == 'edit'">
                                                                        <separate-panel-components
                                                                                :min="codeSeparatePanelInfo.min"
                                                                                :max="codeSeparatePanelInfo.max"
                                                                                :triggerLength="2"
                                                                                :paneLengthPercent.sync="codeSeparatePanelInfo.current"
                                                                                :inBoundSeparatePanel="true"
                                                                                class="gs-edit-template-separate-panel"
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
                                                                                            class="gs-code-previewer-edit-template-left"
                                                                                            v-model="opennedTemplateFramework"
                                                                                            :editMode="true"
                                                                                            :readOnly="false"
                                                                                            :codeSuggestionObj="opennedTemplateFramework ? opennedTemplateFramework[0].eleKeys:{}"
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
                                                                                            class="gs-code-previewer-edit-template-right"
                                                                                            v-model="openCode"
                                                                                            :editMode="true"
                                                                                            :readOnly="true"
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
                                    <div v-if="changedModifying">
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
                                        ></code-viewer>
                                    </div>
                                    <div v-else-if="isDiffMode" style="height: 100%;">
                                        <code-viewer
                                                :type="'diff'"
                                                :readOnly="true"
                                                v-model="filteredOpenCode"
                                                :create-value="changedDiffCode"
                                                @update="updatePathTmp"
                                        ></code-viewer>
                                    </div>
                                    <div v-else style="height: 100%;" :key="defaultCodeViewerRenderKey">
                                        <code-viewer
                                                class="gs-code-previewer-code-viewer"
                                                ref="codeViewer"
                                                :key="docsRenderKey"
                                                v-model="filteredOpenCode"
                                                :readOnly="false"
                                                :showGpt="showGpt"
                                                @editCode="setCurrentCodeForAutoCodeGenerate"
                                                @startAutoGenerate="startAutoGenerateCode"
                                                @update="updatePathTmp"
                                        ></code-viewer>
                                    </div>
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
        </v-card>

        <v-dialog width="500" v-model="templateDialog.show" persistent>
            <v-card>
                <v-card-title class="headline">Template from Git</v-card-title>
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
                    <v-btn
                            color="dimgray"
                            text
                            @click="closeTemplateDialog()"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                            color="primary"
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

        <v-dialog
                v-model="isCustomTemplateForLoad"
                width="480"
        >
            <login-by-gitlab v-if="isOnPrem"></login-by-gitlab>
            <Login v-else :onlyGitLogin="true" />
        </v-dialog>
        <v-dialog
                v-model="startGenerate"
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
                    <div style="margin-top: 5px;">Waiting for code to be generated</div>
                    <v-btn color="primary" style="margin-top: 5px; margin-bottom: -10px;" @click="stopGenerate()">cancel</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showLoginCard">
            <login-by-gitlab v-if="isOnPrem"></login-by-gitlab>
            <Login v-else :onlyGitLogin="true" @login="showLoginCard = false" />
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
        <v-dialog v-if="selectedTreeItem && showTemplateTreeEditor" v-model="showTemplateTreeEditor" width="auto">
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
    </v-card>
</template>

<!-- <script src="./speechRecognition.js"></script> -->
<script>
    /*
        코드생성 공통 기능.
    */
    //From: https://github.com/vuetifyjs/vuetify/issues/1877
    import StorageBase from "./StorageBase";
    import SeparatePanelComponents from "../../SeparatePanelComponents";
    import CodeViewer from "../CodeViewer";
    import gitAPIMenu from "../gitAPIMenu";
    import CodeConfiguration from "./CodeConfiguration";
    // import vueObjectView from 'vue-object-view';	
    import 'core-js';
    import subMenu from '../subMenu.vue';
    import AIGenerator from './generators/AIGenerator';
    import CodeGeneratorCore from './CodeGeneratorCore';
    // import Login from "../../oauth/Login";
    import LoginByGitlab from "../../oauth/LoginByGitlab";
    import MarketPlace from "../MarketPlace.vue"
    import getParent from "../../../utils/getParent";
    import ExpectedTemplateTestDialog from "./ExpectedTemplateTestDialog"

    import GitAPI from "../../../utils/GitAPI"
    import Github from "../../../utils/Github"
    import Gitlab from "../../../utils/Gitlab"

    import GitActionDialog from './GitActionDialog'


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
        name: 'code-generator',
        mixins:[StorageBase],
        components: {
            subMenu,
            CodeConfiguration,
            'separate-panel-components':SeparatePanelComponents,
            'code-viewer': CodeViewer,
            gitAPIMenu,
            // vueObjectView,
            LoginByGitlab,
            MarketPlace,
            ExpectedTemplateTestDialog,
            GitActionDialog
        },
        props: {
            value: Object,
            isOwnModel: Boolean,
            projectName: String,
            projectInformation :Object,
            selectedElements: Array,
            modelInitLoad: Boolean,
            modelingProjectId: String,
            isServerModel: Boolean,
            asyncCodeForValue: Boolean,
            callCodeForValue: Boolean,
            newTreeHashLists: Object,
            oldTreeHashLists: Object,
            projectVersion: Boolean,
            canvasName: String,
            embeddedK8s: Boolean,
        },
        data() {
            return {
                gitActionDialogRenderKey: 0,
                isSIgpt: false,
                testFile: [],
                openAiMessageList: [],
                openGitActionDialog: false,
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
                newTreeList: null,
                isComputeTreeListSwitch: false,
                debuggerPoint: [],
                // Template
                defaultTemplate: 'template-spring-boot',
                tempToppingPlatforms: [] ,
                tempConfiguration: null,
                menuOpen:{
                    BASE: false,
                },
                gitAPI: null,
                baseToppingPlatforms:{
                    'Kubernetes':[
                        {label:'Vanilla Kubernetes', value: 'isVanillaK8s'}
                    ],
                    'Security - Token based Authentication':[
                        {label:'Oauth by Spring Security + Spring GW', value: 'spring-security'},
                        {label:'Oauth by Keycloak + Spring GW', value: 'keycloak-security'}
                    ],
                    'Service Mesh': [
                        {label:'Istio', value: 'istio'},
                        {label:'Ingress', value: 'ingress'}
                    ],
                    'DevOps': [
                        {label:'Argo + Istio', value: 'argo'}
                    ],
                    'Data Projection': [
                        {label:'Apollo GraphQL', value: 'apollo-graphql'},
                        {label:'JAVA GraphQL', value: 'java-graphql', disable: true}
                    ]
                },
                // selectedBaseTemplate: 'spring-boot',
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
                showFullNameforBaseTemplate: false,
                showFullNameforSelectedTemplateKey: null,
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
            "isGeneratorDone":_.debounce(function () {
                var me = this
                if( this.isGeneratorDone ){
                    // this.isListSettingDone = true
                    if( !this.isFirstGenerate ){
                        //this.refreshCallGenerate();
                        this.isFirstGenerate = true
                    }
                    this.startReGenerateCode = false
                    this.setTemplateTreeList()
                    if(this.reGenerateOnlyModifiedTemplate){
                        this.setTemplateFramework(this.opennedTemplateFramework)
                    }
                    
                    this.isLoadingExpectedTemplate = true
                    if(this.openCode && this.openCode[0]){
                        Object.keys(this.templateFrameWorkList[this.openCode[0].template]).some(function (key){
                            if(key.includes(".template/test/expected/")){
                                me.isLoadingExpectedTemplate = false
                                return true;
                            }
                        })
                    }

                    console.log('>>> Generate Code] End Main <<<', Date.now())
                }

            }, 500),
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
                // TODO: check
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
            selectedBaseTemplateName(){
                var me = this
                if(me.basePlatform.includes("http")){
                    if(!me.showFullNameforBaseTemplate){
                        var Project = me.basePlatform.split('/')[me.basePlatform.split('/').length - 1]
                        if(Project.includes("template")){
                            Project = Project.replace("template", "")
                            if(Array.from(Project)[0] == '-'){
                                Project = Project.replace("-", "")
                            }
                        }
                        return Project
                    } else {
                        return me.basePlatform
                    }
                } else {
                    return me.basePlatform
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
                var me = this

                if (me.isGeneratorDone) {

                    if (me.openCode.length == 0) {
                        var getCodePath = localStorage.getItem('openCodePath')
                        if (getCodePath) {
                            me.openCode[0] = me.codeLists.find(x => x.fullPath == getCodePath)
                        } 
                    }
                    //done
                    if (me.openCode.length > 0 && me.openCode[0]) {
                        var openCodePath = me.openCode[0].fullPath ? me.openCode[0].fullPath : me.openCode[0].path
                        if(!localStorage.getItem('openCodePath')){
                            localStorage.setItem('openCodePath', openCodePath)
                        }
                        if (openCodePath && openCodePath.includes('.java')) {
                            setTimeout(()=>{   //TODO: temporal 
                                me.openCode[0].code = me.codeAlign(me.openCode[0].code)
                            }, 0)
                            
                        }
                        return me.openCode
                    }

                    if (me.treeLists && me.treeLists.length > 0 && !me.editTemplateMode) {
                        return me.treeLists[0].children
                    }

                    return []
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
                if (this.defaultTemplate == 'template-spring-boot-mybatis') {
                    this.selectedVersion = 'java15';
                    return true
                }
                return false
            },
            editableTemplate(){
                return true
            },
            templateList: function () {
                var me = this
                var list = []
                Object.keys(me.$manifestsPerTemplate).forEach(function (template) {
                    if(template == 'Custom Template'){
                        var obj = {
                            display: template,
                            template: template
                        }
                    } else {
                        if(!template.includes("http")){
                            var obj = {
                                display: template,
                                template: "template-" + template
                            }
                        } else {
                            var obj = {
                                display: template,
                                template: template
                            }
                        }
                    }
                    if(!list.find(x => x.template == obj.template)){
                        list.push(obj)
                    }
                })

                return list
            },
            baseTemplateList: function () {
                var me = this
                var list = []
                Object.keys(me.$manifestsPerBaseTemplate).forEach(function (template) {
                    if(template == 'Custom Template'){
                        var obj = {
                            display: template,
                            template: template
                        }
                    } else {
                        if(!template.includes("http")){
                            var obj = {
                                display: template,
                                template: "template-" + template
                            }
                        } else {
                            var obj = {
                                display: template,
                                template: template
                            }
                        }
                    }
                    if(!list.find(x => x.template == obj.template)){
                        list.push(obj)
                    }
                })

                return list
            },
            filteredTreeLists(){
                var me = this
                me.showTemplatePath = false;

                if (!me.isClosedSeparatePanel && me.isGeneratorDone) {
                    try {

                        let selectedObj = me.selectedElementIds[0] ? me.selectedElementIds[0] : null
                        let selectedId = selectedObj ? selectedObj.id : null
                        let returnArray = [];

                        if (selectedId) {
                            let isEmbedded = selectedObj ? selectedObj.isEmbedded : false;
                            let value = isEmbedded ? me.value.k8sValue : me.value
                            let selectedElement = selectedId ? value.elements[selectedId]: null;
                            let selectedElementBC = selectedElement ? selectedElement.boundedContext : null;

                            me.showChangedPathLists = false;
                            me.treeOpenLists = [];

                            if (selectedElement && selectedElement._type && selectedElement._type.endsWith("BoundedContext")) {
                                returnArray = me.treeLists.filter(tree => tree.bcId == selectedId)
                            } else {
                                me.showTemplatePath = true

                                var representativeForArray = [];
                                var relatedArray = [];

                                if( isEmbedded ){
                                    me.filteredCodeLists.forEach(function (code, idx) {
                                        if (code.element == selectedId) {
                                            // 자신의 템플릿 파악.
                                            var data = {
                                                name: code.fileName,
                                                key: code.key,
                                                file: code.file,
                                                code: code.code,
                                                path: code.fullPath,
                                                changed: 0,
                                                hash: code.hash,
                                                fullPath: code.fullPath ? code.fullPath:null,
                                                template: code.template ? code.template:null,
                                                templatePath: code.templatePath ? code.templatePath:null,
                                            }
                                            representativeForArray.push(data)
                                            if(me.selectedElementIds.length == 1){
                                                me.openCode = []
                                                me.openCode.push(data)
                                                me.docsRenderKey++
                                            }
                                        }
                                    })
                                } else {
                                    let bcName = me.value.elements[selectedElementBC.id] ? me.value.elements[selectedElementBC.id].name : null;
                                    // let bcName = selectedElementBC ? (selectedElementBC.name ? selectedElementBC.name : selectedElementBC.id) : null

                                    me.filteredCodeLists.forEach(function (code, idx) {
                                        // representativeFor
                                        if (code.representativeFor
                                            && bcName
                                            && bcName == code.boundedContext
                                            && selectedElement._type
                                            && selectedElement._type.endsWith(code.representativeFor)
                                        ) {

                                            if (code && code.forEach == code.representativeFor) {
                                                // forEach  == representativeFor  동일 한경우 모든 대표파일이 나오는 문제.
                                                if (code.element == selectedId) {
                                                    // 자신의 템플릿 파악.
                                                    var data = {
                                                        name: code.fileName,
                                                        key: code.key,
                                                        file: code.file,
                                                        code: code.code,
                                                        path: code.fullPath,
                                                        changed: 0,
                                                        hash: code.hash,
                                                        fullPath: code.fullPath ? code.fullPath:null,
                                                        template: code.template ? code.template:null,
                                                        templatePath: code.templatePath ? code.templatePath:null,
                                                    }
                                                    representativeForArray.push(data)
                                                }
                                            } else {
                                                // 같은 BC , representativeFor 같은 Type
                                                //중복 제거.
                                                if (representativeForArray.findIndex(obj => obj.path == code.fullPath) == -1) {
                                                    var data = {
                                                        name: code.fileName,
                                                        key: code.key,
                                                        file: code.file,
                                                        code: code.code,
                                                        path: code.fullPath,
                                                        changed: 0,
                                                        hash: code.hash,
                                                        fullPath: code.fullPath ? code.fullPath:null,
                                                        template: code.template ? code.template:null,
                                                        templatePath: code.templatePath ? code.templatePath:null,
                                                    }
                                                    representativeForArray.push(data)
                                                }
                                            }
                                        }

                                        // related
                                        if (code.element == selectedId && !code.representativeFor) {
                                            if (relatedArray.findIndex(obj => obj.path == code.fullPath) == -1) {
                                                var data = {
                                                    name: code.fileName,
                                                    key: code.key,
                                                    file: code.file,
                                                    code: code.code,
                                                    path: code.fullPath,
                                                    changed: 0,
                                                    hash: code.hash,
                                                    template: code.template ? code.template:null,
                                                    fullPath: code.fullPath ? code.fullPath:null,
                                                    templatePath: code.templatePath ? code.templatePath:null,
                                                }
                                                relatedArray.push(data)
                                            }
                                        }

                                    });
                                }

                                // TODO:  Design Patterns - 성능이슈로 주석 처리함.
                                // let patternByBC = me.generateDesignPatterns();
                                // if(patternByBC){
                                //     patternByBC.filter(bc=> selectedElementBC && selectedElementBC.id == bc.bcId).forEach(function(bc){
                                //         if(bc.children){
                                //             let patterns =  bc.children.filter(function(codeObj){
                                //                 if( (codeObj.patternRef.elementName && codeObj.patternRef.elementName == selectedElement.name)
                                //                     && (codeObj.patternRef.type && selectedElement._type.endsWith(codeObj.patternRef.type))
                                //                 ){
                                //                     return true;
                                //                 }
                                //             });

                                //             patterns.forEach(function(pattern){
                                //                 returnArray.push(pattern);
                                //             });
                                //         }
                                //     });
                                // }

                                //END OF DESIGN PATTERNS


                                // Default
                                var mainData = {
                                    name: 'Representative',
                                    key: 'Representative',
                                    hash: 'Representative0',
                                    path: '/',
                                    children: representativeForArray,
                                    file: null,
                                    code: null,
                                    changed: 0,
                                }

                                var subData = {
                                    name: 'Referenced',
                                    key: 'Referenced',
                                    hash: 'Referenced0',
                                    path: '/',
                                    children: relatedArray,
                                    file: null,
                                    code: null,
                                    changed: 0,
                                }

                                returnArray.push(subData);
                                returnArray.push(mainData);
                                // tree open
                                me.treeOpenLists = JSON.parse(JSON.stringify(returnArray));
                                // first code open
                                me.openCode = representativeForArray.length > 0 ? representativeForArray :  me.openCode
                            }
                        } else if (me.showChangedPathLists) {
                            me.treeOpenLists = []
                            var changedArray = []

                            if (me.changedPathListsBucket.length > 0) {
                                var merged = [...me.changedPathListsBucket, ...me.changedPathLists]
                                me.changedPathListsBucket = [...new Set(merged)]
                            } else {
                                me.changedPathListsBucket = JSON.parse(JSON.stringify(me.changedPathLists))
                            }

                            me.changedPathListsBucket.forEach(function (changedPath) {
                                var file = me.filteredCodeLists.find(item => item.code && (item.fullPath == changedPath))
                                if (file) {
                                    var data = {
                                        name: file.fileName,
                                        key: file.key,
                                        file: file.file,
                                        code: file.code,
                                        path: file.fullPath,
                                        changed: 0,
                                        hash: file.hash,
                                    }
                                    changedArray.push(data)
                                } else {
                                    // delete file
                                }
                            })


                            var mainData = {
                                name: 'Changed Files',
                                key: 'ChangedFiles',
                                hash: 'ChangedFiles0',
                                path: '/',
                                children: changedArray,
                                file: null,
                                code: null,
                                changed: 0,
                            }
                            returnArray.push(mainData)

                            me.treeOpenLists = returnArray

                        } else if( me.showDesignPatterns ){
                            me.showTemplatePath = true
                            returnArray = me.generateDesignPatterns();
                        } else if( me.searchForContent.onOff ){
                            returnArray = me.searchForContents();
                        }  else {
                            returnArray = me.treeLists;
                        }

                        if( !(selectedId || me.showChangedPathLists) ){
                            // Base 및 Template 구분선.
                            returnArray = returnArray.sort(function(a, b){
                                // a.codeRef.type
                                if( b.generatedType == 'BASE') {
                                    return a.generatedType == 'BASE' ? 0 : 1
                                } else if ( b.generatedType == 'MAIN'){
                                    return a.generatedType == 'MAIN' ? 0 : 1
                                } else {
                                    return 0
                                }
                            })
                            // returnArray =  returnArray.sort((a) => { if(a.bcId == null) return -1; } );
                            let division = returnArray.find(tree => tree.generatedType == 'MAIN')
                            if(division){
                                division.divisionLine = true;
                            }

                            // me.showBaseTemplate = returnArray.find(tree => tree.type == 'BASE') ? true : false

                            returnArray.filter(tree => tree.generatedType == 'MAIN').forEach(function(item){
                                item.showTemplateChip = item.isMirrorElement ? false: true;
                            });

                        }

                        // setting menuOpen
                        returnArray.forEach(function (root) {
                            if(root.preferredPlatform && !root.isBasePlatform){
                                me.menuOpen[root.bcId] = false;
                            }
                        })

                        if(me.isComputeTreeListSwitch){
                            me.isComputeTreeListSwitch = false
                            return me.newTreeList
                        } else {
                            return returnArray
                        }
                    } catch (e) {

                        console.log(`ERROR] Filtered TreeLists:: ${e}`)
                        return []
                    }
                }
                return []
            },
            filteredCodeLists(){
                var me = this
                // console.log(me.codeLists)
                var codeList = me.setAutoGenerateCodetoList ? me.setAutoGenerateCodetoList : me.codeLists
                // var copyCodeLists = JSON.parse(JSON.stringify(codeList));

                // try{
                //     copyCodeLists = me.clearDesignPatterns(copyCodeLists);
                // } catch (e) {
                //     console.log(`ERROR] Filtered CodeLists:: ${e}`)
                // } finally {
                //     me.setAutoGenerateCodetoList = null;
                //     return copyCodeLists
                // }
                return codeList
            },
            filteredPrettierCodeLists(){
                var me = this
                let copyCodeLists = me.filteredCodeLists

                try{
                    if(copyCodeLists && copyCodeLists.length > 0){
                        copyCodeLists.forEach(function(codeObj){
                            if(codeObj && codeObj.fullPath.includes('.java')){
                                codeObj.code = me.codeAlign(codeObj.code)
                            }
                        })
                    }
                    return copyCodeLists
                }catch (e) {
                    console.log(`ERROR] Prettier CodeLists ${e}`)
                    return  me.filteredCodeLists
                }
            },
        },
        created:function () {
            let canvas = getParent(this.$parent, this.canvasName);
            let git;
            if(window.MODE == "onprem") {
                git = new Gitlab();
            } else {
                git = new Github();
            }
            this.gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
            this.gitAPI = new GitAPI(git);
            this.core = new CodeGeneratorCore({
                canvas: canvas,
                projectName: this.projectName,
                gitURLforModel: this.gitURLforModel,
                defaultTemplate: 'template-spring-boot'
            });

            // K8s Topping은 기본세팅
            if(this.tempToppingPlatforms && !this.tempToppingPlatforms.find(x => x === "isVanillaK8s")){
                this.tempToppingPlatforms.push('isVanillaK8s')
            }
            if(this.value){
            if(this.value.toppingPlatforms && !this.value.toppingPlatforms.find(x => x === "isVanillaK8s")){
                this.value.toppingPlatforms.push('isVanillaK8s')
            }
            }
            
            this.openCodeGenerator()
            // this.settingGithub()
            // this.onLoadInitTemplate();
            this.initHandleBars(window.$HandleBars);
            this.callGenerate();

        },
        beforeDestroy: function () {
            this.closeCodeViewer()
        },
        mounted: function () { 

            var me = this

            if(localStorage.getItem("editTemplateList") && me.firstSetEditTemplateList){
                var CircularJSON = require('circular-json');
                var obj = CircularJSON.parse(localStorage.getItem("editTemplateList"));
                if(obj && obj.projectId == me.modelingProjectId){
                    me.editTemplateFrameWorkList = obj.editTemplateList
                }
                me.firstSetEditTemplateList = false
            }
            Object.keys(me.editTemplateFrameWorkList).forEach(function (key){
                Object.keys(me.editTemplateFrameWorkList[key]).forEach(function (filePath){
                    if(!me.editTemplateFrameWorkList[key][filePath].failedGenerate){
                        if(!me.templateFrameWorkList[key]){
                            me.templateFrameWorkList[key] = {}
                        }
                        if(me.editTemplateFrameWorkList[key][filePath].isDeleted){
                            me.templateFrameWorkList[key][filePath] = {
                                isDeleted: true
                            }

                        } else {
                            me.templateFrameWorkList[key][filePath] = {
                                content: me.editTemplateFrameWorkList[key][filePath].code,
                                refList: [],
                                requestUrl: null
                            }
                        }
                    }
                })
            })

            // // K8s Topping은 기본세팅
            // me.tempToppingPlatforms.push('isVanillaK8s')
            // me.value.toppingPlatforms.push('isVanillaK8s')
            me.$EventBus.$on('deploy', async function (boundedId) {
                await me.callGenerate();
            });

            if(localStorage.getItem("openaiToken")){
                me.openaiToken = localStorage.getItem("openaiToken")
            }

            me.$EventBus.$on('downloadCode',function () {
                me.downloadArchive()
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
            startCommit(updateList){
                var me = this
                updateList.forEach(function (file){
                    file['codeChanges'].forEach(function (changed){
                        var idx = me.codeLists.findIndex(x => x.fileName == changed.fileName)
                        if(idx){
                            me.codeLists[idx].code = changed.modifiedFileCode
                        }
                    })
                })
                me.gitMenu = true
                me.isSIgpt = true
                me.gitMenuRenderKey++;
            },
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
            applyTemplateInMarket(val){
                this.changePlatformToForkedRepo(`${val.templatePath}`, true, null)
                this.marketplaceDialog = false
            },
            applyToppingInMarket(val){
                this.changedTopping(`${val.toppingPath}`)
                this.marketplaceDialog = false
                this.closeToppingBox();
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
            editTreeItem(){
                var me = this 
                console.log(me.selectedTreeItem)
                if(me.selectedTreeItem.editMode.includes('add')){
                    if(me.selectedTreeItem.editMode == 'add New'){
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
            pasteModelValue(item){
                console.log(item)
                if(this.treePathList[item.id]){
                    var subPath = this.treePathList[item.id].replace(item.name.replace(": ", ""), "")
                    console.log(subPath + item.name.replace(": ", ""))
                    this.$EventBus.$emit('pasteModelValue', subPath + item.name.replace(": ", ""))
                }
            },
            openModelDataEditor(item){
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
            alertReLogin(){
                alert("You need to re-login because session is expired")
                this.showLoginCard = true
            },
            showTemplateListChip(obj){

                if( obj.showTemplateChip ){
                    return true
                }
                return false;
            },
            async processTemplateUseOpenAi(modifiedValueList){
                var me = this
                me.startTemplateGenerate = true
                var content
                var startGen = false
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

                    startGen = true
                // } else {
                //     if(prompt != '' && prompt != null){
                //         console.log(prompt)
                //         content = prompt + "that response must be Java code without natural language."
                //         startGen = true
                //     }
                // }
                if(me.openaiToken && startGen){
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
            openCodeGenerator(){
                var me = this
                var separatePanel = localStorage.getItem("separatePanel")
                var separatePanelInfo = null;
                if(separatePanel) {
                    separatePanelInfo = JSON.parse(separatePanel)
                }
                me.separatePanelInfo.current = separatePanelInfo && separatePanelInfo.separatePanelInfo ? separatePanelInfo.separatePanelInfo : 30
                me.codeSeparatePanelInfo.current = separatePanelInfo && separatePanelInfo.codeSeparatePanelInfo ? separatePanelInfo.codeSeparatePanelInfo :50
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
            // API 호출은 각 Platform별 JS에서 처리하므로 필요 없음.
            // settingGithub(){
            //     var me = this
            //     if(localStorage.getItem('gitAccessToken') || localStorage.getItem('gitToken')){
            //         me.gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
            //         me.githubHeaders = {
            //             Authorization: 'token ' + me.gitAccessToken,
            //             Accept: 'application/vnd.github+json'
            //         }
            //     }
            // },
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

            getSelectedFilesDeeply(bcRoots, option){
                let codeBag = []
                var files = []

                if(bcRoots){
                    files = bcRoots
                }else{
                    files = this.selectedFile
                }

                this._collectSelectedFileContents(files, codeBag, option)
                return codeBag
            }
            ,
            _collectSelectedFileContents(root, codeBag, option){
                var me = this;
                var set = new Set();
                var option = option

                
                root.forEach((item) => {
                    if(Array.isArray(item.children)) {
                        me._collectSelectedFileContents(item.children, codeBag, option);
                    }

                    var condition

                    if(!option){
                        condition = item.code != null && (item.name.endsWith(".vue") || item.name.endsWith(".java") || item.name.endsWith(".yaml") || item.name.endsWith(".yml")) && !item.path.includes("/test/")
                    }else{
                        if(option.keyword == "si"){
                            condition = item.code != null && item.name.includes(".")
                        }
                    }

                    if(condition){
                        // if (!Array.isArray(me.gptCodes)) {
                        //     //me.gptCodes = []; // 배열로 초기화    /// very very BAD
                        // }
                        if (!set.has(item.code)) {
                            codeBag.push("# "+ item.name + ": \n" + item.code);
                            // if(option.keyword == "si"){ // lineNumber 관련 
                            //     if(item.code.includes('\n')){
                            //         var codeSplit = item.code.split('\n')
                            //         codeSplit.forEach(function (line, idx){
                            //             codeSplit[idx] = `${line} // lineNumber ${idx + 1} `
                            //         })
                            //         item.code = codeSplit.join('\n')
                            //     }
                            //     set.add(item.code);
                            // } else {
                                if(option.keyword == "si" && item.name.includes("Test.java") && item.template === "https://github.com/msa-ez/topping-unit-test"){
                                    me.testFile.push(item)
                                }
                                set.add(item.code);
                            // }
                        }
                        //me.$refs.codeViewer.$refs.collectedCodes = me.gptCodes   /// Very BAD
                    }
                });
            },
            showGptDialog(){
                var me = this;
                me.showGpt = !me.showGpt
            },
            searchForReady(onOff){
                this.closeSearchForFiles()
                this.closeSearchForContents()

                if(onOff == 'files'){
                    this.searchForFile.onOff = true
                    this.searchForFiles()
                    return false
                }else if(onOff == 'contents'){
                    this.searchForContent.onOff = true
                     this.searchForContents()
                    return false
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

                try{
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
                }catch (e) {

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
                // me.settingGithub();
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
            onClickToppingBox(isOpen){
                if(isOpen && !this.showTopping){
                    this.openToppingBox()
                }else if(!isOpen && this.showTopping ){
                    this.closeToppingBox()
                }
            },
            viewToAggregate(view) {
                var tmp = view.fieldDescriptors;

                view.elementView._type == "org.uengine.modeling.model.Aggregate";
                view["aggregateRoot"] = {
                    _type: "org.uengine.modeling.model.AggregateRoot",
                    fieldDescriptors: tmp
                }
                return view
            },
            asyncHandleBars(){

                let obj = {}
                let me = this
                return new Promise(async function (resolve, reject) {
                    let result = await me.gitAPI.getFile("topping-isVanillaK8s", "msa-ez", "for-model/kubernetes/docs/common/Pod.md")
                    .then(function (obj) {
                        resolve(obj.data)
                    })
                    .catch(e => {
                        if(e.response.status === 401){
                            me.alertReLogin()
                        }
                        alert(e)                        
                    })
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

                    }catch(e){
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
                // me.changeBasePlatform();
            },
            pushTemplateToGit(platform){
                var me = this
                // var setRepoName
                if(platform.includes("http") && !platform.includes("msa-ez/")){
                    me.isCustomTemplate = true
                }
                // else {
                //     me.isCustomTemplate = false
                //     setRepoName = "template-" + platform
                // }
                me.oldPlatform = me.basePlatform

                me.templateRepoName = platform
                me.editTemplateList = me.editTemplateFrameWorkList[platform]

                me.templatePushDialog = true
            },
            closeToppingBox(){
                var me = this
                me.showTopping = false;
                if( !me.compareArrayOnlyValue(me.tempToppingPlatforms, me.toppingPlatforms) ){
                    me.tempToppingPlatforms = Array.from(new Set(me.tempToppingPlatforms));
                    me.settingPlatform('TOPPING', me.tempToppingPlatforms);
                    me.refreshCallGenerate();
                }
            },
            compareArrayOnlyValue(array1, array2){
                if (array1.length !== array2.length) return false;
                const uniqueValues = new Set([...array1, ...array2]);
                for (const v of uniqueValues) {
                    const aCount = array1.filter(e => e === v).length;
                    const bCount = array2.filter(e => e === v).length;
                    if (aCount !== bCount) return false;
                }
                return true;
            },
            openToppingBox(){
                var me = this
                me.tempToppingPlatforms = JSON.parse(JSON.stringify(me.toppingPlatforms))

                //<< radio box
                // if(me.tempToppingPlatforms.includes('java15')){
                //     me.selectedVersion= 'java15'
                //     me.isJava15 = true
                // }
                //>> radio box

                me.showTopping = true

                // if(isCustom){
                //     me.showTopping = true
                // }else{
                    // // init
                    // me.selectedVersion = 'java8'
                    // me.isVanillaK8s = false
                    // me.isJava15 = false
                    // me.selectedSecurity = null
                    // me.isSpringSecurity = false
                    // me.isKeycloakSecurity = false
                    // me.isServiceMesh = false
                    // me.isRollout = false
                    // me.isIngress = false
                    // me.isApolloGraphQL = false
                    // me.isJavaGraphQL = false
                    //
                    // if(me.tempToppingPlatforms.length > 0 ){
                    //     me.tempToppingPlatforms.forEach(function(toppingPlatform){
                    //         if(toppingPlatform =="apollo-graphql"){
                    //             me.isApolloGraphQL = true
                    //         } else if(toppingPlatform=="spring-security"){
                    //             me.selectedSecurity = "isSpringSecurity"
                    //             me.isKeycloakSecurity = false
                    //             me.isSpringSecurity = true
                    //         } else if(toppingPlatform=="keycloak-security"){
                    //             me.selectedSecurity = "isKeycloakSecurity"
                    //             me.isKeycloakSecurity = true
                    //             me.isSpringSecurity = false
                    //         } else if(toppingPlatform=="argo"){
                    //             me.isRollout = true
                    //         } else if(toppingPlatform=="istio"){
                    //             me.isServiceMesh = true
                    //         } else if(toppingPlatform=="ingress"){
                    //             me.isIngress = true
                    //         } else if(toppingPlatform=="java15"){
                    //             me.selectedVersion = "java15"
                    //         } else if(toppingPlatform=="isVanillaK8s"){
                    //             me.isVanillaK8s = true
                    //         }
                    //     })
                    // }
                    // me.showTopping = true
                // }
            },
            // openForkedRepo(gitPath){
            //     window.open(gitPath, '_blank');
            // },
            changePlatformToForkedRepo(repoPath, isChangeBaseTemplate, item){
                var me = this
                if(isChangeBaseTemplate){
                    me.openTemplateDialog('BASE', repoPath);
                } else {
                    if(item){
                        me.openTemplateDialog('TEMPLATE', repoPath, item);
                    }
                }
            },
            changePlatform(platform){
                var me = this
                var isChanged = false
                me.newTreeList = JSON.parse(JSON.stringify(me.filteredTreeLists))
                Object.keys(me.value.elements).forEach(function (eleId){
                    if(me.value.elements[eleId] && me.value.elements[eleId].preferredPlatform && me.value.elements[eleId].preferredPlatform == me.oldPlatform){
                        me.$emit('changedByMe', true)
                        me.value.elements[eleId].preferredPlatform = platform
                        me.newTreeList.some(function (arr, index){
                            if(arr.bcId == eleId){
                                me.newTreeList[index].preferredPlatform = platform
                                return true
                            }
                        })

                        isChanged = true

                        if((me.openCode[0] && (eleId == me.openCode[0].bcId)) && !me.openCode[0].code.includes("<!-- Is Not Template -->")){
                            var openCodePath = me.openCode[0].fullPath ? me.openCode[0].fullPath : me.openCode[0].path
                            localStorage.setItem('openCodePath', openCodePath)
                        }
                    }
                })
                if(isChanged){
                    me.isComputeTreeListSwitch = true
                }
                if(me.basePlatform == me.oldPlatform){
                    if(me.basePlatform != platform){
                        me.settingPlatform('BASE', platform);
                        delete me.templateFrameWorkList[me.oldPlatform]
                        // me.selectedBaseTemplate = platform
                        // me.setString(`db://definitions/${me.modelingProjectId}/information/preferredPlatforms/basePlatform` , platform)
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
                return new Promise(async function (resolve, reject) {
                    try{
                        // if( me.templateFrameWorkList[gitRepoUrl] && Object.keys(me.templateFrameWorkList[gitRepoUrl]).length > 0 ){
                        // }
                        let templateUrl = gitRepoUrl ? gitRepoUrl : me.basePlatform
                        me.$manifestsPerTemplate[templateUrl] = [];
                        let org = templateUrl.split('/')[templateUrl.split('/').length - 2].trim()
                        let repo = templateUrl.split('/')[templateUrl.split('/').length - 1].trim()
                        
                        // Template은 Main Branch에서 받아오도록 처리
                        let commitRes = await me.gitAPI.getCommit(org, repo, "main")
                        .then(async function (res) {
                            // Commit List 받아오는 것.
                            let tree = await me.gitAPI.getTree(org, repo, res)
                            .then(async function (list) {
                                console.log("try me.gitAPI.setGitList()")
                                let gitList = await me.gitAPI.setGitList(list, repo, templateUrl)
                                .then(function (resultLists) {
                                    console.log(resultLists)
                                    Object.assign(me.$manifestsPerBaseTemplate, resultLists.manifestsPerBaseTemplate)
                                    me.$manifestsPerTemplate[templateUrl] = resultLists.manifestsPerTemplate[templateUrl]
                                    me.templateFrameWorkList = resultLists.templateFrameWorkList
                                    resolve()
                                })
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                            .catch(e => {
                                console.log(e)
                                if(e.response.status === 401){
                                    me.alertReLogin()
                                }
                                alert(e)
                            })
                        })
                        .catch(error => {
                            console.log(error)
                            if(error.response.status === 401){
                                me.alertReLogin()
                            }
                            alert(error)              
                        })
                    } catch (e) {
                        console.log(`Error] Load Git Template: ${e}`)
                        if(e.response.data.message.includes("Bad credentials")){
                            me.githubTokenError = true
                            me.gitMenu = true
                            reject()
                            return false
                        }
                    }
                })

            },
            // async setGitList(element, repository, gitRepoUrl) {
            //     var me = this

            //     var isToppingSetting = false
            //     if(element.url.includes("topping-")){
            //         isToppingSetting = true
            //     }

            //     var toppingName = ""
            //     if(isToppingSetting){
            //         toppingName = repository
            //     }

            //     // return을 두가지로 줘야함
            //     // me.$manifest... => pathList 정의
            //     // template Code List => { $path: $code}
            //     return new Promise(async (resolve, reject) => {
                    
            //     });
            // },
            async setToppingList(template) {
                var me = this
                return new Promise(async function (resolve, reject) {
                    try{
                        // if( me.templateFrameWorkList[gitRepoUrl] && Object.keys(me.templateFrameWorkList[gitRepoUrl]).length > 0 ){
                        // }
                        let fullUrl = null;
                        if(/^http[s]?\:\/\//i.test(template)){
                            fullUrl = template;
                        } else {
                            fullUrl = await me.gitAPI.getToppingURL(template)
                        }
                        console.log(template, fullUrl)
                        let org = fullUrl.split('/')[fullUrl.split('/').length -2];
                        let repo = fullUrl.split('/')[fullUrl.split('/').length -1];
                        let toppingName = repo.replace('topping-','');
                        // Template은 Main Branch에서 받아오도록 처리
                        if( me.gitToppingList[fullUrl] && Object.keys(me.gitToppingList[fullUrl]).length > 0 ){
                            resolve();
                        }
                        // console.log(repo,)
                        let commitRes = await me.gitAPI.getCommit(org, repo, "main")
                        .then(async function (res) {
                            // Commit List 받아오는 것.
                            let tree = await me.gitAPI.getTree(org, repo, res)
                            .then(async function (list) {
                                console.log("try me.gitAPI.setGitList() - " + fullUrl)
                                let gitList = await me.gitAPI.setGitList(list, toppingName, fullUrl)
                                .then(function (resultLists) {
                                    me.$manifestsPerToppings[fullUrl] = resultLists.manifestsPerToppings[fullUrl]
                                    Object.assign(me.gitToppingList, resultLists.gitToppingList)
                                    // me.gitToppingList = resultLists.gitToppingList
                                    resolve()
                                })
                                .catch(e => {
                                    console.log(e)
                                })
                            })
                            .catch(e => {
                                console.log(e)
                                if(e.response.status === 401){
                                    me.alertReLogin()
                                }
                                alert(e)
                            })
                        })
                        .catch(error => {
                            console.log(error)
                            if(error.response.status === 401){
                                me.alertReLogin()
                            }
                            alert(error)              
                        })
                    } catch (e) {
                        console.log(`Error] Load Git Template: ${e}`)
                        if(e.response.data.message.includes("Bad credentials")){
                            me.githubTokenError = true
                            me.gitMenu = true
                            reject()
                            return false
                        }
                    }
                })
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
                    // console.log(lists)
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
                    type: 'ES'
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
            onSelected(newVal) {
                var me = this

                try {
                    if (newVal && newVal.length > 0) {

                       

                        if (me.changedPathLists && me.changedPathLists.length > 0) {
                            var findIdx = me.changedPathLists.indexOf(newVal[0].path)
                            if (findIdx != -1) {
                                me.changedPathLists.splice(findIdx, 1)
                                if (me.changedPathLists.length == 0) {
                                    me.showChangedPathLists = false
                                }
                            }
                        }
                        me.changedDiffCode = []

                        if (newVal && newVal[0]) {
                            var newValObj = newVal[0]
                            var oldFullObj = me.findBeforeCodeByPath(newVal[0])
                            var oldValObj = oldFullObj ? oldFullObj : null


                            if (oldValObj) {
                                var isExistDiff = jsondiffpatch.diff(newValObj.code, oldValObj.code) ? true : false
                                if (isExistDiff) {
                                    me.changedDiffCode.push(oldValObj)
                                    me.changedDiffCodeViewer = true
                                } else {
                                    // Equals File
                                    me.changedDiffCode = []
                                    me.changedDiffCodeViewer = false
                                }
                            } else {
                                console.log('Is New File.')
                                // New File
                                me.changedDiffCode = []
                                me.changedDiffCodeViewer = false
                            }
                        } else {
                            //No Selected File
                            me.changedDiffCode = []
                            me.changedDiffCodeViewer = false
                        }

                        if (newValObj && newValObj.path.includes('.java')) {

                             ////// TODO : performance problem
                            setTimeout(()=>{newValObj.code = me.codeAlign(newValObj.code)}, 0)
                            
                        }

                        me.openCode = newVal
                        if(me.openCode[0].children){
                            me.showGpt = true;
                            me.openAiMessageList = []
                            if(me.rootModelAndElementMap.modelForElements.BoundedContext.find(x => x.name == me.openCode[0].name)){
                                if(me.openAiMessageList.length == 0){
                                    let prompt
                                    me.testFile = []
                                    let collectedCodes = me.getSelectedFilesDeeply(me.openCode, {keyword: "si"})
                                    
                                    if(Array.isArray(collectedCodes) && collectedCodes.length > 0){
                                        prompt = collectedCodes.join("\n\n");
                                    }

                                    me.openAiMessageList.push({
                                        role: 'user',
                                        content: 'Here is the code list: \n' + prompt
                                    })
                                }
                                me.openGitActionDialog = true
                                me.gitActionDialogRenderKey++;
                            }
                        }else{
                            me.showGpt = false;
                        }
                    } else if (me.changedDiffCodeViewer) {
                        // Before Diff Mode
                        // me.changedDiffCode = []
                        // me.changedDiffCodeViewer = false
                    } else {
                        // Just Show Code
                        me.showGpt = false;
                        me.changedDiffCode = []
                        me.changedDiffCodeViewer = false
                    }
                } catch (e) {
                    console.log('selectedActive[Error] : ', e)
                    me.openCode = []
                }
            },
            editBreakPoint(debuggerPoint){
                var me = this
                // console.log(debuggerPoint, me.opennedTemplateFramework[0])
                me.debuggerPoint = debuggerPoint
            },
            // generatePortAndPBC(value, options, startingPort){
            //     let isPBCModel = options && options.isPBCModel ? options.isPBCModel : false
            //     let PBCLists = Object.values(value.elements).filter(x => x && x._type.endsWith("PBC"));
            //     let sortedPBCLists = PBCLists.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
            //
            //     if(!isPBCModel){
            //         Object.values(value.elements).filter(ele => ele && ele._type.endsWith('BoundedContext')).forEach(function(bc, idx){
            //             startingPort = startingPort + idx;
            //             bc.portGenerated = startingPort
            //         });
            //     }
            //
            //     sortedPBCLists.forEach(function(pbc,idx){
            //         pbc.boundedContextes = _.uniqBy(pbc.boundedContextes, "elementView.id");
            //         pbc.boundedContextes.forEach(function (bc, idx) {
            //             // startingPort = startingPort + 1;
            //             startingPort = options && options.isPBCModel ? startingPort + idx : startingPort + 1
            //             bc.portGenerated = startingPort;
            //         })
            //     });
            //
            //     return {value: value, PBCLists: sortedPBCLists, startingPort: startingPort }
            // },
            settingSCM(elementArray, options){
                var me = this;
                let array = elementArray

                if( typeof array != 'object'){
                    return;
                }

                if( !Array.isArray(array) ){
                    array = Object.values(array);
                }

                array.forEach(function(elementObj){
                    if(options.scm
                        && options.scm.tag
                        && options.scm.org
                        && options.scm.repo
                    ){
                        me.convertNameForElement(elementObj);
                        options.scm.projectName = options.projectName;
                        elementObj.scm = options.scm;

                    }
                });

                return array;
            },
            async extractBoundedContextsOfPBC( values, info ){
                var me = this
                let extractBoundedContext = []

                try{
                    async function callPBC( modelValue, modelInfo ){
                        let value = JSON.parse(JSON.stringify(modelValue));
                        let bcLists =  Object.values(value.elements).filter(x => x && x._type.endsWith("BoundedContext"));
                        let pbcLists =  Object.values(value.elements).filter(x => x && x._type.endsWith("PBC"));

                        if(modelInfo){
                            // only BC of PBC ( set BC Info )
                            bcLists = me.settingSCM(bcLists, modelInfo);
                            bcLists = bcLists.filter(x => x.scm);
                            extractBoundedContext = extractBoundedContext.concat(bcLists);
                        }


                        for(let pbc of pbcLists){
                            let config = pbc.modelValue;
                            if( config.projectId && config.projectVersion ){
                                let modelVerInfo = await me.list(`db://definitions/${config.projectId}/versionLists/${config.projectVersion}`);
                                let modelVerValue = {'elements': {}, 'relations': {}};

                                if(modelVerInfo && modelVerInfo.valueUrl){
                                    modelVerValue = await me.getObject(`storage://${modelVerInfo.valueUrl}`);
                                } else {
                                    modelVerValue = modelVerInfo.versionValue ? JSON.parse(modelVerInfo.versionValue.value) : {'elements': {}, 'relations': {}};;
                                }
                                await callPBC(modelVerValue, modelVerInfo);
                            }
                        }
                    }
                    await callPBC(values, info);

                    return extractBoundedContext;

                } catch(e) {
                    console.log(e)
                    return [];
                }
            },
            async callGenerate(options){
                var me = this

                try {
                    console.log('>>> Generate Code] Start Main<<<', Date.now() )
                    me.isGeneratorDone = false;

                    var isRecursion = options && options.recursion ? true: false

                    // if(options && !options.editCode){
                    //     me.isListSettingDone = false
                    // }
                    if( !isRecursion && !me.reGenerateOnlyModifiedTemplate){
                        me.codeLists = []
                    } else {
                        if(me.reGenerateOnlyModifiedTemplate){
                            Object.keys(me.editTemplateFrameWorkList).forEach(function (platform){
                                Object.keys(me.editTemplateFrameWorkList[platform]).forEach(function (template){
                                    var idx
                                    while(idx != -1){
                                        idx = me.codeLists.findIndex(x => x.templatePath == template)
                                        if(idx != -1){
                                            me.codeLists.splice(idx, 1)
                                        }
                                    }
                                })
                            })
                        }
                    }

                    let values = JSON.parse(JSON.stringify(me.value));
                    me.callGenerateCode(values, options);

                } catch (e){
                    console.log(`ERROR] Generate ${e}`);
                }
            },
            // async callGenerate(options){
            //     var me = this
            //
            //     try {
            //         console.log('>>> Generate Code] Start Main<<<')
            //         me.generateCodeStartCnt = -1;
            //         me.generateCodeEndCnt = -1;
            //         var isRecursion = options && options.recursion ? true: false
            //         let startingPort = 8082;
            //
            //         if(options && !options.editCode){
            //             me.isListSettingDone = false
            //         }
            //         if( !isRecursion ){
            //             me.codeLists = []
            //         }
            //
            //         console.log('>>> extractBoundedContextForPBC] Start Main<<<')
            //         let bcforPBC = await me.extractBoundedContextForPBC(JSON.parse(JSON.stringify(me.value)));
            //         console.log(bcforPBC);
            //         console.log('>>> extractBoundedContextForPBC] End Main<<<')
            //
            //         function callPBCCode(value, options){
            //             let values = JSON.parse(JSON.stringify(value));
            //             let PBCLists = [];
            //
            //             if(values && Object.values(values.elements).filter(x=> x).length > 0) {
            //                 // before
            //                 // me.callGenerateCode(values,options)
            //                 // var PBCLists = Object.values(values.elements).filter(x => x && x._type.endsWith("PBC"))
            //
            //                 // after
            //                 let generateValue = me.generatePortAndPBC(values, options, startingPort);
            //                 values = generateValue.value;
            //                 PBCLists = generateValue.PBCLists;
            //                 startingPort = generateValue.startingPort;
            //                 me.callGenerateCode(values, options);
            //
            //                 if(PBCLists.length > 0){
            //                     PBCLists.forEach(async function(pbc){
            //                         let config = pbc.modelValue;
            //                         let modelInfo = await me.list(`db://definitions/${config.projectId}/versionLists/${config.projectVersion}`);
            //                         let modelValue = null;
            //
            //                         if(modelInfo && modelInfo.valueUrl){
            //                             modelValue = await me.getObject(`storage://${modelInfo.valueUrl}`);
            //                         } else {
            //                             modelValue = modelInfo.versionValue ? JSON.parse(modelInfo.versionValue.value) : {'elements': {}, 'relations': {}};;
            //                         }
            //
            //                         var rootPath = options && options.rootPath ? options.rootPath : ''
            //
            //                         // values
            //                         modelValue.projectName = config.projectName;
            //
            //                         //options
            //                         config.rootPath = `${rootPath}${config.projectName}/`
            //                         config.pbcId = pbc.elementView.id;
            //                         config.isPBCModel = true;
            //
            //                         // set BC of startingPort
            //                         pbc.boundedContextes.forEach(function(bc){
            //                             modelValue.elements[bc.elementView.id] = bc;
            //                         });
            //
            //                         callPBCCode(modelValue, config)
            //                         me.generateCodeStartCnt ++;
            //                     })
            //                 }
            //             } else {
            //                 // me.isListSettingDone = true
            //                 // me.templateSendCnt ++;
            //                 // me.templateDoneCnt ++;
            //                 me.generateCodeStartCnt ++;
            //                 me.generateCodeEndCnt ++;
            //             }
            //         }
            //         callPBCCode(me.value)
            //     } catch (e){
            //
            //     }
            // },
            async callGenerateCode(values, options) {
                var me = this

                return new Promise( async(resolve, reject) => {
                    var value = values  ? values : me.value
                    var rootModelAndElement
                    if(me.reGenerateOnlyModifiedTemplate){
                        rootModelAndElement = me.rootModelAndElementMap
                    } else {
                        rootModelAndElement = me.core.convertModelForCodeGen(value, options);
                        rootModelAndElement = await me.convertK8sModelForCodeGen(value, rootModelAndElement);
                        me.rootModelAndElementMap = rootModelAndElement
                    }
                    if(me.rootModelAndElementMap.modelForElements.BoundedContext.length === 1){
                        me.isOneBCModel = true
                        me.onlyOneBcId = me.rootModelAndElementMap.modelForElements.BoundedContext[0].id
                    }

                    var rootModel = rootModelAndElement.rootModel
                    var modelForElements = rootModelAndElement.modelForElements

                    var basePlatforms =  value.basePlatform ? value.basePlatform : ( options && options.baseTemplate ? options.baseTemplate : me.defaultTemplate )
                    var basePlatformConf =  value.basePlatformConf ? value.basePlatformConf : {}
                    var preferredPlatforms = rootModelAndElement.preferredPlatforms
                    var toppingPlatforms = value.toppingPlatforms;
                    var toppingPlatformsConf = value.toppingPlatformsConf ? value.toppingPlatformsConf : {}

                    var rootPath = options && options.rootPath ? options.rootPath : ''
                    var platforms ={
                        preferredPlatforms: preferredPlatforms,
                        basePlatform: basePlatforms,
                        basePlatformConf: basePlatformConf,
                        toppingPlatforms: toppingPlatforms,
                        toppingPlatformsConf: toppingPlatformsConf,
                        rootPath: rootPath,
                    }
                    let scmInfo = {
                        projectName: rootModel.projectName,
                        scm: value.scm
                    }

                    if(me.reGenerateOnlyModifiedTemplate){
                        rootModel.boundedContexts = me.rootModelBoundedContexts
                    } else {
                        rootModel.boundedContexts = me.settingSCM(rootModel.boundedContexts, scmInfo );
                        me.rootModelBoundedContexts = rootModel.boundedContexts
                    }

                    let bcOfPBC = await me.extractBoundedContextsOfPBC(JSON.parse(JSON.stringify(value)));
                    rootModel.boundedContexts = [...rootModel.boundedContexts, ...bcOfPBC];


                    //////////////////////////////////////////////// TEMPLATE START ////////////////////////////////////////////////
                    // setting Template
                    if(basePlatforms == "Custom Template"){
                        basePlatforms = "template-spring-boot"
                    }
                    // setting of Base Template
                    if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){
                        // 1. 여기 타는 template?
                        if(!basePlatforms.includes("http")){
                            if(!basePlatforms.includes("template-"))
                                basePlatforms = "template-" + basePlatforms
                            basePlatforms = await me.gitAPI.getTemplateURL(basePlatforms)
                            // basePlatforms = "https://github.com/msa-ez/" + basePlatforms
                        }
                        await me.gitTemplate('BASE', basePlatforms)
                    } else if((basePlatforms.includes("http") && !basePlatforms.includes("https://github.com/msa-ez/template-"))){
                        me.isCustomTemplateForLoad = true
                        // me.isListSettingDone = true
                        return false
                    }

                    if(!me.baseTemplateList.find(tmp => tmp.template == basePlatforms)){
                        me.baseTemplateList.push({
                            display: basePlatforms,
                            template: basePlatforms
                        })
                    }

                    // setting of Custom Template
                    if(preferredPlatforms.length > 0){
                        for(let idx in preferredPlatforms) {
                            let preferredPlatform = preferredPlatforms[idx];
                            if(preferredPlatform == "Custom Template"){
                                preferredPlatform = "spring-boot"
                            }
                            if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken) {
                                if(!preferredPlatform.includes("http")){
                                    if(!preferredPlatform.includes("template-"))
                                        preferredPlatform = "template-" + preferredPlatform
                                    preferredPlatform = await me.gitAPI.getTemplateURL(preferredPlatform)
                                    // basePlatforms = "https://github.com/msa-ez/" + basePlatforms
                                }
                                await me.gitTemplate('TEMPLATE', preferredPlatform)
                            } else if((preferredPlatform.includes("http") && !preferredPlatform.includes("https://github.com/msa-ez/template-"))){
                                me.isCustomTemplateForLoad = true
                                // me.isListSettingDone = true
                                return false
                            }
                            // me.$http.defaults.headers.common['Authorization'] = `token ${me.gitAccessToken}`;
                            if(!me.templateList.find(tmp => tmp.template == preferredPlatform)){
                                var obj = {
                                    display: preferredPlatform,
                                    template: preferredPlatform
                                }
                                me.templateList.push(obj)
                            }
                        }
                    }

                    // setting of Topping Template
                    if(toppingPlatforms.length > 0 ){
                        toppingPlatforms = toppingPlatforms.filter(topping => {
                            return !Array.isArray(topping)
                        });
                        for(let idx in toppingPlatforms){
                            let toppingPlatform = toppingPlatforms[idx];
                            await me.setToppingList(toppingPlatform);
                        }
                    }
                    //////////////////////////////////////////////// TEMPLATE END ////////////////////////////////////////////////

                    //Data Preprocessing
                    me.core.afterProcessing(rootModel,modelForElements,platforms);

                    //Generate Code
                    if(!me.githubTokenError){
                        var codeList = me.generateCode(rootModel, modelForElements, platforms);
                        Promise.all([codeList]).then(async function () {
                            me.addTemplateCode();
                            if(!me.reGenerateOnlyModifiedTemplate){
                                me.treeLists = me.generateTree(options)
                            }
                            me.setBeforeCode()
                            me.$ModelingBus.$emit("clearOld");

                            me.isGeneratorDone = true;
                            resolve()
                        }).catch(()=>{

                            me.isGeneratorDone = true;
                        })
                    }

                    // K8s CodeViewer show GuideLine
                    if(me.embeddedK8s){
                        me.showIntroduceK8sCodeViewer();
                    }
                })
            },
            
            convertNameForElement(item){
                item.namePascalCase = changeCase.pascalCase(item.name)
                item.nameCamelCase = changeCase.camelCase(item.name)
                item.namePlural = pluralize(item.nameCamelCase);
            },
            async convertK8sModelForCodeGen(flatModel, rootModelAndElement){
                var me = this
                // let flatModel = JSON.parse(JSON.stringify(flat));

                let rootModel = rootModelAndElement.rootModel
                let modelForElements = rootModelAndElement.modelForElements
                let preferredPlatforms = rootModelAndElement.preferredPlatforms

                var k8sModelForElements= {
                    'k8s.Service':[],
                    'k8s.Deployment':[],
                    'k8s.Pod': [],
                    'k8s.PersistentVolume': [],
                    'k8s.PersistentVolumeClaim': [],
                    'k8s.StorageClass': [],
                    'k8s.Ingress': [],
                    'k8s.HorizontalPodAutoscaler': [],
                    'k8s.ConfigMap': [],
                    'k8s.Namespace': [],
                    'k8s.Secret': [],
                    'k8s.ServiceAccount': [],
                    'k8s.Role': [],
                    'k8s.RoleBinding': [],
                    'k8s.ClusterRole': [],
                    'k8s.ClusterRoleBinding': [],
                }

                try {
                    //<<<<<<<<<< K8s
                    if(flatModel.k8sValue){

                        var k8sElement = flatModel.k8sValue.elements
                        var k8sRelations = flatModel.k8sValue.relations
                        var k8sElementsCopy = JSON.parse(JSON.stringify(k8sElement))
                        var k8sModelCopy = Object.values(k8sElementsCopy)
                        var userEmail = localStorage.getItem("email")

                        for(let index=0; index< k8sModelCopy.length; index++){
                            let item = k8sModelCopy[index];
                            if(item){
                                item.isPassedElement = true

                                var yamlPath = await me.getURL(`storage://yamlStorage/${me.modelingProjectId}/${userEmail}/${item._type}/${ item.object.metadata.name + ".yaml"}`);
                                item.yamlPath = yamlPath;


                                if (item._type == 'Service') {
                                    k8sModelForElements['k8s.Service'].push(item);
                                } else if (item._type == 'Deployment') {
                                    k8sModelForElements['k8s.Deployment'].push(item);
                                } else if (item._type == 'Pod') {
                                    k8sModelForElements['k8s.Pod'].push(item);
                                } else if (item._type == 'PersistentVolume') {
                                    k8sModelForElements['k8s.PersistentVolume'].push(item);
                                } else if (item._type == 'PersistentVolumeClaim') {
                                    k8sModelForElements['k8s.PersistentVolumeClaim'].push(item);
                                } else if (item._type == 'StorageClass') {
                                    k8sModelForElements['k8s.StorageClass'].push(item);
                                } else if (item._type == 'Ingress') {
                                    k8sModelForElements['k8s.Ingress'].push(item);
                                } else if (item._type == 'HorizontalPodAutoscaler') {
                                    k8sModelForElements['k8s.HorizontalPodAutoscaler'].push(item);
                                } else if (item._type == 'ConfigMap') {
                                    k8sModelForElements['k8s.ConfigMap'].push(item);
                                } else if (item._type == 'Namespace') {
                                    k8sModelForElements['k8s.Namespace'].push(item);
                                } else if (item._type == 'Secret') {
                                    k8sModelForElements['k8s.Secret'].push(item);
                                } else if (item._type == 'ServiceAccount') {
                                    k8sModelForElements['k8s.ServiceAccount'].push(item);
                                } else if (item._type == 'Role') {
                                    k8sModelForElements['k8s.Role'].push(item);
                                } else if (item._type == 'RoleBinding') {
                                    k8sModelForElements['k8s.RoleBinding'].push(item);
                                } else if (item._type == 'ClusterRole') {
                                    k8sModelForElements['k8s.ClusterRole'].push(item);
                                } else if (item._type == 'ClusterRoleBinding') {
                                    k8sModelForElements['k8s.ClusterRoleBinding'].push(item);
                                }
                            }
                        }
                    }

                } catch (e) {
                    console.log(`Error]convert K8sModel ForCodeGen:${e}`)
                }
                return {
                    rootModel: rootModel,
                    modelForElements: Object.assign(modelForElements, k8sModelForElements),
                    preferredPlatforms: preferredPlatforms
                }
            },

            generateCode(rootModel, modelForElements, platforms) { //change from getTemplateSetting
                var me = this
                return new Promise(async function (resolve, reject) {
                    try {
                        var preferredPlatforms = platforms.preferredPlatforms
                        let basePlatform = platforms.basePlatform
                        let basePlatformConf = platforms.basePlatformConf
                        let toppingPlatforms = platforms.toppingPlatforms
                        let toppingPlatformsConf = platforms.toppingPlatformsConf
                        var rootPath = platforms.rootPath
                        let projectName = rootModel.projectName


                        var filteredProjectName = me.core.filterProjectName(projectName)

                        if (preferredPlatforms.length == 0) {
                            preferredPlatforms.push(me.defaultTemplate)
                        }

                        //Hash
                        if (!me.newTreeHashLists) me.newTreeHashLists = {}
                        me.oldTreeHashLists = JSON.parse(JSON.stringify(me.newTreeHashLists))
                        me.newTreeHashLists = {}

                        // if (!me.newTreeHashLists) me.$emit('update:newTreeHashLists',{})
                        // me.$emit('update:oldTreeHashLists',JSON.parse(JSON.stringify(me.newTreeHashLists)))
                        // me.$emit('update:newTreeHashLists',{})

                        var templateContext ={
                            modelForElements: modelForElements,
                            filteredProjectName: filteredProjectName,
                            preferredPlatforms: preferredPlatforms,
                            basePlatform: basePlatform,
                            basePlatformConf: basePlatformConf,
                            toppingPlatforms: toppingPlatforms,
                            toppingPlatformsConf: toppingPlatformsConf,
                            rootPath: rootPath,
                            rootModel: rootModel,
                        };


                        Promise.all([me.generateBaseTemplate(templateContext), me.generateTemplate(templateContext), me.generateToppingTemplate(templateContext)])
                            .then( function () {
                                resolve()
                            });

                    } catch (e) {
                        // me.isListSettingDone = true
                        reject()
                    }
                })
            },
            generateBaseTemplate(templateContext){
                var me = this;
                return new Promise(async function (resolve, reject) {
                    try{
                        if( me.canvasName == 'event-storming-model-canvas' && templateContext.modelForElements.BoundedContext.length == 1){
                            resolve()
                            return;
                        }
                        console.log("111111111")
                        var modelForElements = templateContext.modelForElements
                        var filteredProjectName = templateContext.filteredProjectName
                        var rootModel = templateContext.rootModel
                        var rootPath = templateContext.rootPath
                        var basePlatform = templateContext.basePlatform
                        let basePlatformConf = templateContext.basePlatformConf;

                        var manifestTemplate

                        if(me.reGenerateOnlyModifiedTemplate && me.editTemplateFrameWorkList && me.editTemplateFrameWorkList[basePlatform]){
                            manifestTemplate = Object.keys(me.editTemplateFrameWorkList[basePlatform])
                        } else {
                            let getTemplateURL = await me.gitAPI.getTemplateURL(basePlatform)
                            manifestTemplate = me.$manifestsPerBaseTemplate[basePlatform] ? me.$manifestsPerBaseTemplate[basePlatform] : (me.$manifestsPerBaseTemplate[getTemplateURL] ? me.$manifestsPerBaseTemplate[getTemplateURL]:[]);
                            manifestTemplate = JSON.parse(JSON.stringify(manifestTemplate))
                        }
                        var manifestTemplateLastIndex = manifestTemplate.length - 1
                        manifestTemplate =  manifestTemplate.filter(path => path.includes('for-model/'))
                        manifestTemplateLastIndex = manifestTemplate.length - 1

                        if( manifestTemplateLastIndex == -1 ){
                            resolve()
                        } else {
                            var xHttpSendCnt = -1
                            var xHttpDoneCnt = -1

                            manifestTemplate.forEach(async function (element, index) {
                                element = element.replace('./', '')

                                var processContext ={
                                    element: element,
                                    modelForElements: modelForElements,
                                    filteredProjectName: filteredProjectName,
                                    template: basePlatform,
                                    rootModel: rootModel,
                                    rootPath: rootPath,
                                    basePlatform: basePlatform,
                                    basePlatformConf: basePlatformConf,
                                    generatedType: "BASE",
                                };

                                var xhttp = new XMLHttpRequest();
                                xhttp.onreadystatechange = function () {

                                    if (this.readyState == 4 && this.status == 200) {
                                        // DONE && SUCCESS
                                        xHttpDoneCnt++;

                                        // if (me.selectedBaseTemplate.includes("http")) {
                                        try {
                                            var gitCodeObj = JSON.parse(this.responseText);
                                            var gitCodeTmp = Base64.decode(gitCodeObj.content)
                                        } catch(e) {
                                            var gitCodeTmp = this.responseText
                                        }
                                        if (!this.responseText.includes("<!-- Is Not Template -->")) {
                                            me.onLoadTemplateContent(gitCodeTmp, processContext)
                                        }

                                        if (xHttpSendCnt == xHttpDoneCnt) {
                                            resolve()
                                        }
                                    }
                                };

                                if( xHttpSendCnt == -1 && (manifestTemplateLastIndex == index) ){
                                    resolve()
                                }

                                if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken) {
                                    // var loadTemplate = localStorage.getItem(me.selectedBaseTemplate)
                                    // var loadTemplate = me.templateFrameWorkList[basePlatform]
                                    
                                    var platformFullName = basePlatform
                                    if(!platformFullName.includes("http")){
                                        platformFullName = await me.gitAPI.getTemplateURL(basePlatform)
                                    }
                                    var loadTemplate = me.templateFrameWorkList[platformFullName];
                                    if( loadTemplate ){
                                        let content = null;
                                        if(loadTemplate[element] && loadTemplate[element].content){
                                            content = loadTemplate[element].content;
                                            content = JSON.parse(JSON.stringify(content));
                                        }
                                        if(content){
                                            me.onLoadTemplateContent(content, processContext)
                                            return;
                                        }
                                    }
                                    // xhttp.open("GET", me.gitCodeUrl[element], true);
                                    if(me.templateFrameWorkList[platformFullName] && me.templateFrameWorkList[platformFullName][element] && me.templateFrameWorkList[platformFullName][element].requestUrl){
                                        xhttp.open("GET", me.templateFrameWorkList[platformFullName][element].requestUrl, true);
                                        xhttp.setRequestHeader('Authorization', 'token ' + me.gitAccessToken);
                                        xhttp.send();
                                        xHttpSendCnt++;
                                    }
                                } else {
                                    if(basePlatform.includes("https://github.com/msa-ez/template-") || !basePlatform.includes("http")){
                                        var platform = basePlatform.replaceAll("https://github.com/msa-ez/template-", "")
                                        try {
                                            xhttp.open("GET", `/static/templates/${platform}/${element}`, true);
                                            xhttp.setRequestHeader("Cache-Control", "no-cache");
                                            xhttp.send();
                                            xHttpSendCnt++;
                                        } catch(e){
                                            console.log(e)
                                        }
                                    }
                                    // else {
                                    //     // me.isCustomTemplateForLoad = true
                                    //     // me.isListSettingDone = true
                                    // }
                                }

                            });
                        }
                    }  catch(e) {
                        console.log(`Error] GenerateBaseTemplate : ${e}`)
                        reject()
                    }
                })
            },
            generateTemplate(templateContext){
                var me = this
                // me.changedValueCustomTemplate = false
                return new Promise( function (resolve, reject) {
                    try {
                        if( me.canvasName == 'context-mapping-model-canvas' ){
                            resolve()
                            return;
                        }
                        console.log("2222222222")
                        var modelForElements = templateContext.modelForElements
                        var preferredPlatforms = templateContext.preferredPlatforms
                        var basePlatform = templateContext.basePlatform
                        let basePlatformConf = templateContext.basePlatformConf;
                        var filteredProjectName = templateContext.filteredProjectName
                        var rootModel = templateContext.rootModel
                        var rootPath = templateContext.rootPath
                        var xHttpSendCnt = -1
                        var xHttpDoneCnt = -1

                        preferredPlatforms.forEach(async function (preferredPlatform ,index) {

                            var template = JSON.parse(JSON.stringify(preferredPlatform));
                            if(template && !template.includes("http") && me.gitAccessToken){
                                template = await me.gitAPI.getTemplateURL(template)
                            }


                            var manifestTemplate

                            if(me.reGenerateOnlyModifiedTemplate && me.editTemplateFrameWorkList && me.editTemplateFrameWorkList[template]){
                                manifestTemplate = Object.keys(me.editTemplateFrameWorkList[template])
                            } else {
                                // 아래 데이터는 npm 빌드때 파일시스템 tree 탐색을 통해 자동으로 생성하거나 일일이 작업해줘야 한다.
                                let getTemplateURL = await me.gitAPI.getTemplateURL(basePlatform)
                                manifestTemplate = me.$manifestsPerBaseTemplate[basePlatform] ? me.$manifestsPerBaseTemplate[basePlatform] : (me.$manifestsPerBaseTemplate[getTemplateURL] ? me.$manifestsPerBaseTemplate[getTemplateURL]:[]);
                                manifestTemplate = JSON.parse(JSON.stringify(manifestTemplate))
                                manifestTemplate =  manifestTemplate.filter(path => !path.includes('for-model/'))

                            }

                            let manifestTemplateLastIndex = manifestTemplate.length - 1

                            if( manifestTemplateLastIndex == -1 ){
                                if(preferredPlatforms.length - 1 == index){
                                    resolve()
                                }
                            }else{
                                // 템플릿별 파일목록들
                                manifestTemplate.forEach(async function (element, index) {
                                    element = element.replace('./', '')

                                    var processContext ={
                                        element: element,
                                        modelForElements: modelForElements,
                                        filteredProjectName: filteredProjectName,
                                        template: template,
                                        rootModel: rootModel,
                                        rootPath: rootPath,
                                        basePlatform: basePlatform,
                                        basePlatformConf: basePlatformConf,
                                        generatedType: "MAIN",
                                    };

                                    var xhttp = new XMLHttpRequest();
                                    xhttp.onreadystatechange = function () {
                                        if (this.readyState == 4 && this.status == 200) {
                                            // DONE && SUCCESS
                                            xHttpDoneCnt ++;
                                            try {
                                                var gitCodeObj = JSON.parse(this.responseText);
                                                var gitCodeTmp = Base64.decode(gitCodeObj.content)
                                            } catch(e) {
                                                var gitCodeTmp = this.responseText
                                            }
                                            if (!this.responseText.includes("<!-- Is Not Template -->")) {
                                                me.onLoadTemplateContent(gitCodeTmp, processContext)
                                            }
                                            if (xHttpSendCnt == xHttpDoneCnt) {
                                                resolve()
                                            }
                                        }
                                    };

                                    if( xHttpSendCnt == -1 && (manifestTemplateLastIndex == index) ){
                                        resolve()
                                    }

                                    if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){
                                        // var loadTemplate = localStorage.getItem(template)
                                        var platformFullName = template
                                        if(!platformFullName.includes("http")){
                                            platformFullName = await me.gitAPI.getTemplateURL(basePlatform)
                                        }
                                        var loadTemplate = me.templateFrameWorkList[platformFullName];
                                        if(loadTemplate){
                                            // loadTemplate = JSON.parse(loadTemplate)
                                            let content = null;
                                            if(loadTemplate[element] && loadTemplate[element].content){
                                                content = loadTemplate[element].content
                                            }
                                            if(content){
                                                me.onLoadTemplateContent(content, processContext)
                                                return;
                                            }
                                        }
                                        // xhttp.open("GET", me.gitCodeUrl[element], true);
                                        if(me.templateFrameWorkList[platformFullName] && me.templateFrameWorkList[platformFullName][element] && me.templateFrameWorkList[platformFullName][element].requestUrl){
                                            xhttp.open("GET", me.templateFrameWorkList[platformFullName][element].requestUrl, true);
                                            xhttp.setRequestHeader('Authorization', 'token ' + me.gitAccessToken);
                                            xhttp.send();
                                            xHttpSendCnt ++;
                                        }
                                    } else {
                                        if(template.includes("https://github.com/msa-ez/template-") || !template.includes("http")){
                                            var platform = template.replaceAll("https://github.com/msa-ez/template-", "")

                                            xhttp.open("GET", `/static/templates/${platform}/${element}`, true);
                                            xhttp.setRequestHeader("Cache-Control", "no-cache");
                                            xhttp.send();
                                            xHttpSendCnt++;
                                        }
                                        // else {
                                        //     // me.isCustomTemplateForLoad = true
                                        //     // me.isListSettingDone = true
                                        // }
                                    }

                                });
                            }

                        })
                    } catch(e) {
                        console.log(`Error] Generate Template : ${e}`)
                        reject()
                    }
                })
            },
            generateToppingTemplate(templateContext){
                var me = this;
                return new Promise( function (resolve, reject) {
                    try {
                        // if( me.canvasName == 'context-mapping-model-canvas' ) {
                        //     resolve()
                        //     return;
                        // }
                        console.log("3333333")
                        var modelForElements = templateContext.modelForElements
                        var toppingPlatforms = templateContext.toppingPlatforms
                        var basePlatform = templateContext.basePlatform
                        let basePlatformConf = templateContext.basePlatformConf;
                        var filteredProjectName = templateContext.filteredProjectName
                        var rootModel = templateContext.rootModel
                        var rootPath = templateContext.rootPath


                        var xHttpSendCnt = -1
                        var xHttpDoneCnt = -1

                        if (toppingPlatforms && toppingPlatforms.length > 0) {
                            toppingPlatforms.forEach(async function (preferredPlatform, index) {
                                var template = JSON.parse(JSON.stringify(preferredPlatform));
                                if(template && !template.includes("http")){
                                    let getTemplateURL = await me.gitAPI.getToppingURL(template)
                                    template = getTemplateURL
                                }

                                var manifestTemplate

                                if(me.reGenerateOnlyModifiedTemplate && me.editTemplateFrameWorkList && me.editTemplateFrameWorkList[template]){
                                    manifestTemplate = Object.keys(me.editTemplateFrameWorkList[template])
                                } else {
                                    // 아래 데이터는 npm 빌드때 파일시스템 tree 탐색을 통해 자동으로 생성하거나 일일이 작업해줘야 한다.
                                    manifestTemplate = me.$manifestsPerToppings[template] ? me.$manifestsPerToppings[template] : [];
                                }
                                
                                var manifestTemplateLastIndex = manifestTemplate.length - 1

                                if( manifestTemplateLastIndex == -1 ){
                                    if(toppingPlatforms.length - 1 == index){
                                        resolve()
                                    }
                                }else{
                                    manifestTemplate.forEach(async function (element, index) {
                                        element = element.replace('./', '')

                                        var processContext ={
                                            element: element,
                                            modelForElements: modelForElements,
                                            filteredProjectName: filteredProjectName,
                                            template: template,
                                            rootModel: rootModel,
                                            rootPath: rootPath,
                                            basePlatform: basePlatform,
                                            basePlatformConf: basePlatformConf,
                                            generatedType: "TOPPING",
                                        };

                                        var xhttp = new XMLHttpRequest();
                                        xhttp.onreadystatechange = function () {
                                            if (this.readyState == 4 && this.status == 200) {
                                                // DONE && SUCCESS
                                                xHttpDoneCnt ++;
                                                try {
                                                    var gitCodeObj = JSON.parse(this.responseText);
                                                    var gitCodeTmp = Base64.decode(gitCodeObj.content)
                                                } catch(e) {
                                                    var gitCodeTmp = this.responseText
                                                }
                                                if (!this.responseText.includes("<!-- Is Not Template -->")) {
                                                    me.onLoadTemplateContent(gitCodeTmp, processContext)
                                                }
                                                if (xHttpSendCnt == xHttpDoneCnt) {
                                                    resolve()
                                                }
                                            }
                                        };

                                        if( xHttpSendCnt == -1 && (manifestTemplateLastIndex == index) ){
                                            resolve()
                                        }

                                        if((localStorage.getItem("loginType") && localStorage.getItem("loginType") == "github") || me.gitAccessToken){
                                            // var loadTemplate = localStorage.getItem(template)
                                            var platformFullName = template
                                            if(!platformFullName.includes("http")){
                                                platformFullName = await me.gitAPI.getToppingURL(template)
                                            }
                                            var loadTemplate = me.gitToppingList[platformFullName]
                                            if(loadTemplate){
                                                // loadTemplate = JSON.parse(loadTemplate)
                                                let content = null;
                                                if(loadTemplate[element] && loadTemplate[element].content){
                                                    content = loadTemplate[element].content
                                                }
                                                if(content){
                                                    me.onLoadTemplateContent(content, processContext)
                                                    return;
                                                }
                                            }
                                            // xhttp.open("GET", me.gitCodeUrl[element], true);
                                            if(me.gitToppingList[platformFullName][element] && me.gitToppingList[platformFullName][element].requestUrl){
                                                xhttp.open("GET", me.gitToppingList[platformFullName][element].requestUrl, true);
                                                xhttp.setRequestHeader('Authorization', 'token ' + me.gitAccessToken);
                                                xhttp.send();
                                                xHttpSendCnt ++;
                                            }
                                        }
                                        // else {
                                        //     if(template.includes("https://github.com/msa-ez/topping-") || !template.includes("http")){
                                        //         var platform = template.replaceAll("https://github.com/msa-ez/topping-", "")
                                        //
                                        //         xhttp.open("GET", `/static/templates/${platform}/${element}`, true);
                                        //         xhttp.setRequestHeader("Cache-Control", "no-cache");
                                        //         xhttp.send();
                                        //         xHttpSendCnt++;
                                        //     } else {
                                        //         me.isCustomTemplateForLoad = true
                                        //         me.isListSettingDone = true
                                        //     }
                                        // }
                                    });
                                }
                            });
                        } else {
                            resolve()
                        }
                    } catch(e) {
                        console.log(`Error] GenerateToppingTemplate : ${e}`)
                        reject()
                    }

                })
            },
            generateTroubleShooting(values){
                var me = this
                var originValue = values ? values : me.value
                var copyValue =  JSON.parse(JSON.stringify(originValue));

                if( !copyValue.k8sValue ){
                    copyValue.k8sValue = {'elements': {}, 'relations': {}};
                }

                Object.values(copyValue.elements).forEach(function (el) {
                    if (el) {
                        if (el._type.endsWith("BoundedContext")) {
                            me.boundedContextList.push(el);
                        }
                    }
                })

            },
            onLoadTemplateContent(content, processContext){
                var me = this;
                try{
                    let originContent = JSON.parse(JSON.stringify(content));
                    var element = processContext.element;
                    var modelForElements = processContext.modelForElements;
                    var template = processContext.template;
                    var basePlatform = processContext.basePlatform;
                    let basePlatformConf = processContext.basePlatformConf;
                    var filteredProjectName = processContext.filteredProjectName;
                    var rootModel = processContext.rootModel;
                    var rootPath = processContext.rootPath
                    let generatedType = processContext.generatedType;

                    if (element.includes('.template/') || element === '.template.md' || element === '.template.yml') {
                        return;
                    }

                    var test = ''
                    var count = 0
                    let splitDivision = content.split('---');
                    var optionsCheck = splitDivision[0];
                    // Setting For ForEach
                    if (!optionsCheck.includes('forEach:')) {
                        count = count + 1
                        if (element.includes('for-model')) {
                            var forEach = 'Model'
                            test = test.concat('forEach: ' + forEach)
                        } else {
                            var forEach = 'BoundedContext'
                            test = test.concat('forEach: ' + forEach)
                        }
                    } else {
                        var forEach = optionsCheck.split("forEach:")[1].split("\n")[0].trim();
                    }

                    // Setting For FileName
                    if (!optionsCheck.includes('fileName:')) {
                        count = count + 1
                        if (element.split('/')) {
                            var fileName = element.substring(element.lastIndexOf("/") + 1);
                            test = test.concat('\n')
                            if (fileName == 'gitignore') {
                                fileName = '.gitignore'
                            }
                            if (fileName == 'msaez') {
                                fileName = '.msaez'
                            }
                            test = test.concat('fileName: ' + fileName)
                        }
                    }else{
                        // var fileName = element.substring(element.lastIndexOf("/") + 1)
                        var fileName = optionsCheck.split("fileName:")[1].split("\n")[0].trim();
                        if (fileName == 'gitignore') {
                            fileName = '.gitignore'
                        }
                        if (fileName == 'msaez') {
                            fileName = '.msaez'
                        }
                    }

                    // Setting For Path
                    if (!optionsCheck.includes('path:')) {
                        var pathData = element.substring(0, element.lastIndexOf("/") + 1);
                        count = count + 1
                        if (element.includes('for-model')) {
                            test = test.concat('\n')
                            test = test.concat(`path: ${path.dirname(element).replace('./', '')}`)
                        } else if (optionsCheck.includes('forEach:')) {
                            test = test.concat('\n')
                            test = test.concat(`path: {{boundedContext.name}}/${path.dirname(element).replace('./', '')}`)
                        } else {
                            test = test.concat('\n')
                            test = test.concat(`path: {{name}}/${path.dirname(element).replace('./', '')}`)
                        }
                    } else if (!optionsCheck.includes('forEach:')) {
                        // ????? 왜 존재 하는지 ??
                        var pathData = element.substring(0, element.lastIndexOf("/") + 1);
                        if (element.includes('for-model')) {
                            test = test.concat('\n')
                        } else if (!optionsCheck.includes('path:')) {
                            count = count + 1
                            test = test.concat('\n')
                            test = test.concat(`path: {{name}}/${path.dirname(element).replace('./', '')}`)
                        } else {
                            test = test.concat('\n')
                        }
                    }

                    if (count == 3) {
                        // temp fix
                        if( splitDivision.length > 1 &&
                            ( optionsCheck.includes('ifDuplicated:')
                            || optionsCheck.includes('representativeFor:')
                            || optionsCheck.includes('priority:')
                            || optionsCheck.includes('except:')
                            )
                        ){  test = optionsCheck.concat(test) }
                        test = test.concat('\n---\n')
                    } else {
                        test = test.concat('\n')
                    }

                    if (test.length > 0) {
                        content = test.concat(content)
                    }

                    let model = forEach == 'Model' ? rootModel : modelForElements[forEach];
                    if( !model ) return;

                    if( forEach != 'Model' && !Array.isArray(model) ) {
                        Object.keys(model).forEach(function(key){
                            if(Array.isArray(model[key])){
                                model[key] = model[key]
                            }
                        });
                    }

                    // model = forEach == 'Model' ? model : model.filter(x=>x && !x.pbcId || x.pbcId == pbcId)
                    // model.boundedContexts = model.boundedContexts.filter(x=>x.pbcId == pbcId)

                    // if(rootPath && content.includes('---')){
                    //     var splitOptions = content.split('\n---\n')[0]
                    //     var splitLine= splitOptions.split('\n').filter(x=>x.includes('path'))[0]
                    //
                    //     // var originPath= splitLine.split(':')[1].trim()
                    //     // var replacePath = originPath.startsWith('/') ? `${rootPath}${originPath.substring(1)}`: `${rootPath}${originPath}`
                    //
                    //     let originPath = splitLine.split(':')[1].trim();
                    //     let replaceWords = forEach == 'Model' ? element.split('/').slice(0,-1).join('/').trim() : splitLine.split(':')[1].trim();
                    //     let replacePath = replaceWords.startsWith('/') ? `${rootPath}${replaceWords.substring(1)}`: `${rootPath}${replaceWords}`
                    //     // if(processContext.type == 'BASE' && forEach != 'Model' && originPath.startsWith(rootPath)){
                    //     if( forEach != 'Model' && originPath.startsWith(rootPath) ){
                    //         replacePath = originPath
                    //     }
                    //     content = content.replace(`path: ${originPath}`, `path: ${replacePath}`)
                    // }

                    let baseOptions = {};
                    if(!basePlatform) basePlatform = me.defaultTemplate;

                    if( me.isExistConfTemplate('BASE', basePlatform) ){
                        if( !(basePlatformConf && basePlatformConf[basePlatform]) ){
                            if( !basePlatformConf[basePlatform] ) basePlatformConf[basePlatform] = {};
                            if( !basePlatformConf[basePlatform].package ){
                                basePlatformConf[basePlatform].package = `${filteredProjectName.trim().replace(/ /gi, "/").replace("-", "")}`;
                                basePlatformConf[basePlatform].packagePath = `src/main/java/${filteredProjectName.trim().replace(/ /gi, "/").replace("-", "")}`;
                            }
                        }
                        baseOptions = basePlatformConf[basePlatform];
                    } else {
                        baseOptions = {
                            "package": `${filteredProjectName.trim().replace(/ /gi, "/").replace("-", "")}`,
                            "packagePath": `src/main/java/${filteredProjectName.trim().replace(/ /gi, "/").replace("-", "")}`
                        }
                    }

                    //
                    baseOptions["rootPackage"] = `${me.core.filterProjectName(me.projectName).trim().replace(/ /gi, "/").replace("-", "")}`;


                    var templateProcessContext = {
                        templateFile: element,
                        template: template,
                        content: content,
                        originContent: originContent,
                        filteredProjectName: filteredProjectName,
                        forEach: forEach,
                        element: element,
                        rootModel: rootModel,
                        rootPath: rootPath,
                        options: baseOptions,
                        generatedType: generatedType,
                    }

                    if (Array.isArray(model)) { // elements 별로 돌림
                        model.forEach(function (modelElement) {
                            if ( (template == modelElement.preferredPlam || template.includes(modelElement.preferredPlatform)) || !processContext.generatedType.includes('MAIN') || modelElement.isPassedElement ) {
                                if(forEach == 'BoundedContext' ){
                                    if( me.isExistConfTemplate('TEMPLATE', modelElement.preferredPlatform)
                                        && modelElement.preferredPlatformConf
                                        && modelElement.preferredPlatformConf[modelElement.preferredPlatform] ){
                                        // setting of Configuration
                                        templateProcessContext.options = JSON.parse(JSON.stringify(modelElement.preferredPlatformConf[modelElement.preferredPlatform]));
                                    } else{
                                        // setting of base
                                        templateProcessContext.options = JSON.parse(JSON.stringify(me.isExistConfTemplate('BASE', basePlatform) ? basePlatformConf[basePlatform] : templateProcessContext.options))
                                    }
                                } else if( modelElement.boundedContext
                                        && modelElement.boundedContext.preferredPlatform
                                        && modelElement.boundedContext.preferredPlatformConf
                                        && modelElement.boundedContext.preferredPlatformConf[modelElement.boundedContext.preferredPlatform]
                                        && me.isExistConfTemplate('TEMPLATE', modelElement.boundedContext.preferredPlatform) ){
                                    // setting of Configuration
                                    templateProcessContext.options = JSON.parse(JSON.stringify(modelElement.boundedContext.preferredPlatformConf[modelElement.boundedContext.preferredPlatform]));
                                } else { // setting of base
                                    if (me.isExistConfTemplate('BASE', basePlatform)) {
                                        templateProcessContext.options = JSON.parse(JSON.stringify(basePlatformConf[basePlatform]));
                                    }
                                    // templateProcessContext.options = JSON.parse(JSON.stringify(me.isExistConfTemplate('BASE', basePlatform) ? basePlatformConf[basePlatform] : templateProcessContext.options));
                                }

                                me.processTemplate(modelElement, templateProcessContext);
                            }
                        });
                    } else {
                        me.processTemplate(model, templateProcessContext);
                    }
                }catch (e) {
                    console.error(`Error] Load TemplateContent :${e}`)
                }
            },
            processTemplate(ele, processContext) {
                var me = this;
                var frameWork = processContext.content;
                var frameWorkelement = processContext.element;

                var content = processContext.content;
                var originContent = processContext && processContext.originContent ? JSON.parse(JSON.stringify(processContext.originContent)) : content
                var template = processContext.template;
                var forEach = processContext.forEach;
                var element = processContext.element;
                var rootModel = processContext.rootModel;
                var rootPath = processContext.rootPath;
                var options = processContext.options;
                let generatedType = processContext.generatedType;

                let fullPath

                var isEditTemplate = false
                if( me.editTemplateFrameWorkList[template] && me.editTemplateFrameWorkList[template][frameWorkelement] ){
                    isEditTemplate = true 
                    frameWork = me.editTemplateFrameWorkList[template][frameWorkelement].code
                    
                    if(me.editTemplateFrameWorkList[template][frameWorkelement].code.includes("---")){
                        content = me.editTemplateFrameWorkList[template][frameWorkelement].code
                    } else {
                        let editTempContent = [content.split("---")[0], me.editTemplateFrameWorkList[template][frameWorkelement].code]
                        content = editTempContent.join("---")
                    }
                }

                try {
                    if(!me.codeLists){
                        me.codeLists = []
                    }

                    var space = "  "
                    var replaceRoof = true;
                    var gen = null;

                    if(options && options.package){
                        // source code package name
                        options.package = options.package.replace(/ /gi, ".").replace("-", "").replace(/\//gi, '.');
                        // options.packagePath = options.packagePath.replace(/ /gi, ".").replace("-", "").replace(/\//gi, '.');
                        options.packagePath = options.packagePath.replace(/ /gi, ".").replace("-", "");
                    }

                    ele.options = options;
                    ele.contexts = {};
                    ele.k8sValue = me.value.k8sValue
                    ele.options.rootModel = me.value


                    while(replaceRoof){
                        if(processContext.filteredProjectName.includes(space)){
                            processContext.filteredProjectName = processContext.filteredProjectName.replaceAll(space, " ")
                            space = space + " "
                        } else {
                            replaceRoof = false
                        }
                    }
                    if(processContext.filteredProjectName.at(-1) == " "){
                        processContext.filteredProjectName = processContext.filteredProjectName.replace(/.$/, "");
                    }

                    //mustach
                    // var gen = window.$Mustache.render(content, ele);

                    //$HandleBars
                    var currentFile
                    if(me.opennedTemplateFramework && content == me.opennedTemplateFramework[0].code){
                        currentFile = true
                    }

                    if (content.split("<function>")[1]) {
                        var functionBlock = content.split("<function>")[1];
                        functionBlock = functionBlock.replace("\n</function>", "");
                        content = content.replace("\n</function>", "");
                        content = content.replace("<function>\n", "");
                        content = content.replace("<function>", "");
                        content = content.replace(functionBlock, "");

                        if(currentFile){
                            var code = functionBlock.split("\n")
                            var idx = -1
                            me.debuggerPoint.forEach(function (lineNum){
                                code.splice(lineNum + idx, 0, 'debugger;');
                                idx++;
                            })
                            functionBlock = code.join("\n")
                        }

                        functionBlock += "\n//# sourceURL=templates/"+ processContext.template.replaceAll(" ", "-") + "/"+processContext.templateFile+".js"

                        try{
                            var result = function(str){
                                return eval(str);
                            }.call(ele,functionBlock);
                        }catch(e){
                            throw e;
                        }

                    }
                    // try{
                    
                    var compileTemplate = window.$HandleBars.compile(content);
                    gen = compileTemplate(ele);

                    
                    if(processContext.element.includes('for-model/kubernetes/docs')){
                        compileTemplate = window.$HandleBars.compile(gen);
                        gen = compileTemplate(ele);

                        // 임시조치 (추가될 템플릿에 따라 정규표현으로 처리 예정)
                        gen = gen.replaceAll("&#x60;", "`"); // 코드 블록 변환
                        gen = gen.replaceAll("&gt;", ">"); // 꺽쇠(>) 변환
                    }

                    var metadataAndSource = gen.split("---"); // 소스와 구분

                    var header = yamlpaser.load(metadataAndSource[0].replace(/\n\n/gi, "\n"))
                    var headerOptions = {}
                    Object.keys(header).forEach(function (keyValue, idx) {
                        var key = keyValue
                        var value = Object.values(header)[idx]
                        if (key == 'path' && (value.lastIndexOf('.') == value.length - 1)) {
                            value = value.substring(0, value.lastIndexOf(".") - 1)
                        }
                        headerOptions[key] = value;
                    })

                    if(element.includes('/for-model')){
                        // topping관련: topping-apollo-graphql-shl/apollo-graphql/for-model/apollo-graphQL/
                        // element = element.replace(`${element.split('/for-model')[0]}/for-model`,'for-model')
                        headerOptions['path'] = headerOptions['path'].replace(`${headerOptions['path'].split('/for-model')[0]}/for-model`,'for-model')
                    }

                    let optionsPathString = '';
                    if(forEach == 'Model'){
                        // Setting path of for-model( BASE)
                        var optionsMetadataAndSource = content.split("---"); // 소스와 구분
                        var optionsPathHeader = yamlpaser.load(optionsMetadataAndSource[0])
                        var elementPath = element.split('/');
                        var elementPathString = elementPath[0] + '/' + elementPath[1];
                        var removeRootPath = rootPath ? optionsPathHeader['path'].replace(rootPath,'') : optionsPathHeader['path']

                        if(elementPathString){
                            if (removeRootPath && (removeRootPath.includes(elementPathString) || elementPathString.includes(removeRootPath)) ) {
                                optionsPathHeader['path'] = rootPath ? elementPathString.replace('for-model/', `for-model/${rootPath}`) : elementPathString
                            } else {
                                var lastWord = elementPath[1]
                                var replaceRootPath  = rootPath.replaceAll('/',`/${lastWord}/`)
                                if(optionsPathHeader['path']){
                                    optionsPathHeader['path'] = optionsPathHeader['path'].replace(elementPathString,replaceRootPath)
                                }
                            }
                        }
                        if(optionsPathHeader['path']){
                            var optionsPath = optionsPathHeader['path'].split('/');
                            for (var o = 1; o < optionsPath.length; o++) {
                                if (o == 1) {
                                    optionsPathString = optionsPathString.concat(optionsPath[o]);
                                } else {
                                    optionsPathString = optionsPathString.concat('/' + optionsPath[o]);
                                }
                            }
                        }
                    }
                    var optionsPath = headerOptions['path']=='/' ? '' : headerOptions['path'];

                    // Generate packageName to filePath
                    optionsPath = optionsPath && optionsPath.startsWith('.') ? optionsPath.replace('.','/') : optionsPath
                    if(optionsPath && optionsPath != ""){
                        fullPath = optionsPath+ '/' + headerOptions['fileName'];
                    } else {
                        fullPath = headerOptions['fileName'];
                    }
                    if( forEach == 'Model' && fullPath.startsWith('/') ){
                        fullPath = elementPathString.concat(fullPath)
                    }

                    if(!me.modelForElement[template]){
                        me.modelForElement[template] = {}
                    }

                    if(forEach != 'Model'){
                        if(!me.modelForElement[template][frameWorkelement]){
                            me.modelForElement[template][frameWorkelement] = {}
                        }
                        if (headerOptions['except'] == true) {
                            if(!me.modelForElement[template][frameWorkelement][fullPath]){
                                me.modelForElement[template][frameWorkelement][fullPath] = ele
                            }
                        } else {
                            me.modelForElement[template][frameWorkelement][fullPath] = ele
                        }
                    }



                    var representativeFor = headerOptions['representativeFor']
                    var priority = headerOptions['priority']

                    var fileName = headerOptions['fileName']
                    if (template == 'spring-boot' && headerOptions['fileName'] && headerOptions['fileName'].includes("Impl")) {
                        if (!ele.boundedContext.fallback) {
                            return;
                        }
                    }
                    if (headerOptions['except'] == true) {
                        return;
                    }

                    var source = ''
                    if (metadataAndSource && metadataAndSource.length > 1) {
                        for (var data in metadataAndSource) {

                            if (data != 0 && data < metadataAndSource.length - 1) {
                                source = source.concat(metadataAndSource[data] + '---\n')
                            } else if (data == metadataAndSource.length - 1) {
                                source = source.concat(metadataAndSource[data])
                            }
                        }
                    }

                    if(fullPath.includes('_template/')){
                        if(!me._templateLists) me._templateLists = {}
                        if(fullPath.startsWith('for-model')){
                            me.$set(me._templateLists, fullPath.replace('for-model', template.split('/')[template.split('/').length-1]), source)
                        }else{
                            me.$set(me._templateLists, fullPath, source)
                        }
                        return;
                    }

                    if(!me.templateFrameWorkList[template]) me.templateFrameWorkList[template] = {}
                    if(!me.templateFrameWorkList[template][frameWorkelement]) {
                        me.templateFrameWorkList[template][frameWorkelement] = {}
                    }
                    if(!me.templateFrameWorkList[template][frameWorkelement].refList){
                        me.templateFrameWorkList[template][frameWorkelement].refList = []
                    }

                    me.templateFrameWorkList[template][frameWorkelement].content = originContent;
                    // me.templateFrameWorkList[template][frameWorkelement].content = frameWork;
                    if(!me.templateFrameWorkList[template][frameWorkelement].refList.find(x => x == fullPath)){
                        me.templateFrameWorkList[template][frameWorkelement].refList.push(fullPath.replace('for-model/', ''))
                    }

                    // set of Design Patterns
                    let patterns = [{start: '//<<<', end:'//>>>'}, {start: '#<<<', end:'#>>>'}];

                    patterns.forEach(function(pattern){
                        if(source.indexOf(pattern.start) > 0){
                            var copySource = fullPath.endsWith('.java') ? JSON.parse(JSON.stringify(source)) : source
                            // var matchPatternLen = copySource.match(pattern.start).length;
                            var matchPatternLen =  copySource.split('\n').filter(x=>x.includes(pattern.start)).length;

                            for ( var matchNum = 0; matchNum < matchPatternLen; matchNum ++ ){
                                var lineObj = {}
                                let patternSearch = copySource.split(pattern.start)[1].split('\n')[0];
                                let patternName = copySource.split(pattern.start)[1].split('\n')[0];

                                lineObj.search = patternSearch.trim();
                                if(patternSearch.match('for (.*) (.*)')){
                                    lineObj.type = patternSearch.match('for (.*) "(.*)"')[1];
                                    lineObj.elementName = patternSearch.match('for (.*) "(.*)"')[2];
                                    patternName = patternSearch.replace(patternSearch.match(/\(.+/gi)[0],'');
                                }

                                var endPatternIndex = copySource.split('\n').filter(line => line.includes(pattern.start) || line.includes(pattern.end)).findIndex(item => item.includes(`${pattern.end}${patternSearch}`))
                                var startLineNumber =  copySource.substring(0,copySource.indexOf(`${pattern.start}${patternSearch}`)).split('\n').length;
                                copySource = copySource.replace(`${pattern.start}${patternName}\n`, '')
                                var endLineNumber =  copySource.substring(0,copySource.indexOf(`${pattern.end}${patternSearch}`)).split('\n').length
                                if(copySource.split('\n').length == endLineNumber){
                                    copySource = copySource.replace(`${pattern.end}${patternSearch}`,'')
                                }else{
                                    copySource = copySource.replace(`${pattern.end}${patternSearch}\n`,'')
                                }

                                lineObj.start = startLineNumber - 1
                                lineObj.end = endLineNumber - (endPatternIndex + 1)

                                lineObj.path = fullPath
                                patternName = patternName.trim()

                                if( me.designPatterns[patternName] ){
                                    if(me.designPatterns[patternName].filter( obj => JSON.stringify(obj) == JSON.stringify(lineObj)).length == 0 ){
                                        me.designPatterns[patternName].push(lineObj)
                                    }
                                }else{
                                    me.designPatterns[patternName] = []
                                    me.designPatterns[patternName].push(lineObj)
                                }
                            }
                        }
                    });
                    // end of Design Patterns



                    // var codeValue = {}
                    // var fullValue = {}

                    source = source.replace('\n', '')
                    let codeObj
                    if (source.length > 1) {
                        var uuid = me.uuid();
                        // if (source == undefined) {
                        //     console.log(source, fullPath)
                        // }
                        // var hashName = JSON.parse(JSON.stringify(fileName))
                        // var hashValue = JSON.parse(JSON.stringify(source))
                        // var hashPath = JSON.parse(JSON.stringify(fullPath))

                        //템플릿단에서 BC 파악 위해서 element의 BC 파악.
                        var getBcId = null
                        if (ele && ele.boundedContext && ele.boundedContext.elementView) {
                            getBcId = ele.boundedContext.elementView.id
                        }

                        codeObj = {
                            'element': null,
                            'key': uuid,
                            'fileName': fileName,
                            'code': source,
                            'file': me.fileType(fileName),
                            'boundedContext': fullPath.split("/")[0],
                            'bcId': getBcId,
                            'fullPath': fullPath.replace('for-model/', ''),
                            'priority': priority,
                            'options': options,
                            'templatePath': frameWorkelement,
                            'generatedType': generatedType,
                            'template': template
                        }

                        codeObj.fullPath = fullPath.replace('for-model/', '')

                        // set Hash.
                        let hashConcat = fileName.concat(source).concat(codeObj.fullPath)
                        var sourceHash = Math.abs(me.hashCode(hashConcat))
                        codeObj.hash = sourceHash;

                        if (ele._type && ele._type.endsWith("Model")) {
                            // /src/main/java/com/example/Application.java
                            // gateway2/src/main/java/com/example/template/Application.java
                            codeObj.element = ele.elementView ? ele.elementView.id : null;
                        } else {
                            if (ele._type && ele._type.endsWith("BoundedContext")) {
                                codeObj.isMirrorElement = ele.mirrorElement ? true: false;
                                if(element.includes("for-model/")){
                                    codeObj.boundedContext = 'for-model';
                                    codeObj.bcId = null;
                                } else {
                                    codeObj.element = ele.elementView ? ele.elementView.id : null;
                                    codeObj.bcId = ele.elementView ? ele.elementView.id : null;
                                    codeObj.representativeFor = representativeFor ? representativeFor : null;
                                    codeObj.forEach = forEach ? forEach : null;
                                    codeObj.fullPath = fullPath;
                                }
                            } else {
                                //////// why key is requred?
                                // -> Code view 관련 key 설정 없을시, 중복선택 막음
                                if(element.includes("for-model/") && fullPath.split("/")[0] == "for-model"){
                                    codeObj.boundedContext = 'for-model';
                                    codeObj.bcId = null;
                                    codeObj.fullPath = fullPath.replace(fullPath.split("/")[0] + '/', '');
                                } else {
                                    codeObj.element = ele.elementView ? ele.elementView.id : null;
                                    codeObj.representativeFor = representativeFor ? representativeFor : null;
                                    codeObj.forEach = forEach ? forEach : null;
                                    codeObj.fullPath = fullPath;
                                }
                            }
                        }

                        // var diffObj = me.fullPathList.find(x => x.fullPath === fullPath);

                        if(me.codeLists){
                            let dupObj = me.codeLists.find(x => x.fullPath === codeObj.fullPath);

                            if (dupObj) {
                                if( headerOptions['ifDuplicated'] && headerOptions['ifDuplicated'] === "merge") {
                                    //ifDuplicate
                                    // _codeMerger(compare, origin, type of compare)
                                    var mergedCode = me._codeMerger(codeObj.code, dupObj.code, codeObj.fileName);

                                    dupObj.code = mergedCode;
                                } else {
                                    // priority 1 이상....
                                    if ( priority && (priority < dupObj.priority) || codeObj.generatedType =="TOPPING" ) {
                                        dupObj.code = codeObj.code;
                                    }else{
                                        return;
                                    }
                                }
                            } else {
                                me.codeLists.push(codeObj);
                            }
                        }



                        me.$set(me.newTreeHashLists, sourceHash, fullPath)

                        // if(isEditTemplate){
                        //     me.editTemplateFrameWorkList[template][frameWorkelement].elementResult = null
                        //     me.editTemplateFrameWorkList[template][frameWorkelement].elementResult = codeObj
                        // }

                        // treeLists beforeFullPath 미포함.
                        if(me.openCode && me.openCode[0]){
                            if(me.openCode[0].path == codeObj.fullPath || me.openCode[0].fullPath == codeObj.fullPath || (me.openCode[0].template == codeObj.template && me.openCode[0].templatePath == codeObj.templatePath)){
                                me.openCode[0].code = codeObj.code
                            } 
                            // else {
                            //     if(!me.opennedTemplateFramework[0].templateErrMsg){
                            //         var platform = me.getPlatformPath()
                            //         var tempPath = me.getTempPath()
                            //         if(me.editTemplateFrameWorkList[platform] && me.editTemplateFrameWorkList[platform][tempPath] && me.editTemplateFrameWorkList[platform][tempPath].elementResult){
                            //             me.openCode[0].code = me.editTemplateFrameWorkList[platform][tempPath].elementResult.code
                            //         }
                            //     }
                            // }
                        } 


                        var fileNameCheckArray = content.split("---");
                        if (fileNameCheckArray[0].includes("fileName: {{")) {
                            if (ele.name != ele.oldName && ele.oldName != undefined && ele.oldName.length > 0) {
                                var nameCamelCase = _.camelCase(ele.oldName);
                                var namePascalCase = nameCamelCase.substring(0, 1).toUpperCase() + nameCamelCase.substring(1);
                                var beforeFullPath = "";
                                var stringArray = codeObj.fullPath.split("/");
                                stringArray.forEach(function (value, index) {
                                    if (index != stringArray.length - 1) {
                                        beforeFullPath = beforeFullPath.concat(value + "/");
                                    } else {
                                        beforeFullPath = beforeFullPath.concat(value.replace(ele.namePascalCase, namePascalCase));
                                    }
                                })
                                codeObj.beforeFullPath = beforeFullPath;
                            }
                        }
                        if (ele.boundedContext || options.forEach == "BoundedContext") {
                            if (options.forEach == "BoundedContext") {
                                if (ele.oldName != undefined)
                                    if (ele.name != ele.oldName) {
                                        codeObj.beforeFullPath = fullPath.replace(ele.name, ele.oldName);
                                    }
                            } else if (ele.boundedContext) {
                                if (ele.boundedContext.oldName != undefined) {
                                    if (codeObj.beforeFullPath) {
                                        codeObj.beforeFullPath = codeObj.beforeFullPath.replace(ele.boundedContext.name, ele.boundedContext.oldName)
                                    } else {
                                        codeObj.beforeFullPath = codeObj.fullPath.replace(ele.boundedContext.name, ele.boundedContext.oldName)
                                    }
                                }
                            }
                        }
                        // treeLists beforeFullPath 포함.
                        // fullValue.beforeFullPath = fullValue.beforeFullPath ? fullValue.beforeFullPath : null
                        // me.getCodeList.push(codeValue)
                        // me.fullPathList.push(fullValue)
                        // me.$set(me.newTreeHashLists, sourceHash, fullPath)
                        // if(me.templateResultPath && me.filteredOpenCode && me.filteredOpenCode[0]){
                        //     if((me.filteredOpenCode[0].fullPath && me.filteredOpenCode[0].fullPath == codeObj.fullPath) || (me.filteredOpenCode[0].path && me.filteredOpenCode[0].path == codeObj.path)){
                        //         var selectedRef = me.filteredPrettierCodeLists.find(x => x.fullPath == me.filteredOpenCode[0].fullPath)
                        //         if(!selectedRef){
                        //             selectedRef = me.filteredPrettierCodeLists.find(x => x.path == me.filteredOpenCode[0].path)
                        //         } 
                        //         me.openCode[0].code = selectedRef.code
                        //         me.editModeResultViewerRenderKey++;
                        //     }
                        // }
                        if (me.ideWindow) {
                            console.log("canvas code");
                            var projectId;
                            if (me.information && me.information.projectId) {
                                projectId = me.information.projectId;
                            } else {
                                projectId = me.params.projectId;
                            }
                            var message = {
                                "message": "code",
                                "type": "update",
                                "path": projectId + "/" + codeObj.fullPath,
                                "content": codeObj.code,
                            }
                            if (codeObj.beforeFullPath) {
                                message.beforePath = projectId + "/" + codeObj.beforeFullPath;
                            }
                            // if (me.fullPathList.length == 1) {
                            if (me.codeLists.length == 1) {
                                message.start = true
                            }
                            if (options.mergeType) {
                                message.mergeType = options.mergeType
                            }
                            me.ideWindow.postMessage(message);
                        }
                    }
                    if(me.editTemplateFrameWorkList[template] && me.editTemplateFrameWorkList[template][frameWorkelement]){
                        if(me.editTemplateFrameWorkList[template][frameWorkelement].failedGenerate == true){
                            me.editTemplateFrameWorkList[template][frameWorkelement].failedGenerate = false
                            me.editTemplateFrameWorkList[template][frameWorkelement].errorMessage = null
                            if(me.editTemplateFrameWorkList[template][frameWorkelement].isEditted == true){
                                me.editTemplateFrameWorkList[template][frameWorkelement].isFixed = true
                                me.editTemplateFrameWorkList[template][frameWorkelement].isEditted = false
                            } 
                        }
                    }

                    if(!(me.openCode && me.openCode[0]) && me.opennedTemplateFramework && me.opennedTemplateFramework[0]){
                        if(me.opennedTemplateFramework[0].templatePath == codeObj.templatePath || me.opennedTemplateFramework[0].path == codeObj.templatePath){
                            me.opennedTemplateFramework[0].templateErrMsg = null 
                            me.setTemplateResult(codeObj.templatePath)
                        }
                    }

                } catch (e) {
                    var filePath = processContext.element
                    var template = processContext.template
                    // var code = originContent
                    var fileName = filePath.split('/')
                    var subFileName = filePath.replace(fileName.at(-1), "")
                    console.log(filePath, ": ", e)
                    var elementObj =
                        {
                            'code' : frameWork,
                            'failedGenerate': true,
                            'isFixed': false,
                            'errorMessage': e.message,
                            'element': [
                                {
                                    'templatePath': filePath,
                                    'computedFileName': fileName.at(-1),
                                    'computedSubFileName': subFileName ? subFileName : null,
                                    'code': frameWork,
                                    'template': template
                                }
                            ]
                        }
                    if(localStorage.getItem("editTemplateList") && me.firstSetEditTemplateList){
                        var CircularJSON = require('circular-json');
                        var obj = CircularJSON.parse(localStorage.getItem("editTemplateList"));
                        if(obj && obj.projectId == me.modelingProjectId){
                            me.editTemplateFrameWorkList = obj.editTemplateList
                        }
                        me.firstSetEditTemplateList = false
                    }
                    if( !(me.editTemplateFrameWorkList[template] && me.editTemplateFrameWorkList[template][frameWorkelement]) ){
                        if(!me.editTemplateFrameWorkList[template]) {
                            me.editTemplateFrameWorkList[template] = {}
                        }
                        me.$set(me.editTemplateFrameWorkList[template], filePath, elementObj)
                    } else {
                        me.editTemplateFrameWorkList[template][frameWorkelement].errorMessage = e.message
                    }

                    me.$set(me.editTemplateFrameWorkList[template], filePath, elementObj);
                    
                    if(fullPath){
                        if(!me.errTempResultList[template]){
                            me.errTempResultList[template] = {}
                        } 
                        if(!me.errTempResultList[template][filePath]){
                            me.errTempResultList[template][filePath] = {}
                        } 
                        me.errTempResultList[template][filePath][fullPath] = e.message
                        console.log(fullPath, e.message)
                    }
                    if(me.openCode && me.openCode[0]){
                        if(filePath == me.openCode[0].templatePath){
                            me.setTemplateResult(filePath)
                        }
                    }
                }
            },
            showIntroduceK8sCodeViewer(){
                let me = this

                if(me.embeddedK8s){
                    if(me.treeLists){
                        me.openCode = [];
                        me.treeLists.forEach(function (obj) {
                            obj.children.forEach(function (obj2) {
                                if(obj2.name=='docs'){
                                    obj2.children.forEach(function (obj3) {
                                        if(obj3.path.includes('introduce.md')){
                                            me.openCode.push(obj3);
                                            return false;
                                        }
                                    });
                                }
                            });
                        });
                    }
                }
            }

        }
    }
</script>
<style>
</style>