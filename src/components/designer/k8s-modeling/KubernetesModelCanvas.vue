<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="page">
        <separate-panel-components
                :min="mainSeparatePanel.min"
                :max="mainSeparatePanel.max"
                :triggerLength="5"
                :paneLengthPercent.sync="mainSeparatePanel.current"
                @close="closeSeparatePanel()"
                :inBoundSeparatePanel="false"
        >
            <template v-slot:one>
                <div style="width: 100%; height: 100%;">
                    <div class="canvas-panel" style="left: 0">
                        <v-overlay v-if="showOverlay">
                            <v-col align="center">
                                <div>{{ showOverlay }}</div>
                                <v-progress-circular indeterminate size="64">
                                    <v-btn text @click="closeOverlay()"></v-btn>
                                </v-progress-circular>
                            </v-col>
                        </v-overlay>

                        <v-layout right>
                            <opengraph ref="opengraph"
                                    :width=100000 :height=100000
                                    :sliderLocationScale=sliderLocationScale
                                    focus-canvas-on-select wheelScalable :labelEditable="true"
                                    :dragPageMovable="dragPageMovable" :enableContextmenu="false"
                                    :automaticGuidance="automaticGuidance"
                                    :enableRootContextmenu="false"
                                    :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                                    :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" :enableHotkeyCtrlD="false"
                                    :enableHotkeyCtrlG="false" :slider="true"
                                    :movable="!isReadOnlyModel"
                                    :resizable="!isReadOnlyModel"
                                    :selectable="true"
                                    :connectable="!isReadOnlyModel"
                                    v-if="value"
                                    :autoSliderUpdate="true"
                                    :imageBase="imageBase"
                                    v-on:update:sliderLocationScale="sliderLocationScale = $event"
                                    v-on:connectShape="onConnectShape"
                                    v-on:canvasReady="bindEvents"   
                        >
                                <!-- elements -->
                                <div v-if="value.elements && typeof value.elements == 'object'">
                                    <div v-for="elementId in Object.keys(value.elements)" :key="elementId">
                                        <component
                                                v-if="elementId && value.elements[elementId]"
                                                :is="getComponentByClassName(value.elements[elementId]._type)"
                                                :value.sync="value.elements[elementId]"
                                                :ref="elementId"
                                        ></component>
                                    </div>
                                </div>

                                <!-- relations -->
                                <div v-if="value.relations && typeof value.relations == 'object'">
                                    <div v-for="relationId in Object.keys(value.relations)" :key="relationId">
                                        <component
                                                v-if="relationId && value.relations[relationId]"
                                                :is="getComponentByClassName(value.relations[relationId]._type)"
                                                :value.sync="value.relations[relationId]"
                                                :ref="relationId"
                                        ></component>
                                    </div>
                                </div>
                            </opengraph>

                            <div>
                                <v-row class="gs-modeling-undo-redo k8s-modeling-undo-redo">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn class="gs-model-z-index-2 gs-undo-opacity-hover" 
                                                    :disabled="checkUndo"
                                                    text
                                                    small
                                                    right
                                                    @click.native="undo()"
                                                    v-on="on"
                                            >
                                                <v-icon medium>mdi-undo</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Undo</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-btn class="gs-model-z-index-2 gs-redo-opacity-hover" 
                                                    :disabled="checkRedo"
                                                    text
                                                    small
                                                    right
                                                    @click.native="redo()"
                                                    v-on="on"
                                            >
                                                <v-icon medium>mdi-redo</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Redo</span>
                                    </v-tooltip>
                                </v-row>
                            </div>

                            <div v-if="embedded" style="justify:end; align:start;">
                                <v-row justify="end" align="start">
                                    <v-btn
                                        style="position: absolute; top:26px; right: 60px;"
                                        color="orange"
                                        @click="openCommandViewer()"
                                        v-on="on"
                                        small
                                        text
                                    >
                                        <v-icon>mdi-code-greater-than</v-icon>
                                        <div>KUBECTL</div>
                                    </v-btn>
                                </v-row>
                            </div>

                            <div v-if="!embedded" style="margin: 0 auto">
                                <slot name="top">
                                    <v-row>
                                        <v-row class="gs-model-z-index-1 k8s-is-mobile-project-name"
                                                style="margin: 5px 5px 0px 0px;
                                                    height: 64px;
                                                    max-width: 200px;
                                                    background-color: transparent;"
                                        >
                                            <v-text-field class="k8s-modeling-project-name"
                                                    label="Project Name"
                                                    v-model="projectName"
                                                    :disabled="readOnly"
                                                    dense
                                            ></v-text-field>
                                        </v-row>

                                        <!-- 웹페이지 버튼들 -->
                                        <div class="gs-model-z-index-1 k8s-is-not-mobile"
                                                style="margin: 40px 0px 0px 15px;"
                                        >
                                            <v-row justify="end"
                                                    align="start"
                                                    style="margin-right: 15px"
                                            >
                                                <v-menu 
                                                        class="pa-2"
                                                        offset-y
                                                        open-on-hover
                                                        left
                                                >
                                                    <template v-slot:activator="{ attrs, on }">
                                                        <v-btn text
                                                                style="margin-right: 5px; margin-top: 15px;"
                                                                color="primary"
                                                                class="white--text k8s-hide-cluster-btn"
                                                                v-bind="attrs"
                                                                v-on="on"
                                                        >
                                                            <div v-if="loadTerminal">
                                                                <v-progress-circular
                                                                        indeterminate
                                                                        color="primary"
                                                                ></v-progress-circular>
                                                            </div>
                                                            <v-icon>mdi-server-network</v-icon>
                                                            <div class="k8s-hide-cluster" v-if="!loadTerminal">
                                                                {{ clusterInfo.name ? clusterInfo.name : "Cluster" }}
                                                            </div>
                                                        </v-btn>
                                                    </template>

                                                    <v-list>
                                                        <v-list-item v-for="(item, index) in clusterItems"
                                                                    :key="index"
                                                                    @click="functionCluster(item.title,index)"
                                                        >
                                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>
                                                
                                                <v-menu offset-y
                                                        open-on-hover
                                                        left
                                                >
                                                    <template v-slot:activator="{ attrs, on }">
                                                        <v-btn text
                                                                style="margin-right: 5px; margin-top: 15px;"
                                                                color="primary"
                                                                class="white--text k8s-hide-reverse-btn"
                                                                v-bind="attrs"
                                                                v-on="on"
                                                        >
                                                            <v-icon>mdi-cached</v-icon>
                                                            <div class="k8s-hide-reverse">Reverse</div>
                                                        </v-btn>
                                                    </template>
                                                    <v-list>
                                                        <v-list-item v-for="(item, index) in reverseItems"
                                                                    :key="index"
                                                                    @click="functionReverse(item.title,index)"
                                                        >
                                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>

                                                <v-menu offset-y
                                                        open-on-hover
                                                        left
                                                >
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn class="k8s-hide-gitops-btn"
                                                                text
                                                                style="margin-right: 5px;margin-top: 15px;"
                                                                color="orange"
                                                                dark
                                                                @click="getArgoSetting"
                                                                v-on="on"
                                                        >
                                                            <Icon class="gs-icon-style"
                                                                    icon="icomoon-free:git"
                                                                    style="margin-right: 2px; height: 22px; width: 22px"
                                                            />
                                                            <div class="k8s-hide-gitops">GITOPS</div>
                                                        </v-btn>
                                                    </template>
                                                    <v-list>
                                                        <v-list-item v-for="(item, index) in gitOpsItems"
                                                                :key="index"
                                                                @click="functionSelect(item.title)"
                                                        >
                                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                            <v-icon v-if="item.check" 
                                                                    color="green"
                                                                    style="margin-left: 5px;"
                                                            >
                                                                mdi-check-decagram
                                                            </v-icon>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>

                                                <v-menu offset-y
                                                        open-on-hover
                                                        left
                                                >
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn class="k8s-hide-save-btn"
                                                                text
                                                                style="margin-right: 5px; margin-top: 15px;"
                                                                color="primary"
                                                                dark
                                                                @click="saveComposition('save')"
                                                                v-on="on"
                                                        >
                                                            <v-icon>{{ icon.save }}</v-icon>
                                                            <div class="k8s-hide-save">SAVE</div>
                                                        </v-btn>
                                                    </template>
                                                    <v-list>
                                                        <v-list-item v-for="(item, index) in saveItems"
                                                                :key="index"
                                                                @click="functionSelect(item.title,index)"
                                                        >
                                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>
                                                
                                                <v-menu offset-y
                                                        open-on-hover
                                                        left
                                                >
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn class="k8s-hide-code-btn"
                                                                text
                                                                style="margin-right: 5px;margin-top: 15px;"
                                                                color="orange" dark
                                                                @click="openCodeViewer()"
                                                                v-on="on"
                                                        >
                                                            <v-icon> {{ icon.code }}</v-icon>
                                                            <div class="k8s-hide-code">CODE</div>
                                                        </v-btn>
                                                    </template>
                                                    <v-list>
                                                        <v-list-item v-for="(item, index) in codeItems"
                                                                :key="index"
                                                                @click="functionSelect(item.title)"
                                                        >
                                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                        </v-list-item>
                                                    </v-list>
                                                </v-menu>
                                            </v-row>
                                        </div>
                                        <!-- 웹페이지 버튼들 끝 -->
                                    </v-row>
                                </slot>

                                <div class="k8s-is-mobile">
                                    <v-speed-dial
                                            v-model="fab"
                                            style="position:fixed; bottom:50px; right:50px;"
                                    >
                                        <template v-slot:activator>
                                            <v-btn v-model="fab"
                                                    color="blue darken-2"
                                                    dark
                                                    fab
                                                    small
                                            >
                                                <v-icon v-if="fab">
                                                    mdi-playlist-remove
                                                </v-icon>
                                                <v-icon v-else>
                                                    mdi-playlist-check
                                                </v-icon>
                                            </v-btn>
                                        </template>
                                        <v-row class="k8s-mobile-action-btn">
                                            <v-menu v-if="!parents"
                                                    style="margin: 0px !important;"
                                                    offset-y
                                            >
                                                <template v-slot:activator="{ attrs, on }">
                                                    <v-btn small
                                                            color="primary"
                                                            class="white--text"
                                                            v-bind="attrs"
                                                            v-on="on"
                                                            text
                                                    >
                                                        <div v-if="loadTerminal">
                                                            <v-progress-circular
                                                                    indeterminate
                                                                    color="primary"
                                                            ></v-progress-circular>
                                                        </div>
                                                        <v-icon>mdi-server-network</v-icon>
                                                        <div v-if="!loadTerminal">
                                                            {{ clusterInfo.name ? clusterInfo.name : "Cluster" }}
                                                        </div>
                                                    </v-btn>
                                                </template>

                                                <v-list>
                                                    <v-list-item>
                                                        <v-list-item-title @click="openTerminal">
                                                            Terminal
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item>
                                                        <v-list-item-title @click="deployDialog=true">
                                                            Sync
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item>
                                                        <v-list-item-title @click="clusterDialog=true">
                                                            Cluster
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>

                                            <v-menu v-if="!parents"
                                                    style="margin: 0px !important;"
                                                    open-on-hover offset-y
                                            >
                                                <template v-slot:activator="{ attrs, on }">
                                                    <v-btn
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            color="primary"
                                                            class="white--text"
                                                            v-bind="attrs"
                                                            v-on="on"
                                                            small
                                                            text
                                                    >
                                                        <v-icon>mdi-cached</v-icon>
                                                        <div>Reverse</div>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item>
                                                        <v-list-item-title @click="drawFromCluster()">
                                                            From Cluster
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                    <v-list-item>
                                                        <v-list-item-title @click="yamlModalShow()">
                                                            From Local
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>

                                            <v-menu style="margin: 0px !important;"
                                                    open-on-hover offset-y
                                            >
                                                <template v-slot:activator="{ on }">
                                                    <v-btn
                                                            style="margin-right: 5px;margin-top: 15px;"
                                                            color="orange"
                                                            @click="openCodeViewer()"
                                                            v-on="on"
                                                            small
                                                            text>
                                                        <v-icon> {{ icon.code }}</v-icon>
                                                        CODE
                                                    </v-btn>
                                                </template>
                                                <v-list v-if="!parents">
                                                    <v-list-item v-for="(item, index) in codeItems"
                                                            :key="index"
                                                            @click="functionSelect(item.title)"
                                                    >
                                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-menu v-if="!parents"
                                                    style="margin: 0px !important;"
                                                    open-on-hover offset-y
                                            >
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-on="on"
                                                            style="margin-right: 5px;margin-top: 15px;"
                                                            color="orange"
                                                            @click="openCodeViewer()"
                                                            small
                                                            text
                                                    >
                                                        <div v-if="gitOpsLoading">
                                                            <v-progress-circular
                                                                    indeterminate
                                                                    color="primary"
                                                            ></v-progress-circular>
                                                        </div>
                                                        <div v-else>
                                                            <Icon class="gs-icon-style"
                                                                    icon="icomoon-free:git"
                                                                    style="height: 22px; width: 22px; vertical-align: middle;"
                                                            />
                                                            GITOPS
                                                        </div>
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item v-for="(item, index) in codeItems"
                                                            :key="index"
                                                            @click="functionSelect(item.title)"
                                                    >
                                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-menu v-if="!parents"
                                                    style="margin: 0px !important;"
                                                    open-on-hover offset-y
                                            >
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-if="readOnly"
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            color="primary"
                                                            @click="saveComposition('fork')"
                                                            small
                                                            text
                                                    >
                                                        <v-icon>{{ icon.fork }}</v-icon>
                                                        FORK
                                                    </v-btn>
                                                    <v-btn v-else
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            color="primary"
                                                            @click="saveComposition('save')"
                                                            v-on="on"
                                                            small
                                                            text
                                                    >
                                                        <v-icon>{{ icon.save }}</v-icon>
                                                        SAVE
                                                    </v-btn>
                                                </template>
                                                <v-list>
                                                    <v-list-item v-for="(item, index) in saveItems"
                                                            :key="index"
                                                            @click="functionSelect(item.title,index)"
                                                    >
                                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-menu  v-if="isOwnModel && isServerModel && !isReadOnlyModel && !parents"
                                                    class="pa-2"
                                                    offset-y
                                                    open-on-hover
                                                    left
                                            >
                                                <template v-slot:activator="{ on }">
                                                    <v-btn
                                                            text
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            color="primary"
                                                            v-on="on"
                                                            @click="openInviteUsers()"
                                                    >
                                                        <v-icon>{{ icon.share }}</v-icon>
                                                        SHARE
                                                    </v-btn>
                                                </template>
                                            </v-menu>
                                        </v-row>
                                    </v-speed-dial>
                                </div>
                            </div>

                            <v-card class="tools" style="top:100px; text-align: center;">
                                <v-tooltip v-for="(category, categoryIndex) in elementTypes"
                                        :key="categoryIndex"
                                        right 
                                >
                                    <template v-slot:activator="{ on }">
                                        <span @mouseover="changeCategory(categoryIndex)"
                                                :_component="category[0].component"
                                                :_width="category[0].width"
                                                :_height="category[0].height"
                                                :_description="category[0].description"
                                                :_label="category[0].label"
                                        >
                                            <img height="30px" width="30px" :src="category[0].src" v-on="on">
                                        </span>
                                    </template>
                                    <span>{{ category[0].component }}</span>
                                </v-tooltip>
                            </v-card>

                            <div v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">
                                <div v-if="selectedCategoryIndex == categoryIndex">
                                    <v-tooltip right v-for="(item, key) in category" :key="key">
                                        <template v-slot:activator="{ on }" v-if="key>0">
                                            <span class="draggable"
                                                    :_component="item.component"
                                                    :_width="item.width"
                                                    :_height="item.height"
                                                    :_description="item.description"
                                                    :_label="item.label"
                                                    :style="toolStyle(key, categoryIndex, category.length)"
                                                    @click="item.x = 500 + Math.random()*200; item.y=280 + Math.random()*150; addElement(item)"
                                            >
                                                <img valign="middle" style="vertical-align:middle; border: 2 solid grey; -webkit-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);" onmouseover="this.height=this.height*1.5;this.width=this.width*1.5;this.left=this.left-this.width*0.5;this.right=this.right-this.width*0.5;" onmouseout="this.height=this.height/1.5;this.width=this.width/1.5;this.left=this.left+this.width*0.5;this.right=this.right+this.width*0.5;" height="40px" width="40px" :src="item.src" v-on="on" border=2>
                                                <v-chip v-on="on">{{item.label}}</v-chip>
                                            </span>
                                        </template>

                                        <v-card class="mx-auto"
                                                max-width="400"
                                                max-height="400"
                                                outlined
                                        >
                                            <v-list-item three-line>
                                                <v-list-item-content>
                                                    <div class="overline mb-4">
                                                        {{category[0].label}}
                                                    </div>

                                                    <v-list-item-title class="headline mb-1">
                                                        {{item.label}}
                                                    </v-list-item-title>
                                                    
                                                    <v-list-item-subtitle>
                                                        {{item.description}}
                                                    </v-list-item-subtitle>
                                                </v-list-item-content>

                                                <v-list-item-avatar tile
                                                        size="80"
                                                        color="white"
                                                >
                                                    <v-img :src="item.src"></v-img>
                                                </v-list-item-avatar>
                                            </v-list-item>
                                        </v-card>
                                    </v-tooltip>
                                </div>
                            </div>
                        </v-layout>

                        <modal name="codeModal" :height='"auto"' :width="'80%'" scrollable>
                            <v-card flat>
                                <v-card-title class="d-flex">
                                    <span class="headline">Code Preview</span>
                                    <v-btn x-small
                                            icon
                                            @click="codePreviewLeftReSize()"
                                            class="code-preview-left-re-size-btn ml-2"
                                    >
                                        <v-icon>mdi-menu</v-icon>
                                    </v-btn>
                                    <v-select
                                            v-model="template"
                                            :items="templateTypes"
                                            label="Select Template"
                                            hide-details
                                            class="ml-auto"
                                            style="max-width: 300px;"
                                    ></v-select>
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="width: auto; height: auto; margin-bottom:-40px;">
                                    <v-row class="mb-6" no-gutters>
                                        <v-col id="scroll-target"
                                                style="border-right: 1px solid black; max-height: 550px; display: flex !important;"
                                                class="overflow-auto code-preview-left-re-size"
                                        >
                                            <v-treeview
                                                    :items.sync='treeList'
                                                    :active.sync="openCode"
                                                    activatable
                                                    item-key="key"
                                                    return-object
                                                    open-all
                                                    :transition="treeOpen"
                                                    open-on-click
                                                    dense
                                                    style="text-overflow: clip !important; width:600px;"
                                            >
                                                <template v-slot:prepend="{ item, open }">
                                                    <v-icon v-if="!item.file">
                                                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                                                    </v-icon>
                                                    <v-icon v-else>
                                                        {{ icon[item.file] }}
                                                    </v-icon>
                                                </template>
                                            </v-treeview>
                                        </v-col>
                                        <v-col>
                                            <code-viewer
                                                    v-if="diffCheck"
                                                    :diff-value="existYaml"
                                                    v-model="openCode"
                                                    :type="'diff'"
                                                    :create-value="existYaml"
                                                    @update="updatePathTmp"
                                                    style="padding: 0 !important;"
                                            ></code-viewer>
                                            <code-viewer
                                                    v-else-if="codeView"
                                                    v-model="openCode"
                                                    style="padding: 0 !important;"
                                            ></code-viewer>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text
                                            color="primary" 
                                            @click="endDiffCheck()"
                                    >
                                        확인
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </modal>

                        <v-snackbar v-model="snackbar.show"
                                :color="snackbar.color" 
                                :multi-line="snackbar.mode === 'multi-line'"
                                :timeout="snackbar.timeout"
                                :vertical="snackbar.mode === 'vertical'"
                        >
                            <template v-slot:action="{ attrs }">
                                <div>{{ snackbar.text }}</div>
                                <v-btn dark
                                        v-bind="attrs"
                                        class="mx-2"
                                        @click="snackbar.show = false"
                                >
                                    Close
                                </v-btn>
                            </template>
                        </v-snackbar>

                        <v-dialog v-model="generateZipDialog" max-width="290">
                            <v-card>
                                <v-card-title class="headline">Generate Zip Archive</v-card-title>
                                <v-card-text>
                                    <v-select
                                            :items="templateTypes"
                                            v-model="template"
                                            label="Select Template"
                                            hide-details
                                            class="pa-0"
                                    ></v-select>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <div v-if="!isDownloading">
                                        <v-btn text @click="generateZipDialog = false">Cancel</v-btn>
                                        <v-btn color="primary" text @click="generateZip()">Download</v-btn>
                                    </div>
                                    <v-progress-circular
                                            v-else
                                            indeterminate
                                            color="primary"
                                    ></v-progress-circular>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-dialog v-model="deployDialog" max-width="350">
                            <v-card>
                                <v-card-title class="headline">Deploy</v-card-title>
                                <v-card-text>
                                    <v-text-field
                                            label="cluster"
                                            v-model="clusterInfo.name"
                                    ></v-text-field>
                                    <v-text-field
                                            label="API Server"
                                            v-model="clusterInfo.apiServer"
                                    ></v-text-field>
                                    <v-text-field
                                            label="Namespace"
                                            v-model="clusterInfo.namespace"
                                    ></v-text-field>
                                    <div class="subtitle">Namespace 미 입력시 default로 설정됩니다.</div>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="red darken-1" text @click="deployDialog = false">Cancel</v-btn>
                                    <v-btn color="green darken-1" text @click="deployReady()">Deploy</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-dialog v-model="clusterDialog"
                                persistent
                                fullscreen
                                hide-overlay 
                                transition="dialog-bottom-transition"
                        >
                            <v-card>
                                <v-toolbar dark color="primary">
                                    <v-toolbar-title>Manage Clusters</v-toolbar-title>
                                    <v-spacer></v-spacer>
                                    <v-toolbar-items>
                                        <v-btn icon dark @click="clusterDialog = false">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-toolbar-items>
                                </v-toolbar>
                                <v-list three-line subheader>
                                    <v-list-item>
                                        <v-list-item-content>
                                            <clusters @close="clusterDialog = false" v-model="clusterInfo"/>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-dialog>

                        <v-dialog v-model="commandDialog" max-width="700">
                            <v-card>
                                <v-card-title>
                                    <v-tabs v-model="commandTab" class="mx-auto">
                                        <v-tab v-for="tab in commandTabs" :key="tab">{{ tab }}</v-tab>
                                    </v-tabs>
                                </v-card-title>
                                <v-card-text class="px-5 py-2">
                                    <div v-for="(obj, idx) in commandList" :key="idx">
                                        <v-text-field
                                                v-if="commandTabs[commandTab].includes(obj.label)"
                                                :value="obj.command"
                                                :label="obj.label"
                                                readonly outlined
                                                append-icon="mdi-content-copy"
                                                :id="'copyCommand'+idx"
                                                @click:append="commandCopy(obj.command, idx)"
                                                style="max-height: 65px;"
                                        ></v-text-field>
                                        <div v-if="commandTabs[commandTab].includes(obj.label)"
                                                style="margin-bottom: 10px; padding-left: 490px;"
                                        >
                                            <v-btn @click="runCommand(obj.command)"
                                                    color="primary"
                                                    text
                                            >
                                                Run in terminal
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn @click="commandDialog = false"
                                            color="primary"
                                            text
                                    >
                                        Close
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <modal name="yamlModal" :height='"auto"' :width="'80%'" style="overflow: scroll">
                            <v-card flat>
                                <v-card-title style="position: sticky">
                                    <v-col :col="8">
                                        <span class="headline">From Local YAML</span>
                                    </v-col>
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-card-text style="width: auto; height: auto;">
                                    <local-yaml-editor
                                            v-model="localYamlText"
                                            style="width: 100%; height: 100%"
                                    ></local-yaml-editor>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <!-- <text-reader :label="'Upload File'"
                                                :fileName.sync="fileName"
                                                :plainText.sync="localYamlText"
                                                :importType="'yaml'"
                                                @load="loadYaml($event)"
                                                class="v-btn v-btn--contained v-size--default"
                                                style="color:#1976d2; background:none; border-radius:none;"
                                    ></text-reader> -->
                                    <v-btn text color="primary" @click.prevent="drawFromYaml">
                                        <div v-if="reverseYaml">
                                            <v-progress-circular
                                                    indeterminate
                                                    color="primary"
                                            ></v-progress-circular>
                                        </div>
                                        <div v-else>Reverse</div>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </modal>

                        <!-- search (cmd+p) -->
                        <v-dialog
                                class="v-dialog v-dialog--active"
                                v-model="isSearch"
                                hide-overlay
                                max-width="50%"
                        >
                            <div style="color: gray; font-size: small; margin-left: 5px;"> cmd + p / ctrl + p</div>
                            <v-autocomplete
                                    class="v-input-prepend-outer-prepend-icon"
                                    rounded
                                    v-model="searchKeyword"
                                    :items="mergeElementTypes"
                                    prepend-icon="mdi-magnify"
                                    :filter="customFilter"
                                    item-text="label"
                                    return-object
                                    auto-select-first
                                    autofocus
                                    style="font-size: xx-large;"
                                    @keydown="searchKeyDown"
                            >
                                <template v-slot:item="data">
                                    <template>
                                        <v-list-item-avatar>
                                            <img :src="data.item.src">
                                        </v-list-item-avatar>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                {{ data.item.label }}
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                </template>
                            </v-autocomplete>
                        </v-dialog>

                        <!-- user defined crd dialog -->
                        <v-dialog v-model="definedDialog" max-width="500">
                            <v-card>
                                <v-card-title class="headline">Add CRD</v-card-title>
                                <v-card-text style="overflow: hidden;">
                                    <v-text-field
                                            label="kind"
                                            v-model="definedCrd.kind"
                                            autofocus
                                            :rules="[value => !!value || 'Required.']"
                                    ></v-text-field>
                                    <v-text-field
                                            label="Icon"
                                            v-model="definedCrd.icon"
                                            hint="EX) https://raw.githubusercontent.com/kubernetes/community/master/icons/png/resources/unlabeled/pod-128.png"
                                            :rules="[value => !!value || 'Required.']"
                                    ></v-text-field>
                                    <v-text-field
                                            label="Color"
                                            v-model="definedCrd.color"
                                            :rules="[value => !!value || 'Required.']"
                                    ></v-text-field>
                                    <span>CRD Yaml</span>
                                    <MonacoEditor
                                            v-model="definedCrd.yaml"
                                            class="editor"
                                            theme="vs-dark"
                                            language="yaml"
                                    ></MonacoEditor>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="green darken-1" text @click="addDefinedCrd(definedCrd)">ADD CRD</v-btn>
                                    <v-btn color="red darken-1" text @click="definedDialog = false">Cancel</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <!-- GitOps dialog -->
                        <v-dialog v-model="settingGitInfoDialog">
                            <v-card>
                                <v-card-title>GitOps Configure</v-card-title>
                                <v-card-text>
                                    <v-stepper v-model="step">
                                        <v-stepper-header v-if="checkGitLogin">
                                            <div v-for="(n,idx) in gitSteps" :key="`${idx}-step`">
                                                <v-stepper-step
                                                        :complete="step > idx"
                                                        :step="idx + 1"
                                                >
                                                    {{ n }}
                                                </v-stepper-step>

                                                <v-divider
                                                        v-if="idx !== step"
                                                        :key="n"
                                                ></v-divider>
                                            </div>
                                        </v-stepper-header>
                                        <!-- Google -->
                                        <v-stepper-header v-else>
                                            <div v-for="(n, idx) in googleSteps" :key="`${idx}-step`">
                                                <v-stepper-step
                                                        :complete="step > idx"
                                                        :step="idx + 1"
                                                >
                                                    {{ n }}
                                                </v-stepper-step>
                                                <v-divider
                                                        v-if="idx < googleSteps.length-1"
                                                        :key="idx"
                                                ></v-divider>
                                            </div>
                                        </v-stepper-header>
                                        <!-- GitHub Login -->
                                        <v-stepper-items v-if="checkGitLogin">
                                            <v-stepper-content step="1">
                                                <v-select
                                                        width="100%"
                                                        v-model="argoServerInfo"
                                                        :items="argoServerLists"
                                                        :item-text="checkName"
                                                        item-value="namespace"
                                                        return-object
                                                        label="Argo Server"
                                                        hint="namespace/deployment"
                                                        persistent-hint
                                                ></v-select>
                                                <v-select
                                                        width="100%"
                                                        v-model="argoCdInfo"
                                                        :items="argoCdLists"
                                                        :item-text="checkName"
                                                        item-value="namespace"
                                                        return-object
                                                        label="Argo Server"
                                                        hint="namespace/deployment"
                                                        persistent-hint
                                                ></v-select>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                        color="primary"
                                                        @click="step = step + 1"
                                                >
                                                    Continue
                                                </v-btn>
                                            </v-stepper-content>
                                            <v-stepper-content step="2">
                                                <v-radio-group
                                                        v-model="repositoryType"
                                                        row
                                                >
                                                    <v-radio
                                                            label="url"
                                                            value="url"
                                                    ></v-radio>
                                                    <v-radio
                                                            label="select"
                                                            value="select"
                                                    ></v-radio>
                                                </v-radio-group>
                                                <v-select
                                                        v-if="repositoryType == 'select'"
                                                        :items="repositoryList"
                                                        v-model="gitInfo.url"
                                                        item-text="name"
                                                        item-value="url"
                                                        label="Select Repository"
                                                ></v-select>
                                                <v-text-field
                                                        v-else
                                                        v-model="gitInfo.url"
                                                        label="Repository URL"
                                                ></v-text-field>
                                                <v-spacer></v-spacer>
                                                <v-btn color="primary"
                                                        @click="step = step + 1"
                                                >
                                                    Continue
                                                </v-btn>
                                            </v-stepper-content>
                                            <v-stepper-content step="3">
                                                <v-text-field
                                                        v-model="gitInfo.path"
                                                        label="YAML Path"
                                                ></v-text-field>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                        color="primary"
                                                        @click="getNamespaceList()"
                                                >
                                                    Continue
                                                </v-btn>
                                            </v-stepper-content>
                                            <v-stepper-content step="4">
                                                <v-select
                                                        :items="namespaceList"
                                                        v-model="gitInfo.namespace"
                                                        label="Select Repository"
                                                ></v-select>
                                                <v-spacer></v-spacer>
                                                <v-btn color="green darken-1" 
                                                        text 
                                                        @click="setGitRepository()"
                                                >
                                                    Save
                                                </v-btn>
                                            </v-stepper-content>
                                        </v-stepper-items>
                                        <!-- Google Login -->
                                        <v-stepper-items v-else>
                                            <v-stepper-content step="1">
                                                <v-select
                                                        width="100%"
                                                        v-model="argoServerInfo"
                                                        :items="argoServerLists"
                                                        :item-text="checkName"
                                                        item-value="namespace"
                                                        return-object
                                                        label="Argo Server"
                                                        hint="namespace/deployment"
                                                        persistent-hint
                                                ></v-select>
                                                <v-select
                                                        width="100%"
                                                        v-model="argoCdInfo"
                                                        :items="argoCdLists"
                                                        :item-text="checkName"
                                                        item-value="namespace"
                                                        return-object
                                                        label="Argo Server"
                                                        hint="namespace/deployment"
                                                        persistent-hint
                                                ></v-select>
                                            </v-stepper-content>
                                            <v-stepper-content step="2">
                                                <v-radio-group
                                                        v-model="gitInfo.type"
                                                        row
                                                >
                                                    <v-radio
                                                            label="Github"
                                                            value="github"
                                                    ></v-radio>
                                                    <v-radio
                                                            disabled
                                                            label="Gitlab"
                                                            value="gitlab"
                                                    ></v-radio>
                                                </v-radio-group>
                                                <v-text-field
                                                        v-model="gitInfo.username"
                                                        label="Git Username"
                                                ></v-text-field>
                                                <v-text-field
                                                        v-model="gitInfo.token"
                                                        label="Git AccessToken"
                                                ></v-text-field>
                                                <div class="body-1">
                                                    Github 유저명과, GitAccessToken을 입력하여줍니다.
                                                    자세한 발급 방법은 <a
                                                        href="https://github.com/TheOpenCloudEngine/msaschool/wiki/Github-Personal-Access-Token-%EB%B0%9C%ED%96%89-%EB%B0%A9%EB%B2%95"
                                                        target="_blank">이곳</a>을 참조하세요.
                                                </div>
                                                <div style="margin-top: 15px;">
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                            color="primary"
                                                            @click="getGitRepoList()"
                                                    >
                                                        Continue
                                                    </v-btn>
                                                </div>
                                            </v-stepper-content>
                                            <v-stepper-content step="3">
                                                <v-radio-group
                                                        v-model="repositoryType"
                                                        row
                                                >
                                                    <v-radio
                                                            label="url"
                                                            value="url"
                                                    ></v-radio>
                                                    <v-radio
                                                            label="select"
                                                            value="select"
                                                    ></v-radio>
                                                </v-radio-group>
                                                <v-select
                                                        v-if="repositoryType == 'select'"
                                                        :items="repositoryList"
                                                        v-model="gitInfo.url"
                                                        item-text="name"
                                                        item-value="url"
                                                        label="Select Repository"
                                                ></v-select>
                                                <v-text-field
                                                        v-else
                                                        v-model="gitInfo.url"
                                                        label="Repository URL"
                                                ></v-text-field>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                        color="primary"
                                                        @click="step = step + 1"
                                                >
                                                    Continue
                                                </v-btn>
                                            </v-stepper-content>
                                            <v-stepper-content step="4">
                                                <v-text-field
                                                        v-model="gitInfo.path"
                                                        label="YAML Path"
                                                ></v-text-field>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                        color="primary"
                                                        @click="getNamespaceList()"
                                                >
                                                    Continue
                                                </v-btn>
                                            </v-stepper-content>
                                            <v-stepper-content step="5">
                                                <v-select
                                                        :items="namespaceList"
                                                        v-model="gitInfo.namespace"
                                                        label="Select Repository"
                                                ></v-select>
                                                <v-spacer></v-spacer>
                                                <v-btn color="green darken-1"
                                                        text 
                                                        @click="setGitRepository()"
                                                >
                                                    Save
                                                </v-btn>
                                            </v-stepper-content>
                                        </v-stepper-items>
                                    </v-stepper>
                                </v-card-text>
                            </v-card>
                        </v-dialog>

                        <!-- save dialog -->
                        <model-storage-dialog
                                :condition="storageCondition"
                                :showDialog="showStorageDialog"
                                @save="saveModel"
                                @fork="forkModel"
                                @backup="backupModel"
                                @close="storageDialogCancel"
                        ></model-storage-dialog>

                        <!-- modeler image generateor -->
                        <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
                    </div>
                </div>
            </template>

            <template v-slot:two>
                <kube-code-generator
                        v-model="value"
                        :isOwnModel="isOwnModel"
                        :isServerModel="isServerModel"
                        :projectInformation="information"
                        :projectName="projectName"
                        :modelInitLoad="initLoad"
                        :modelingProjectId="projectId"
                        :asyncCodeForValue="false"
                        :callCodeForValue="changedTemplateCode"
                        :oldTreeHashLists.sync="oldTreeHashLists"
                        :newTreeHashLists.sync="newTreeHashLists"
                        :projectVersion="projectVersion"
                        @changedByMe="settingChangedByMe"
                        @editModelData="editModelData"
                        canvas-name="kubernetes-model-canvas"
                ></kube-code-generator>
            </template>
        </separate-panel-components>
    </div>
</template>

<script>
    import { Octokit } from "@octokit/rest";
    import jsyaml from "js-yaml";
    import json2yaml from 'json2yaml';
    import MonacoEditor from 'vue-monaco';

    var _ = require('lodash');
    var YAML = require('yamljs');
    var JSZip = require('jszip');
    var pluralize = require('pluralize');
    var changeCase = require('change-case');

    import KubeModeling from "./index";
    import ModelCanvas from "../modeling/ModelCanvas";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import SeparatePanelComponents from "../../SeparatePanelComponents";

    export default {
        mixins: [ModelCanvas],
        name: 'kubernetes-model-canvas',
        components: {
            MonacoEditor,
            ModelStorageDialog,
            SeparatePanelComponents,
        },
        data() {
            return {
                codePreviewLeftReSizeNumber: null,
                gitOpsLoading: false,
                namespaceList: [],

                // command
                commandDialog: false,
                commandList: [],
                commandTab: 0,
                commandTabs: [
                    "Create/Apply",
                    "Get",
                    "Delete",
                    "Describe",
                    "Port-forward",
                    "Logs"
                ],

                tempValue: [],
                selectedElements: [],
                tmpTreeList: [],
                diffCheck: false,
                existYaml: [],
                settingGitInfoDialog: false,
                gitInfo: {
                    name: "",
                    url: "",
                    type: "github",
                    token: "",
                    namespace: "",
                    path: ""
                },
                step: 1,
                repositoryType: "url",
                gitSteps: [
                    "Select Repo", 
                    "YAML Folder Path", 
                    "Select Namespace"
                ],
                googleSteps: [
                    "Setting Github Personal Token",
                    "Input GitRepo URL",
                    "YAML Folder Path",
                    "Select Namespace"
                ],
                fab: false,
                fileName: '',
                importFile: false,
                localYamlText: "",
                yamlPanel: false,
                reverseYaml: false,
                
                // user defined crd
                userDefinedCRD: [],
                definedDialog: false,
                definedCrd: {
                    kind: "",
                    icon: "",
                    color: "",
                    yaml: ""
                },

                // clusters
                clusterInfo: {},
                clusterDialog: false,
                clusterItems: [
                    {title: 'Terminal'},
                    {title: 'Sync'},
                    {title: 'Cluster'}
                ],

                // search
                isSearch: false,
                searchKeyword: '',
                
                // save
                saveItems: [
                    {title: 'Save to Server'},
                    {title: 'Download model File'},
                    {title: 'Duplicate'},
                ],
                generateZipDialog: false,
                isDownloading: false,

                // reverse
                reverseItems: [
                    {title: 'From Cluster'},
                    {title: 'From Local'},
                ],

                // code view
                codeView: false,
                codeItems: [
                    {title: 'Code Preview'},
                    {title: 'Download Archive'},
                ],

                // gitOps
                gitOpsItems: [
                    {title: "Git Configure", check: false},
                    {title: "Sync"},
                    {title: "Argo DashBoard"}
                ],

                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',

                // snackbar options
                snackbar: {
                    show: false,
                    color: 'error',
                    mode: 'multi-line',
                    timeout: 6000,
                    text: '',
                },

                // terminal
                loadTerminal: false,
                
                // data structure
                treeList: [],
                openCode: [],
                template: 'Separate File',
                templateTypes: [ 'Separate File', 'Single File', 'Separate File per kind', 'Helm' ],
                treeOpen: true,
                
                // deploy
                deployDialog: false,
                deployRes: '',
                
                // param
                params: null,
                parmType: '',
                parmProjectId: '',
                parmUid: '',
                
                // argo
                argoServerInfo: undefined,
                argoCdInfo: undefined,
                argoDialog: false,
                argoServerLists: [],
                argoCdLists: [],
                argoUrl: undefined,
                argoCdUrl: undefined,
                
                //helm chart
                chartJson: {},
                valuesYaml: '',
                
                selectedCategoryIndex: null,

                // command
                commandDialog: false,
                commandList: [],
                commandTab: 0,
                commandTabs: ['Create/Apply', 'Get', 'Delete', 'Describe', 'Port-forward', 'Logs'],
                

                elementTypes: [
                    [
                        {
                            'component': 'Workload',
                            'label': 'Workload',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`,
                        },
                        {
                            'component': 'namespace',
                            'label': 'Namespace',
                            'width': '400',
                            'height': '400',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ns-palette.svg`,
                            'description': 'Kubernetes supports multiple virtual clusters backed by the same physical cluster. These virtual clusters are called namespaces.'
                        },
                        {
                            'component': 'deployment',
                            'label': 'Deployment',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/deploy-palette.svg`,
                            'description': 'A Deployment provides declarative updates for Pods ReplicaSets. You describe a desired state in a Deployment, and the Deployment Controller changes the actual state to the desired state at a controlled rate. You can define Deployments to create new ReplicaSets, or to remove existing Deployments and adopt all their resources with new Deployments.'
                        },
                        {
                            'component': 'replicaSet',
                            'label': 'ReplicaSet',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rs-palette.svg`,
                            'description': "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time. As such, it is often used to guarantee the availability of a specified number of identical Pods."

                        },
                        {
                            'component': 'pod',
                            'label': 'Pod',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pod-palette.svg`,
                            'description': "Pods are the smallest deployable units of computing that you can create and manage in Kubernetes."
                        },
                        {
                            'component': 'statefulSet',
                            'label': 'StatefulSet',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sts-palette.svg`,
                            'description': "StatefulSet is the workload API object used to manage stateful applications. Manages the deployment and scaling of a set of Pods, and provides guarantees about the ordering and uniqueness of these Pods."
                        },
                        {
                            'component': 'daemonSet',
                            'label': 'DaemonSet',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ds-palette.svg`,
                            'description': "A DaemonSet ensures that all (or some) Nodes run a copy of a Pod. As nodes are added to the cluster, Pods are added to them. As nodes are removed from the cluster, those Pods are garbage collected. Deleting a DaemonSet will clean up the Pods it created."
                        },
                    ],
                    [
                        {
                            'component': 'Routing',
                            'label': 'Routing',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-palette.svg`
                        },
                        {
                            'component': 'service',
                            'label': 'Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/svc-palette.svg`,
                            'description': "An abstract way to expose an application running on a set of Pods as a network service."
                        },
                        {
                            'component': 'ingress',
                            'label': 'Ingress',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/ing-palette.svg`,
                            'description': "An API object that manages external access to the services in a cluster, typically HTTP. Ingress may provide load balancing, SSL termination and name-based virtual hosting."
                        },
                    ],
                    [
                        {
                            'component': 'Persistence',
                            'label': 'Persistence',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                        },
                        {
                            'component': 'persistentVolume',
                            'label': 'PersistentVolume',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pv-palette.svg`
                        },
                        {
                            'component': 'persistentVolumeClaim',
                            'label': 'PersistentVolumeClaim',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/pvc-palette.svg`
                        },
                        {
                            'component': 'storageClass',
                            'label': 'StorageClass',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sc-palette.svg`
                        },
                    ],
                    [
                        {
                            'component': 'Autoscaler',
                            'label': 'Autoscaler',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/hpa-palette.svg`
                        },
                        {
                            'component': 'horizontalPodAutoscaler',
                            'label': 'Horizontal Pod Autoscaler',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/hpa-palette.svg`
                        }
                    ],
                    [
                        {
                            'component': 'Job',
                            'label': 'Job',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/job-palette.svg`
                        },
                        {
                            'component': 'job',
                            'label': 'Job',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/job-palette.svg`
                        },
                        {
                            'component': 'cronJob',
                            'label': 'CronJob',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cronjob-palette.svg`
                        },
                    ], [
                        {
                            'component': 'Configuration',
                            'label': 'Configuration',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cm-palette.svg`
                        },

                        {
                            'component': 'configMap',
                            'label': 'ConfigMap',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/cm-palette.svg`
                        },
                        {
                            'component': 'secret',
                            'label': 'Secret',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/secret-palette.svg`
                        },
                    ], [
                        {
                            'component': 'Role Based Access Control',
                            'label': 'Role',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/role-palette.svg`
                        },
                        {
                            'component': 'role',
                            'label': 'Role',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/role-palette.svg`
                        },
                        {
                            'component': 'roleBinding',
                            'label': 'RoleBinding',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/rb-palette.svg`
                        },
                        {
                            'component': 'clusterRole',
                            'label': 'ClusterRole',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/c-role-palette.svg`
                        },
                        {
                            'component': 'clusterRoleBinding',
                            'label': 'ClusterRoleBinding',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/crb-palette.svg`
                        },
                        {
                            'component': 'serviceAccount',
                            'label': 'ServiceAccount',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/sa-palette.svg`
                        },
                    ], [
                        {
                            'component': 'Istio',
                            'label': 'Istio',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-gateway.svg`
                        },
                        {
                            'component': 'gateway',
                            'label': 'Gateway',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-gateway.svg`
                        },
                        {
                            'component': 'virtualService',
                            'label': 'VirtualService',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-vsvc.svg`
                        },
                        {
                            'component': "destinationRule",
                            'label': "DestinationRule",
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`
                        },
                        {
                            'component': 'serviceEntry',
                            'label': 'ServiceEntry',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-svcentry.svg`
                        },
                        {
                            'component': 'sidecar',
                            'label': 'Sidecar',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-sidecar.svg`
                        },
                        {
                            'component': 'quota',
                            'label': 'Quota',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                        },
                        {
                            'component': 'rule',
                            'label': 'Rule',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                        },
                        {
                            'component': 'quotaSpec',
                            'label': 'QuotaSpec',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                        },
                        {
                            'component': 'quotaSpecBinding',
                            'label': 'QuotaSpecBinding',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                        },
                        {
                            'component': 'memquota',
                            'label': 'MemQuota',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio.svg`
                        },
                    ], [
                        {
                            'component': 'Knative',
                            'label': 'Knative',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/knative/logo.svg`
                        },
                        {
                            'component': 'knativeService',
                            'label': 'Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/knative/logo.svg`
                        }
                    ],
                    [
                        {
                            'component': 'argo',
                            'label': 'Argo',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'application',
                            'label': 'Application',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'workflow',
                            'label': 'Workflow',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'workflow',
                            'label': 'Workflow - Steps',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'workflow',
                            'label': 'Workflow - Dag',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'rollout',
                            'label': 'Rollout',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'eventSource',
                            'label': 'EventSource',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'sensor',
                            'label': 'Sensor',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        },
                        {
                            'component': 'workflowTemplate',
                            'label': 'WorkflowTemplate',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
                        }
                    ],
                    [
                        {
                            'component': 'User Defined CRD',
                            'label': 'New CRD',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/crd-palette.svg`
                        },
                        {
                            'component': 'customResourceDefinition',
                            'label': 'CustomResourceDefinition',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/crd-palette.svg`
                        },
                        {
                            'component': 'newCrd',
                            'label': 'User Defined CRD',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/data_object.png`
                        },
                    ],
                ],
            }
        },
        computed: {
            parents() {
                if(window.opener) {
                    return true;
                } else {
                    return false;
                }
            },
            checkGitLogin() {
                if (localStorage.getItem('gitAccessToken')) {
                    return true;
                }
                return false;
            },
            mergeElementTypes() {
                var me = this;
                var copyElementTypes = JSON.parse(JSON.stringify(me.elementTypes));
                var filter;
                copyElementTypes.forEach((elementType) => {
                    if (filter) {
                        filter = [...filter, ...elementType];
                    } else {
                        filter = [...elementType];
                    }
                });

                filter = _.filter(filter, function (item) {
                    return item.width;
                });

                return filter;
            },
        },
        created() {
            var me = this;

            try {
                Vue.use(KubeModeling);

                if (!me.embedded) {
                    me.canvasType = 'k8s';
                    me.isQueueModel = true;

                    if (!me.readOnly) {
                        me.isSearch = true;
                    }
                    me.track();
                }
            } catch (e) {
                alert('Error: KubeModelCanvas Created().', e);
            }
        },
        mounted() {
            var me = this;

            if (me.embedded) {
                if (me.localYamlText != "") {
                    me.drawFromYaml();
                } else {
                    me.addRelations();
                }
                me.$emit('input', me.value);
            }

            if (localStorage.getItem("gitAccessToken")) {
                me.gitInfo.token = localStorage.getItem("gitAccessToken");
            }
            if (localStorage.getItem('userDefinedCRD')) {
                me.userDefinedCRD = JSON.parse(localStorage.getItem('userDefinedCRD'));
                me.userDefinedCRD.forEach((crd) => {
                    me.elementTypes[10].push({
                        'component': 'crdTemplate',
                        'label': crd._type,
                        'width': '100',
                        'height': '100',
                        'src': crd.imgSrc,
                        'color': crd.color,
                        'object': crd.object
                    });
                });
            }

            if (localStorage.getItem('kuberToken')) {
                me.clusterInfo = {
                    'name': localStorage.getItem('clusterName'),
                    'clusterAddress': localStorage.getItem('clusterAddress'),
                    'token': localStorage.getItem('kuberToken'),
                    'namespace': localStorage.getItem('namespace')
                };
            }

            $(document).keydown((evt) => {
                if ((evt.metaKey || evt.ctrlKey) && evt.keyCode == 80) {
                    evt.preventDefault();

                    if (me.isSearch) {
                        me.isSearch = false;
                    } else {
                        me.searchKeyword = ''
                        me.isSearch = true;
                    }
                } else if (evt.keyCode == 13) {
                    me.searchKeyDown(evt);
                }

                if (evt.keyCode == 90 && (evt.metaKey || evt.ctrlKey)) {
                    if (evt.shiftKey) {
                        me.redo();
                    } else {
                        me.undo();
                    }
                }
            });
        },
        async beforeDestroy() {
            var me = this;

            clearInterval(me.connetServer);

            var lists = localStorage.getItem('localLists');
            if (lists) {
                lists = JSON.parse(lists);
                var index = lists.findIndex(list => list.projectId == me.params.projectId);
                if (localStorage.getItem(me.params.projectId)) {
                    lists[index].img = resolve;
                    lists[index].projectName = me.projectName;
                } else {
                    lists.splice(index, 1);
                }

                await me.putObject(`localstorage://localLists`, lists);
            }

            localStorage.removeItem('projectId');
            localStorage.removeItem('sharedMultiTimeStamp');
        },
        watch: {
            argoServerInfo: {
                handler(newVal) {
                    var me = this;
                    if (newVal.name && newVal.namespace) {
                        me.clusterItems.forEach((item, idx) => {
                            if (item.title == 'Argo') {
                                me.clusterItems[idx].check = true;
                            }
                        })
                        me.getArgoServerUrl();
                    }
                }
            },
            argoCdInfo: {
                handler(newVal) {
                    var me = this;
                    if (newVal.name && newVal.namespace) {
                        me.clusterItems.forEach((item, idx) => {
                            if (item.title == 'Argo') {
                                me.clusterItems[idx].check = true;
                            }
                        });
                        me.getArgoCdUrl();
                    }
                }
            },
            "value.elements": {
                deep: true,
                handler: _.debounce(function(newVal) {
                    var me = this;
                    var reqUrl = "";
                    if (newVal && !me.embedded) {
                        Object.keys(newVal).forEach(async function(key) {
                            var item = newVal[key];
                            if (item) {
                                if (item._type == "Pod" || item._type == "Deployment" ||
                                        item._type == "ReplicaSet" || item._type == "StatefulSet" ||
                                        item._type == "DaemonSet"
                                ) {
                                    var reqObj = await me.getReqUrl(item);
                                    reqUrl = reqObj.reqUrl + item.object.metadata.name;

                                    if (item.object.metadata.name && item.status) {
                                        me.getStatusData(reqUrl, item);
                                    }
                                }
                            }
                        });
                    }
                }, 4000)
            },
            async template() {
                var me = this;
                me.$nextTick(() => {
                    me.treeOpen = true;
                });
            },
        },
        methods: {
            async postParentWindow() {
                var me = this;
                me.template = "Single File";
                var code = me.treeList[0].code;
                var message = {
                    "message": "updateYaml",
                    "content": code
                };
                window.opener.postMessage(message, "*");
            },
            messageProcessing(e) {
                var me = this;
                if (e.data.message === "syncYaml") {
                    me.localYamlText = e.data.resource;
                    me.drawFromYaml();
                }
            },
            codePreviewLeftReSize() {
                this.codePreviewLeftReSizeNumber++;

                if (this.codePreviewLeftReSizeNumber == 1) {
                    $(".code-preview-left-re-size").css("display", "none");
                } else if (this.codePreviewLeftReSizeNumber == 2) {
                    $(".code-preview-left-re-size").css("display", "block");
                    this.codePreviewLeftReSizeNumber = 0;
                }
            },
            async getNamespaceList() {
                var me = this;
                var namespaceList = await me.getNamespace();
                me.namespaceList = namespaceList;
                me.step++;
            },
            checkName(item) {
                return item.namespace + "/" + item.name;
            },
            endDiffCheck() {
                this.codeModalhide();
                this.diffCheck = false;
            },
            async getGitRepoList() {
                try {
                    var me = this;

                    if (me.gitInfo.token || me.gitInfo.username) {
                        var octokit = new Octokit({
                            auth: me.gitInfo.token,
                        });
                    }
                    
                    var username = me.gitInfo.username;
                    var repoList = await octokit.repos.listForUser({username});

                    var toArray = Object.entries(repoList.data);
                    me.repositoryList = [];
                    toArray.forEach(data => {
                        me.repositoryList.push({
                            name: data[1].name,
                            url: data[1].html_url
                        });
                    });

                    me.step++;

                } catch (e) {
                    if (e.code == 401) {
                        alert("AccessToken을 확인하여 주세요");
                    }
                }
            },
            async setGitRepository() {
                try {
                    var me = this;
                    var url = new URL(me.gitInfo.url);
                    var path = url.pathname;
                    var splitPath = path.split("/");
                    var yamlExistCheck = false;
                    me.settingGitInfoDialog = false;
                    me.step = 1;
                    me.gitOpsLoading = true;
                    var user = splitPath[1];
                    var repo = splitPath[2];
                    this.gitInfo.name = repo;
                    var branch = splitPath[4] ? splitPath[4] : "master";
                    me.template = 'Separate File per kind';
                    yamlExistCheck = await me.getKubeez(user, repo, branch);
                    var octokit = new Octokit({
                        auth: me.gitInfo.token,
                    });

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    if (yamlExistCheck) {
                        me.tmpTreeList = JSON.parse(JSON.stringify(me.treeList));
                        // 존재 할때는 동기화 관련 처리
                        me.$modal.show('codeModal');
                        me.codeView = true;
                        me.diffCheck = true;

                        while (me.diffCheck) {
                            await sleep(3000);
                        }
                        const sha = await me.getSHA(octokit, user, repo);
                        const status = await me.commitArticle(octokit, user, repo, sha);

                    } else {
                        // 존재 하지 않을때는 올릴 yaml을 표시
                        const status = await me.commitArticle(octokit, user, repo);
                    }

                    var existArgoApp = await me.getArgoApplication();
                    if (!existArgoApp) {
                        me.addArgoApplication();
                    }
                } catch (e) {
                    console.log(e);
                    me.gitOpsLoading = false;
                    if (e.code == 401) {
                        alert("입력된 정보를 확인해주세요.");
                    }
                }

            },
            async commitArticle(octokit, user, repo, sha) {
                var me = this;
                const path = `kubeez/kubeez.yaml`;
                var result;
                if (sha)
                    result = await octokit.repos.createOrUpdateFileContents({
                        owner: user,
                        repo: repo,
                        path,
                        message: `Add article "kubeez.yaml"`,
                        content: Base64.encode(me.tmpTreeList[0].code),
                        sha
                    });
                else
                    result = await octokit.repos.createOrUpdateFileContents({
                        owner: user,
                        repo: repo,
                        path,
                        message: `Update article "kubeez.yaml"`,
                        content: Base64.encode(me.treeList[0].code),
                    });

                return result ? result.status : 500;
            },
            updatePathTmp(update) {
                var me = this;
                me.tmpTreeList[0].code = update.code;
            },
            async getSHA(octokit, user, repo) {
                var path = 'kubeez/kubeez.yaml';
                const result = await octokit.repos.getContent({
                    owner: user,
                    repo: repo,
                    path,
                });

                const sha = result ? result.data.sha : null;

                return sha;
            },
            async getArgoServerUrl() {
                var service = await this.getKubeApi('services', 
                    this.argoServerInfo.namespace,
                    this.argoServerInfo.name
                );
                var result = 'https://' + service.data.status.loadBalancer.ingress[0].ip + 
                    ':' + service.data.spec.ports[0].port;
                var checkClusterItems = false;
                this.clusterItems.forEach((item) => {
                    if (item.title == 'Workflow Dashboard') {
                        checkClusterItems = true;
                    }
                });

                if (!checkClusterItems) {
                    this.clusterItems.push({ title: 'Workflow Dashboard' });
                }
                this.argoUrl = result;
            },
            async getArgoCdUrl() {
                var service = await this.getKubeApi('services', this.argoCdInfo.namespace, this.argoCdInfo.name);
                var result = 'https://' + service.data.status.loadBalancer.ingress[0].ip + ':' + service.data.spec.ports[0].port;
                var checkClusterItems = false;
                this.clusterItems.forEach(function (item) {
                    if (item.title == 'ArgoCD Dashboard') {
                        checkClusterItems = true
                    }
                })
                if (!checkClusterItems) {
                    this.clusterItems.push({title: 'ArgoCD Dashboard'});
                }
                this.argoCdUrl = result;
            },
            async getYaml(url) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    me.$http.get(url)
                    .then((result) => {
                        resolve(result.data);
                    }).catch(e => reject(e));
                });
            },
            getKubeez(user, repo, branch) {
                var me = this;
                var exist = false;
                me.existYaml = [];
                return new Promise(function (resolve, reject) {
                    me.$http.defaults.headers.common["Authorization"] = `bearer ${me.gitInfo.token}`
                    me.$http.get(`https://api.github.com/repos/${user}/${repo}/git/trees/${branch}`).then((result) => {
                        result.data.tree.forEach(item => {
                            if (item.path == 'kubeez') {
                                me.$http.get(item.url).then(kubeezPath => {
                                    kubeezPath.data.tree.forEach(async function (yaml) {
                                        var yaml = await me.getYaml(yaml.url);
                                        var codeValue = {
                                            'key': 'local',
                                            'name': 'local.yaml',
                                            'code': atob(yaml.content),
                                            'file': me.fileType('.yaml')
                                        }
                                        me.existYaml.push(codeValue);
                                    })
                                });
                                exist = true;
                            }
                        });
                        resolve(exist);
                    }).catch(error => reject(error));
                });
            },
            getArgoApplication() {
                var me = this;
                var serverUrl = localStorage.getItem('clusterAddress');
                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/apis/argoproj.io/v1alpha1/namespaces/${me.argoCdInfo.namespace}/applications/${me.gitInfo.name}/status?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`
                    ).then((result) => {
                        resolve(true);
                    }).catch((e) => {
                        resolve(false);
                    })
                });
            },
            addArgoApplication() {
                var me = this;
                var spec = {
                    "apiVersion": "argoproj.io/v1alpha1",
                    "kind": "Application",
                    "metadata": {
                        "name": _.kebabCase(me.gitInfo.name)
                    },
                    "spec": {
                        "destination": {
                            "name": "",
                            "namespace": "default",
                            "server": "https://kubernetes.default.svc"
                        },
                        "source": {
                            "path": me.gitInfo.path,
                            "repoURL": me.gitInfo.url,
                            "targetRevision": "HEAD"
                        },
                        "project": "default",
                        "syncPolicy": {
                            "automated": {
                                "prune": false,
                                "selfHeal": false
                            }
                        }
                    }
                };
                var serverUrl = localStorage.getItem('clusterAddress');
                me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/argoproj.io/v1alpha1/namespaces/${me.argoCdInfo.namespace}/applications?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`, spec
                ).then((result) => {
                }).catch(e => {
                    console.log(e);
                });
            },
            getClassPath(path) {
                if (this.classId) {
                    var classId = this.classId.replace('@', '/');
                } else {
                    if (this.$route.params.classId) {
                        var classId = this.$route.params.classId.replace('@', '/');
                    }
                }

                if (this.courseId) {
                    var courseId = this.courseId;
                } else {
                    var courseId = this.$route.params.courseId;
                }
                return `${courseId}/classes/${classId}/${path}`;
            },
            existServiceAccountCheck(hashName) {
                var me = this;
                var serverToken;
                var serverUrl;
                if (this.$route.params.courseId) {
                    serverToken = me.$parent.classInfo.token;
                    serverUrl = me.$parent.classInfo.serverUrl;
                }
                return new Promise((resolve) => {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/serviceaccounts/${hashName}?serverUrl=${serverUrl}&token=${serverToken}`
                    ).then((result) => {
                        resolve(result);
                    }).catch((e) => {
                        resolve(false);
                    });
                });
            },
            hashCode(s) {
                return s.split("").reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
            },
            loadYaml(yaml) {
                var yamlList = yaml.split("---");
                var result = "";
                var me = this;
                yamlList.forEach((item) => {
                    if (item.length > 1) {
                        var temp = YAML.parse(item);
                        result += '--- \n' + me.yamlFilter(json2yaml.stringify(temp));
                    }
                });
                this.localYamlText = result;
                this.yamlPanel = true;
            },
            customFilter(item, queryText, itemText) {
                var lowItemText = itemText.toLowerCase();
                var lowQueryText = queryText.toLowerCase();
                return lowItemText.startsWith(lowQueryText);
            },
            searchKeyDown(event) {
                var me = this;
                if (!me.readOnly) {
                    if (event.keyCode == 13 && me.searchKeyword) {
                        me.searchKeyword.x = 500 + Math.random() * 200;
                        me.searchKeyword.y = 280 + Math.random() * 150;
                        me.addElement(me.searchKeyword, null, true);
                        me.searchKeyword = '';
                        me.isSearch = false;
                    }
                }
            },
            onLoad() {
                this.iframeLoading = false;
            },
            changeCategory(key) {
                var me = this;
                if (me.selectedCategoryIndex == key) {
                    me.selectedCategoryIndex = null;
                } else {
                    me.selectedCategoryIndex = key;
                }
            },
            toolStyle(cardIndex, categoryIndex, cardLength) {
                var me = this
                var angle =  (cardIndex - categoryIndex/10) * 40 / (cardLength +1) - 10;
                var angle2 = cardIndex * 10 / cardLength - 3;
                var radians = (Math.PI/ 180) * angle;

                var curvedX = Math.cos(radians) * 500 - 500;
                var curvedY = Math.sin(radians) * 700 + categoryIndex * 10 + 50;
                
                return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg);`;
            },
            functionSelect(title) {
                var me = this
                if (title == 'Code Preview') {
                    me.openCodeViewer();
                } else if (title == 'Download Archive') {
                    me.generateZipDialog = true;
                } else if (title == 'Git Configure') {
                    me.getArgoSetting();
                } else if (title == 'Sync') {
                    me.setGitRepository();
                } else if (title == 'Deploy to Server') {
                    me.deployDialog = true;
                } else if (title == 'Duplicate') {
                    me.saveComposition('duplicate');
                } else if (title == 'Download model File') {
                    me.downloadModelToJson();
                } else if (title == 'Save to Server') {
                    me.saveComposition('save');
                }
            },
            functionReverse(title) {
                var me = this;
                if (title == 'From Cluster') {
                    me.drawFromCluster();
                } else if (title == 'From Local') {
                    me.yamlModalShow();
                }
            },
            async getArgoSetting() {
                var me = this;
                me.settingGitInfoDialog = true;
                if (localStorage.getItem('clusterAddress') && localStorage.getItem('kuberToken')) {
                    me.argoServerLists = [];
                    me.argoCdLists = [];
                    var namespace = await me.getNamespace();
                    namespace.forEach((name) => {
                        me.findArgo(name);
                    });
                } else {
                    me.argoDialog = false;
                    me.snackbar.show = true;
                    me.snackbar.color = 'error';
                    me.snackbar.text = 'To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.';
                }
            },
            openArgoDashboard() {
                window.open(this.argoUrl, '_blank');
            },
            openArgoCdDashboard() {
                window.open(this.argoCdUrl, '_blank');
            },
            async findArgo(namespace) {
                var me = this;
                var tmp = await me.getKubeApis("deployments", namespace);
                tmp.forEach((result) => {
                    if (result.metadata.name == 'argo-server') {
                        me.argoServerLists.push({name: result.metadata.name, namespace: namespace});
                    }
                    if (result.metadata.name == 'argocd-server') {
                        me.argoCdLists.push({name: result.metadata.name, namespace: namespace});
                    }
                });
            },
            getApiList() {
                var me = this;

                return new Promise(async function (resolve, reject) {
                    var serverUrl = localStorage.getItem('clusterAddress');
                    var config = await me.getConfigFile();
                    var namespace;
                    var user
                    var currentContext = config.data["current-context"];
                    var token;
                    config.data.contexts.forEach((context) => {
                        if (context.context.cluster == currentContext) {
                            namespace = context.context.namespace;
                            user = context.context.user;
                        }
                    });
                    config.data.users.forEach((userTmp) => {
                        if (userTmp.name == user) {
                            token = userTmp.user.token;
                            me.clusterInfo.token = token;
                        }
                    });
                    let apiServer=localStorage.getItem("apiServer");
                    me.$http.get(`${me.getProtocol()}//${apiServer}/api/v1?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                        var getList = [];
                        result.data.resources.forEach((resource) => {
                            if (resource.verbs.includes("get") && !resource.name.includes("/")) {
                                getList.push(resource.name);
                            }
                        });
                        resolve(getList);
                    }).catch(e => console.log(e));
                });
            },
            async getApisList() {
                var me = this

                return new Promise(async function (resolve, reject) {
                    var serverUrl = localStorage.getItem('clusterAddress');
                    var config = await me.getConfigFile();
                    var namespace;
                    var user
                    var currentContext = config.data["current-context"];
                    var token;
                    config.data.contexts.forEach(function (context) {
                        if (context.context.cluster == currentContext) {
                            namespace = context.context.namespace;
                            user = context.context.user
                        }
                    })
                    config.data.users.forEach(function (userTmp) {
                        if (userTmp.name == user) {
                            token = userTmp.user.token
                            me.clusterInfo.token = token
                        }
                    })
                    me.$http.get(`${me.getProtocol()}//api.msaez.io/apis/apps/v1?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                        var getList = []
                        result.data.resources.forEach(function (resource) {
                            if (resource.verbs.includes("get") && !resource.name.includes("/")) {
                                getList.push(resource.name)
                            }
                        })
                        resolve(getList)
                    }).catch(e => console.log(e))
                })
            },
            getNamespace() {
                var me = this
                var serverUrl = localStorage.getItem('clusterAddress');
                // var serverToken = localStorage.getItem('kuberToken');
                return new Promise(function (resolve, reject) {
                    me.$http.get(`${me.getProtocol()}//api.msaez.io/api/v1/namespaces?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                        var getList = []
                        result.data.items.forEach(function (namespace) {
                            getList.push(namespace.metadata.name)
                        })
                        resolve(getList)
                    }).catch(e => console.log(e))
                })
            },
            getIngersses(namespace) {
                var me = this
                var serverUrl = localStorage.getItem('clusterAddress');
                return new Promise(function (resolve, reject) {
                    me.$http.get(`${me.getProtocol()}//api.msaez.io/apis/extensions/v1beta1/namespaces/${namespace}/ingresses?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                        result.data.items.forEach(function (item, idx) {
                            var tmp = {
                                "kind": result.data.kind.includes('List') ? result.data.kind.replace('List', '') : result.data.kind,
                                "apiVersion": result.data.apiVersion
                            }
                            var template = Object.assign(tmp, item)
                            result.data.items[idx] = template
                        })
                        resolve(result.data.items)
                    }).catch(e => console.log(e))
                })
            },
            getKubeApi(resource, namespace, name) {
                var me = this
                var serverUrl = localStorage.getItem('clusterAddress');
                if (name)
                    return new Promise(function (resolve, reject) {
                        me.$http.get(`${me.getProtocol()}//api.msaez.io/api/v1/namespaces/${namespace}/${resource}/${name}?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                            resolve(result)
                        }).catch(e => console.log(e))
                    })
                else if (namespace)
                    return new Promise(function (resolve, reject) {
                        me.$http.get(`${me.getProtocol()}//api.msaez.io/api/v1/namespaces/${namespace}/${resource}?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                            result.data.items.forEach(function (item, idx) {
                                var tmp = {
                                    "kind": result.data.kind.includes('List') ? result.data.kind.replace('List', '') : result.data.kind,
                                    "apiVersion": result.data.apiVersion
                                }
                                var template = Object.assign(tmp, item)
                                result.data.items[idx] = template
                            })
                            resolve(result.data.items)
                        }).catch(e => console.log(e))
                    })
                else
                    return new Promise(function (resolve, reject) {
                        me.$http.get(`${me.getProtocol()}//api.msaez.io/api/v1/${resource}?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                            result.data.items.forEach(function (item, idx) {
                                var tmp = {
                                    "kind": result.data.kind.includes('List') ? result.data.kind.replace('List', '') : result.data.kind,
                                    "apiVersion": result.data.apiVersion
                                }
                                var template = Object.assign(tmp, item)
                                result.data.items[idx] = template
                            })
                            resolve(result.data.items)
                        }).catch(e => console.log(e))
                    })
            },
            getSecret(hashName, secretName) {
                console.log(secretName)
                var me = this
                var serverToken;
                var serverUrl
                if (this.$route.params.courseId) {
                    serverToken = me.$parent.classInfo.token;
                    serverUrl = me.$parent.classInfo.serverUrl;
                }
                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/secrets/${secretName}?serverUrl=${serverUrl}&token=${serverToken}`).then((result) => {
                        resolve(result.data.data.token)
                    }).catch((e) => {
                        resolve(false)
                    })
                })
            },
            getKubeApis(resource, namespace) {
                var me = this
                var serverUrl = localStorage.getItem('clusterAddress');
                var serverToken = localStorage.getItem('kuberToken');
                if (namespace)
                    return new Promise(function (resolve, reject) {
                        me.$http.get(`${me.getProtocol()}//api.msaez.io/apis/apps/v1/namespaces/${namespace}/${resource}?serverUrl=${serverUrl}&token=${me.clusterInfo.token}`).then((result) => {
                            result.data.items.forEach(function (item, idx) {
                                var tmp = {
                                    "kind": result.data.kind.includes('List') ? result.data.kind.replace('List', '') : result.data.kind,
                                    "apiVersion": result.data.apiVersion
                                }
                                var template = Object.assign(tmp, item)
                                result.data.items[idx] = template
                            })
                            resolve(result.data.items)
                        }).catch(e => console.log(e))
                    })
                else
                    return new Promise(function (resolve, reject) {
                        me.$http.get(`${me.getProtocol()}//api.msaez.io/apis/apps/v1/${resource}?serverUrl=${serverUrl}&token=${serverToken}`).then((result) => {
                            result.data.items.forEach(function (item, idx) {
                                var tmp = {
                                    "kind": result.data.kind.includes('List') ? result.data.kind.replace('List', '') : result.data.kind,
                                    "apiVersion": result.data.apiVersion
                                }
                                var template = Object.assign(tmp, item)
                                result.data.items[idx] = template
                            })
                            resolve(result.data.items)
                        }).catch(e => console.log(e))
                    })
            },
            async drawFromCluster() {
                var me = this
                me.value = {'elements': {}, 'relations': {}};

                var apiList = await this.getApiList();
                var apisList = await this.getApisList();

                var namespaceList = await this.getNamespace();

                var result = apiList.concat(apisList);
                var podList = new Map();
                var serviceList = new Map();
                var deployList = new Map();
                var replicaSetList = new Map();
                var pvList = new Map();
                var pvcList = new Map();
                var ingressList = new Map();
                var statefulSetList = new Map();

                var getPodList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApi("pods", namespace)
                        podList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getServiceList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApi("services", namespace)
                        serviceList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getPvList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApi("persistentvolumes")
                        pvList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getPvcList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApi("persistentvolumeclaims")
                        pvcList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getDeployList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApis("deployments", namespace)
                        deployList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getRsList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApis("replicasets", namespace)
                        replicaSetList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getStatefulSetList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getKubeApis('statefulsets', namespace)
                        statefulSetList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                var getIngressList = new Promise((resolve, reject) => {
                    namespaceList.forEach(async function (namespace, index) {
                        var tmp = await me.getIngersses(namespace)
                        ingressList.set(namespace, tmp)
                        if (index === namespaceList.length - 1) resolve();
                    })
                });

                Promise.all([getPodList, getServiceList, getDeployList, getPvcList, getPvList, getRsList, getIngressList, getStatefulSetList]).then(function () {
                    var podDeployLists = new Map();
                    podList.forEach(function (value, namespace) {
                        var merge = [...value, ...deployList.get(namespace)]
                        podDeployLists.set(namespace, merge)
                    })

                    var podDeployStateLists = new Map();
                    podDeployLists.forEach(function (value, namespace) {
                        var merge = [...value, ...statefulSetList.get(namespace)]
                        podDeployStateLists.set(namespace, merge)
                    })
                    var depthForFirst = [0, 0, 0, 0, 0]
                    var depthForLast = [0, 0, 0, 0, 0]
                    namespaceList.forEach(function (namespace) {
                        if (namespace == "default") {
                            function compare(a, b) {
                                if (a.metadata.name < b.metadata.name) {
                                    return -1;
                                }
                                if (a.metadata.name > b.metadata.name) {
                                    return 1;
                                }
                                return 0;
                            }

                            var height = 0;
                            var i = 0;
                            var ingressService = new Map();
                            var drawSvcIdx = 0;
                            var drawPodDeplolyIdx = 0;
                            var drawPvcIdx = 0;
                            var drawPvIdx = 0;
                            // ingress
                            ingressList.get(namespace).forEach(function (ingress, idx) {
                                var ingressServiceArray = []
                                if (!ingress.metadata.ownerReferences) {
                                    ingress.spec.rules.forEach(function (rule) {
                                        rule.http.paths.forEach(function (path) {
                                            ingressServiceArray.push(path.backend.serviceName)
                                        })
                                    })

                                    ingressServiceArray = ingressServiceArray.filter((item, index) => ingressServiceArray.indexOf(item) === index);
                                    ingressService.set(ingress.metadata.name, ingressServiceArray)
                                    var isLast = false
                                    if (idx == ingressList.get(namespace).length - 1) {
                                        isLast = true
                                    }
                                }
                            })
                            // if (ingressList.size > 0) {
                            //     height++
                            // }

                            ingressService.forEach(function (ingress, key) {
                                // Service
                                var depthForFirstIngress = [0, 0, 0, 0, 0]
                                var depthForLastIngress = [0, 0, 0, 0, 0]
                                serviceList.get(namespace).forEach(function (service, idx) {
                                    var podCheck = null
                                    if (service) {
                                        if (!service.metadata.ownerReferences && ingress.includes(service.metadata.name)) {
                                            podDeployStateLists.get(namespace).some(function (podDeploy) {
                                                var count = 0;
                                                var drawCount = 0
                                                if (podDeploy.spec.volumeClaimTemplates) {
                                                    podDeploy.spec.volumeClaimTemplates.forEach(function (pvcTemplate) {
                                                        pvcList.get(namespace).forEach(function (pvc) {
                                                            if (pvc != null)
                                                                if (pvc.metadata.name.includes(pvcTemplate.metadata.name))
                                                                    count++
                                                        })
                                                    })
                                                }
                                                podCheck = me.drawPodDeploy(podDeploy, depthForLast[2], service, count);
                                                if (podCheck) {
                                                    if (depthForFirst[2] == 0) {
                                                        depthForFirst[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                    }
                                                    if (depthForFirstIngress[2] == 0) {
                                                        depthForFirstIngress[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                    }
                                                    depthForLast[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                    depthForLastIngress[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                    pvcList.get(namespace).forEach(function (pvc, pvcIdx) {
                                                        if (pvc != null) {

                                                            var pvcCheck = me.drawPvc(pvc, pvcIdx, podCheck, drawCount);

                                                            if (pvcCheck) {
                                                                if (count != 0) {
                                                                    drawCount++
                                                                }
                                                                pvList.get(namespace).forEach(function (pv) {
                                                                    me.drawPv(pv, drawPvcIdx, pvcCheck, pvc)
                                                                })
                                                                pvcList.get(namespace)[pvcIdx] = null
                                                                drawPvcIdx++
                                                            }
                                                        }
                                                    })
                                                }
                                            });

                                            var serviceTmp = {"kind": "Service", "apiVersion": "v1"}
                                            var serviceTemplate = Object.assign(serviceTmp, service)
                                            var serviceElement = {
                                                'component': 'service',
                                                'label': 'Service',
                                                'width': podCheck ? podCheck.element.width : 100,
                                                'height': 100,
                                                'auto': true
                                            }
                                            serviceElement.x = podCheck ? podCheck.element.x : depthForLast[1] + 150
                                            serviceElement.y = 200 + (200 * 1)
                                            drawSvcIdx++
                                            me.addElement(serviceElement, serviceTemplate)

                                            if (depthForFirst[1] == 0) {
                                                depthForFirst[1] = serviceElement.x - (serviceElement.width / 2)
                                            }
                                            depthForLast[1] = serviceElement.x + (serviceElement.width / 2)

                                            // Pod, Deploy, StatefulSet, ReplicaSet
                                            serviceList.get(namespace)[idx] = null
                                        }
                                    }
                                })

                                ingressList.get(namespace).forEach(function (ingress, idx) {
                                    if (ingress.metadata.name == key) {
                                        if (!ingress.metadata.ownerReferences) {

                                            var ingressElement = {
                                                'component': 'ingress',
                                                'label': 'Ingress',
                                                'width': depthForFirstIngress[2] != 0 ? depthForLast[2] - depthForFirstIngress[2] : 100,
                                                'height': 100,
                                                'auto': true
                                            }
                                            // innerIngressService.set(ingress, tmp)
                                            if (depthForFirstIngress[2] == 0) {
                                                ingressElement.x = depthForLast[2] + 150
                                            } else {
                                                ingressElement.x = (depthForFirstIngress[2] + depthForLast[2]) / 2
                                            }

                                            console.log(ingress.metadata.name, ingressElement)
                                            ingressElement.y = 200 + (200 * 0)
                                            i++
                                            me.addElement(ingressElement, ingress)
                                        }
                                    }
                                })
                            })

                            serviceList.get(namespace).forEach(function (service, idx) {
                                var podCheck = null
                                if (service) {
                                    if (!service.metadata.ownerReferences) {
                                        podDeployStateLists.get(namespace).some(function (podDeploy) {
                                            var count = 0;
                                            var drawCount = 0
                                            if (podDeploy.spec.volumeClaimTemplates) {
                                                podDeploy.spec.volumeClaimTemplates.forEach(function (pvcTemplate) {
                                                    pvcList.get(namespace).forEach(function (pvc) {
                                                        if (pvc != null)
                                                            if (pvc.metadata.name.includes(pvcTemplate.metadata.name))
                                                                count++
                                                    })
                                                })
                                            }
                                            podCheck = me.drawPodDeploy(podDeploy, depthForLast[2], service, count);
                                            if (podCheck) {
                                                if (depthForFirst[2] == 0) {
                                                    depthForFirst[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                }
                                                depthForLast[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                pvcList.get(namespace).forEach(function (pvc, pvcIdx) {
                                                    if (pvc != null) {

                                                        var pvcCheck = me.drawPvc(pvc, pvcIdx, podCheck, drawCount);

                                                        if (pvcCheck) {
                                                            if (count != 0) {
                                                                drawCount++
                                                            }
                                                            pvList.get(namespace).forEach(function (pv) {
                                                                me.drawPv(pv, drawPvcIdx, pvcCheck, pvc)
                                                            })
                                                            pvcList.get(namespace)[pvcIdx] = null
                                                            drawPvcIdx++
                                                        }
                                                    }
                                                })
                                            }
                                        });

                                        var serviceElement = {
                                            'component': 'service',
                                            'label': 'Service',
                                            'width': podCheck ? podCheck.element.width : 100,
                                            'height': 100,
                                            'auto': true
                                        }
                                        serviceElement.x = podCheck ? podCheck.element.x : depthForLast[1] + 150
                                        serviceElement.y = 200 + (200 * 1)
                                        drawSvcIdx++
                                        me.addElement(serviceElement, service)

                                        if (depthForFirst[1] == 0) {
                                            depthForFirst[1] = serviceElement.x - (serviceElement.width / 2)
                                        }
                                        depthForLast[1] = serviceElement.x + (serviceElement.width / 2)
                                        if (!podCheck) {
                                            depthForLast[2] = depthForLast[1]
                                        }
                                        // Pod, Deploy, StatefulSet, ReplicaSet
                                        serviceList.get(namespace)[idx] = null
                                    }
                                }
                            })
                        }
                    })

                    me.$nextTick(function () {
                        me.addRelations()
                    })
                })
            },
            drawPodDeploy(podDeploy, index, service, innerItem) {
                var me = this
                if (service.spec.selector)
                    if (!podDeploy.metadata.ownerReferences) {
                        if (podDeploy.kind == 'StatefulSet') {
                            if (podDeploy.spec.serviceName == service.metadata.name) {
                                var element = {
                                    'component': 'statefulSet',
                                    'label': 'StatefulSet',
                                    'width': podDeploy.spec.volumeClaimTemplates ? (150 * innerItem) - 50 : 100,
                                    'height': '100',
                                    'auto': true
                                }
                                // if (serviceElement)
                                //     element.x = serviceElement.x
                                // else
                                if (innerItem) {
                                    element.x = 100 + index + (element.width / 2)
                                } else {
                                    element.x = 150 + index
                                }
                                element.y = 200 + (200 * 2)
                                me.addElement(element, podDeploy)

                                return {element: element, template: podDeploy}
                            }
                        } else if (podDeploy.kind == 'Pod') {
                            if (service.spec.selector)
                                if (podDeploy.metadata.name == service.spec.selector.app) {
                                    var element = {
                                        'component': 'pod',
                                        'label': 'Pod',
                                        'width': 100,
                                        // 'width': podDeploy.spec.volumes ? (150 * podDeploy.spec.volumes.length) - 50 : 100,
                                        'height': 100,
                                        'auto': true
                                    }
                                    // if (serviceElement)
                                    //     element.x = serviceElement.x
                                    // else
                                    if (innerItem) {
                                        element.x = 100 + index + (element.width / 2)
                                    } else {
                                        element.x = 150 + index
                                    }
                                    element.y = 200 + (200 * 2)
                                    me.addElement(element, podDeploy)
                                    return {element: element, template: podDeploy}
                                }
                        } else if (podDeploy.kind == 'Deployment') {
                            if (podDeploy.spec.selector) {
                                if (podDeploy.spec.selector.matchLabels.app == service.spec.selector.app) {
                                    if (service.spec.selector.role) {
                                        if (service.spec.selector.tier) {
                                            if (service.spec.selector.tier != podDeploy.spec.selector.matchLabels.tier) {
                                                return false
                                            }
                                        }
                                        if (service.spec.selector.role != podDeploy.spec.selector.matchLabels.role) {
                                            return false
                                        }
                                    }
                                    if (service.spec.selector.tier) {
                                        if (service.spec.selector.tier != podDeploy.spec.selector.matchLabels.tier) {
                                            return false
                                        }
                                    }
                                } else {
                                    return false
                                }
                            } else if (podDeploy.spec.template) {
                                if (podDeploy.spec.template.metadata.labels.app != service.spec.selector.app) {
                                    return false
                                }
                            }
                            var element = {
                                'component': 'deployment',
                                'label': 'Deployment',
                                'width': podDeploy.spec.volumes ? (150 * podDeploy.spec.volumes.length) - 50 : 100,
                                'height': 100,
                                'auto': true
                            }
                            if (innerItem) {
                                element.x = 100 + index + (element.width / 2)
                            } else {
                                element.x = 150 + index
                            }
                            element.y = 200 + (200 * 2)
                            me.addElement(element, podDeploy)
                            return {element: element, template: podDeploy}

                        }
                    } else {
                        return false
                    }
                else
                    return false
            },
            drawPvc(pvc, index, pod, drawCount) {
                var me = this
                var draw = false;
                if (!pvc.metadata.ownerReferences) {
                    if (pod.template.kind == 'StatefulSet') {
                        pod.template.spec.volumeClaimTemplates.forEach(function (claims) {
                            if (pvc.metadata.name.includes(claims.metadata.name)) {
                                draw = true;
                            }
                        })
                    } else if (pod.template.kind == 'Deployment') {
                        if (pod.template.spec.template.spec.volumes)
                            pod.template.spec.template.spec.volumes.forEach(function (volume) {
                                // ConfigMap 제외 조건문
                                if (volume.persistentVolumeClaim) {
                                    if (volume.persistentVolumeClaim.claimName == pvc.metadata.name) {
                                        draw = true;
                                    }
                                }
                            })
                    } else if (pod.template.kind == 'Pod') {
                        if (pod.template.spec.volumes)
                            pod.template.spec.volumes.forEach(function (volume) {
                                if (volume.persistentVolumeClaim)
                                    if (volume.persistentVolumeClaim.claimName == pvc.metadata.name) {
                                        draw = true;
                                    }
                            })
                    } else if (pod.template.kind == "ReplicaSet") {
                        // 추후 구현 / 당장 없음
                    }

                    if (draw) {
                        var element = {
                            'component': 'persistentVolumeClaim',
                            'label': 'PersistentVolumeClaim',
                            'width': 100,
                            'height': 100
                        }
                        // if (serviceElement)
                        //     element.x = serviceElement.x + (150 * index)
                        // else
                        if (drawCount > -1)
                            element.x = (pod.element.x - pod.element.width / 2) + (element.width / 2) + (150 * drawCount)
                        else
                            element.x = 150 * index

                        element.y = 200 + (200 * 3)
                        me.addElement(element, pvc)

                        return element;
                    }

                }
            },
            /**
             *
             * @param pv PersistentVolume Data
             * @param index
             * @param pvcElement 연결 되어 있는 PersistentVolumeClaim Element
             * @param pvc 연결 되어 있는 PersistentVolumeClaim Infomation
             * @returns {{component: string, width: number, label: string, height: number}}
             */
            drawPv(pv, index, pvcElement, pvc) {
                var me = this
                if (!pv.metadata.ownerReferences) {
                    if (pv.spec.claimRef) {
                        if (pv.spec.claimRef.name == pvc.metadata.name) {
                            var element = {
                                'component': 'persistentVolume',
                                'label': 'PersistentVolume',
                                'width': 100,
                                'height': 100
                            }
                            if (pvcElement)
                                element.x = pvcElement.x
                            else
                                element.x = 150 * index
                            element.y = 200 + (200 * 4)
                            me.addElement(element, pv)

                            return element
                        }
                    } else {
                        if (pv.metadata.name == pvc.metadata.name) {
                            var element = {
                                'component': 'persistentVolume',
                                'label': 'PersistentVolume',
                                'width': 100,
                                'height': 100
                            }
                            if (pvcElement)
                                element.x = pvcElement.x
                            else
                                element.x = 150 * index
                            element.y = 200 + (200 * 4)
                            me.addElement(element, pv)

                            return element
                        }
                    }
                }
            },
            addRelations() {
                var me = this
                var value = me.embedded ? me.value.k8sValue : me.value

                Object.keys(value.elements).forEach(function (fromKey) {
                    if (value.elements[fromKey]) {
                        var kind = value.elements[fromKey].object.kind;
                        if (kind != "Namespace" && kind != undefined) {
                            var vueComponent
                            var res = me.getComponentByClassName(kind)
                            if (res) {
                                vueComponent = me.getComponentByName(res.name)
                            } else {
                                vueComponent = me.getComponentByName('crdTemplate')
                            }
                            Object.keys(value.elements).forEach(function (toKey) {
                                if (kind != "Namespace" && value.elements[toKey]) {
                                    var res = false
                                    if (vueComponent.methods.isConnected) {
                                        res = vueComponent.methods.isConnected(value.elements[toKey], value.elements[fromKey])
                                    }
                                    var isConn = Object.keys(value.relations).some(function (relKey) {
                                        if (value.relations[relKey]) {
                                            if (value.relations[relKey].from == fromKey && value.relations[relKey].to == toKey) {
                                                return true
                                            }
                                        }
                                    })
                                    if (res && !isConn) {
                                        var toOg = document.getElementById(toKey)
                                        var fromOg = document.getElementById(fromKey)
                                        me.canvas._RENDERER._CANVAS.connect(fromOg, toOg, null, null, null, null, null, null, null)
                                    }
                                }
                            })
                        }
                    }
                })
            },
            drawFromYaml() {
                var lists = this.localYamlText.split("---");
                var listMap = new Map();
                var namespaceMap = new Map();
                var me = this;

                me.reverseYaml = true
                if(!me.embedded) {
                    me.value = {'elements': {}, 'relations': {}};
                }
                if (me.localYamlText == '') {
                    me.reverseYaml = false
                    return false
                }
                me.$nextTick(function () {
                    lists.forEach(function (item) {
                        if (item.length > 1) {
                            var parseItem = YAML.parse(item)
                            var keys = Array.from(listMap.keys())
                            if (!keys.includes(parseItem.kind)) {
                                listMap.set(parseItem.kind, new Map())
                            }
                            // if (!parseItem.metadata.namespace && parseItem.kind != 'Namespace') {
                            //     parseItem.metadata.namespace = 'default'
                            // }
                            if (!keys.includes('Namespace')) {
                                listMap.set('Namespace', [])
                            }
                            if (parseItem.metadata.namespace) {
                                if (!listMap.get("Namespace").includes(parseItem.metadata.namespace)) {
                                    listMap.set('Namespace', [...listMap.get("Namespace"), parseItem.metadata.namespace])
                                }
                                var kindList = listMap.get(parseItem.kind);
                                if (!Array.from(kindList.keys()).includes(parseItem.metadata.namespace)) {
                                    kindList.set(parseItem.metadata.namespace, []);
                                }
                                kindList.set(parseItem.metadata.namespace, [...kindList.get(parseItem.metadata.namespace), parseItem]);
                            } else if (!parseItem.metadata.namespace && parseItem.kind != 'Namespace') {
                                if (!listMap.get("Namespace").includes('undefined')) {
                                    listMap.set('Namespace', [...listMap.get("Namespace"), 'undefined'])
                                }
                                var kindList = listMap.get(parseItem.kind);
                                if (!Array.from(kindList.keys()).includes('undefined')) {
                                    kindList.set('undefined', []);
                                }
                                kindList.set('undefined', [...kindList.get('undefined'), parseItem]);
                            } else {
                                if (parseItem.kind == 'Namespace') {
                                    namespaceMap.set(parseItem.metadata.name, parseItem)
                                }
                            }
                        }
                    })

                    var depthForFirst = [0, 0, 0, 0, 0]
                    var depthForLast = [0, 0, 0, 0, 0]
                    var depthType = [
                        ["Ingress", "Gateway", "VirtualService"],
                        ["Service", "DestinationRule", "DestinationRuleSubset"],
                        ["Deployment", "Pod", "ReplicaSet", "StatefulSet", "DaemonSet", "Job", "CronJob"],
                        ["PersistentVolumeClaim", "ConfigMap", "Secret"],
                        ["PersistentVolume", "StorageClass"]
                    ]
                    var depthForNamespace = [0, 0, 0, 0, 0]

                    listMap.get('Namespace').forEach(function (namespace, namespaceIdx) {
                        var depthForFirstNamespace = [0, 0, 0, 0, 0]

                        function compare(a, b) {
                            if (a.metadata.name < b.metadata.name) {
                                return -1;
                            }
                            if (a.metadata.name > b.metadata.name) {
                                return 1;
                            }
                            return 0;
                        }

                        var i = 0;
                        var ingressService = new Map();
                        var drawSvcIdx = 0;
                        var drawPvcIdx = 0;

                        var keys = Array.from(listMap.keys())
                        var depth2 = new Map()
                        var depth3 = new Map()
                        var depth4 = new Map()
                        var elementMap = new Map()
                        keys.forEach((kind) => {

                            if (depthType[2].includes(kind)) {
                                if (!Array.from(depth2.keys()).includes(namespace)) {
                                    depth2.set(namespace, [])
                                }
                                if (listMap.get(kind) && listMap.get(kind).get(namespace)) {
                                    depth2.set(namespace, [...depth2.get(namespace), ...listMap.get(kind).get(namespace)])
                                }

                            } else if (depthType[3].includes(kind)) {
                                if (!Array.from(depth3.keys()).includes(namespace)) {
                                    depth3.set(namespace, [])
                                }
                                if (listMap.get(kind) && listMap.get(kind).get(namespace)) {
                                    depth3.set(namespace, [...depth3.get(namespace), ...listMap.get(kind).get(namespace)])
                                }

                            } else if (depthType[4].includes(kind)) {
                                if (!Array.from(depth4.keys()).includes(namespace)) {
                                    depth4.set(namespace, [])
                                }
                                if (listMap.get(kind) && listMap.get(kind).get(namespace)) {
                                    depth4.set(namespace, [...depth4.get(namespace), ...listMap.get(kind).get(namespace)])
                                }
                            } else if (depthType[0].includes(kind) || depthType[1].includes(kind) || kind == 'Namespace') {
                                //
                            } else {
                                if (!Array.from(elementMap.keys()).includes(namespace)) {
                                    elementMap.set(namespace, [])
                                }
                                if (listMap.get(kind) && listMap.get(kind).get(namespace)) {
                                    elementMap.set(namespace, [...elementMap.get(namespace), ...listMap.get(kind).get(namespace)])
                                }
                            }
                        })

                        if (listMap.get("Ingress") && listMap.get("Ingress").get(namespace)) {
                            listMap.get("Ingress").get(namespace).forEach(function (ingress, idx) {
                                var ingressServiceArray = []
                                if (!ingress.metadata.ownerReferences) {
                                    ingress.spec.rules.forEach(function (rule) {
                                        rule.http.paths.forEach(function (path) {
                                            ingressServiceArray.push(path.backend.serviceName)
                                        })
                                    })

                                    ingressServiceArray = ingressServiceArray.filter((item, index) => ingressServiceArray.indexOf(item) === index);
                                    ingressService.set(ingress.metadata.name, ingressServiceArray)
                                    var isLast = false
                                    if (idx == listMap.get("Ingress").get(namespace).length - 1) {
                                        isLast = true
                                    }
                                }
                            })

                            ingressService.forEach(function (ingress, key) {
                                var depthForFirstIngress = [0, 0, 0, 0, 0]
                                var depthForLastIngress = [0, 0, 0, 0, 0]
                                listMap.get("Service").get(namespace).forEach(function (service, idx) {
                                    var podCheck = null
                                    if (service) {
                                        if (ingress.includes(service.metadata.name)) {
                                            depth2.get(namespace).some(function (podDeploy, poIdx) {
                                                var count = 0;
                                                var drawCount = 0
                                                if (podDeploy)
                                                    if (service.spec.selector.app == podDeploy.metadata.name) {
                                                        podCheck = me.drawElement(depthForLast[2], 2, podDeploy)
                                                        // podCheck = me.drawPodDeploy(podDeploy, depthForLast[2], service, count);
                                                        if (podCheck) {
                                                            if (depthForFirst[2] == 0) {
                                                                depthForFirst[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                            }
                                                            if (depthForFirstIngress[2] == 0) {
                                                                depthForFirstIngress[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                            }
                                                            if (depthForFirstNamespace[2] == 0) {
                                                                depthForFirstNamespace[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                            }
                                                            depthForLast[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                            depthForLastIngress[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                            if (depth3.get(namespace)) {
                                                                depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                                                    if (pvc != null) {
                                                                        var kind = podDeploy.kind.charAt(0).toLowerCase() + podDeploy.kind.slice(1, podDeploy.kind.length)
                                                                        var vueComponent = me.getComponentByName(kind)
                                                                        var res = false
                                                                        var toObj = {"_type": pvc.kind, "object": pvc}
                                                                        var fromObj = {
                                                                            "_type": podDeploy.kind,
                                                                            "object": podDeploy
                                                                        }
                                                                        fromObj.connectableType = ["PersistentVolumeClaim", "ConfigMap", "Secret"]
                                                                        res = vueComponent.methods.isConnected(toObj, fromObj)
                                                                        if (res) {
                                                                            var x = podCheck.element.x - 150
                                                                            var pvcCheck = me.drawElement(x, 3, pvc);
                                                                            // var pvcCheck = me.drawPvc(pvc, pvcIdx, podCheck, drawCount);
                                                                            if (pvcCheck) {
                                                                                if (count != 0) {
                                                                                    drawCount++
                                                                                }
                                                                                if (depthForFirst[3] == 0) {
                                                                                    depthForFirst[3] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                }
                                                                                if (depthForFirstNamespace[3] == 0) {
                                                                                    depthForFirstNamespace[3] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                }
                                                                                depthForLast[3] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                                                                if (depth4.get(namespace)) {
                                                                                    depth4.get(namespace).forEach(function (pv, pvIdx) {
                                                                                        var x = pvcCheck.element.x - 150
                                                                                        var pvCheck = me.drawElement(x, 4, pv)
                                                                                        if (pvCheck) {
                                                                                            if (depthForFirst[4] == 0) {
                                                                                                depthForFirst[4] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                                                            }
                                                                                            if (depthForFirstNamespace[4] == 0) {
                                                                                                depthForFirstNamespace[4] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                                                            }
                                                                                            depthForLast[4] = pvCheck.element.x + (pvCheck.element.width / 2)
                                                                                            depth4.get(namespace)[pvIdx] = null
                                                                                        }
                                                                                    })
                                                                                }
                                                                                depth3.get(namespace)[pvcIdx] = null
                                                                                drawPvcIdx++
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                        depth2.get(namespace)[poIdx] = null
                                                    }
                                            });

                                            var serviceTmp = {"kind": "Service", "apiVersion": "v1"}
                                            var serviceTemplate = Object.assign(serviceTmp, service)
                                            var serviceElement = {
                                                'component': 'service',
                                                'label': 'Service',
                                                'width': podCheck ? podCheck.element.width : 100,
                                                'height': 100,
                                                'auto': true
                                            }
                                            serviceElement.x = podCheck ? podCheck.element.x : depthForLast[1] + 150
                                            serviceElement.y = 200 + (200 * 1)
                                            drawSvcIdx++
                                            me.addElement(serviceElement, serviceTemplate)

                                            if (depthForFirst[1] == 0) {
                                                depthForFirst[1] = serviceElement.x - (serviceElement.width / 2)
                                            }
                                            depthForLast[1] = serviceElement.x + (serviceElement.width / 2)

                                            listMap.get("Service").get(namespace)[idx] = null
                                        }
                                    }
                                })

                                listMap.get("Ingress").get(namespace).forEach(function (ingress, idx) {
                                    if (ingress.metadata.name == key) {
                                        if (!ingress.metadata.ownerReferences) {

                                            var ingressElement = {
                                                'component': 'ingress',
                                                'label': 'Ingress',
                                                'width': depthForFirstIngress[2] != 0 ? depthForLast[2] - depthForFirstIngress[2] : 100,
                                                'height': 100,
                                                'auto': true
                                            }
                                            // innerIngressService.set(ingress, tmp)
                                            if (depthForFirstIngress[2] == 0) {
                                                ingressElement.x = depthForLast[2] + 150
                                            } else {
                                                ingressElement.x = (depthForFirstIngress[2] + depthForLast[2]) / 2
                                            }
                                            ingressElement.y = 200 + (200 * 0)
                                            i++
                                            me.addElement(ingressElement, ingress)

                                            if (depthForFirst[0] == 0) {
                                                depthForFirst[0] = ingressElement.x - (ingressElement.width / 2)
                                            }
                                            depthForLast[0] = ingressElement.x + (ingressElement.width / 2)
                                            listMap.get("Ingress").get(namespace)[idx] = null
                                        }
                                    }
                                })
                            })
                        }
                        if (listMap.get("Gateway") && listMap.get("Gateway").get(namespace)) {
                            listMap.get("Gateway").get(namespace).forEach(function (gw, gwIdx) {
                                if (listMap.get("VirtualService") && listMap.get("VirtualService").get(namespace)) {
                                    listMap.get("VirtualService").get(namespace).forEach(function (vsvc, vsvcIdx) {
                                        if (vsvc.spec.gateways) {
                                            if (vsvc.spec.gateways[0] == gw.metadata.name) {
                                                var vsvcCheck = me.drawElement(depthForLast[1], 1, vsvc)
                                                if (depthForFirst[1] == 0) {
                                                    depthForFirst[1] = vsvcCheck.element.x - (vsvcCheck.element.width / 2)
                                                }
                                                if (depthForFirstNamespace[1] == 0) {
                                                    depthForFirstNamespace[1] = vsvcCheck.element.x - (vsvcCheck.element.width / 2)
                                                }
                                                // depthForLast[1] = vsvcCheck.element.x + (vsvcCheck.element.width / 2)
                                                depthForLast[1] = vsvcCheck.element.x + 210
                                                listMap.get("VirtualService").get(namespace)[vsvcIdx] = null

                                                if (listMap.get("Service") && listMap.get("Service").get(namespace)) {
                                                    listMap.get("Service").get(namespace).forEach(function (service, idx) {
                                                        if (service) {
                                                            if (depth2.get(namespace)) {
                                                                depth2.get(namespace).forEach(function (podDeploy, poIdx) {
                                                                    if (podDeploy) {
                                                                        if (service.spec.selector.app == podDeploy.metadata.name) {
                                                                            var count = 0
                                                                            var podCheck = me.drawElement(depthForLast[3], 3, podDeploy)
                                                                            if (podCheck) {
                                                                                if (depthForFirst[3] == 0) {
                                                                                    depthForFirst[3] = podCheck.element.x - (podCheck.element.width / 2)
                                                                                }
                                                                                if (depthForFirstNamespace[3] == 0) {
                                                                                    depthForFirstNamespace[3] = podCheck.element.x - (podCheck.element.width / 2)
                                                                                }
                                                                                depthForLast[3] = podCheck.element.x + (podCheck.element.width / 2)
                                                                                if (depth3.get(namespace)) {
                                                                                    depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                                                                        if (pvc != null) {
                                                                                            var kind = podDeploy.kind.charAt(0).toLowerCase() + podDeploy.kind.slice(1, podDeploy.kind.length)
                                                                                            var vueComponent = me.getComponentByName(kind)
                                                                                            var res = false
                                                                                            var toObj = {
                                                                                                "_type": pvc.kind,
                                                                                                "object": pvc
                                                                                            }
                                                                                            var fromObj = {
                                                                                                "_type": podDeploy.kind,
                                                                                                "object": podDeploy
                                                                                            }
                                                                                            fromObj.connectableType = ["PersistentVolumeClaim", "ConfigMap", "Secret"]
                                                                                            res = vueComponent.methods.isConnected(toObj, fromObj)
                                                                                            if (res) {
                                                                                                var x = podCheck.element.x - 150 + (pvcIdx * 100)
                                                                                                var pvcCheck = me.drawElement(x, 4, pvc);
                                                                                                if (pvcCheck) {
                                                                                                    if (count != 0) {
                                                                                                        drawCount++
                                                                                                    }
                                                                                                    if (depthForFirst[4] == 0) {
                                                                                                        depthForFirst[4] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                                    }
                                                                                                    if (depthForFirstNamespace[4] == 0) {
                                                                                                        depthForFirstNamespace[4] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                                    }
                                                                                                    depthForLast[4] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                                                                                    if (depth4.get(namespace)) {
                                                                                                        depth4.get(namespace).forEach(function (pv) {
                                                                                                            var x = pvcCheck.element.x - 150
                                                                                                            var pvCheck = me.drawElement(x, 5, pv)
                                                                                                            if (pvCheck) {
                                                                                                                depth4.get(namespace)[pvcIdx] = null
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                    depth3.get(namespace)[pvcIdx] = null
                                                                                                    drawPvcIdx++
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            }
                                                                            depth2.get(namespace)[poIdx] = null
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                            drawSvcIdx++

                                                            var svcCheck = me.drawElement(depthForLast[2], 2, service)
                                                            if (depthForFirst[2] == 0) {
                                                                depthForFirst[2] = svcCheck.element.x - (svcCheck.element.width / 2)
                                                            }
                                                            depthForLast[2] = svcCheck.element.x + (svcCheck.element.width / 2)
                                                            listMap.get("Service").get(namespace)[idx] = null
                                                        }
                                                    })
                                                }
                                                if (listMap.get("DestinationRule") && listMap.get("DestinationRule").get(namespace)) {
                                                    listMap.get("DestinationRule").get(namespace).forEach(function (drule, drIdx) {
                                                        if (drule) {
                                                            var druleElement = {
                                                                'component': 'destinationRuleSubset',
                                                                'label': 'DestinationRule',
                                                                'width': 80,
                                                                'height': 80,
                                                                'auto': true
                                                            }
                                                            druleElement.x = depthForLast[2] + 150
                                                            druleElement.y = 200 + (200 * 2)
                                                            me.addElement(druleElement, drule)
                                                            // var drCheck = me.drawElement(depthForFirst[2], 2, drule)
                                                            if (depthForFirst[2] == 0) {
                                                                depthForFirst[2] = 320 - 50
                                                            }
                                                            if (depthForFirstNamespace[2] == 0) {
                                                                depthForFirstNamespace[2] = 320 - 50
                                                            }
                                                            // depthForLast[2] = druleElement.x - 150
                                                            depthForLast[2] = druleElement.x + (druleElement.width * 2) + 50
                                                            listMap.get("DestinationRule").get(namespace)[drIdx] = null
                                                            me.moveToNamespace()

                                                            if (depth2.get(namespace)) {
                                                                depth2.get(namespace).forEach(function (podDeploy, poIdx) {
                                                                    if (podDeploy) {
                                                                        var podCheck = me.drawElement(depthForLast[3], 3, podDeploy)
                                                                        if (podCheck) {
                                                                            if (depthForFirst[3] == 0) {
                                                                                depthForFirst[3] = podCheck.element.x - (podCheck.element.width / 2)
                                                                            }
                                                                            if (depthForFirstNamespace[3] == 0) {
                                                                                depthForFirstNamespace[3] = podCheck.element.x - (podCheck.element.width / 2)
                                                                            }
                                                                            depthForLast[3] = podCheck.element.x + (podCheck.element.width / 2)
                                                                            depth2.get(namespace)[poIdx] = null
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                            if (elementMap.get(namespace)) {
                                                                elementMap.get(namespace).forEach(function (el, elIdx) {
                                                                    if (el && el.kind == 'Rollout') {
                                                                        if (depthForLast[3] == 0) {
                                                                            depthForLast[3] = 100
                                                                        }
                                                                        var elCheck = me.drawElement(depthForLast[3], 3, el)
                                                                        if (elCheck) {
                                                                            if (depthForFirst[3] == 0) {
                                                                                depthForFirst[3] = elCheck.element.x - (elCheck.element.width / 2)
                                                                            }
                                                                            if (depthForFirstNamespace[3] == 0) {
                                                                                depthForFirstNamespace[3] = elCheck.element.x - (elCheck.element.width / 2)
                                                                            }
                                                                            depthForLast[3] = elCheck.element.x + 210
                                                                            elementMap.get(namespace)[elIdx] = null
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    })
                                }
                                var gwElement = {
                                    'component': 'gateway',
                                    'label': 'Gateway',
                                    'width': depthForLast[0] == 0 ? (depthForLast[1] - 250) : 100,
                                    'height': 100,
                                    'auto': true
                                }
                                gwElement.x = depthForLast[0] + (depthForLast[1] / 2)
                                gwElement.y = 200
                                var gwCheck = me.addElement(gwElement, gw)
                                if (depthForFirst[0] == 0) {
                                    depthForFirst[0] = gwElement.x - (gwElement.width / 2)
                                }
                                if (depthForFirstNamespace[0] == 0) {
                                    depthForFirstNamespace[0] = gwElement.x - (gwElement.width / 2)
                                }
                                depthForLast[0] = gwElement.x + (gwElement.width / 2)
                                listMap.get("Gateway").get(namespace)[gwIdx] = null
                            })
                        }
                        if (listMap.get("VirtualService") && listMap.get("VirtualService").get(namespace)) {
                            listMap.get("VirtualService").get(namespace).forEach(function (vsvc, vsvcIdx) {
                                if (listMap.get("Service") && listMap.get("Service").get(namespace)) {
                                    listMap.get("Service").get(namespace).forEach(function (service, idx) {
                                        if (service) {
                                            if (depth2.get(namespace)) {
                                                depth2.get(namespace).forEach(function (podDeploy, poIdx) {
                                                    if (podDeploy) {
                                                        if (service.spec.selector.app == podDeploy.metadata.name) {
                                                            var count = 0
                                                            var podCheck = me.drawElement(depthForLast[2], 2, podDeploy)
                                                            if (podCheck) {
                                                                if (depthForFirst[2] == 0) {
                                                                    depthForFirst[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                                }
                                                                if (depthForFirstNamespace[2] == 0) {
                                                                    depthForFirstNamespace[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                                }
                                                                depthForLast[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                                if (depth3.get(namespace)) {
                                                                    depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                                                        if (pvc != null) {
                                                                            var kind = podDeploy.kind.charAt(0).toLowerCase() + podDeploy.kind.slice(1, podDeploy.kind.length)
                                                                            var vueComponent = me.getComponentByName(kind)
                                                                            var res = false
                                                                            var toObj = {
                                                                                "_type": pvc.kind,
                                                                                "object": pvc
                                                                            }
                                                                            var fromObj = {
                                                                                "_type": podDeploy.kind,
                                                                                "object": podDeploy
                                                                            }
                                                                            fromObj.connectableType = ["PersistentVolumeClaim", "ConfigMap", "Secret"]
                                                                            res = vueComponent.methods.isConnected(toObj, fromObj)
                                                                            if (res) {
                                                                                var x = podCheck.element.x - 150 + (pvcIdx * 100)
                                                                                var pvcCheck = me.drawElement(x, 3, pvc);
                                                                                if (pvcCheck) {
                                                                                    if (count != 0) {
                                                                                        drawCount++
                                                                                    }
                                                                                    if (depthForFirst[3] == 0) {
                                                                                        depthForFirst[3] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                    }
                                                                                    if (depthForFirstNamespace[3] == 0) {
                                                                                        depthForFirstNamespace[3] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                                    }
                                                                                    depthForLast[3] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                                                                    if (depth4.get(namespace)) {
                                                                                        depth4.get(namespace).forEach(function (pv) {
                                                                                            var x = pvcCheck.element.x - 150
                                                                                            var pvCheck = me.drawElement(x, 5, pv)
                                                                                            if (pvCheck) {
                                                                                                depth4.get(namespace)[pvcIdx] = null
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                    depth3.get(namespace)[pvcIdx] = null
                                                                                    drawPvcIdx++
                                                                                }
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                            depth2.get(namespace)[poIdx] = null
                                                        }
                                                    }
                                                });
                                            }
                                            drawSvcIdx++

                                            var svcCheck = me.drawElement(depthForLast[1], 1, service)
                                            if (depthForFirst[1] == 0) {
                                                depthForFirst[1] = svcCheck.element.x - (svcCheck.element.width / 2)
                                            }
                                            depthForLast[1] = svcCheck.element.x + (svcCheck.element.width / 2)
                                            listMap.get("Service").get(namespace)[idx] = null
                                        }
                                    })
                                }
                                if (listMap.get("DestinationRule") && listMap.get("DestinationRule").get(namespace)) {
                                    listMap.get("DestinationRule").get(namespace).forEach(function (drule, drIdx) {
                                        if (drule) {
                                            var druleElement = {
                                                'component': 'destinationRuleSubset',
                                                'label': 'DestinationRule',
                                                'width': 80,
                                                'height': 80,
                                                'auto': true
                                            }
                                            druleElement.x = depthForLast[1] + 150
                                            druleElement.y = 200 + (200 * 1)
                                            var drCheck = me.addElement(druleElement, drule)
                                            if (depthForFirst[1] == 0) {
                                                depthForFirst[1] = 320 - 50
                                            }
                                            if (depthForFirstNamespace[1] == 0) {
                                                depthForFirstNamespace[1] = 320 - 50
                                            }
                                            depthForLast[1] = druleElement.x - 150
                                            listMap.get("DestinationRule").get(namespace)[drIdx] = null
                                            if (depth2.get(namespace)) {
                                                depth2.get(namespace).forEach(function (podDeploy, poIdx) {
                                                    if (podDeploy) {
                                                        var podCheck = me.drawElement(depthForLast[2], 2, podDeploy)
                                                        if (podCheck) {
                                                            if (depthForFirst[2] == 0) {
                                                                depthForFirst[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                            }
                                                            if (depthForFirstNamespace[2] == 0) {
                                                                depthForFirstNamespace[2] = podCheck.element.x - (podCheck.element.width / 2)
                                                            }
                                                            depthForLast[2] = podCheck.element.x + (podCheck.element.width / 2)
                                                            depth2.get(namespace)[poIdx] = null
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                                if (vsvc) {
                                    var vsvcCheck = me.drawElement(depthForFirst[0], 0, vsvc)
                                    if (depthForFirst[0] == 0) {
                                        depthForFirst[0] = vsvcCheck.element.x - (vsvcCheck.element.width / 2)
                                    }
                                    if (depthForFirstNamespace[0] == 0) {
                                        depthForFirstNamespace[0] = vsvcCheck.element.x - (vsvcCheck.element.width / 2)
                                    }
                                    depthForLast[0] = vsvcCheck.element.x + (vsvcCheck.element.width / 2)
                                    listMap.get("VirtualService").get(namespace)[vsvcIdx] = null
                                }
                            })
                        }
                        if (listMap.get("Service") && listMap.get("Service").get(namespace)) {
                            listMap.get("Service").get(namespace).forEach(function (service, idx) {
                                var podCheck = null
                                if (service) {
                                    if (depth2.get(namespace)) {
                                        depth2.get(namespace).forEach(function (podDeploy, poIdx) {
                                            if (podDeploy) {
                                                if (service.spec.selector.app == podDeploy.metadata.name) {
                                                    var count = 0
                                                    var drawCount = 0
                                                    podCheck = me.drawElement(depthForLast[1], 1, podDeploy)
                                                    if (podCheck) {
                                                        if (depthForFirst[1] == 0) {
                                                            depthForFirst[1] = podCheck.element.x - (podCheck.element.width / 2)
                                                        }
                                                        if (depthForFirstNamespace[1] == 0) {
                                                            depthForFirstNamespace[1] = podCheck.element.x - (podCheck.element.width / 2)
                                                        }
                                                        depthForLast[1] = podCheck.element.x + (podCheck.element.width / 2)
                                                        if (depth3.get(namespace)) {
                                                            depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                                                if (pvc != null) {
                                                                    var kind = podDeploy.kind.charAt(0).toLowerCase() + podDeploy.kind.slice(1, podDeploy.kind.length)
                                                                    var vueComponent = me.getComponentByName(kind)
                                                                    var res = false
                                                                    var toObj = {"_type": pvc.kind, "object": pvc}
                                                                    var fromObj = {
                                                                        "_type": podDeploy.kind,
                                                                        "object": podDeploy
                                                                    }
                                                                    fromObj.connectableType = ["PersistentVolumeClaim", "ConfigMap", "Secret"]
                                                                    res = vueComponent.methods.isConnected(toObj, fromObj)
                                                                    if (res) {
                                                                        var x = podCheck.element.x - 150 + (pvcIdx * 100)
                                                                        var pvcCheck = me.drawElement(x, 2, pvc);
                                                                        if (pvcCheck) {
                                                                            if (count != 0) {
                                                                                drawCount++
                                                                            }
                                                                            if (depthForFirst[2] == 0) {
                                                                                depthForFirst[2] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                            }
                                                                            if (depthForFirstNamespace[2] == 0) {
                                                                                depthForFirstNamespace[2] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                                            }
                                                                            depthForLast[2] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                                                            if (depth4.get(namespace)) {
                                                                                depth4.get(namespace).forEach(function (pv) {
                                                                                    var x = pvcCheck.element.x - 150
                                                                                    var pvCheck = me.drawElement(x, 3, pv)
                                                                                    if (pvCheck) {
                                                                                        if (depthForFirst[3] == 0) {
                                                                                            depthForFirst[3] = pvCheck.x - (pvCheck.width / 2)
                                                                                        }
                                                                                        if (depthForFirstNamespace[3] == 0) {
                                                                                            depthForFirstNamespace[3] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                                                        }
                                                                                        depthForLast[3] = pvCheck.element.x + (pvCheck.element.width / 2)
                                                                                        depth4.get(namespace)[pvcIdx] = null
                                                                                    }
                                                                                })
                                                                            }
                                                                            depth3.get(namespace)[pvcIdx] = null
                                                                            drawPvcIdx++
                                                                        }
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                    depth2.get(namespace)[poIdx] = null
                                                }
                                            }
                                        });
                                    }
                                    drawSvcIdx++
                                    var svcCheck = me.drawElement(depthForLast[0], 0, service)

                                    if (depthForFirst[0] == 0) {
                                        depthForFirst[0] = svcCheck.element.x - (svcCheck.element.width / 2)
                                    }
                                    depthForLast[0] = svcCheck.element.x + (svcCheck.element.width / 2)
                                    listMap.get("Service").get(namespace)[idx] = null
                                }
                            })
                        }
                        if (depth2 && depth2.get(namespace)) {
                            depth2.get(namespace).forEach(function (podDeploy, idx) {
                                var podCheck = null
                                var count = 0
                                podCheck = me.drawElement(depthForLast[0], 0, podDeploy);
                                if (podCheck) {
                                    if (depthForFirst[0] == 0) {
                                        depthForFirst[0] = podCheck.element.x - (podCheck.element.width / 2)
                                    }
                                    if (depthForFirstNamespace[0] == 0) {
                                        depthForFirstNamespace[0] = podCheck.element.x - (podCheck.element.width / 2)
                                    }
                                    depthForLast[0] = podCheck.element.x + (podCheck.element.width / 2)
                                    if (depth3.get(namespace)) {
                                        depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                            if (pvc != null) {
                                                var kind = podDeploy.kind.charAt(0).toLowerCase() + podDeploy.kind.slice(1, podDeploy.kind.length)
                                                var vueComponent = me.getComponentByName(kind)
                                                var res = false
                                                var toObj = {"_type": pvc.kind, "object": pvc}
                                                var fromObj = {"_type": podDeploy.kind, "object": podDeploy}
                                                fromObj.connectableType = ["PersistentVolumeClaim", "ConfigMap", "Secret"]
                                                res = vueComponent.methods.isConnected(toObj, fromObj)
                                                if (res) {
                                                    var x = podCheck.element.x - 150
                                                    var pvcCheck = me.drawElement(x, 1, pvc);
                                                    if (pvcCheck) {
                                                        if (count != 0) {
                                                            drawCount++
                                                        }
                                                        if (depthForFirst[1] == 0) {
                                                            depthForFirst[1] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                        }
                                                        if (depthForFirstNamespace[1] == 0) {
                                                            depthForFirstNamespace[1] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                                        }
                                                        depthForLast[1] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                                        if (depth4.get(namespace)) {
                                                            depth4.get(namespace).forEach(function (pv, pvIdx) {
                                                                var x = pvcCheck.element.x - 150
                                                                var pvCheck = me.drawElement(x, 2, pv)
                                                                if (pvCheck) {
                                                                    if (depthForFirst[2] == 0) {
                                                                        depthForFirst[2] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                                    }
                                                                    if (depthForFirstNamespace[2] == 0) {
                                                                        depthForFirstNamespace[2] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                                    }
                                                                    depthForLast[2] = pvCheck.element.x + (pvCheck.element.width / 2)
                                                                    depth4.get(namespace)[pvIdx] = null
                                                                }
                                                            })
                                                        }
                                                        depth3.get(namespace)[pvcIdx] = null
                                                        drawPvcIdx++
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        if (depth3 && depth3.get(namespace)) {
                            depth3.get(namespace).forEach(function (pvc, pvcIdx) {
                                if (pvc) {
                                    var pvcCheck = me.drawElement(depthForLast[0], 0, pvc);
                                    if (pvcCheck) {
                                        if (depthForFirst[0] == 0) {
                                            depthForFirst[0] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                        }
                                        if (depthForFirstNamespace[0] == 0) {
                                            depthForFirstNamespace[0] = pvcCheck.element.x - (pvcCheck.element.width / 2)
                                        }
                                        depthForLast[0] = pvcCheck.element.x + (pvcCheck.element.width / 2)
                                        if (depth4.get(namespace)) {
                                            depth4.get(namespace).forEach(function (pv, pvIdx) {
                                                var x = pvcCheck.element.x - 150
                                                var pvCheck = me.drawElement(x, 1, pv)
                                                if (pvCheck) {
                                                    if (depthForFirst[1] == 0) {
                                                        depthForFirst[1] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                    }
                                                    if (depthForFirstNamespace[1] == 0) {
                                                        depthForFirstNamespace[1] = pvCheck.element.x - (pvCheck.element.width / 2)
                                                    }
                                                    depthForLast[1] = pvCheck.element.x + (pvCheck.element.width / 2)
                                                    depth4.get(namespace)[pvIdx] = null
                                                }
                                            })
                                        }
                                        depth3.get(namespace)[pvcIdx] = null
                                        drawPvcIdx++
                                    }
                                }
                            })
                        }
                        if (depth4 && depth4.get(namespace)) {
                            depth4.get(namespace).forEach(function (pv, pvIdx) {
                                if (pv) {
                                    var pvCheck = me.drawElement(depthForLast[0], 0, pv)
                                    if (pvCheck) {
                                        if (depthForFirst[0] == 0) {
                                            depthForFirst[0] = pvCheck.element.x - (pvCheck.element.width / 2)
                                        }
                                        if (depthForFirstNamespace[0] == 0) {
                                            depthForFirstNamespace[0] = pvCheck.element.x - (pvCheck.element.width / 2)
                                        }
                                        depthForLast[0] = pvCheck.element.x + (pvCheck.element.width / 2)
                                        depth4.get(namespace)[pvIdx] = null
                                    }
                                }
                            })
                        }
                        if (elementMap && elementMap.get(namespace)) {
                            elementMap.get(namespace).forEach(function (el, elIdx) {
                                if (el) {
                                    var elCheck = me.drawElement(depthForLast[0], 0, el)
                                    if (elCheck) {
                                        if (depthForFirst[0] == 0) {
                                            depthForFirst[0] = elCheck.element.x - (elCheck.element.width / 2)
                                        }
                                        if (depthForFirstNamespace[0] == 0) {
                                            depthForFirstNamespace[0] = elCheck.element.x - (elCheck.element.width / 2)
                                        }
                                        depthForLast[0] = elCheck.element.x + (elCheck.element.width / 2)
                                        elementMap.get(namespace)[elIdx] = null
                                    }
                                }
                            })
                        }

                        var namespaceHeight = 100;
                        var depthForLastReverse = JSON.parse(JSON.stringify(depthForLast)).reverse();

                        depthForLastReverse.some(function (item, idx) {
                            if (item != 0) {
                                namespaceHeight = namespaceHeight + (1000 - 200 * idx);
                                return true;
                            }
                        })

                        var max = depthForLast.reduce(function (previous, current) {
                            return previous > current ? previous : current
                        })

                        var namespaceElement = {
                            'component': 'namespace',
                            'label': 'Namespace',
                            'width': max != 0 ? max : 100,
                            'height': namespaceHeight,
                            'auto': true
                        }

                        if (namespaceIdx == 0) {
                            namespaceElement.x = (max + 100) / 2
                        } else {
                            namespaceElement.width = max - depthForNamespace[namespaceIdx - 1]
                            namespaceElement.x = (max + depthForNamespace[namespaceIdx - 1] + 100) / 2
                        }
                        namespaceElement.y = namespaceHeight / 2 + 50
                        depthForNamespace[namespaceIdx] = max

                        var namespaceObject;

                        if (namespaceMap.get(namespace)) {
                            namespaceObject = namespaceMap.get(namespace)
                        } else {
                            namespaceObject = {
                                "apiVersion": "v1",
                                "kind": "Namespace",
                                "metadata": {
                                    "name": namespace,
                                },
                                "spec": {
                                    "finalizers": [
                                        "kubernetes"
                                    ]
                                }
                            }
                        }
                        if (namespaceObject.metadata.name != 'undefined') {
                            me.addElement(namespaceElement, namespaceObject)
                        }
                    })

                    me.yamlModalhide();
                    me.$nextTick(function () {
                        me.addRelations();
                        me.moveToNamespace();
                        me.localYamlText = '';
                        me.reverseYaml = false;
                    })
                })
            },
            drawElement(index, depth, object) {
                var me = this
                if (!object) {
                    return
                }
                var element = {
                    'label': object.kind,
                    'width': 100,
                    'height': 100
                }
                var res = me.includeElement(object.kind)
                if (res) {
                    res = me.getComponentByClassName(object.kind)
                    element.component = res.name
                } else {
                    element.component = 'crdTemplate'
                    element.object = object
                }
                var res = me.getComponentByClassName(object.kind)
                element.component = res.name
                if (element.component == 'crdTemplate') {
                    element.object = object
                }

                element.x = 100 + index + (element.width / 2)
                element.y = 200 + 200 * depth
                me.addElement(element, object)

                return {element: element, template: object}
                // return element
            },
            drawFrameYaml(yamlText, object) {
                var me = this
                var lists = yamlText.split("---")

                lists.forEach(function (item) {
                    if (item.length > 1) {
                        var parseItem = YAML.parse(item)
                        var kind = parseItem.kind.toLowerCase()

                        var element
                        var elements = me.elementTypes.flat();
                        elements.forEach(function (el) {
                            var type = el.component.toLowerCase()
                            if ((type == kind) && (el.width && el.height)) {
                                element = el
                            } else if ((kind == 'destinationrule') && (el.width && el.height)) {
                                element = {
                                    'component': 'destinationRule',
                                    'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/istio/istio-drule.svg`,
                                    'width': 320,
                                    'height': 175,
                                }
                            } else if ((kind == 'workflow') && (el.width && el.height)) {
                                element = {
                                    'component': 'destinationRule',
                                    'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`,
                                    'width': 600,
                                    'height': 250,
                                }
                            }
                        });
                        if (parseItem.metadata.annotations) {
                            if (parseItem.metadata.annotations['msaez.io/x']) {
                                element.x = Number(parseItem.metadata.annotations['msaez.io/x']) + object.parentX
                                parseItem.metadata.annotations['msaez.io/x'] = String(element.x)
                            }
                            if (parseItem.metadata.annotations['msaez.io/y']) {
                                element.y = Number(parseItem.metadata.annotations['msaez.io/y']) + object.parentY
                                parseItem.metadata.annotations['msaez.io/y'] = String(element.y)
                            }
                            if (parseItem.metadata.annotations['msaez.io/width']) {
                                element.width = Number(parseItem.metadata.annotations['msaez.io/width'])
                            }
                            if (parseItem.metadata.annotations['msaez.io/height']) {
                                element.height = Number(parseItem.metadata.annotations['msaez.io/height'])

                            }
                        }
                        me.addElement(element, parseItem)
                    }
                })

                me.$nextTick(function () {
                    me.addRelations()
                })
            },
            moveToNamespace() {
                var me = this;
                var value =  me.embedded ? me.value.k8sValue : me.value;
                Object.keys(value.elements).forEach((key) => {
                    if(value.elements[key]) {
                        me.$set(value.elements[key].elementView, 'x', value.elements[key].elementView.x + 1);
                    }
                });
            },
            yamlModalShow() {
                var me = this;
                me.$modal.show('yamlModal');
                me.codeView = true;
            },
            yamlModalhide() {
                this.codeView = false;
                this.$modal.hide('yamlModal');
            },
            async openCodeViewer() {
                var me = this;

                try {
                    me.gitAccessToken = localStorage.getItem("gitAccessToken");
                    // me.model = []

                    var filtered = me.filteredProjectName(me.projectName);
                    if (filtered.replace(/\s/gi, "") == "") {
                        // validationResults
                        var validationResultIndex =
                            me.canvasValidationResults.findIndex(
                                (x) => x.code == me.ESC_NOT_PJ_NAME
                            );
                        var isExistValidationResult =
                            validationResultIndex == -1 ? false : true;
                        if (!isExistValidationResult) {
                            me.canvasValidationResults.push(
                                me.validationFromCode(me.ESC_NOT_PJ_NAME)
                            );
                        }
                        me.projectName = window.prompt(
                            "Please input your Project Name(Alphabet Only)"
                        );
                        return false;
                    } else {
                        me.checkName = true;
                        me.openSeparatePanel();
                        return true;
                    }
                } catch (e) {
                    console.error(e);
                    alert("openCodeViewer:: ", e);
                    return false;
                }
            },
            codeModalhide() {
                this.$modal.hide('codeModal');
                this.codeView = false;
            },
            toggleGrip() {
                this.dragPageMovable = !this.dragPageMovable;
                if (this.dragPageMovable) {
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else {
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            onConnectShape: function (edge, from, to) {
                var me = this;
                var edgeElement;
                if (edge.shape) {
                    edgeElement = edge;
                } else {
                    edgeElement = edge.element;
                }

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var sourceComponent = from.$parent ? from.$parent : from;
                    var targetComponent = to.$parent ? to.$parent : to;
                    var sourceValue = sourceComponent.value ? sourceComponent.value : sourceComponent;
                    var targetValue = targetComponent.value ? targetComponent.value : targetComponent;
                    var customRelation = sourceValue.relationComponent ? sourceValue.relationComponent : 'kube-relation';

                    var componentInfo = {
                        component: customRelation,
                        sourceElement: sourceValue,
                        targetElement: targetValue,
                        vertices: vertices,
                        isFilled: true,
                        isRelation: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    };

                    sourceValue.elementView.id = from.id;
                    targetValue.elementView.id = to.id;

                    me.canvas.removeShape(edgeElement, true);

                    if (me.validateRelation(from.id, to.id)) {
                        me.addElement(componentInfo);
                    }
                }
            },
            modifyRelation(element) {
                if (element.sourceElement.connectableType) {
                    if (element.sourceElement.connectableType.includes(element.targetElement._type)) {
                        return false;
                    } else {
                        return element;
                    }
                } else {
                    return false;
                }
            },
            addElement: function (componentInfo, object) {
                var me = this;
                var vueComponent = me.getComponentByName(componentInfo.component);
                var element;

                if (componentInfo.component == "newCrd") {
                    me.definedCrdDialog();
                    return;
                }

                if (componentInfo.isRelation) {
                    var sourceValue = componentInfo.sourceElement.value ? componentInfo.sourceElement.value : componentInfo.sourceElement
                    var targetValue = componentInfo.targetElement.value ? componentInfo.targetElement.value : componentInfo.targetElement

                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        sourceValue,
                        targetValue,
                        componentInfo.vertices,
                        object
                    );

                } else {
                    if (componentInfo.auto) {
                        element = vueComponent.computed.createNew(
                            this.uuid(),
                            componentInfo.x,
                            componentInfo.y,
                            componentInfo.width,
                            componentInfo.height,
                            object
                        );
                    } else if (componentInfo.component == "crdTemplate") {
                        element = vueComponent.computed.createNew(
                            this.uuid(),
                            componentInfo.x,
                            componentInfo.y,
                            me.$store.getters.getWidth(componentInfo.component),
                            me.$store.getters.getHeight(componentInfo.component),
                            componentInfo.object,
                            componentInfo.label,
                            componentInfo.src,
                            componentInfo.color,
                        );
                    } else {
                        if(componentInfo.component == "workflow") {
                            element = vueComponent.computed.createNew(
                                this.uuid(),
                                componentInfo.x,
                                componentInfo.y,
                                me.$store.getters.getWidth(componentInfo.component),
                                me.$store.getters.getHeight(componentInfo.component),
                                object,
                                componentInfo.label.replace("Workflow - ", "")
                            );
                        } else {
                            element = vueComponent.computed.createNew(
                                this.uuid(),
                                componentInfo.x,
                                componentInfo.y,
                                me.$store.getters.getWidth(componentInfo.component),
                                me.$store.getters.getHeight(componentInfo.component),
                                object
                            );
                        }
                    }
                }

                if(me.embedded) {
                    if (!me.value.k8sValue) {
                        me.value.k8sValue = {'elements': {}, 'relations': {}};
                    }
                    me.addElementPush(me.value.k8sValue, element);
                } else {
                    me.addElementPush(me.value, element);
                }

                return element;
            },
            definedCrdDialog() {
                var me = this;
                me.definedDialog = true;
            },
            addDefinedCrd(crdObj) {
                var me = this
                if (crdObj.kind == '' || crdObj.icon == '' || crdObj.color == '' || crdObj.yaml == '') {
                    return;
                }
                me.userDefinedCRD.push({
                    "_type": crdObj.kind,
                    "imgSrc": crdObj.icon,
                    "color": crdObj.color,
                    "object": jsyaml.load(crdObj.yaml)
                });
                localStorage['userDefinedCRD'] = JSON.stringify(me.userDefinedCRD);
                crdObj = {
                    kind: '',
                    icon: '',
                    color: '',
                    yaml: ''
                };
                me.definedCrd = crdObj;
                me.definedDialog = false;

                me.$nextTick(() => {
                    window.location.reload();
                });
            },
            includeElement(obj) {
                var me = this;
                var include = false;
                var elements = me.elementTypes.flat();
                include = elements.some((el) => {
                    var type = el.component.toLowerCase();
                    if (type == obj || type.includes(obj) || obj.includes(type)) {
                        return true;
                    } else if (obj.includes('relation')) {
                        return true;
                    }
                });
                return include;
            },
            filteredProjectName(projectName) {
                var me = this;

                var getProjectName = projectName ? projectName : me.projectName;
                var filteredName = JSON.parse(JSON.stringify(getProjectName));
                var pattern1 = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi; //특수문자 제거
                var pattern2 = /[0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+|-|<>?:{}]/gi; // 한글 제거

                if (filteredName) {
                    if (pattern1.test(filteredName)) {
                        filteredName = filteredName.replace(pattern1, "");
                    }
                    if (pattern2.test(filteredName)) {
                        filteredName = filteredName.replace(pattern2, "");
                    }
                    filteredName = filteredName.toLowerCase();
                } else {
                    return "untitled";
                }
                return filteredName == "" ? "untitled" : filteredName;
            },
            getComponentByClassName(className) {
                var componentByClassName;

                $.each(window.Vue.KubeModelingComponents, (i, component) => {
                    if (component.default.computed && 
                            component.default.computed.className && 
                            component.default.computed.className() == className
                    ) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
            fileType(file) {
                var type;

                if (file.includes('.java')) {
                    type = 'java';
                } else if (file.includes('Dockerfile')) {
                    type = 'docker';
                } else if (file.includes('.xml')) {
                    type = 'xml';
                } else if (file.includes('.yaml') || file.includes('.yml') || file.includes('.properties') || file.includes('mvnw') || file.includes('.groovy')) {
                    type = 'txt';
                } else if (file.includes('md')) {
                    type = 'md';
                } else if (file.includes('.jpg') || file.includes('.png') || file.includes('.jpeg')) {
                    type = 'png';
                } else if (file.includes('.json')) {
                    type = 'json';
                } else if (file.includes('.py')) {
                    type = 'python';
                }

                return type;
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
            async generateZip() {
                var me = this;

                if (me.treeList.length > 0) {
                    me.isDownloading = true;
                    var zip = new JSZip();

                    if (!me.projectName) {
                        var name = 'local';
                    } else {
                        var name = me.projectName;
                    }

                    if (me.template == 'Single File') {
                        var filename = name + '.yaml';
                        var code = me.treeList[0].code;
                        var file = new File([code], filename, {type: "text/yaml;charset=utf-8"});
                        saveAs(file);
                    } else if (me.template == 'Helm') {
                        var name = me.treeList[0].name;
                        var templates = [];

                        me.treeList[0].children.forEach((item) => {
                            if (item.name == 'templates') {
                                templates = item;
                            } else {
                                zip.folder(name).file(item.name, item.code);
                            }
                        });

                        templates.children.forEach((item) => {
                            zip.folder(name).folder('templates').file(item.name, item.code);
                        });

                        zip.generateAsync({type: "blob"})
                            .then((content) => {
                                saveAs(content, `${name}.zip`);
                            });

                    } else {
                        me.treeList.forEach((item) => {
                            zip.folder(name).file(item.name, item.code);
                        });

                        zip.generateAsync({type: "blob"})
                            .then((content) => {
                                saveAs(content, `${name}.zip`);
                            });
                    }
                    me.generateZipDialog = false;
                    me.isDownloading = false;
                }
            },
            async startIDE() {
                var me = this
                var userName = localStorage.getItem("author").split('@')[0].toLowerCase();
                var userGroup = localStorage.getItem("author").split('@')[1].split('.')[0].toLowerCase();
                var projectName = me.projectName.toLowerCase();
                var projectId = me.$route.params.projectId;
                var podStatus = await me.getPodStatus(userName, userGroup, projectName);
                var hashName;

                var serverUrl, serverToken;

                if (this.$route.params.courseId) {
                    serverToken = me.$parent.classInfo.token;
                    serverUrl = me.$parent.classInfo.serverUrl;
                }

                // Lab인지 일반 Kubernetes인지 구분
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

                var configPath = `${userGroup}/${userName}/config`
                var checkConfigFile;
                try {
                    checkConfigFile = await me.getString('storage://labs-msaez.io/' + configPath + '/config');
                } catch (e) {
                    checkConfigFile = null
                }
                var projectId = me.$route.params.projectId;

                if (me.$route.params.labId) {
                    var course = me.courseId;
                    var clazz = me.classId;
                    var clazzName = clazz
                    var lab = me.labId;
                }

                var spec = {
                    "apiVersion": "uengine.org/v1alpha1",
                    "kind": "Ide",
                    "metadata": {
                        "name": hashName
                    },
                    "spec": {
                        "hashName": hashName,
                        "userId": localStorage.getItem("author").replace("@", "_"),
                        "image": 'msa-repository.kubeflow.kr/msaez/theia-full-test:v9',
                        "tenant": me.$route.params.labId ? me.getTenantId() : "eventstorming",
                        "course": me.$route.params.labId ? course : `${userGroup}`,
                        "lab": me.$route.params.labId ? lab : `${projectId}`,
                        "clazz": me.$route.params.labId ? clazzName : `users`,
                        "status": "running"
                    }
                }
                // await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides`, spec);

                await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides?serverUrl=${serverUrl}&token=${serverToken}`, spec);

                var operatorCheck = await me.checkIdeOperator(hashName);

                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms))
                }

                while (!operatorCheck) {
                    operatorCheck = await me.checkIdeOperator(hashName);
                    await sleep(3000)
                }

                // "config": JSON.stringify(configJson),
                //       "tenant": me.getTenantId(),
                //       "course": course,
                //       "clazz": clazzName,
                //       "userId": userEmail.replace("@", "_"),

                var obj = {
                    "course": me.$route.params.labId ? course : `${userGroup}`,
                    "clazz": me.$route.params.labId ? clazzName : `users`,
                    "userId": localStorage.getItem("author").replace("@", "_")
                }
                await me.deleteConfig(hashName, obj);
                sleep(3000)
                await me.makeConfig(hashName, obj);

                return hashName;
            },
            async openTerminal() {
                try {
                    var me = this;
                    me.$EventBus.$emit('terminalFrameOn')
                    var userName = localStorage.getItem("author").split('@')[0].toLowerCase();
                    var userGroup = localStorage.getItem("author").split('@')[1].split('.')[0].toLowerCase();
                    var projectName = me.projectName.toLowerCase();
                    var projectId = me.$route.params.projectId;
                    var podStatus = await me.getPodStatus(userName, userGroup, projectName);
                    var hashName;

                    // Lab인지 일반 Kubernetes인지 구분
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

                } catch (e) {
                    console.error(e)
                    alert(e)
                }
                var operatorCheck = await me.checkIdeOperator(hashName);
                if (!operatorCheck) {
                    hashName = await me.startIDE();
                }

                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms))
                }

                while (!operatorCheck) {
                    operatorCheck = await me.checkIdeOperator(hashName);
                    await sleep(3000)
                }
                try {
                    if (operatorCheck) {

                        /** 수정필요 - Eventstorming쪽 참고하여 수정 요망 */
                        var config = await me.getConfigFile();
                        var namespace;
                        var user;
                        var currentContext = config.data["current-context"];
                        var token;
                        config.data.contexts.forEach(function (context) {
                            if (context.context.cluster == currentContext) {
                                namespace = context.context.namespace;
                                user = context.context.user
                            }
                        })
                        config.data.users.forEach(function (userTmp) {
                            if (userTmp.name == user) {
                                token = userTmp.user.token
                                me.clusterInfo.token = token
                            }
                        })
                        var data = {
                            name: localStorage.getItem("clusterName") ? localStorage.getItem("clusterName") : "tmp",
                            config: btoa(JSON.stringify(config.data))
                        }

                        console.log(data)

                        if (me.app.terminal) {
                            me.$EventBus.$emit('terminalOff');
                        } else {
                            me.$EventBus.$emit('terminalOn', data);
                        }
                    }
                } catch (e) {
                    console.log(e)
                    alert(e)
                }
            },
            getConfigFile() {
                var me = this
                return new Promise(function (resolve, reject) {
                    var course = me.$route.params.courseId;
                    var ideUrl
                    var clazzName
                    var userId
                    var userGroup = localStorage.getItem("author").split('@')[1].split('.')[0].toLowerCase();

                    if (me.$route.params.classId) {
                        clazzName = me.$route.params.classId.split('@')[1];
                        ideUrl = me.$parent.classInfo.ideUrl ? me.$parent.classInfo.ideUrl : "kuberez.io";
                        userId = me.$route.params.userId
                    } else {
                        clazzName = "kubernetes"
                        ideUrl = "kuberez.io";
                        userId = localStorage.getItem("email")
                    }
                    me.$http.post(`${me.getProtocol()}//file.${ideUrl}/api/getConfig`, {
                        "tenant": me.$route.params.labId ? me.getTenantId() : "eventstorming",
                        "course": me.$route.params.labId ? course : `${userGroup}`,
                        "clazz": me.$route.params.labId ? clazzName : `users`,
                        "userId": userId,
                    }).then((result) => {
                        resolve(result)
                    }).catch(error => alert(error))
                })
            },
            deployReady() {
                var me = this
                if (localStorage.getItem('clusterAddress') && localStorage.getItem('kuberToken')) {
                    me.deploy();
                    me.deployDialog = false;
                } else {
                    me.deployDialog = false;
                    me.snackbar.show = true;
                    me.snackbar.color = 'error';
                    me.snackbar.text = 'To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.'
                }
            },
            deploy() {
                var me = this;
                me.deployRes = '';
                me.$EventBus.$emit('progressValue', true);

                var valueObj = me.embedded ? me.value.k8sValue : me.value
                var value = valueObj
                var arr = value.elements

                // 빈 array check
                if (Object.keys(arr).length == 0 ||
                    Object.values(arr).filter(function (a) {
                        return a == null
                    }).length == Object.keys(arr).length) {
                    me.$EventBus.$emit('progressValue', false);
                    return false
                }

                Object.keys(value.elements).forEach(async function (key, idx) {
                    var item = value.elements[key]
                    if (item) {
                        var reqObj = await me.getReqUrl(item);
                        var reqUrl = reqObj.reqUrl;
                        var params = {
                            "apiServer": me.$parent.classInfo ? reqObj.reqUrl : me.clusterInfo.apiServer,
                            "clusterAdress": me.clusterInfo.clusterAdress,
                            "token": me.$parent.classInfo ? reqObj.token : me.clusterInfo.token,
                            "data": item.object
                        }

                        if (!item.status) {
                            console.log(reqUrl)
                            me.$http.post(reqUrl + "?serverUrl=" + me.clusterInfo.clusterAddress + "&token=" + params.token, params.data).then(function (res) {
                                // console.log(res.status);
                                reqUrl += item.object.metadata.name;
                                me.getStatusData(reqUrl, item);
                                me.deployed(idx, arr);
                            }).catch(function (error) {
                                var errorMsg
                                if (error.response) {
                                    // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
                                    errorMsg = `<br/> Error Status :${error.response.status}` + '<br/> Error:' + error.response.data.error
                                    if (error.response.data.message.includes('422')) {
                                        errorMsg += '<br/> Message: 422 Unprocessable Entity'
                                    }
                                    errorMsg += '<br/> Message Detail: ' + error.response.data.message
                                } else if (error.request) {
                                    // 요청이 이루어 졌으나 응답을 받지 못했습니다.
                                    // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
                                    // Node.js의 http.ClientRequest 인스턴스입니다.
                                    errorMsg = '<br/> Request Error: 응답이 없습니다.'
                                } else {
                                    // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
                                    errorMsg = '<br/>' + error.message
                                }

                                me.deployRes += ' false';
                                me.deployed(idx, arr, errorMsg);
                            })
                        } else {
                            reqUrl += item.object.metadata.name;
                            me.$http.put(reqUrl, params).then(function (res) {
                                // console.log(res.status);
                                me.getStatusData(params.apiServer, item);
                                me.deployed(idx, arr);
                            }).catch(function (err) {
                                me.deployed(idx, arr);
                                // console.log(err);
                            })
                        }
                    }
                })
            },
            deployed(idx, obj, errMsg) {
                var me = this;
                var res = me.deployRes;
                if (obj && (idx == Object.keys(obj).length - 1)) {
                    me.$EventBus.$emit('progressValue', false);
                    me.snackbar.show = true;

                    me.snackbar.color = 'success';
                    me.snackbar.text = 'Deploy to server completed successfully.'
                    if (res.includes('false')) {
                        me.snackbar.color = 'error';
                        me.snackbar.mode = 'multi-line'
                        me.snackbar.text = `[ Deploy Failed ]${errMsg}`
                    }
                }
            },
            async deleteObj(item) {
                var me = this
                var reqObj = await me.getReqUrl(item)
                var reqUrl = reqObj.reqUrl
                var params = {
                    "apiServer": me.clusterInfo.apiServer,
                    "token": me.clusterInfo.token,
                    "data": item.object
                }

                me.$http.delete(reqUrl, params).then(function (res) {
                    item.status = null
                    console.log(res.status)
                }).catch(function (err) {
                    console.log(err)
                })
            },
            async getReqUrl(item) {
                var me = this;
                var reqUrl = '';
                var type = pluralize(changeCase.camelCase(item._type));

                if (item.object && item.object.apiVersion == 'v1') {
                    var apiVersion = 'api/' + item.object.apiVersion;
                } else if (item.object && item.object.apiVersion != 'v1') {
                    var apiVersion = 'apis/' + item.object.apiVersion;
                }
                var token;
                if (item.object.metadata.namespace) {
                    var namespace = item.object.metadata.namespace;
                } else if (me.$parent.classInfo) {
                    var config = await me.getConfigFile();
                    var namespace;
                    var user;
                    var currentContext = config.data["current-context"];
                    config.data.contexts.forEach(function (context) {
                        if (context.context.cluster == currentContext) {
                            namespace = context.context.namespace;
                            user = context.context.user;
                        }
                    })
                    config.data.users.forEach(function (userTmp) {
                        if (userTmp.name == user) {
                            token = userTmp.user.token;
                            me.clusterInfo.token = token;
                        }
                    })
                } else {
                    var namespace = 'default';
                }

                reqUrl = `${me.getProtocol()}//api.${me.getTenantId()}` + '/' + apiVersion + '/namespaces/' + namespace + '/' + type + '/'

                // namespace가 없이 배포되는 object resources
                if (type == 'persistentvolumes' || type == 'clusterroles' || type == 'clusterrolebindings' || type == 'namespaces' || type == 'storageclasses') {
                    reqUrl = `${me.getProtocol()}//api.${me.getTenantId()}` + '/' + apiVersion + '/' + type + '/'
                }

                return { reqUrl: reqUrl, token: token };
            },
            getStatusData(reqUrl, element) {
                var me = this;
                reqUrl += '?serverUrl=' + me.clusterInfo.apiServer + '&token=' + me.clusterInfo.token;
                console.log(reqUrl)
                me.$http.get(reqUrl).then(function (res) {
                    var obj = {
                        action: "getStatus",
                        element: res.data
                    }

                    me.$EventBus.$emit(`${element.elementView.id}`, obj)
                }).catch(function (err) {
                    console.log('getStatusData', err)
                    var obj = {
                        action: "delStatus",
                    }
                    me.$EventBus.$emit(`${element.elementView.id}`, obj)
                }).finally((e) => {
                    console.log(e)
                })
            },
            // command
            async openCommandDialog(value) {
                var me = this;

                if(value._type.includes('model.Relation') || 
                        value._type.includes('IngressToService')
                ){
                    return false;
                }

                var yaml = '';
                var arr = JSON.parse(localStorage.getItem('selectedElements'));
                arr.forEach(el => {
                    yaml += '--- \n' + me.yamlFilter(json2yaml.stringify(el));
                });
                
                var projectId = me.$route.params.projectId;
                var userEmail = localStorage.getItem("email");

                var eleName = value.object ? value.object.metadata.name : value.name;
                var yamlName = eleName + ".yaml"
                try {
                    if(eleName == ""){
                        return;
                    }

                    var put = await me.putString(`storage://yamlStorage/${projectId}/${userEmail}/${value.object.kind}/${yamlName}`, yaml);
                    var presignedUrl = await me.getURL(`storage://yamlStorage/${projectId}/${userEmail}/${value.object.kind}/${yamlName}`);

                    code += ' "' + presignedUrl + "\"";

                } catch (error) {
                    code += '- <<EOF \n' + yaml + 'EOF';
                }
            },
            commandCopy(cmd, idx) {
                var id = 'copyCommand' + idx;
                let input = document.getElementById(id);
                input.select();
                document.execCommand("copy");
            },
            runCommand(cmd) {
                var me = this;
                me.$EventBus.$emit('sendCode', cmd);
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .embedded {
        position: absolute;
        width: 100%;
        height: 90%;
        left: 0;
        right: 0;
        overflow: hidden;
    }

    .code-preview-left-re-size {
        min-width: 150px;
        max-width: 250px;
    }

    .input-name {
        background-color: #ffffff;
    }

    .canvas-panel {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: absolute;
        overflow: hidden;

        .fullcanvas {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
        }

        .fullcanvashands {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
            cursor: url('../../../../public/static/image/symbol/hands.png'), auto;
        }

        .tools {
            position: absolute;
            width: 60px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow-x: hidden;
            overflow-y: auto;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .search-tool {
            position: absolute;
            width: 50px;
            height: 45px;
            top: 90px;
            left: 20px;
            text-align: center;
            overflow-x: hidden;
            overflow-y: hidden;

            .search-tool-icon > .v-icon {
                font-size: 32px;
                margin-top: 5px;
            }
        }

        .zoom {
            position: absolute;
            width: 42px;
            right: 20px;
            bottom: 120px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .icons {
            cursor: pointer;
            font-size: 30px;

            &:hover {
                color: #ffc124;
            }
        }

        .hands {
            cursor: pointer;
            font-size: 30px;
            color: #ffc124;
        }

        .export,
        .history,
        .import,
        .save {
            position: absolute;
            padding: 8px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
            }
        }

        .import {
            left: 80px;
            bottom: 20px;
        }

        .export {
            left: 180px;
            bottom: 20px;
        }

        .history {
            left: 280px;
            bottom: 20px;
        }
    }

    .searchBox {
        top: 90px;
        left: 80px;
        position: absolute;
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

    /* The whole thing */
    .custom-menu {
        display: none;
        z-index: 1000;
        position: absolute;
        overflow: hidden;
        border: 1px solid #CCC;
        white-space: nowrap;
        font-family: sans-serif;
        background: #FFF;
        color: #333;
        border-radius: 5px;
        padding: 0;
    }

    /* Each of the items in the list */
    .custom-menu li {
        padding: 8px 12px;
        cursor: pointer;
        list-style-type: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #DEF;
    }

    /*.moveable-line.moveable-rotation-line {*/
    /*    height: 40px;*/
    /*    width: 1px;*/
    /*    transform-origin: 0.5px 39.5px;*/
    /*}*/

    /*.moveable {*/
    /*    font-family: "Roboto", sans-serif;*/
    /*    position: relative;*/
    /*    width: 400px;*/
    /*    height: 130px;*/
    /*    text-align: center;*/
    /*    font-size: 40px;*/
    /*    margin: 0 auto;*/
    /*    font-weight: 100;*/
    /*    letter-spacing: 1px;*/
    /*    background: white;*/
    /*}*/

    .video-list {
        height: 160px;
        width: auto;
        margin-left: 2px;
        background: transparent;
    }

    .video-list div {
        padding: 2px;
    }

    .video-item {
        display: inline-block;
        padding: 2px;
    }

    .v-input-prepend-outer {
        font-size: 25px;
        margin-left: 10px;
        margin-block-start: auto;
    }

    .v-input-prepend-outer .prepend-icon {
        font-size: xx-large;
    }

    .v-dialog v-dialog--active {
        background: aliceblue;
        transform-origin: center center;
        align-self: baseline;
    }

    .v-dialog-search {
        top: 90px;
        left: 80px;
        position: absolute;
        background: aliceblue;
        transform-origin: center center;
        align-self: baseline;
    }

    .editor {
        height: 250px;
    }

    .page {
        height: 100%;
        /*padding: 10px;*/
        background: #000;
    }
    .k8s-modeling-undo-redo {
        position: absolute;
        top: 5px;
        left: 100px;
        min-width: 170px !important;
        max-width: 170px !important;
    }

    .k8s-modeling-project-name {
        margin: 50px 0px 0px 5px !important;
        max-width: 150px !important;
    }

    .k8s-hide-cluster,
    .k8s-hide-reverse,
    .k8s-hide-gitops,
    .k8s-hide-save,
    .k8s-hide-code,
    .k8s-hide-fork,
    .k8s-hide-share {
        display: block;
    }

    .k8s-is-mobile {
        display: none;
    }

    @media only screen and (max-width: 1430px) {
        .k8s-hide-cluster,
        .k8s-hide-reverse,
        .k8s-hide-gitops,
        .k8s-hide-save,
        .k8s-hide-code,
        .k8s-hide-fork,
        .k8s-hide-share {
            display: none;
        }
        .k8s-hide-cluster-btn,
        .k8s-hide-reverse-btn,
        .k8s-hide-gitops-btn,
        .k8s-hide-save-btn,
        .k8s-hide-code-btn,
        .k8s-hide-fork-btn,
        .k8s-hide-share-btn {
            min-width:10px !important;
            max-width:10px !important;
        }
    }

    @media only screen and (max-width: 1020px) {
        .k8s-is-mobile {
            display: block !important;
            margin-top: 100px;
            min-width: 100%;
            margin-left: 10%;
        }
        .k8s-is-not-mobile {
            display: none !important;
        }
        .k8s-is-mobile-project-name {
            position: absolute !important;
            right: 120px !important;
        }
    }

    @media only screen and (max-width: 930px) {
        .k8s-is-not-mobile {
            display: none !important;
        }
        .k8s-is-mobile {
            display: block !important;
        }
        .k8s-is-mobile-project-name {
            position: absolute !important;
            right: 160px !important;
            top:-15px
        }
    }

    @media only screen and (max-width: 600px) {
        .k8s-modeling-project-name {
            margin: 50px -60px 0px 5px !important;
            max-width: 110px !important;
        }

        .k8s-is-mobile-project-name {
            position: absolute !important;
            left: 10px !important;
        }
    }    
</style>
