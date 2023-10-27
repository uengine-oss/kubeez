<template>
    <div>
        <div style="margin: 5%; overflow-y: scroll; height: 200px;" >
            <v-runtime-template v-if="portalHtml" :template='`<div><template name="default">${portalHtml}</template></div>`'></v-runtime-template>
        </div>
        <v-card flat>
            <v-card-actions style="justify-content: flex-end;">
                <v-btn text @click="close()">Close</v-btn>
                <v-btn color="primary" text @click="apply()">Apply</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import TextField from "../v-components/TextField.vue";
    import Radio from "../v-components/Radio.vue";
    import CheckBox from "../v-components/CheckBox.vue";
    import Divider from "../v-components/Divider.vue";

    export default {
        name: 'code-configuration',
        mixins: [],
        components: {
            'text-field': TextField,
            'radio': Radio,
            'checkbox': CheckBox,
            'divider': Divider,
        },
        props: {
            instruction: Object
        },
        data() {
            return {
                portalHtml: null,
                originalValue: {},
                value: {},
                id: null,
                division: null,
            }
        },
        created() {
            if(this.instruction){
                this.portalHtml = this.instruction.template;
                this.value = this.instruction.configuration ? this.instruction.configuration : {};
                this.id = this.instruction.elementId
                this.division = this.instruction.division
                this.originalValue = JSON.parse(JSON.stringify(this.value));
            }
        },
        methods: {
            apply(){
                this.$emit('apply', this.division, this.id, this.value)
            },
            close(){
                this.value = this.originalValue;
                this.$emit('close', this.division, this.id)
            },
        },
    }
</script>
