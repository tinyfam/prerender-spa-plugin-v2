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
    // stats: {
    //     preset: 'normal',
    //     colors: true,
    //     modules: true,
    //     timings: true,
    //     reasons: true
    // },
    // infrastructureLogging: {
    //     level: 'info',  // 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose'
    //     debug: true
    // },
    entry: {
        'index': './src/pages/contract/index/index.mjs',
        'ai-lawyer': './src/pages/contract/lawyer/index.mjs',
        'pay/handwritten': './src/pages/pay/handwritten/index.mjs',
        'ai-contract-management': './src/pages/contract/management/index.mjs',
        'draw-signature': './src/pages/signature/draw-signature.mjs',
        'type-signature': './src/pages/signature/type-signature.mjs',
        'email-signatures': './src/pages/email/email-signature.mjs',
        'invoice-signature': './src/pages/invoice/index.mjs',
        'pdf-signatures': './src/pages/pdf/index/index.mjs',
        'ai-contract-summary': './src/pages/summary/index.mjs',
        'logo-signature': './src/pages/signature/logo-signature.mjs',
        'handwritten-signature': './src/pages/signature/handwritten-signature.mjs',
        'calligraphy-signature': './src/pages/signature/calligraphy-signature.mjs',
        'cursive-signature': './src/pages/signature/cursive-signature.mjs',
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
            template: './src/type-signature.html',
            filename: 'type-signature/index.html',
            chunks: ['type-signature'],
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/email-signatures.html',
        //     filename: 'email-signatures/index.html',
        //     chunks: ['email-signatures'],
        // }),
        new HtmlWebpackPlugin({
            template: './src/ai-lawyer.html',
            filename: 'ai-lawyer/index.html',
            chunks: ['ai-lawyer'],
        }),
        new HtmlWebpackPlugin({
            template: './src/pay/handwritten.html',
            filename: 'pay/handwritten/index.html',
            chunks: ['pay/handwritten'],
        }),
        new HtmlWebpackPlugin({
            template: './src/ai-contract-summary.html',
            filename: 'ai-contract-summary/index.html',
            chunks: ['ai-contract-summary'],
        }),
        new HtmlWebpackPlugin({
            template: './src/ai-contract-management.html',
            filename: 'ai-contract-management/index.html',
            chunks: ['ai-contract-management'],
        }),
        // new HtmlWebpackPlugin({
        //     template: './src/invoice-signature.html',
        //     filename: 'invoice-signature/index.html',
        //     chunks: ['invoice-signature'],
        // }),
        new HtmlWebpackPlugin({
            template: './src/pdf-signatures.html',
            filename: 'pdf-signatures/index.html',
            chunks: ['pdf-signatures'],
        }),
        new HtmlWebpackPlugin({
            template: './src/draw-signature.html',
            filename: 'draw-signature/index.html',
            chunks: ['draw-signature'],
        }),
        new HtmlWebpackPlugin({
            template: './src/ai-logo-signature.html',
            filename: 'ai-logo-signature/index.html',
            chunks: ['logo-signature'],
        }),
        new HtmlWebpackPlugin({
            template: './src/ai-handwritten-signature-generator.html',
            filename: 'ai-handwritten-signature-generator/index.html',
            chunks: ['handwritten-signature'],
        }),
        new HtmlWebpackPlugin({
            template: './src/ai-handwritten-signature-generator.html',
            filename: 'ai-calligraphy-signature-generator/index.html',
            chunks: ['calligraphy-signature'],
        }),
        new HtmlWebpackPlugin({
            template: './src/cursive-signature-generator.html',
            filename: 'cursive-signature-generator/index.html',
            chunks: ['cursive-signature'],
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
                '/ai-lawyer/index.html',
                '/pay/handwritten/index.html',
                // '/email-signatures/index.html',
                '/ai-contract-summary/index.html',
                '/ai-contract-management/index.html',
                // '/invoice-signature/index.html',
                '/pdf-signatures/index.html',
                '/draw-signature/index.html',
                '/type-signature/index.html',
                '/ai-logo-signature/index.html',
                '/ai-handwritten-signature-generator/index.html',
                '/ai-calligraphy-signature-generator/index.html',
                '/cursive-signature-generator/index.html',
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