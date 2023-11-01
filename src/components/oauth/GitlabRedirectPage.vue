<template>
    
</template>

<script>
    export default {
        name: "GitlabRedirectPage",
        mounted: async function() {
            var me = this;
            console.log("GitlabRedirectPage");
            const parser = new URLSearchParams(window.location.search);
            let origin = window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
            // console.log(parser.getAll())
            var getToken = await this.$http.post(`https://gitlab.${origin}/oauth/token`, {
                "client_id": "8eb94ad361085009155d495af28e6a822d7b64bb2397807a9e93cf269d28d1c8",
                "client_secret": "b5d82ae5c7b55355d1c09261c93d7a1917ad90115fb5df649ce250d06e963e61",
                "code": parser.get("code"),
                "grant_type": "authorization_code",
                "redirect_uri": `https://${window.location.host}/?oauth=gitlab`
            });
            console.log(getToken.data)
            var accessToken = getToken.data.access_token;
            var getUsers = await this.$http.get(`https://gitlab.${origin}/api/v4/user?access_token=${accessToken}`);
            getUsers["data"]["accessToken"] = accessToken;
            await this.postMessage(getUsers);
            // window.close();
        },
        methods: {
            async postMessage(getUsers) {
                return new Promise(function (resolve) {
                    window.localStorage.setItem("gitAuthor", getUsers.data.email);
                    window.localStorage.setItem(
                        "gitUserName",
                        getUsers.data.username
                    );
                    window.localStorage.setItem("gitEmail", getUsers.data.email);
                    window.localStorage.setItem(
                        "gitToken",
                        getUsers.data.accessToken
                    );
                    window.opener.postMessage({message: "gitlab-login", data: JSON.parse(JSON.stringify(getUsers))},"*");
                    resolve();
                })

            }
        }
        // mounted() {
        //     window.href = window.location.host
        // }
    }
</script>

<style scoped>

</style>