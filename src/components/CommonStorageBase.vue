<template>
</template>

<script>
    import StorageBase from "./designer/modeling/StorageBase";

    export default {
        name: 'common-storage-base',
        mixins: [StorageBase],
        created() {
        },
        mounted() {
            var me = this
            me.$EventBus.$on('login', async function (newVal) {
                me.loginUser(newVal)
            })
        },
        computed: {
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        },
        methods: {
            async setUserInfo() {
                var me = this
                var user = null
                if (localStorage.getItem("accessToken"))
                    user = await me.getUserInfo();
                me._setUserInfo(user)
                
            },
            async loginUser() {
                var me = this
                await me.setUserInfo()
                if (me.isLogin) {
                    if (me.userInfo.email && !this.$isElectron)
                        me.getUserPurchaseLists()
                } else if (!me.isLogin && !me.isGuestLogin) {
                    me.initUserInfo()
                }
            },
        }
    }


</script>