module.exports = {
    configureWebpack: {
        devServer: {
            // host: 'es2cd.io',
            port: '8081'
        },
        devtool: "source-map"
    },
  transpileDependencies: ["vuetify"]
};
