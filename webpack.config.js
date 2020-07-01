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
        host: 'es2cd.io',
        port: 8080,
        disableHostCheck : true,
        proxy: 'http://192.168.99.125:30807/',
    },
}
