"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const server_1 = require("react-dom/server");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const react_1 = require("react");
const glob_1 = require("glob");
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = require("path");
const utils_1 = require("../utils");
const hbs_1 = require("../hbs");
const writeFile_1 = require("../writeFile");
const config_1 = require("./config");
/**插件功能
 * 1、加载.ranrc.ts并合并到webpack的配置
 * 2、自动生成.ran临时文件夹
 * 3、监听文件变更并自动生成路由清单
 * 4、提供ran插件功能
 */
class CorePlugin {
    // 用户配置
    userConfig;
    // 额外的pageConfig类型
    pageConfigTypes = [];
    // 额外的appConfig类型
    appConfigTypes = [];
    // 从ran命名空间导出的模块
    exports = [];
    // 在入口文件中导入的模块
    imports = [];
    // 在入口文件顶部插入的代码
    aheadCodes = [];
    // 在入口文件尾部插入的代码
    tailCodes = [];
    // 文件变更时触发的函数
    watchers = [];
    // 运行时配置
    runtimes = [];
    compiler;
    constructor() {
        // 获取用户配置
        this.userConfig = (0, utils_1.dynamicImport)((0, path_1.resolve)(process.cwd(), '.ranrc.ts')).default;
    }
    apply(compiler) {
        // 加载插件
        this.laodPlugins();
        // 创建临时文件夹并且写入临时文件
        this.createTmpDir();
        // 合并配置
        this.mergeConfig(compiler.options);
        this.compiler = compiler;
        this.watchFiles();
        this.addHtmlTemplate();
        // 添加webpack的entry
        compiler.hooks.entryOption.tap('entryOption', (ctx, entry) => {
            entry.main.import.push((0, path_1.resolve)(ctx, this.userConfig.srcDir ?? 'src', '.ran', 'entry.tsx'));
        });
        // compiler.hooks.compilation.tap('compilation', (compilation) => {
        // 添加html模板
        // compilation.hooks.processAssets.tap('processAssets', (assets) => {
        //   const source = new webpack.sources.ConcatSource(this.getHtmlText(assets))
        //   assets['index.html'] = source
        // })
        // })
    }
    /**处理文件监听 */
    watchFiles() {
        if (this.compiler?.options.mode !== 'development')
            return;
        const watcher = chokidar_1.default.watch((0, path_1.resolve)(process.cwd()), {
            ignored: [/node_modules/],
            persistent: true,
            cwd: process.cwd()
        });
        watcher.on('all', (event, path) => {
            if (this.needGenerateRoutes(path)) {
                const manifest = this.generateRouteManifest();
                (0, writeFile_1.writeRanRoutesTs)((0, path_1.resolve)(process.cwd(), this.userConfig.srcDir ?? 'src', '.ran'), manifest);
            }
            this.watchers.forEach(watcher => watcher(event, path));
        });
    }
    /**加载html模板 */
    addHtmlTemplate() {
        let tmpl = (0, path_1.resolve)(process.cwd(), this.userConfig.srcDir ?? 'src', 'document.tsx');
        if (!(0, fs_1.existsSync)(tmpl)) {
            tmpl = (0, path_1.resolve)(__dirname, '..', 'template', 'index.html');
        }
        // 添加HtmlWebpackPlugin插件
        this.compiler.options.plugins.push(new html_webpack_plugin_1.default({
            template: tmpl,
            cache: false,
            inject: 'body'
        }));
        return tmpl;
    }
    /**获取html */
    getHtmlText(assets) {
        let htmlTmp = (0, path_1.resolve)(process.cwd(), this.userConfig.srcDir ?? 'src', 'document.tsx');
        if (!(0, fs_1.existsSync)(htmlTmp)) {
            htmlTmp = (0, path_1.resolve)(__dirname, '..', '..', 'template', 'document.tsx');
        }
        const module = (0, utils_1.dynamicImport)(htmlTmp).default;
        const names = Object.keys(assets);
        const html = (0, server_1.renderToString)(module({
            Scripts: () => names.filter(name => name.endsWith('.js')).map(name => {
                return (0, react_1.createElement)('script', { key: name, src: `${this.compiler.options.output.publicPath}${name}` });
            })
        }));
        return html;
    }
    /**创建临时文件夹 */
    createTmpDir() {
        (0, writeFile_1.createTmpDir)({
            root: process.cwd(),
            srcDir: this.userConfig.srcDir || 'src',
            options: {
                manifest: this.generateRouteManifest(),
                pageConfigTypes: this.pageConfigTypes,
                appConfigTypes: this.appConfigTypes,
                exports: this.exports,
                imports: this.imports,
                aheadCodes: this.aheadCodes,
                tailCodes: this.tailCodes,
                runtimes: this.runtimes
            }
        });
    }
    /**合并配置 */
    mergeConfig(config) {
        const { port, open, publicPath = '/', outputDir = 'dist', srcDir = 'src', alias, proxy, webpackPlugins, webpack } = this.userConfig;
        if (!config.devServer)
            config.devServer = {};
        // 端口
        if (port)
            config.devServer.port = port;
        // 启动时打开浏览器
        if (open)
            config.devServer.open = open;
        if (publicPath)
            config.output.publicPath = publicPath;
        if (outputDir)
            config.output.path = (0, path_1.resolve)(process.cwd(), outputDir);
        if (proxy)
            config.devServer.proxy = proxy;
        if (webpackPlugins)
            config.plugins.push(...webpackPlugins);
        config.module.rules.push(...config_1.rules);
        if (!config.resolve.extensions)
            config.resolve.extensions = [];
        config.resolve.extensions.push(...config_1.extensions);
        if (!config.resolve.mainFiles)
            config.resolve.mainFiles = [];
        config.resolve.mainFiles.push('index');
        config.devtool = config.mode === 'development' ? 'source-map' : false;
        if (webpack && typeof webpack === 'function')
            webpack(config);
        config.watch = true;
        config.resolve.alias = {
            '@': (0, path_1.resolve)(process.cwd(), srcDir.split('/')[0]),
            'ran': (0, path_1.resolve)(process.cwd(), srcDir, '.ran'),
            ...alias
        };
    }
    /**加载插件 */
    laodPlugins() {
        this.userConfig.plugins?.forEach(plugin => {
            const { runtime, setup } = plugin;
            const srcDir = this.userConfig.srcDir || 'src';
            const pkg = require(`${process.cwd()}/package.json`);
            const context = {
                mode: process.env.NODE_ENV,
                root: process.cwd(),
                srcDir,
                userConfig: this.userConfig,
                pkg
            };
            if (runtime)
                this.runtimes.push(runtime);
            setup?.({
                context,
                modifyUserConfig: this.modifyUserConfig,
                addFile: this.addFile,
                addFileTemplate: this.addFileTemplate,
                addPageConfigType: this.addPageConfigType,
                addAppConfigType: this.addAppConfigType,
                addExport: this.addExport,
                addEntryImport: this.addEntryImport,
                addEntryCodeAhead: this.addEntryCodeAhead,
                addEntryCodeTail: this.addEntryCodeTail,
                addWatch: this.addWatch
            });
        });
    }
    /**watch函数列表 */
    addWatch(fn) {
        this.watchers.push(fn);
    }
    /**生成路由清单 */
    generateRouteManifest() {
        const srcDir = (0, path_1.resolve)(process.cwd(), this.userConfig.srcDir ?? 'src');
        // 获取页面根目录
        const pageDir = (0, fs_1.existsSync)(srcDir + '/pages') ? 'pages' : '';
        // 获取全局layout
        const rootLayout = (0, glob_1.globSync)('layout{s,}{/index,}.tsx', { cwd: srcDir });
        // 获取所有页面
        const include = ['**/*{[^/],}page.tsx', '**/layout{/index,}.tsx'];
        const ignore = ['**/layout/**/*{[^/],}page.tsx', '**/layout/**/layout.tsx'];
        const pages = (0, glob_1.globSync)(include, { cwd: (0, path_1.resolve)(srcDir, pageDir), ignore });
        // 获取id和文件的映射
        const idpaths = pages.reduce((prev, file) => {
            const id = file
                // 去除路径中文件夹为index的部分
                .replace(/index\//, '')
                // 去除结尾的index.tsx(layout才有) | (/)page.tsx | (/).page.tsx | (/)index.page.tsx
                .replace(/\/?((index)|((((\/|^)index)?\.)?page))?\.tsx$/, '')
                // 将user.detail 转换为 user/detail格式(简化目录层级)
                .replace('.', '/')
                // 将$id转换为:id
                .replace(/\$(\w+)/, ':$1')
                // 将$转换为通配符*
                .replace(/\$$/, '*')
                // 将404转换为通配符*
                .replace(/404$/, '*');
            prev[id || '/'] = file;
            return prev;
        }, {});
        const ids = Object.keys(idpaths).sort((a, b) => {
            const nA = a.replace(/\/?layout/, ''), nB = b.replace(/\/?layout/, '');
            return nA.length === nB.length ? a.indexOf('layout') : nB.length - nA.length;
        });
        // 生成路由清单
        const routesManifest = ids.reduce((prev, id, index) => {
            const parentId = ids.slice(index + 1).find(v => {
                return v.endsWith('layout') && id.startsWith(v.replace(/\/?layout/, ''));
            });
            const regex = new RegExp(`^${parentId?.replace(/\/?layout$/, '')}/?|/?layout$`, 'g');
            return {
                ...prev,
                [id]: {
                    id,
                    parentId,
                    path: id === '/' ? '' : id.replace(regex, ''),
                    pathname: id.replace(/\/?layout?$/, ''),
                    file: (0, path_1.resolve)(srcDir, pageDir, idpaths[id]),
                    layout: id.endsWith('layout')
                }
            };
        }, {});
        if (rootLayout.length > 0 && pageDir) {
            Object.values(routesManifest).forEach(v => {
                if (!v.parentId)
                    v.parentId = 'rootLayout';
            });
            routesManifest['rootLayout'] = {
                id: 'rootLayout',
                path: '',
                pathname: '',
                file: (0, path_1.resolve)(srcDir, rootLayout[0]),
                layout: true
            };
        }
        return routesManifest;
    }
    /**判断是否需要重新生成路由 */
    needGenerateRoutes(path) {
        const srcDir = this.userConfig.srcDir || 'src';
        // 匹配src目录下的layout(s).tsx | layout(s)/index.tsx
        const regex = new RegExp(`^${srcDir}/(layout|layouts)(?:/index)?.tsx$`);
        const isRootLayout = regex.test(path);
        // 匹配以(.)page.tsx | layout.tsx | layout/index.tsx 结尾且page.tsx不在layout(s)下的文件
        const isPageOrLayout = /^(?:(?!.*(layout|layouts)\/.*page\.tsx).)*\/((\S+\.)?page\.tsx|layout(\/index)?\.tsx)$/.test(path);
        // 是否在指定的pages目录下
        const inPagesDir = (0, fs_1.existsSync)((0, path_1.resolve)(process.cwd(), srcDir, 'pages')) ? path.startsWith(`${srcDir}/pages`) : path.startsWith(srcDir);
        return (isRootLayout || (isPageOrLayout && inPagesDir) || path === srcDir || path === `${srcDir}/pages`);
    }
    /**修改用户配置 */
    modifyUserConfig = (fn) => {
        this.userConfig = fn(this.userConfig);
    };
    /**添加文件 */
    addFile = ({ content, outPath }) => {
        (0, fs_1.writeFileSync)(outPath, content);
    };
    /**根据Handlebars模板写入文件 */
    addFileTemplate = (options) => {
        (0, hbs_1.renderHbsTpl)(options);
    };
    /**添加额外的pageConfig的配置类型 */
    addPageConfigType = (options) => {
        this.pageConfigTypes.push(options);
    };
    /**添加额外的appConfig的配置类型 */
    addAppConfigType = (options) => {
        this.appConfigTypes.push(options);
    };
    /**添加从ran命名空间导出的模块 */
    addExport = (options) => {
        this.exports.push(options);
    };
    /**在入口文件的最前面添加import */
    addEntryImport = (options) => {
        this.imports.push(options);
    };
    /**在入口文件的最前插入代码 */
    addEntryCodeAhead = (code) => {
        this.aheadCodes.push(code);
    };
    /**在入口文件的最后插入代码 */
    addEntryCodeTail = (code) => {
        this.tailCodes.push(code);
    };
}
exports.default = CorePlugin;
//# sourceMappingURL=index.js.map