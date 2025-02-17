import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';

import puppeteer from 'puppeteer';
import { minify } from 'html-minifier';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

class PrerenderSPAPlugin {
    constructor(...args) {
        this._options = {};

        // Parse arguments and set options
        if (args.length === 1) {
            this._options = args[0] || {};
        } else {
            let staticDir, routes;
            args.forEach(arg => {
                if (typeof arg === 'string') staticDir = arg;
                else if (Array.isArray(arg)) routes = arg;
                else if (typeof arg === 'object') this._options = arg;
            });
            staticDir ? (this._options.staticDir = staticDir) : null;
            routes ? (this._options.routes = routes) : null;
        }

        // Set default options if not provided
        this._options.routes = this._options.routes || ['/'];
        this._options.outputDir = this._options.outputDir || 'dist';
        this._options.headless = this._options.renderer.executablePath || false;
        this._options.maxConcurrentRoutes = this._options.maxConcurrentRoutes || 2;
        this._options.timeout = this._options.timeout || 20000;  // 20 seconds
        this._options.minify = this._options.minify || false;
        this._options.waitUntil = this._options.waitUntil || 'networkidle0';
    }

    run_server() {
        const app = express();
        const distDir = path.join(__dirname, 'dist');
        app.use(express.static(distDir));
        app.get('/', (req, res) => {
            res.sendFile(path.join(distDir, 'index.html')); // 返回 dist 目录下的 index.html 文件
        });
        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
        return server
    }
    async renderRoute(page, route) {
        const routeUrl = `http://localhost:${PORT}${route}`;
        try {
            try {
                await page.goto(routeUrl);
                await page.waitForFunction(() => {
                    return new Promise((resolve) => {
                        document.addEventListener('render-event', resolve, { once: true });
                    });
                });
                await page.waitForNetworkIdle({ idleTime: 500, retries: 3 });
            } catch (err) {
                console.error(`[prerender-spa-plugin] Error rendering route: ${route}`, err);
            }
            await page.evaluate(() => {
                const scripts = document.querySelectorAll('script[data-prerender="prerender"]');
                scripts.forEach(script => script.remove());
            });

            const html = await page.content();
            const minifiedHtml = this._options.minify ? minify(html, this._options.minify) : html;
            const outputPath = path.join(this._options.outputDir, route);
            // fs.mkdir(path.dirname(outputPath), { recursive: true }, (err) => {
            // });
            fs.writeFile(outputPath, minifiedHtml, (err) => {
            });
            console.log(`rendered route: ${route}`, outputPath);
        } catch (err) {
            console.error(`[prerender-spa-plugin] Error rendering route: ${route}`, err);
            throw new Error(`[prerender-spa-plugin] Error rendering route ${route}: ${err.message}`);
        }
    }


    async apply(compiler) {
        // Create a queue for routes to be processed
        const routeQueue = [...this._options.routes];
        const inProgress = new Set();
        const server = this.run_server()

        // Function to process routes using two pages (or more)
        const processRoute = async (page) => {
            while (routeQueue.length > 0) {
                const route = routeQueue.shift(); // Get next route from queue

                if (!route || inProgress.has(route)) {
                    continue;
                }

                inProgress.add(route); // Mark route as being processed
                await this.renderRoute(page, route); // Render the route
                inProgress.delete(route); // Mark route as completed
            }
        };

        const afterEmit = async (compilation, done) => {
            const browser = await puppeteer.launch({
                headless: false,
                executablePath: this._options.renderer.executablePath
            });
            try {
                const page1 = await browser.newPage();
                const page2 = await browser.newPage();
                await Promise.all([
                    processRoute(page1),
                    processRoute(page2),
                ])
            } catch (err) {
                const msg = `[prerender-spa-plugin] Unable to prerender all routes! [Error: ${err.message}]`
                compilation.errors.push(new Error(msg));
                console.error(msg);
            } finally {
                await browser.close();
                server.close(() => {
                    console.log('Server closed!');
                });
                done();
            }
        };

        if (compiler.hooks) {
            const plugin = { name: 'PrerenderSPAPlugin' };
            compiler.hooks.afterEmit.tapAsync(plugin, afterEmit);
        } else {
            compiler.plugin('after-emit', afterEmit);
        }
    }
}

export default PrerenderSPAPlugin;
