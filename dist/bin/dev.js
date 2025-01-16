"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = __importDefault(require("webpack"));
const fs_1 = require("fs");
const path_1 = require("path");
const express_1 = __importDefault(require("express"));
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const webpack_config_1 = __importDefault(require("./webpack.config"));
const utils_1 = require("../utils");
// 启动开发服务器
const startServer = (app, port) => {
    // 启动开发服务器
    const server = app.listen(port);
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE')
            return startServer(app, port + 1);
        console.error(err);
    });
    // 开发服务器启动成功后执行webpack编译
    server.on('listening', () => {
        console.log(`服务器启动成功：`);
        console.log(`  - Local: ${utils_1.chalk.green(`http://localhost:${port}`)}`);
        console.log(`  - Network: ${utils_1.chalk.green(`http://${(0, utils_1.getLocalIp)()}:${port}`)}\n`);
        const watcher = (0, fs_1.watch)((0, path_1.resolve)(process.cwd(), '.ranrc.ts'), () => {
            console.log(utils_1.chalk.blue(`.ranrc.ts 文件变更，服务器重启中...`));
            watcher.close();
            server.close(createApp);
        });
    });
};
// 配置http代理
const setProxy = (app, devServer) => {
    const proxy = devServer && devServer?.proxy;
    if (proxy) {
        Object.keys(proxy).forEach(key => {
            app.use(key, (0, http_proxy_middleware_1.createProxyMiddleware)(proxy[key]));
        });
    }
};
const createApp = async () => {
    webpack_config_1.default.mode = 'development';
    const app = (0, express_1.default)();
    // 设置静态文件路径
    app.use(express_1.default.static('public'));
    const compiler = (0, webpack_1.default)(webpack_config_1.default);
    // 获取端口
    let port = 8000;
    const devServer = compiler.options.devServer;
    if (devServer && devServer.port) {
        port = devServer.port;
    }
    // 启动开发服务器
    await startServer(app, port);
    // 启动webpack-dev-middleware中间件
    const devMiddleware = (0, webpack_dev_middleware_1.default)(compiler, {
        publicPath: compiler.options.output.publicPath,
        stats: 'errors-warnings',
        writeToDisk: true
    });
    // 使用开发服务中间件
    app.use(devMiddleware);
    // 使用热更新中间件
    app.use((0, webpack_hot_middleware_1.default)(compiler));
    setProxy(app, devServer);
    app.all('*', (req, res) => {
        compiler.outputFileSystem?.readFile((0, path_1.join)(compiler.outputPath, 'index.html'), (err, result) => {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.setHeader('content-type', 'text/html');
            res.send(result);
        });
    });
};
exports.default = createApp;
//# sourceMappingURL=dev.js.map