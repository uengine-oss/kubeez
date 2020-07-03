module.exports = {
    configureWebpack: {
        devServer: {
            proxy: 'http://34.69.16.54:8080/',
            host: 'es2cd.io',
            port: '8080'
        }
    },
    "transpileDependencies": [
        "vuetify"
    ]
}