<template>
    <v-col style="height: 100%; align-items: center; margin: 2px; width: 100%;">
        <div v-for="id in value" :key="id">
            <jump-to-model-lists-card :id="id" :url="url" @deleteModel="deleteModel" ></jump-to-model-lists-card>
        </div>
    </v-col>
</template>

<script>
    import JumpToModelListCard from "./JumpToModelListCard";

    export default {
        name: 'jump-to-model-lists',
        components:{
            'jump-to-model-lists-card': JumpToModelListCard
        },
        props: {
            value: Array,
            url: String,
        },
        created(){},
        data() {
            return { }
        },
        methods: {
            deleteModel(id){
                localStorage.removeItem(`image_${id}`)
                localStorage.removeItem(`${id}`)
                this.$emit("deleteModel", id)
            },
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


