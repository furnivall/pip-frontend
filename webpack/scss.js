const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';
const filename = `[name]${fileNameSuffix}.css`;

const miniCss = new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename,
    chunkFilename: '[id].css',
});

module.exports = {
    rules: [
        {
            test: /\.scss$/,
            use: [
                { loader: MiniCssExtractPlugin.loader },
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    },
                },
                { loader: 'sass-loader' },
            ],
        },
    ],
    plugins: [miniCss],
};
