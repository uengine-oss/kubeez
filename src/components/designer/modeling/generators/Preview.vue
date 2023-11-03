<template>
    <div v-if="paletteMode && selectedPalette">
        <v-row cols="12">
            <v-col cols="4"></v-col>
            <v-col cols="8">
                <v-card style="margin:20px 10px 20px 10px; padding:10px; max-width:400px; text-align: center;">
                    <v-app-bar :style="selectedPreviewStyle(selectedPalette.colors.primary, null)"
                        style="box-shadow: none; height:64px;"
                    >
                        <v-row>
                            <v-btn icon style="margin-top:8px;">
                                <v-icon >mdi-menu</v-icon>
                            </v-btn>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <div @click="generateServiceName()"
                                        v-on="on"
                                        style="cursor: pointer;
                                        line-height: 64px;"
                                        :style="selectedPreviewStyle(null, selectedPalette.colors.mainText)"
                                    >{{ value.serviceName }}</div>
                                </template>
                                <span>{{$t('Preview.serviceName')}}</span>
                            </v-tooltip>
                        </v-row>
    
                        
                    </v-app-bar>
                    <v-container fluid
                        style="padding: 0px; margin-top:10px;"
                    >
                        <v-row dense>
                            <v-col>
                                <v-card :style="selectedPreviewStyle(selectedPalette.colors.background, null)"
                                    style="padding:10px;"
                                >
                                    <div class="d-flex justify-center">
                                        <v-img style="max-width:300px;" :src="selectedImage.url"/>
                                    </div>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-card-text v-on="on"
                                                @click="generateServiceDescription"
                                                style="cursor: pointer;"
                                                :style="selectedPreviewStyle(null, selectedPalette.colors.secondaryText)"
                                            >{{value.serviceDescription}}</v-card-text>
                                        </template>
                                        <span>{{$t('Preview.serviceScenarios')}}</span>
                                    </v-tooltip>
                                    
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn @click="generateServiceDescription()"  :style="selectedPreviewStyle(null, selectedPalette.colors['primary-darken-1'])" text>View</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
            <v-col cols="4"></v-col>
        </v-row>
    </div>
    <div v-else-if="!paletteMode">
        <v-col style="padding: 0;">
            <v-card style="margin-top: 10px;  background-color: #DAF5FF; padding:10px; min-width:200px; min-height:200px;">
                <v-col>
                    <v-row>
                        <v-col :cols="columnWidth" v-for="(previewColor, index) in firstPreviewPalettes" v-bind:key="previewColor.paletteName" v-if="index < 3">
                            <v-card style="margin:20px 10px 20px 10px; padding:10px; min-width:400px; max-width:400px; text-align: center;">
                                <v-app-bar :style="{ background: previewColor.colors.primary.colorCode }"
                                    style="box-shadow: none; height:64px;"
                                >
                                    <v-row>
                                        <v-btn icon style="margin-top:8px;">
                                            <v-icon >mdi-menu</v-icon>
                                        </v-btn>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div @click="generateServiceName()"
                                                    v-on="on"
                                                    style="cursor: pointer;
                                                    line-height: 64px;"
                                                    :style="{ color: previewColor.colors.mainText.colorCode }"
                                                >{{ value.serviceName }}</div>
                                            </template>
                                            <span>{{$t('Preview.serviceName')}}</span>
                                        </v-tooltip>
                                    </v-row>
                                </v-app-bar>
                                <v-container fluid
                                    style="padding: 0px; margin-top:10px;"
                                >
                                    <v-row dense>
                                        <v-col>
                                            <v-card :style="{ background: previewColor.colors.background.colorCode }" 
                                                style="padding:10px;"
                                            >
                                                <div class="d-flex justify-center">
                                                    <v-img style="max-width:300px;" :src="selectedImage.url"/>
                                                </div>
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <v-card-text v-on="on"
                                                            style="cursor: pointer;"
                                                            :style="{ color: previewColor.colors.secondaryText.colorCode }"
                                                        >{{value.serviceDescription}}</v-card-text>
                                                    </template>
                                                    <span>{{$t('Preview.serviceScenarios')}}</span>
                                                </v-tooltip>
                                                
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn :style="{ background: previewColor.colors['primary-darken-1'].colorCode }" text>View</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                            
                                        </v-col>
                                    </v-row>
                                    <v-btn
                                        style="top: 6px; left: 36%"
                                        class="ms-2"
                                        variant="outlined"
                                        size="small"
                                        @click="changePalette(previewColor)"
                                    >
                                        PALETTE
                                    </v-btn>
                                </v-container>
                            </v-card>
                        </v-col>
                        <v-col :cols="columnWidth" v-for="(previewColor, index) in firstPreviewPalettes" v-bind:key="previewColor.paletteName" v-if="index >= 3">
                            <v-card style="margin:20px 10px 20px 10px; padding:10px; max-width:400px; text-align: center;">
                                <v-app-bar :style="{ background: previewColor.colors.primary.colorCode }"
                                    style="box-shadow: none; height:64px;"
                                >
                                    <v-row>
                                        <v-btn icon style="margin-top:8px;">
                                            <v-icon >mdi-menu</v-icon>
                                        </v-btn>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <div @click="generateServiceName()"
                                                    v-on="on"
                                                    style="cursor: pointer;
                                                    line-height: 64px;"
                                                    :style="{ color: previewColor.colors.mainText.colorCode }"
                                                >{{ value.serviceName }}</div>
                                            </template>
                                            <span>{{$t('Preview.serviceName')}}</span>
                                        </v-tooltip>
                                    </v-row>
                                </v-app-bar>
                                <v-container fluid
                                    style="padding: 0px; margin-top:10px;"
                                >
                                    <v-row dense>
                                        <v-col>
                                            <v-card :style="{ background: previewColor.colors.background.colorCode }" 
                                                style="padding:10px;"
                                            >
                                                <div class="d-flex justify-center">
                                                    <v-img style="max-width:300px;" :src="selectedImage.url"/>
                                                </div>
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on }">
                                                        <v-card-text v-on="on"
                                                            style="cursor: pointer;"
                                                            :style="{ color: previewColor.colors.secondaryText.colorCode }"
                                                        >{{value.serviceDescription}}</v-card-text>
                                                    </template>
                                                    <span>{{$t('Preview.serviceScenarios')}}</span>
                                                </v-tooltip>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn :style="{ background: previewColor.colors['primary-darken-1'].colorCode }" text>View</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                    <v-btn
                                        style="top: 6px; left: 36%"
                                        class="ms-2"
                                        variant="outlined"
                                        size="small"
                                        @click="changePalette(previewColor)"
                                    >
                                        PALETTE
                                    </v-btn>
                                </v-container>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card>
        </v-col>
    </div>
</template>
<script>
    import ServiceDescriptionGenerator from './ServiceDescriptionGenerator';
    import ServiceNameGenerator from './ServiceNameGenerator';
    export default {
        name: 'preview',
        props: {
            selectedPalette: Object,
            selectedImage: Object,
            selectedFont: Object,
            paletteMode: Boolean,
            value: Object,
            firstPreviewPalettes: Array,
        },
        components: {
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
            columnWidth() {
                return 12 / (this.firstPreviewPalettes.length / 2);
            },
        },
        created(){
            
        },
        watch: {
        },
        mounted(){
            this.generateServiceDescription()
            this.generateServiceName()
        },
        data() {
            return {
                fields: [
                    { style: '', label: '입력해주세요.' },
                    { style: 'filled', label: '입력해주세요.' },
                    { style: 'solo', label: '입력해주세요.' },
                    { style: 'outlined', label: '입력해주세요.' }
                ],
                items: [
                    { text: 'item1' },
                    { text: 'item2' },
                    { text: 'item3' },
                    { text: 'item4' },
                    { text: 'item5' },
                    { text: 'item6' },
                    { text: 'item7' },
                ],
                serviceDescription: 'click to generate description of service',
                serviceName: 'click to generate service name',
            }
        },
        methods: {
            generateServiceDescription() {
                let me = this;
                let generator = new ServiceDescriptionGenerator({
                    input:{
                        title: me.value.prompt,
                        serviceDescription : me.value.serviceDescription,
                    },
                    onReceived(data) {
                        me.value.serviceDescription = data;
                        me.$emit("input", me.value);
                    }
                });
                generator.generate();
            },

            generateServiceName() {
                let me = this;
                let generator = new ServiceNameGenerator({
                    input:{
                        title: me.value.prompt,
                        serviceName : me.value.serviceName
                    },
                    onReceived(data) {
                        me.value.serviceName = data;
                        me.$emit("input", me.value);
                    }
                });
                generator.generate();
            },
            changeColor(card) {
                card.iconColor = card.iconColor === "default" ? "red" : "default";
            },
            selectedPreviewStyle(background, color) {
                let styles = '';
                if (background) {
                    styles += "background-color: " + (background ? background.colorCode : '#FFFFFF') + ";";
                }
                if (color) {
                    styles += "color: " + (color ? color.colorCode : '#000000') + ";";
                }
                return styles;
            },
            selectedPreviewFont(font){
                if (font) {
                    return "font-family: " + font.fontFamilyName;
                } else {
                    return "";
                }
            },
            changePalette(previewColor){
                this.paletteMode = !this.paletteMode
                this.$emit('showOnePalette', previewColor)
                this.$emit('changePalette', this.paletteMode)
            }
        }
    }
</script>
<style>
</style>


