<template>
    <div style="margin-top: 10px;">   
        <v-tabs
            v-model="tab"
            bg-color="primary"
        >
            <v-tab value="mainImage">Main Image</v-tab>
            <v-tab value="colorPalettes">Color Palettes</v-tab>
            <v-tab value="fonts">Fonts</v-tab>
            <v-tab value="menuImages">Images for menus</v-tab>
            <v-tab value="menuUiStyles">UI for menus</v-tab>
            
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item key="mainIamge">
                <div class="auto-modeling-message-border">
                    <v-row style="margin-top:0px; margin-left: 0px;">
                        <v-card class="auto-modeling-message-card"
                                    style="margin-top:10px; margin-bottom: 10px;">
                            <v-card-text class="auto-modeling-message">
                                <vue-typed-js 
                                    :strings="[$t('UIWizardDialoger.imageMessage')]"
                                    :typeSpeed="10"
                                    :showCursor="false"
                                    @onComplete="firstMessageIsTyping = false"
                                >
                                    <span class="typing"></span>
                                </vue-typed-js>
                            </v-card-text>
                            <!-- <v-textarea v-model="imageDescription"></v-textarea> -->
                        </v-card>
                    </v-row>
                    <v-row style="position: relative; right: -8%; margin-bottom: 0px;">
                        <v-card class="auto-modeling-user-story-card" v-if="!firstMessageIsTyping" style="bottom: 10px; top: -5px;">
                            <v-card-text class="auto-modling-textarea" style="margin-bottom: -30px;">
                                <v-textarea
                                v-model="imageDescription"
                                dense
                                auto-grow
                                rows="2"
                                solo
                                >
                                </v-textarea>
                            </v-card-text>

                            <v-btn @click="generateImageDescription"  style="float: right; margin-bottom: 10px; margin-right: 15px;">REGENERATE IMAGE DESCRIPTION</v-btn>
                            <v-btn @click="generateImage" style="float: right; margin-bottom: 10px; margin-right: 15px;">GENERATE IMAGE</v-btn>
                        </v-card>
                    </v-row>
                    <v-row v-if="!isLoading">
                        <v-col v-for="(image) in value.images" :key="image.url">
                            <v-card :style="image === value.selectedImage ? 'border: solid darkturquoise;':''" style="text-align: center; min-width:200px; min-height:200px; padding-top: 5px; padding-bottom: 10px;">
                                <img style="width:256px; height:256px;" :src="image.url" />
                                <div style="height: 36px; width: 100%;">
                                    <v-btn
                                        variant="outlined"
                                        size="small"
                                        @click="selectImage(image)"
                                        style="position: absolute; right: 10px;"
                                    >
                                        SELECT
                                    </v-btn>
                                </div>   
                            </v-card>                                       
                        </v-col>
                    </v-row>
                    <v-row v-else>
                        <v-col>
                            <v-skeleton-loader
                                ref="skeleton"
                                type="card"
                                class="mx-auto"
                            >
                            </v-skeleton-loader>
                        </v-col>
                    </v-row>
                </div>
                <v-btn style="float: right; margin: 15px 5px 10px 0px;" @click="regenerateImages()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
            </v-tab-item>
            <v-tab-item key="colorPalettes">
                <v-tabs
                    v-model="paletteTab"
                    bg-color="primary"
                >
                    <v-tab value="AI color Palettes" @click="changePreViewMode()">AI Palettes</v-tab>
                    <v-tab value="Default Palettes" @click="changePaletteMode()" >Default Palettes</v-tab>
                </v-tabs>
                <v-tabs-items v-model="paletteTab">
                    <v-tab-item key="AI color Palettes">
                        <div class="auto-modeling-message-border">
                            <v-card class="auto-modeling-message-card"
                                        style="margin-top:10px;">
                                <v-card-text class="auto-modeling-message">
                                    <vue-typed-js 
                                        :strings="[$t('UIWizardDialoger.colorPaletteMessage')]"
                                        :typeSpeed="10"
                                        :showCursor="false"
                                    >
                                        <span class="typing"></span>
                                    </vue-typed-js>
                                </v-card-text>
                            </v-card>
                            <v-col style="padding: 0;">
                                <v-card style="margin-top: 10px; display: inline-flex; background-color: #DAF5FF; padding:10px; min-width:200px; min-height:200px;">
                                    <v-col>
                                        <v-row>
                                            <v-col :cols="columnPaletteWidth" v-for="(palette) in value.palettes" v-bind:key="palette.paletteName">
                                                <v-card :style="palette === value.selectedPalette ? 'border: solid darkturquoise;':''" style="padding: 0px 10px 0px 10px;">
                                                    <div style="padding-bottom:20px;">
                                                        <v-card-title class="text-h5;">
                                                            {{palette.paletteName}}
                                                        </v-card-title>
                                                        <div v-for="(color, key) in palette.colors">
                                                            <v-row v-if="color" cols="12" style="margin-bottom: 10px;">
                                                                <v-col cols="2">
                                                                    <div :style="circleStyle(color.colorCode)" @click="editColor(palette, key)"></div>
                                                                </v-col>
                                                                <v-col cols="10">
                                                                    <div style="font-weight: 700;">
                                                                        {{ key }} : {{color.colorName}}
                                                                    </div>
                                                                    <div>
                                                                        {{ color.description }}
                                                                    </div>
                                                                    <div v-if="editMode && selectedPaletteName === palette.paletteName && selecctedEditColor === key">
                                                                        <v-color-picker hide-inputs v-model="color.colorCode"></v-color-picker>
                                                                        <v-icon small style="color: black; float: right; margin-top: -6%; margin-right: 6%; font-size:18px; " @click="saveColor()">mdi-content-save</v-icon>
                                                                    </div>
                                                                </v-col>
                                                            </v-row>
                                                        </div>
                                                        <v-card-actions>
                                                            <v-btn
                                                                class="ms-2"
                                                                variant="outlined"
                                                                size="small"
                                                                @click="selectPalette(palette)"
                                                                style="position: absolute; right:10px; bottom:10px;"
                                                                >
                                                                SELECT
                                                            </v-btn>
                                                        </v-card-actions>
                                                    </div>
                                                </v-card>                                       
                                            </v-col>
                                        </v-row>
                                        <div style="width:100%; margin:15px 0px 0px 0px;">
                                            <v-btn v-if="done" style="float: right;" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                                            <v-btn v-else style="float: right;" @click="stop()"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop Generating</v-btn>
                                        </div>
                                    </v-col>
                                </v-card>
                            </v-col>
                        </div>
                    </v-tab-item>
                    <v-tab-item key="Default Palettes">
                        <v-col v-if="paletteMode">
                            <v-col style="padding: 0;">
                                <v-card style="margin-top: 10px;  background-color: #DAF5FF; padding:10px; min-width:200px; min-height:200px;">
                                    <v-col>
                                        <v-row>
                                            <v-col :cols="columnWidth" v-for="(previewColor, index) in firstPreviewPalettes" v-bind:key="previewColor.paletteName" v-if="index < 3">
                                                <v-card :style="previewColor === selectedPaletteTheme ? 'border: solid darkturquoise;':''" style="padding: 0px 10px 0px 10px;">       
                                                    <div style="padding-bottom:20px;">
                                                        <v-card-title class="text-h5;">
                                                            {{previewColor.paletteName}}
                                                        </v-card-title>
                                                        <div v-for="(color, key) in previewColor.colors">
                                                            <v-row v-if="color" cols="12" style="margin-bottom: 10px;">
                                                                <v-col cols="2">
                                                                    <div :style="circleStyle(color.colorCode)" @click="editColor(previewColor, key)"></div>
                                                                </v-col>
                                                                <v-col cols="10">
                                                                    <div style="font-weight: 700;">
                                                                        {{ key }} : {{color.colorName}}
                                                                    </div>
                                                                    <div>
                                                                        {{ color.description }}
                                                                    </div>
                                                                    <div v-if="editMode && selectedPaletteName === previewColor.paletteName && selecctedEditColor === key">
                                                                        <v-color-picker hide-inputs v-model="color.colorCode"></v-color-picker>
                                                                        <v-icon small style="color: black; float: right; margin-top: -6%; margin-right: 6%; font-size:18px; " @click="saveColor(previewColor)">mdi-content-save</v-icon>
                                                                    </div>
                                                                </v-col>
                                                            </v-row>
                                                        </div>
                                                        <v-card-actions>
                                                            <v-row>
                                                                <v-btn
                                                                    class="ms-2"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    @click="selectPaletteTheme(previewColor)"
                                                                    style="position: absolute; right:115px; bottom:10px;"
                                                                    >
                                                                    SELECT
                                                                </v-btn>
                                                                <v-btn
                                                                    class="ms-2"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    @click="changePaletteMode()"
                                                                    style="position: absolute; right:6px; bottom:10px;"
                                                                >
                                                                    PREVIEW
                                                                </v-btn>
                                                            </v-row>
                                                        </v-card-actions>
                                                    </div>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-card>
                            </v-col>
                            <v-col style="padding: 0;">
                                <v-card style="margin-top: 10px;  background-color: #DAF5FF; padding:10px; min-width:200px; min-height:200px;">
                                    <v-col>
                                        <v-row>
                                            <v-col :cols="columnWidth" v-for="(previewColor,index) in firstPreviewPalettes" v-bind:key="previewColor.paletteName" v-if="index >=3">
                                                <v-card :style="previewColor === selectedPaletteTheme ? 'border: solid darkturquoise;':''" style="padding: 0px 10px 0px 10px;">       
                                                    <div style="padding-bottom:20px;">
                                                        <v-card-title class="text-h5;">
                                                            {{previewColor.paletteName}}
                                                        </v-card-title>
                                                        <div v-for="(color, key) in previewColor.colors">
                                                            <v-row v-if="color" cols="12" style="margin-bottom: 10px;">
                                                                <v-col cols="2">
                                                                    <div :style="circleStyle(color.colorCode)" @click="editColor(previewColor, key)"></div>
                                                                </v-col>
                                                                <v-col cols="10">
                                                                    <div style="font-weight: 700;">
                                                                        {{ key }} : {{color.colorName}}
                                                                    </div>
                                                                    <div>
                                                                        {{ color.description }}
                                                                    </div>
                                                                    <div v-if="editMode && selectedPaletteName === previewColor.paletteName && selecctedEditColor === key">
                                                                        <v-color-picker hide-inputs v-model="color.colorCode"></v-color-picker>
                                                                        <v-icon small style="color: black; float: right; margin-top: -6%; margin-right: 6%; font-size:18px; " @click="saveColor(previewColor)">mdi-content-save</v-icon>
                                                                    </div>
                                                                </v-col>
                                                            </v-row>
                                                        </div>
                                                        <v-card-actions>
                                                            <v-row>
                                                                <v-btn
                                                                    class="ms-2"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    @click="selectPaletteTheme(previewColor)"
                                                                    style="position: absolute; right:115px; bottom:10px;"
                                                                    >
                                                                    SELECT
                                                                </v-btn>
                                                                <v-btn
                                                                    class="ms-2"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    @click="changePaletteMode()"
                                                                    style="position: absolute; right:6px; bottom:10px;"
                                                                >
                                                                    PREVIEW
                                                                </v-btn>
                                                            </v-row>
                                                        </v-card-actions>
                                                    </div>
                                                </v-card>                                       
                                            </v-col> 
                                        </v-row>
                                    </v-col>
                                </v-card>
                            </v-col>
                        </v-col>
                        <v-col v-else>
                            <Preview
                                :selectedPalette="value.selectedPalette"
                                :selectedImage="value.selectedImage"
                                :selectedFont="value.selectedFont"
                                :paletteMode="paletteMode"
                                :firstPreviewPalettes="firstPreviewPalettes"
                                :value="value"
                                @changePalette="changePreViewMode"
                                @showOnePalette="showSinglePalette"
                                v-model="serviceDescription"
                            />
                        </v-col>
                    </v-tab-item>
                </v-tabs-items>
            </v-tab-item>
            <v-tab-item key="fonts">
                <div class="auto-modeling-message-border">
                    <v-card class="auto-modeling-message-card"
                                style="margin-top:10px;">
                        <v-card-text class="auto-modeling-message">
                            <vue-typed-js 
                                :strings="[$t('UIWizardDialoger.fontPaletteMessage')]"
                                :typeSpeed="10"
                                :showCursor="false"
                            >
                                <span class="typing"></span>
                            </vue-typed-js>
                        </v-card-text>
                    </v-card>
                    <v-row>
                        <v-col style="margin-top:10px;" v-for="font in value.fonts">
                            <v-card style="padding-bottom:20px;" :style="font === value.selectedFont ? 'border: solid darkturquoise;':''">
                                <v-col>
                                    <div style="font-weight: 700;">{{ font.fontFamilyName }} : {{ font.fontTitle }}</div>
                                    <div>{{ font.recommendedReason }}</div>
                                    <br>
                                    <div class="preview-font" :style="fontStyle(font.fontFamilyName)">
                                        <h1>Aa Bb Cc Dd Ee Ff Gg</h1>
                                        <h2 >Aa Bb Cc Dd Ee Ff Gg</h2>
                                        <h3>Aa Bb Cc Dd Ee Ff Gg</h3>
                                        <div>Aa Bb Cc Dd Ee Ff Gg</div>
                                        <br>
                                        <h1>가 나 다 라 마 바 사 아</h1>
                                        <h2>가 나 다 라 마 바 사 아</h2>
                                        <h3>가 나 다 라 마 바 사 아</h3>
                                        <div>가 나 다 라 마 바 사 아</div>
                                    </div>
                                    <v-card-actions>
                                        <v-btn
                                            class="ms-2"
                                            variant="outlined"
                                            size="small"
                                            @click="selectFont(font)"
                                            style="position: absolute; right:10px; bottom:10px;"
                                        >
                                            SELECT
                                        </v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-btn style="float: right; margin: 10px 5px 10px 0px;" @click="regenerateFont()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                </div>
            </v-tab-item>

            <v-tab-item key="menuImages" v-if="cachedModels.ESGenerator">
                <div class="auto-modeling-message-border" v-for="(aggregate, key) in aggregates" :key="aggregate.name">
                    <v-row style="position: relative; right: -8%; margin-bottom: 0px;">
                        <v-card class="auto-modeling-user-story-card" style="bottom: 10px; top: -5px;">
                            <v-card-subtitle>Image description for {{aggregate.name}}</v-card-subtitle>
                            <v-card-text class="auto-modling-textarea" style="margin-bottom: -30px;">
                                <v-textarea
                                v-model="aggregates[key].imageDescription"
                                dense
                                auto-grow
                                rows="2"
                                solo
                                >
                                </v-textarea>
                            </v-card-text>

                            <v-btn @click="generateMenuImageDescription(aggregate.name)" text style="float: right; margin-bottom: 10px; margin-right: 15px;">(RE)GENERATE IMAGE DESCRIPTION</v-btn>
                            <v-btn @click="generateMenuImage(aggregate.name)" v-if="!aggregate.isLoading" style="float: right; margin-bottom: 10px; margin-right: 15px;">(RE)GENERATE IMAGE</v-btn>
                        </v-card>
                    </v-row>
                    <v-row v-if="!aggregate.isLoading">
                        <v-col v-for="(image) in aggregate.images" :key="image.url">
                            <v-card :style="image === aggregate.selectedImage ? 'border: solid darkturquoise;':''" style="text-align: center; min-width:200px; min-height:200px; padding-top: 5px; padding-bottom: 10px;">
                                <img style="width:256px; height:256px;" :src="image.url" />
                                <div style="height: 36px; width: 100%;">
                                    <v-btn
                                        variant="outlined"
                                        size="small"
                                        @click="selectMenuImage(aggregate.name, image)"
                                        style="position: absolute; right: 10px;"
                                    >
                                        SELECT
                                    </v-btn>
                                </div>   
                            </v-card>                                       
                        </v-col>
                    </v-row>
                    <v-row v-else>
                        <v-col>
                            <v-skeleton-loader
                                ref="skeleton"
                                type="card"
                                class="mx-auto"
                            >
                            </v-skeleton-loader>
                        </v-col>
                    </v-row>
                </div>
            </v-tab-item>

            <v-tab-item key="menuUiStyles" v-if="cachedModels.ESGenerator">
                <div class="auto-modeling-message-border" v-for="(aggregate, key) in aggregates" :key="aggregate.name">
                    <v-row style="position: relative; right: -8%; margin-bottom: 0px;">
                        <v-card class="auto-modeling-user-story-card" style="bottom: 10px; top: -5px;">
                            <v-card-subtitle>UI Style for {{aggregate.name}}</v-card-subtitle>
                            <v-card-text class="auto-modling-textarea" style="margin-bottom: -30px;">
                                <v-textarea
                                v-model="aggregates[key].uiStyleJson"
                                dense
                                auto-grow
                                rows="2"
                                solo
                                >
                                </v-textarea>
                            </v-card-text>

                            <v-btn @click="generateUIStyle(aggregate.name)" text style="float: right; margin-bottom: 10px; margin-right: 15px;">(RE)GENERATE UI STYLE</v-btn>
                        </v-card>
                    </v-row>
                </div>
            </v-tab-item>
            <Preview
                v-if="paletteMode && selectPalette"
                :selectedPalette="value.selectedPalette"
                :selectedImage="value.selectedImage"
                :selectedFont="value.selectedFont"
                :paletteMode="paletteMode"
                :value="value"
                @changePalette="changePaletteMode()"
                v-model="serviceDescription"
            />
        </v-tabs-items>
    </div>
</template>
<script>
    import { VueTypedJs } from 'vue-typed-js'
    import ColorPaletteGenerator from './ColorPaletteGenerator.js'
    import ImageGenerator from './AIImageGenerator.js'
    import FontGenerator from './FontGenerator.js'
    import Preview from './Preview.vue';
    import ImageDescriptionGenerator from './ImageDescriptionGenerator'
    import UIStyleGenerator from './UIStyleGenerator.js'
    
    export default {
        name: 'ui-wizard-dialoger',
        props: {
            value: Object,
            prompt: String,
            cachedModels: Object,
            projectId: String,
        },
        components: {
            VueTypedJs,
            Preview,
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
            input(){
                return {title: this.prompt};
            },
            columnWidth() {
                return 12 / (this.firstPreviewPalettes.length / 2);
            },
            columnPaletteWidth() {
                return 12 / this.value.palettes.length;
            }
        },
        created(){
        },
        watch: {
        },
        mounted(){
            var me = this;
            me.init(); 
        },
        data() {
            return {
                selectedPaletteTheme: null,
                paletteMode:true,
                firstMessageIsTyping: true,
                isLoading: false,
                selectedPaletteName: null,
                selecctedEditColor: null,
                editMode:false,
                serviceDescription: {
                    serviceName: null,
                    serviceDescription: null,
                    title: this.prompt
                },
                tab: "mainImage",
                paletteTab: "colorPalettes",
                done: false,                
                step: 1,
                imageDescription: null,
                generator: null,
                imageDescriptionGenerator: null,
                imageGenerator: null,
                fontGenerator: null,
                aggregates: [],
                firstPreviewPalettes:[
                    {
                        "paletteName": "Bright Accent Colors",
                        "colors":{
                            "background": {
                                "colorCode": "#2025B2",
                                "colorName": "Royal Blue", 
                                "description": "강력하고 화려한 느낌을 주는 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#EAEAEA", 
                                "colorName": "Silver", 
                                "description": "차분하고 깔끔한 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#E8E8E8", 
                                "colorName": "Light Gray", 
                                "description": "깨끗하고 현대적인 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#f5f5f5", 
                                "colorName": "White Smoke", 
                                "description": "부드러운 중립성과 깨끗한 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#D46155", 
                                "colorName": "Dark Salmon", 
                                "description": "열정적이고 감각적인 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#cc4e41", 
                                "colorName": "Brick Red",
                                "description": "힘이 있고 강렬한 느낌을 주는 색상입니다"
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }           
                        }
                    },
                    {
                        "paletteName": "Natural and Earthy",
                        "colors":{
                            "background": {
                                "colorCode": "#4788B2",
                                "colorName": "Steel Blue", 
                                "description": "강력하고 신뢰성 있는 느낌을 주는 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#009B9D", 
                                "colorName": "Teal", 
                                "description": "상쾌하고 고요한 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#FBEEC3", 
                                "colorName": "Champagne", 
                                "description": "부드러운 따뜻한 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#FFFFFE", 
                                "colorName": "Snow", 
                                "description": "깨끗하고 순수한 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#B6C396", 
                                "colorName": "Sage Green", 
                                "description": "자연스럽고 조화로운 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#6A7836", 
                                "colorName": "Olive Drab",
                                "description": "안정적이고 자연스러운 느낌을 주는 색상입니다"
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }        
                        }
                    },
                    {
                        "paletteName": "Elegant Yet Approachable",
                        "colors":{
                            "background": {
                                "colorCode": "#EED9D0",
                                "colorName": "Blush", 
                                "description": "부드러운 피부 톤과 유사한 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#F5E8E2", 
                                "colorName": "Pale Pink", 
                                "description": "부드럽고 귀여운 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#EDC8B9", 
                                "colorName": "Light Salmon Pink ", 
                                "description": "따뜻하고 상큼한 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#325278", 
                                "colorName": "Dark Sapphire", 
                                "description": "밤하늘의 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#AC3B61", 
                                "colorName": "Deep Rose", 
                                "description": "강인하고 화려한 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#7a213f", 
                                "colorName": "Maroon",
                                "description": "포근하고 고급스러운 느낌을 주는 색상입니다."
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }       
                        }
                    },
                    {
                        "paletteName": "Minimal Yet Warm",
                        "colors":{
                            "background": {
                                "colorCode": "#EAE8DC",
                                "colorName": "Pale Ivory", 
                                "description": "부드러운 피부 톤과 유사한 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#F4F4F4", 
                                "colorName": "Light Gray", 
                                "description": "깨끗하고 중립적인 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#8F8D8A", 
                                "colorName": "Medium Gray", 
                                "description": "조용하고 안정적인 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#D8C3A4", 
                                "colorName": "Light Beige", 
                                "description": "자연스럽고 따뜻한 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#E98073", 
                                "colorName": "Salmon Pink", 
                                "description": "기차고 상큼한 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#E85A50",
                                "colorName": "Crimson",  
                                "description": "열정적이고 화려한 느낌을 주는 색상입니다"
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }        
                        }
                    },
                    {
                        "paletteName": "Vibrant and Elegant",
                        "colors":{
                            "background": {
                                "colorCode": "#A8D1E7",
                                "colorName": "Light Sky Blue", 
                                "description": "상쾌하고 부드러운 느낌을 주는 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#E48684", 
                                "colorName": "Light Coral", 
                                "description": "부드럽고 로맨틱한 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#F4F9FB", 
                                "colorName": "Alice Blue", 
                                "description": "상쾌하고 청명한 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#F7E9A0", 
                                "colorName": "Pale Yellow", 
                                "description": "부드럽고 따뜻한 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#F76D6D", 
                                "colorName": "Light Salmon", 
                                "description": "활기차고 매력적인 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#24315E", 
                                "colorName": "Dark Blue",
                                "description": "고요하고 우아한 느낌을 주는 색상입니다"
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }    
                        }
                    },
                    {
                        "paletteName": "Snowy Yet Warm",
                        "colors":{
                            "background": {
                                "colorCode": "#F0F8FF",
                                "colorName": "Cornflower Blue", 
                                "description": "상쾌하고 청명한 느낌을 주는 색상입니다"
                            },
                            "surface": {
                                "colorCode": "#58A0EA", 
                                "colorName": "Sky Blue", 
                                "description": "신선하고 활기찬 느낌을 주는 색상입니다"
                            },
                            "mainText": {
                                "colorCode": "#000000", 
                                "colorName": "Snow White", 
                                "description": "깨끗하고 순수한 느낌을 주는 색상입니다"
                            },
                            "secondaryText": {
                                "colorCode": "#000000", 
                                "colorName": "Pale Ivory", 
                                "description": "부드러운 자연스러움과 따뜻한 느낌을 주는 색상입니다"
                            },
                            "primary": {
                                "colorCode": "#3072CA",
                                "colorName": "Powder Blue", 
                                "description": "부드럽고 우아한 느낌을 주는 색상입니다"
                            },
                            "primary-darken-1": {
                                "colorCode": "#3072CA", 
                                "colorName": "Slate Blue",
                                "description": "안정적이고 현명한 느낌을 주는 색상입니다"
                            },
                            "secondary": {
                                "colorCode": "#424242",
                                "colorName": "Gunmetal", 
                                "description": "어두운 회색 계열에 속합니다"
                            },
                            "secondary-darken-1": {
                                "colorCode": "#212121",
                                "colorName": "Rich Black", 
                                "description": "어두운 검정색 계열에 속합니다"
                            },
                            "error": {
                                "colorCode": "#FF5252", 
                                "colorName": "Coral Red", 
                                "description": "밝은 주홍색 계열에 속합니다"
                            },
                            "info": {
                                "colorCode": "#2196F3", 
                                "colorName": "Dodger Blue", 
                                "description": "밝은 파란색 계열에 속합니다"
                            },
                            "success": {
                                "colorCode": "#4CAF50", 
                                "colorName": "Lime Green", 
                                "description": "밝은 연두색 계열에 속합니다"
                            },
                            "warning": {
                                "colorCode": "#FFC107", 
                                "colorName": "Orange Peel", 
                                "description": "밝은 주황색 계열에 속합니다"
                            }    
                        }
                    }
                ],
            }
        },
        methods: {
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
            changeServiceDescription(serviceDescription){
            },
            generateImage(){
                this.isLoading = true;
                this.imageGenerator.prompt = this.imageDescription;
                this.imageGenerator.generate()
            },
            generateImageDescription(){
                this.imageDescriptionGenerator.generate();
            },
            generateMenuImage(aggregateName){
                let aggregate = this.aggregates.find(agg => agg.name === aggregateName);

                aggregate.isLoading = true;
                aggregate.__ob__.dep.notify()

                let menuImageGenerator = new ImageGenerator({
                    onReceived(data){
                        aggregate.images = data;
                        aggregate.__ob__.dep.notify()
                        
                    },
                    onGenerationFinished(){
                        aggregate.isLoading = false;
                        aggregate.__ob__.dep.notify()
                    }
                }, {prompt: "A main image for a sub menu: " + aggregate.imageDescription, n: 3, size: "256x256"})

                menuImageGenerator.generate()
            },

            generateMenuImageDescription(aggregateName){
                let aggregate = this.aggregates.find(agg => agg.name === aggregateName);

                let menuImageDescriptionGenerator = new ImageDescriptionGenerator({
                    input:{
                        title: aggregate.description
                    },
                    onReceived(data){
                        aggregate.imageDescription = data;
                        aggregate.__ob__.dep.notify()
                    },
                })

                menuImageDescriptionGenerator.generate()
            },

            generateUIStyle(aggregateName){
                let aggregate = this.aggregates.find(agg => agg.name === aggregateName);

                let uiStyleGenerator = new UIStyleGenerator({
                    input:{
                        aggregateName: aggregate.name,
                        model: this.cachedModels.ESGenerator
                    },
                    onReceived(data){
                        aggregate.uiStyleJson = data;
                        aggregate.__ob__.dep.notify()
                    },
                })

                uiStyleGenerator.generate()
            },


            init(){
                var me = this 
                this.imageDescriptionGenerator = new ImageDescriptionGenerator({
                    input:{
                        title: me.prompt
                    },
                    onReceived(data){
                        me.imageDescription = data;
                    },
                });
                this.generator = new ColorPaletteGenerator(this);
                this.imageGenerator = new ImageGenerator({
                    onReceived(data){
                        me.value.images = data;
                    },
                    onGenerationFinished(imgResource){
                        me.$emit("input", me.value);
                        me.$emit("save", me.value);
                        me.isLoading = false;
                    },
                }, {prompt: "A main image for the service: " + me.prompt, n: 3, size: "1024x1024"})
                this.fontGenerator = new FontGenerator({
                    input: {title: me.prompt},
                    onModelCreated(fonts){
                        me.value.fonts = fonts;
                    },
                    onGenerationFinished(fonts){
                        me.$emit("input", me.value);
                        me.$emit("save", me.value);
                    },
                })
                this.step = 1;
                
                if(!me.value){
                    me.value = {
                        selectedPalette: null,
                        selectedFont: null,
                        selectedImage: null,
                        palettes:[],
                        fonts:[],
                        images:[]
                    }
                
                    this.imageDescriptionGenerator.generate();
                    this.fontGenerator.generate();
                    this.generate();
                    
                }
                me.value.selectedPalette = me.firstPreviewPalettes[5]
                me.value.selectedImage = { url: '/static/image/logo.png' };

                if(this.cachedModels && this.cachedModels.ESGenerator){
                    this.aggregates = Object.values(this.cachedModels.ESGenerator.elements).filter(element => element && element._type==='org.uengine.modeling.model.Aggregate')
                }
            },
            regenerateFont() {
                this.value.fonts = [],
                this.fontGenerator.generate();
            },
            regenerateImages(){
                this.value.images = [];
                this.imageGenerator.generate();
            },
            circleStyle(color){
                return "width: 50px; height: 50px; border-radius: 50%; border: solid 2px; background-color: " + color;
            },
            fontStyle(font){
                return "fontFamily: " + font;
            },
            previewColor(colorObj){
                if (colorObj) {
                    return "background-color: " + colorObj.colorCode;
                } else {
                    return "";
                }
            },
            selectPalette(palette){
                this.value.selectedPalette = palette;
                this.emitChangedEvent();
                this.generator.stop();
            },
            selectFont(font){
                this.value.selectedFont = font;
                this.emitChangedEvent();
            },
            selectImage(image){
                this.value.selectedImage = image; 
                this.emitChangedEvent();
            },
            selectMenuImage(aggregateName, image){
                let aggregate = this.aggregates.find(agg => agg.name === aggregateName);

                aggregate.selectedImage = image; 
                aggregate.__ob__.dep.notify()
                this.emitChangedEvent();
            },
            emitChangedEvent(){
                let aggregateImages = {}
                if(this.aggregates){
                    this.aggregates.forEach(aggregate =>{
                        aggregateImages[aggregate.name] = aggregate.selectedImage
                    })
                }

                let me = this
                let uiStyle = {
                    palette: this.value.selectedPalette, 
                    logoImage: this.value.selectedImage,
                    font: this.value.selectedFont,
                    serviceDescription: this.serviceDescription,
                    aggregateImages: aggregateImages
                }

                this.$emit("selected", uiStyle)

                const channel = new BroadcastChannel('ui-wizard')//this.$vnode.tag);

                channel.postMessage({
                    event: "StyleChanged",
                    uiStyle: uiStyle
                });


                me.$emit("input", me.value);
                me.$emit("save", me.value);
            },
            onGenerationFinished(palettes){
                this.done = true;
                this.$emit("input", this.value)
                this.$emit("change", this.value)
            },
            onModelCreated(palettes){
                this.value.palettes = palettes;
                
            },
            generate(){
                this.selectedPaletteId = this.uuid();
                this.scenario = '';
                this.generator.generate();
                this.done = false;
            },
            stop(){
                this.generator.stop();
                this.done = true;
            },
            editColor(palettes, color){
                var me = this;
                me.selectedPaletteName = palettes.paletteName;
                me.selecctedEditColor = color
                me.editMode = true;
            },
            saveColor(colorValue){
                var me = this;
                let editPalette = null;

                for(editPalette of me.firstPreviewPalettes){
                    if(editPalette.paletteName == colorValue.paletteName) {
                        editPalette = colorValue
                        break;
                    }
                }
                me.editMode = false;
            },
            selectPaletteTheme(previewColor){
                var me = this;
                me.selectedPaletteTheme = previewColor;
                me.value.selectedPalette = previewColor
                this.emitChangedEvent()
            },
            changePaletteMode(){
                this.paletteMode = false;
            },
            changePreViewMode(){
                this.paletteMode = true;
            },
            showSinglePalette(val){
                var me = this;
                // me.firstPreviewPalettesCopyValue = me.firstColorPalettes
                // me.secondPalettesCopyValue = me.secondrPalettes
                // me.firstColorPalettes = []
                // me.secondrPalettes = []
                me.firstPreviewPalettesCopyValue.push(val) 
                
            }
        }
    }
</script>
<style>
.preview-font h1 {
    margin-bottom:10px;
}
.preview-font h2 {
    margin-bottom:10px;
}
.preview-font h3 {
    margin-bottom:10px;
}
.preview-font div {
    margin-bottom:10px;
}
</style>