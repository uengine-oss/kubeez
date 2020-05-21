<template>
    
    <codemirror
            :options="{
                theme: 'darcula',
                lineNumbers: true,
                lineWrapping: true,
            }"
            v-model="yamlText"
            @focus="onYamlFocus()"
    >
    </codemirror>


</template>


<script>
    import yaml from "js-yaml";

    import {codemirror} from "vue-codemirror";


    export default {
        name: 'yaml-editor',
        props: {
            value: Object
        },

        components: {
           
            codemirror
        },
        computed: {
            
        },
        data: function () {
            return {
               yamlText:JSON.stringify(this.value) 
            }
        },

        watch: {
            value: {
                deep: true, 
                handler: function(){
                    this.yamlText = JSON.stringify(this.value) 
                }
            },

            yamlText: {
                deep: true,
                handler: function(){
                    var some = JSON.parse(this.yamlText);
                    this.value = null;
                    this.value = some;
                }
            }
            
        },
        methods: {
            

        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
