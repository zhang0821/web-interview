/**
 * @file    index.ts
 * @author  zhangxu24
*/
import {Plugin} from 'vite';
import type {PluginOptions} from './types';

import fs from 'fs';
import path from 'path';
import {render, renderFile} from 'ejs';
import {minify} from 'html-minifier-terser';
import {parseUrl} from 'query-string';
import set from 'object-set';

// 导航页模板路径
const NAV_PAGE_TEMPLATE_PATH = 'src/templates/nav.html';

// 默认页面模板路径
const DEFAULT_PAGE_TEMPLATE_PATH = 'src/templates/page.html';

// minify默认配置
// @see https://github.com/terser/html-minifier-terser#options-quick-reference
const DEFAULT_MINIFY_OPTIONS = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: false,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true
};

const resolve = (p: string) => path.resolve(process.cwd(), p);
const relative = (p: string) => path.relative(process.cwd(), p);

function renderTemplate(tpl: string, tplData: object): string {
    return render(tpl, tplData);
};

async function renderTemplateFile(tplPath: string, tplData: object): Promise<string> {
    return await renderFile(tplPath, tplData)
}

function tangramMpa(options: PluginOptions): Plugin {
    let mode: string;
    return {
        name: 'vite-plugin-tangram-mpa',
        enforce: 'pre',
        config(config, env) {
            mode = env.mode;
            // 生成页面相关rollup配置
            Object.keys(options.pages).forEach(el => {
                set(config, ['build', 'rollupOptions', 'input', el], path.resolve(process.cwd(), `${el}.html`));
            });
        },
        configureServer(server) {
            // 拦截默认导航页请求
            server.middlewares.use(async (req, res, next) => {
                let url = req.url || '';
                let { url: pathName } = parseUrl(url);
                if (pathName !== '/') {
                    return next();
                }
                let pages:Array<object> = [];
                Object.keys(options.pages).forEach(key => {
                    pages.push({
                        name: key,
                        ...options.pages[key]
                    });
                });
                let tplPath = path.resolve(process.cwd(), NAV_PAGE_TEMPLATE_PATH);
                let content = await renderTemplateFile(tplPath, {TANGRAM_PAGES: pages});
                res.end(content);
            });
        },
        transformIndexHtml: {
            enforce: 'pre',
            transform(html, ctx) {
                // 开发模式
                if (mode === 'development') {
                    // 通过APIM请求的模板URL参数获取真实页面名称
                    let pageName = parseUrl(ctx.originalUrl!).query.page! as string;
                    let pageOptions = options.pages?.[pageName];
                    // 替换入口文件
                    html = html.replace(
                        /<\/body>/,
                        `<script type="module" src="${pageOptions.entry}"></script>\n</body>`
                    );
                    return {
                        html: renderTemplate(html, {...options.data}),
                        tags: [],
                    }
                }
                return {
                    html,
                    tags: []
                }
            }
        },
        resolveId(id) {
            if (id.endsWith('.html')) {
                return id;
            }
            return null;
        },
        async load(id) {
            // 通过虚拟模块生成多个页面文件
            if (id.endsWith('.html')) {
                const pageName = path.basename(relative(id), '.html');
                const pageOptions = options.pages?.[pageName];
                if (pageOptions) {
                    let templateRelativePath = pageOptions.template || DEFAULT_PAGE_TEMPLATE_PATH;
                    let templatePath = resolve(templateRelativePath);
                    let minifyOptions = options?.minify;
                    let html = await renderTemplateFile(templatePath, options.data || {});
                    // 替换入口文件
                    html = html.replace(
                        /<\/body>/,
                        `<script type="module" src="${pageOptions.entry}"></script>\n</body>`
                    );
                    // 压缩HTML
                    if (!minifyOptions) {
                        return html;
                    } else {
                        let options = typeof(minifyOptions) === 'boolean' ? DEFAULT_MINIFY_OPTIONS : {...DEFAULT_MINIFY_OPTIONS, ...minifyOptions};
                        return minify(html, options);
                    }
                }
            }
            return null;
        },
        closeBundle() {
            let outputDir = path.resolve('./dist');
            let configDir = path.resolve('./config');
            // 重命名模板文件
            let tplfiles = fs.readdirSync(outputDir);
            tplfiles.forEach(el => {
                if (el.endsWith('.html')) {
                    let filePath = outputDir + '/' + el;
                    let newFilePath = filePath.replace('.html', '.tpl');
                    try {
                        fs.renameSync(filePath, newFilePath);
                    } catch(err) {
                        throw (err);
                    }
                }
            });
            // 复制schema文件
            let schemaFiles = fs.readdirSync(configDir);
            schemaFiles.forEach(el => {
                if (el.endsWith('.schema.json')) {
                    let filePath = configDir + '/' + el;
                    let newFilePath = (outputDir + '/' + el).replace('.json', '');
                    try {
                        fs.copyFileSync(filePath, newFilePath)
                    } catch (err) {
                        throw (err);
                    }
                }
            });
        }
    }
};

export default tangramMpa;