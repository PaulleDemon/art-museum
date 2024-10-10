const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Clean the output directory before each build
    },
    mode: "development",
    module: {
        rules: [
            {
                // following is an example of YOUR loader config
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                // here I decided to put all my gltf files under a folder named 'gltf'
                // so I added and exclude rule to my existing loader
                exclude: /gltf/, // only add this line
                // (etc)
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: 'img/[name].[hash:7].[ext]'
                }
              },
              {
                // here I match only IMAGE and BIN files under the gltf folder
                test: /gltf.*\.(bin|png|jpe?g|gif)$/,
                // or use url-loader if you would like to embed images in the source gltf
                loader: 'file-loader',
                options: {
                  // output folder for bin and image files, configure as needed
                  name: 'gltf/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
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
    devServer: {
        static: './public', // Serve content from the public directory
        hot: true, // Enable hot module replacement
        port: 8080, // Port for the server
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
};