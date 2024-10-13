const path = require('path');
const { DefinePlugin } = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin'); 
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production'; 

module.exports = {
    entry: './src/index.js',
    output: {
        filename: isProduction ? 'main.[contenthash].js' : 'main.js', // Use content hash for caching in production
        path: path.resolve(__dirname, 'dist'),
        clean: true, 
    },
    mode: isProduction ? 'production' : 'development', 
    plugins: [
        new Dotenv({
            path: `src/.env`,
            systemvars: true, 
        }),
        new HtmlWebpackPlugin({
            template: 'public/index.html',
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            filename: isProduction ? '[name].[contenthash].css' : '[name].css', // Extracted CSS file name
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/assets', to: 'assets' }, // Copy public assets
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                type: 'asset', // Use Webpack 5's asset modules
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024, // Limit to 10KB for inline images
                    },
                },
                generator: {
                    filename: 'img/[name].[hash:7].[ext]', // Output folder for images
                },
            },
            {
                test: /\.css$/i,
                use:  [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // Extract CSS for production
                    'css-loader',
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    optimization: {
        minimize: isProduction, // Enable minimization only in production
        minimizer: isProduction ? [
            new TerserWebpackPlugin(), // Minimize JS
            new CssMinimizerPlugin(), // Minimize CSS
        ] : [],
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
    devServer: {
        static: './public', // Serve content from the public directory
        hot: true, // Enable hot module replacement
        port: 8080, // Port for the server
    },
};
