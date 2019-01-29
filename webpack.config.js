const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postcssPresetEnv = require('postcss-preset-env');

const environment = process.env.NODE_ENV || 'development';

module.exports = {
    context: path.resolve(__dirname, 'Src'),
    entry: './bootstrap.js',
    mode: environment,
    target: "web",
    devtool: environment === 'development' ? 'source-map' : false,
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'Bin')
    },
    optimization: {
        minimize: environment === 'production',
        minimizer: [
            new UglifyJsPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: [
                    path.resolve(__dirname, 'Src/Components'),
                    /\.useable\.css$/
                ],
                use: [
                    MiniCssExtractPlugin.loader
                ]
            },
            {
                test: /\.useable\.css$/,
                use: [
                    "style-loader/useable"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            modules: true,
                            camelCase: "only"
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                postcssPresetEnv({
                                    features: {
                                        'nesting-rules': true,
                                        'custom-media-queries': true
                                    }
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "client"),
                    path.resolve(__dirname, "node_modules/lit-html"),
                    path.resolve(__dirname, "node_modules/lit-element")
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: [
                                '@babel/plugin-transform-object-assign',
                                '@babel/plugin-transform-runtime',
                                "@babel/plugin-syntax-dynamic-import"
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [
                    'minify-lit-html-loader'
                ]
            },
            {
                test: /\.(png|jpe?g)$/,
                use: [
                    "file-loader"
                ]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            path.resolve(__dirname, "node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"),
            path.resolve(__dirname, "node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js.map"),
        ]),
        new HtmlWebpackPlugin({
            title: 'Comma-Delimited Search',
            meta: {
                viewport: "width=device-width, initial-scale=1.0",
                "Content-Language": { "http-equiv": "Content-Language", content: "en" }
            }
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            assets: [
                "webcomponents-bundle.js",
            ],
            append: false
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ]
};