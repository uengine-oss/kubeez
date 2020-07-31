module.exports = {
    configureWebpack: {
        devServer: {
            proxy: 'http://35.222.165.91:8080/',
            // host: 'es2cd.io',
            port: '8080'
        }
    },
    "transpileDependencies": [
        "vuetify"
    ]
}