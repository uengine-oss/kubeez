<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <v-runtime-template v-if="myPageLocator" :template=" `<div slot=default style ='text-align: -webkit-center'>` + myPageLocator + '</div>' "/>
    </div>
</template>


<script>
    import VRuntimeTemplate from "v-runtime-template";
    import AdminMyPage from "./AdminMyPage";
    import PersonalMyPage from "./PersonalMyPage";
    import MyPage from "./MyPage";

    export default {
        name: 'my-page-manager',
        mixins: [MyPage],
        components: {
            VRuntimeTemplate,
            PersonalMyPage,
            AdminMyPage
        },
        props: {},
        data() {
            return {
                myPageLocator: null //"hello, this is tenant1's home. <br><class-list/>"
            }
        },

        watch: {},

        computed: {},
        async created() {
            var me = this
            if (!this.isLogin)
                await this.loginUser()

            if (me.isLogin) {
                if (me.isAdmin) {
                    me.myPageLocator = "<AdminMyPage></AdminMyPage>"
                }else{
                    me.myPageLocator = "<PersonalMyPage></PersonalMyPage>"
                }
            } else {
                me.$EventBus.$emit('showLoginDialog')
            }
        },
        mounted(){

        },
        methods: {}
    }
</script>


