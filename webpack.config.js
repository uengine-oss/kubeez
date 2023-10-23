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
        port: 8081,
        disableHostCheck : true,
    },
}
