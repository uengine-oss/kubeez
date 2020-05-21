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
    },
}
