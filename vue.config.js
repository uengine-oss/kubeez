module.exports = {
    configureWebpack: {
        devServer: {
            proxy: 'http://35.225.49.251:8080/',
            host: 'es2cd.io',
            port: '8080'
        }
    },
    "transpileDependencies": [
        "vuetify"
    ]
}