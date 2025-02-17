import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import PrerenderSPAPlugin from './prerender-spa-plugin.js';
import webpack from 'webpack';
import Dotenv from 'dotenv-webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 根据你本地 Chrome 的实际安装路径修改
// const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

export default {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        'index': './src/pages/contract/index/index.mjs',
        'privacy': './src/pages/privacy/privacy.mjs',
        'feedback': './src/pages/feedback/feedback.mjs',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.mjs$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name].[hash][ext]'
                }
            }
        ]
    },
    plugins: [
        new Dotenv({
            path: './src/.env.production',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/images', to: path.resolve(__dirname, 'dist/images') },
                { from: 'public/favicon.ico', to: path.resolve(__dirname, 'dist/favicon.ico') },
                { from: 'public/robots.txt', to: path.resolve(__dirname, 'dist/robots.txt') },
                { from: 'public/js', to: path.resolve(__dirname, 'dist/js') },
                { from: 'public/css', to: path.resolve(__dirname, 'dist/css') },
            ],
        }),
        new webpack.ProgressPlugin(),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['index'],
        }),
        new HtmlWebpackPlugin({
            template: './src/privacy.html',
            filename: 'privacy/index.html',
            chunks: ['privacy'],
        }),
        new HtmlWebpackPlugin({
            template: './src/feedback.html',
            filename: 'feedback/index.html',
            chunks: ['feedback'],
        }),
        new PrerenderSPAPlugin({
            staticDir: path.join(__dirname, 'dist'),
            routes: [
                '/index.html',
                '/privacy/index.html',
                '/feedback/index.html',
            ],
            renderer: {
                renderAfterDocumentEvent: 'render-event',
                headless: true,
                executablePath: CHROME_PATH, 
                maxConcurrentRoutes: 2,
                renderAfterTime: 15000, // 等待 5 秒
                timeout: 20000, // 超时时间 10 秒
                // debug: true,
                waitUntil: 'networkidle0',
            }
        }),

    ],
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendor'
        }
    },
    // devServer: {
    //     static: {
    //         directory: path.join(__dirname, 'public')
    //     },
    //     compress: true,
    //     port: 8000,
    //     hot: true
    // }
};