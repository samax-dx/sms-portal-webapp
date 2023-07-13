const CracoLessPlugin = require('craco-less');
const webpack = require("webpack");
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

module.exports = {
    webpack: {
        plugins: [
            new webpack.DefinePlugin({
                "process.env.MY_ENV": JSON.stringify("value")
            })
        ],
        // headers: {
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
        // }
    },
    webpack: {
            configure: {
                output: {
                    filename: 'client/static/js/bundle.js',
                    assetModuleFilename: 'client/static/media/[name].[hash:8][ext][query]'
                },
                optimization: {
                    runtimeChunk: false,
                    splitChunks: {
                        chunks(chunk) {
                            return false;
                        }
                    }
                }
            }
        },
    // mode: 'development',
    devServer: {
        port: 3001
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: { '@primary-color': '#1DA57A' },
                        javascriptEnabled: true,
                    },
                },
            },
        },
        {
            plugin: new AntdDayjsWebpackPlugin()
        }
    ],
};