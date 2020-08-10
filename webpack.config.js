module.exports = {
    module: {
        rules: [
            {

                test: /\.css$/,
                use: [ 'style-loader', 'css-loader', 'cssimportant-loader' ]
            }
        ]
    },
    devServer: {
        // host: 'es2cd.io',
        port: 8080,
        disableHostCheck : true,
        proxy: 'http://35.222.165.91:8080/',
    },
    configureWebpack: {
        devtool: 'source-map'
    }
}
