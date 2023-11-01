const path = require('path');

module.exports = {
    configureWebpack: {
        devServer: {
            https: true,
            port: '8081',
            disableHostCheck: true,
        },
        module: {
            rules: [
              {
                test: /\.js$/,
                include: [
                  path.resolve(__dirname, 'node_modules/acebase-core'),
                  path.resolve(__dirname, 'node_modules/acebase-client'),
                ],
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      '@babel/preset-env',
                    ],
                    plugins: [
                      '@babel/plugin-proposal-optional-chaining',
                    ],
                  },
                },
              },
            ],
          },
    },
    chainWebpack: config => {
        // Add loader for acebase-client package
        config.module
          .rule('js')
          .test(/\.js$/)
          .include
            .add(/node_modules\/acebase-client/)
            .end()
          .use('babel-loader')
            .loader('babel-loader')
            .end()
      },
    "runtimeCompiler": true
}
