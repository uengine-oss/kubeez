<template>
    <div  style="height:100%; width:100%; background-color:white;">
        <div v-if="!detailMarketMode">
            <h1 style="text-align:center;">Marketplace</h1>
            <v-icon @click="closeDialog()" style="position: absolute; right: 10px; top: 10px;">mdi-close</v-icon>
            <v-tabs
                v-if="templateList.length > 1"
                v-model="tab"
                bg-color="primary"
                show-arrows
                centered
                style="width: 100%;"
                
            >
                <v-tab value="templates" class="marketplace-margin-place-tab">Templates</v-tab>
                <v-tab value="toppings" class="marketplace-margin-place-tab">Toppings</v-tab>
            </v-tabs>
            <v-row v-if="templateList.length < 1"
                class="ma-0"
            >
                <v-col cols="2" style="padding:25px;">
                    <v-skeleton-loader v-for="n in templateLists.length" :key="n"
                        class="mx-auto border marketplace-loding-menu"
                        type="avatar, text"
                    ></v-skeleton-loader>
                </v-col>
                <v-col cols="10">
                    <v-container class="marketplace-skeleton-container">
                        <v-row>
                            <v-col cols="10" lg="2" md="3" sm="6" v-for="n in 9" :key="n">
                                <v-skeleton-loader
                                    class="mx-auto border marketplace-loding-card"
                                    max-width="300"
                                    type="image, text@2"
                                ></v-skeleton-loader>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>
            <v-tabs-items v-model="tab">
                <v-tab-item key="templates">
                    <v-row>
                        <v-col cols="2">
                            <v-list dense>
                                <v-list-item-group
                                    color="primary"
                                >
                                    <v-list-item
                                        v-for="(item, i) in templateLists"
                                        :key="i"
                                        @click="ClickFilteredTemplate(i)"
                                    >
                                        <v-list-item-icon class="marketplace-list-icon-box">
                                            <Icon class="gs-icon-style marketplace-list-icon"
                                                :icon="item.icon"
                                            />
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                        <v-col cols="10">
                            <v-row class="marketplace-card-row">
                                <v-col cols="12" lg="2" md="3" sm="6"
                                    v-for="temp in filteredTemplateList" :key="temp.id"
                                >
                                    <v-card class="marketplace-card" outlined>
                                        <div class="marketplace-image-text-container">
                                            <v-img class="marketplace-card-image" :src="temp.imageUrl" />
                                            <v-card-subtitle class="marketplace-card-subtitle"
                                                @click="openTempDetailDialog(temp)"
                                            >{{ temp.description }}
                                            </v-card-subtitle>
                                        </div>
                                        <v-card-title class="marketplace-card-title">{{ temp.name }}</v-card-title>
                                        <v-rating
                                            class="marketplace-rating"
                                            v-model="temp.rating"
                                            bg-color="gray"
                                            color="#231813"
                                            half-increments
                                            readonly
                                            size="18"
                                        >
                                            Rating: {{ temp.rating }}
                                        </v-rating>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-tab-item>
                <v-tab-item key="toppings">
                    <v-row>
                        <v-col cols="2">
                            <v-list dense>
                                <v-list-item-group
                                    color="primary"
                                >
                                    <v-list-item
                                        v-for="(item, i) in toppingLists"
                                        :key="i"
                                        @click="ClickFilteredTopping(i)"
                                    >
                                        <v-list-item-icon class="marketplace-list-icon-box">
                                            <Icon class="gs-icon-style marketplace-list-icon"
                                                :icon="item.icon"
                                            />
                                        </v-list-item-icon>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                        <v-col cols="10">
                            <v-row class="marketplace-card-row">
                                <v-col cols="12" lg="2" md="3" sm="6"
                                    v-for="topping in filteredToppingList" :key="topping.id"
                                >
                                    <v-card class="marketplace-card" outlined>
                                        <div>
                                            <div class="marketplace-image-text-container">
                                                <v-img class="marketplace-card-image" :src="topping.imageUrl"></v-img>
                                                <v-card-subtitle @click="openToppingDetailDialog(topping)"
                                                    class="marketplace-card-subtitle"
                                                >{{ topping.description }}
                                                </v-card-subtitle>
                                            </div>
                                            <v-card-title class="marketplace-card-title">{{ topping.name }}</v-card-title>
                                            <v-rating
                                                class="marketplace-rating"
                                                v-model="topping.rating"
                                                bg-color="gray"
                                                color="#231813"
                                                half-increments
                                                readonly
                                                size="18"
                                            >
                                                Rating: {{ topping.rating }}
                                            </v-rating>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-tab-item>
            </v-tabs-items>
        </div>
        <div v-else class="marketplace-details-page-box">
            <div v-if="selectedTemplate">
                <div class="marketplace-details-page-bar">
                    <v-icon @click="closeDetailDialog()" class="marketplace-details-page-back-btn">mdi-arrow-left</v-icon>
                </div>
                <div>
                    <v-row class="marketplace-details-page-row">
                        <v-col cols="5" lg="3" md="4" sm="5"
                            class="marketplace-details-page-col"
                        >
                            <v-img :src="selectedTemplate.imageUrl"></v-img>
                            <v-card-title>{{ selectedTemplate.name }}</v-card-title>
                            <v-card-subtitle>{{ selectedTemplate.description }}</v-card-subtitle>
                            <v-rating
                                class="marketplace-details-page-rating"
                                v-model="selectedTemplate.rating"
                                bg-color="gray"
                                color="#231813"
                                half-increments
                                readonly
                                size="16"
                            >
                                Rating: {{ selectedTemplate.rating }}
                            </v-rating>
                            <div class="marketplace-chip-box">
                                <div>tags:</div>
                                <v-chip v-for="tag in selectedTemplate.tags" :key="tag"
                                >{{ tag }}
                                </v-chip>
                            </div>
                            <v-btn @click="applyTemplate(selectedTemplate)" color="primary"
                                class="marketplace-details-page-apply-btn"
                            >apply
                            </v-btn>
                        </v-col>
                        <v-divider vertical />
                        <v-col cols="7" lg="9" md="8" sm="7">
                            <vue-markdown
                                v-if="selectedTemplate && selectedTemplate.instruction"
                                class="markdown-body marketplace-markdown"
                                :source="selectedTemplate.instruction"
                            >
                            </vue-markdown>
                        </v-col>
                    </v-row>
                </div>
            </div>
            <div v-else-if="selectedTopping">
                <div class="marketplace-details-page-bar">
                    <v-icon @click="closeDetailDialog()" class="marketplace-details-page-back-btn">mdi-arrow-left</v-icon>
                </div>
                <div>
                    <v-row class="marketplace-details-page-row">
                        <v-col cols="5" lg="3" md="4" sm="5"
                            class="marketplace-details-page-col"
                        >
                            <v-img :src="selectedTopping.imageUrl"></v-img>
                            <v-card-title>{{ selectedTopping.name }}</v-card-title>
                            <v-card-subtitle>{{ selectedTopping.description }}</v-card-subtitle>
                            <v-rating
                                class="marketplace-details-page-rating"
                                v-model="selectedTopping.rating"
                                bg-color="gray"
                                color="#231813"
                                half-increments
                                readonly
                                size="16"
                            >
                                Rating: {{ selectedTopping.rating }}
                            </v-rating>
                            <div class="marketplace-chip-box">
                                <div>
                                    tags:
                                    <v-chip v-for="tag in selectedTopping.tags" :key="tag">{{ tag }}</v-chip>
                                </div>
                                <div v-if="!isToppingCompatible(selectedTopping)">
                                    depends:
                                    <v-chip v-for="depends in selectedTopping.depends">{{ depends }}</v-chip>
                                </div>
                            </div>
                            
                            <v-btn @click="applyTopping(selectedTopping)" color="primary"
                                class="marketplace-details-page-apply-btn"
                                :disabled="!isToppingCompatible(selectedTopping)"
                            >apply
                            </v-btn>
                        </v-col>
                        <v-divider vertical />
                        <v-col cols="7" lg="9" md="8" sm="7">
                            <vue-markdown
                                v-if="selectedTopping && selectedTopping.instruction"
                                class="markdown-body marketplace-markdown"
                                :source="selectedTopping.instruction"
                            >
                            </vue-markdown>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import VueMarkdown from 'vue-markdown';

const axios = require('axios');
export default {
    name: 'MarketPlace',
    components: {
        'vue-markdown': VueMarkdown
    },
    data() {
        return {
            tab: "templates",
            templateList:[],
            toppingList:[],
            selectedTemplate: null,
            selectedTopping: null,
            githubHeaders: null,
            allRepoList: null,
            detailMarketMode: false,
            templateLists: [
                { name: 'All', icon: 'icon-park-solid:id-card' },
                { name: 'Java', icon: 'la:java' },
                { name: 'Python', icon: 'teenyicons:python-outline' },
                { name: 'Go', icon: 'simple-icons:go' },
                { name: 'JavaScript', icon: 'teenyicons:javascript-outline' },
                { name: 'Spring boot', icon: 'simple-icons:springboot' },
            ],
            toppingLists: [
                { name: 'All', icon: 'icon-park-solid:id-card' },
                { name: 'Multitenancy', icon: 'carbon:chart-multitype' },
                { name: 'Kubernetes', icon: 'pajamas:kubernetes' },
                { name: 'Security', icon: 'ic:sharp-security' },
                { name: 'Service Mesh', icon: 'simple-icons:istio' },
                { name: 'DevOps', icon: 'mdi:microsoft-azure-devops' },
                { name: 'Data Projection', icon: 'logos:apollostack' },
                { name: 'Frontend', icon: 'icon-park-twotone:web-page' },
            ],
            selectedTemplateIndex: null,
            selectedToppingIndex: null,
        }
    },
    props: {
        marketplaceDialog: Boolean,
        selectedBaseTemplateName: null
    },
    computed: {
        filteredTemplateList() {
            var me = this;
            const selectedTags = me.selectedTemplateIndex !== null ? me.templateLists[me.selectedTemplateIndex].name : 'All';
            if (selectedTags && selectedTags !== 'All') {
                return me.templateList.filter(temp => {
                    if (Array.isArray(temp.tags)) {
                        return temp.tags.includes(selectedTags);
                    } else {
                        return temp.tags === selectedTags;
                    }
                });
            }
            return me.templateList;
        },
        filteredToppingList() {
            var me = this;
            const selectedTags = me.selectedToppingIndex !== null ? me.toppingLists[me.selectedToppingIndex].name : 'All';
            if (selectedTags && selectedTags !== 'All') {
                return me.toppingList.filter(topping => {
                    if (Array.isArray(topping.tags)) {
                        return topping.tags.includes(selectedTags);
                    } else {
                        return topping.tags === selectedTags;
                    }
                });
            }
            return me.toppingList;
        },
    },
    created(){
        this.setGitHubHeader()
        this.loadAllRepoList()
    },
    watch: {
    },
    mounted(){
    },
    methods: {
        isToppingCompatible(selectedTopping) {
            return !selectedTopping.depends || selectedTopping.depends.includes(this.selectedBaseTemplateName);
        },
        applyTemplate(temp){
            this.$emit("applyTemplate", temp)
            this.detailMarketMode = false;
        },
        applyTopping(topping){
            this.$emit("applyTopping", topping)
            this.detailMarketMode = false;
        },
        async loadTemplateInfo() {
            var me = this;
            me.templateList = [];

            for (let idx = 0; idx < me.allRepoList.length; idx++) {
                const templateInfo = me.allRepoList[idx];
                if (templateInfo.name.includes("template-") && !templateInfo.name.includes("_template")) {
                    try {
                        var tempInfo = await axios.get(`https://api.github.com/repos/msa-ez/${templateInfo.name}/contents/.template/metadata.yml`, { headers: me.githubHeaders });
                        var templatePath = `https://github.com/msa-ez/${templateInfo.name}`
                        if (tempInfo && tempInfo.data.content) {
                            var obj = YAML.parse(decodeURIComponent(escape(atob(tempInfo.data.content))));
                            obj.id = idx;
                            obj.templatePath = templatePath
                            try {
                                const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${templateInfo.name}/contents/.template/instruction.md`, { headers: me.githubHeaders });
                                if (instruction) {
                                    obj.instruction = decodeURIComponent(escape(atob(instruction.data.content)));
                                }
                            } catch (e) {
                                console.error(e);
                            }
                            me.templateList.push(obj);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        },
        async loadToppingInfo() {
            var me = this;
            me.toppingList = [];

            for (let idx = 0; idx < me.allRepoList.length; idx++) {
                const toppingInfo = me.allRepoList[idx];
                if (toppingInfo.name.includes("topping-") && !toppingInfo.name.includes("_topping")) {
                    try {
                        var topInfo = await axios.get(`https://api.github.com/repos/msa-ez/${toppingInfo.name}/contents/.template/metadata.yml`, { headers: me.githubHeaders });
                        var toppingPath = `https://github.com/msa-ez/${toppingInfo.name}`
                        console.log('toppingPath :', toppingPath)
                        if (topInfo && topInfo.data.content) {
                            var obj = YAML.parse(decodeURIComponent(escape(atob(topInfo.data.content))));
                            obj.id = idx;
                            obj.toppingPath = toppingPath
                            try {
                                const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${toppingInfo.name}/contents/.template/instruction.md`, { headers: me.githubHeaders });
                                if (instruction) {
                                    obj.instruction = decodeURIComponent(escape(atob(instruction.data.content)));
                                }
                            } catch (e) {
                                console.error(e);
                            }
                            me.toppingList.push(obj);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        },
        setGitHubHeader(){
            var gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
            this.githubHeaders = {
                Authorization: 'token ' + gitAccessToken,
                Accept: 'application/vnd.github+json'
            }
        },
        async loadAllRepoList(){
            var count = 1
            this.allRepoList = []
            while(count != 'stop'){
                var repoList = await axios.get(`https://api.github.com/orgs/msa-ez/repos?sort=updated&page=${count}&per_page=100`, { headers: this.githubHeaders})
                if(repoList && repoList.data && repoList.data.length > 0) {
                    this.allRepoList = this.allRepoList.concat(repoList.data)
                    count++
                }else {
                    count = 'stop'
                }
            }
            if(this.allRepoList.length > 0){
                this.loadTemplateInfo()
                this.loadToppingInfo()
            }
        },
        closeDialog(){
            this.$emit('closeMarketplaceDialog')
        },
        closeDetailDialog(){
            this.detailMarketMode = false;
        },
        openTempDetailDialog(val){
            this.detailMarketMode = true
            this.selectedTemplate = val
            this.selectedTopping = null
        },
        openToppingDetailDialog(val){
            this.detailMarketMode = true
            this.selectedTopping = val
            this.selectedTemplate = null
        },
        ClickFilteredTemplate(index) {
            this.selectedTemplateIndex = index;
        },
        ClickFilteredTopping(index) {
            this.selectedToppingIndex = index;
        },
    }
}
</script>
<style>
.non-clickable-card {
    opacity: 0.2;
    pointer-events: none;
}
.marketplace-details-page-apply-btn {
    max-width: 100px;
    height: 30px;
    z-index: 1;
    margin-top:10px;
    float:right;
}
.marketplace-details-page-bar {
    height:64px;
}
.marketplace-details-page-box {
    background-color:white;
    padding:0px 10% 0px 10%;
}
.marketplace-details-page-back-btn {
    font-size: 25px !important;
    position: absolute !important;
    z-index: 1;
    left: 10px;
    top: 10px;
}
.marketplace-details-page-row {
    margin:0px;
    padding-bottom:20px;
    background-color:white;
}
.marketplace-details-page-col {
    position: relative;
}

.marketplace-chip-box div {
    float:left;
    padding:0px 5px 0px 16px;
    margin-top:3px;
}

.marketplace-chip-box .v-chip {
    margin-right:5px;
    margin-bottom:5px;
}

.marketplace-markdown h1 {
    text-align: center;
}
.marketplace-details-page-img {
    
}
.marketplace-list-icon-box {
    margin-right: 12px !important;
}
.marketplace-list-icon {
    height: 22px;
    width: 22px
}
.marketplace-margin-place-tab {
    flex-grow: 1;
}
.marketplace-skeleton-container {
    height:100%;
    width:100%;
}
.marketplace-card-title {
    font-size:16px;
}
.marketplace-card-row {
    padding:7px 1% 20px 0px;
}
.marketplace-card {
    padding-top:5px;
}
.marketplace-card-image {
    width: 100%;
    height:130px;
    transition: opacity 0.5s;
}

.marketplace-card-subtitle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding-top:15px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    opacity: 0;
    transition: opacity 0.5s;
    cursor: pointer;
}

.marketplace-image-text-container {
    height:130px;
}

.marketplace-image-text-container:hover .marketplace-card-image {
  opacity: 0;
}

.marketplace-image-text-container:hover .marketplace-card-subtitle {
  opacity: 1;
}


.marketplace-rating {
    margin:-10px 0px 10px 16px;
}

.marketplace-details-page-rating {
    margin:-10px 0px 10px 6px;
}

.marketplace-details-page-rating button {
    margin-right:-5px;
}

.marketplace-loding-menu {
    display:flex;
    margin-bottom:15px;
}

.marketplace-rating button {
    margin-left:-10px;
}

.marketplace-loding-menu .v-skeleton-loader__avatar {
    width:26px;
    height:26px;
}

.marketplace-loding-menu .v-skeleton-loader__text {
    margin:6px 0px 0px 20px;
}

.marketplace-loding-card .v-skeleton-loader__image {
    height:150px;
    margin-bottom:10px;
}

.marketplace-loding-card .v-skeleton-loader__text {
    height:15px;
}

.marketplace-loding-card .v-skeleton-loader__button {
    float:right;
}
</style>