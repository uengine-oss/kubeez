<template>
    <div class="is-mobile" :style = "tenantLogoStyle" text style="width: 100px; height: 60px; margin-top: 9px; cursor: pointer;" @click="test()">
        <v-img v-if="tenantLogo" contain max-height=90% max-width=90% :src="tenantLogo"></v-img>
    </div>
</template>
<script>
import StorageBase from '../designer/modeling/StorageBase.vue'
export default {
    name: 'LogoView',
    mixins: [StorageBase],
    data () {
        return {
            tenantLogo: null,
        }
    },
    computed: {
        tenantLogoStyle(){
            if(window.location.host.includes('teachez')){
                return 'margin-left:-40px;'
            }
        },
    },
    created: async function () {
        var me = this
        try {
            if(window.MODE == "onprem" || window.MODE == 'dev' || this.$isElectron) {
                me.tenantLogo = "/static/image/logo.png";
            }
            else if ( !window.location.host.includes('localhost') )
                me.tenantLogo = await me.getString("storage://labs-msaez.io/logo.png");

        } catch (e) {
            console.log(e);
            console.log('created')
        }
    },
    methods: {
        test(){
            this.$EventBus.$emit("setLabInfo", null)
            if(window.ipcRenderer && window.location.host.includes('teachez')){
                this.$router.push('/start-Electron');
            } else {
                if(window.location.hash != "#/"){
                    this.$router.push('/');
                    //     window.location = "/"
                }
            }
        },
    },
}
</script>
<style>
@media only screen and (max-width:600px) {
    .is-mobile {
        display:none;
    }
}
</style>