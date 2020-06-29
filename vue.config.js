module.exports = {
    configureWebpack: {
        devServer: {
            proxy: 'http://192.168.99.125:31405/',
            host: 'es2cd.io',
            port: '8080'
        }
    },
    "transpileDependencies": [
        "vuetify"
    ]
}