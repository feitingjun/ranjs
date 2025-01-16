"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chalk = void 0;
exports.getLocalIp = getLocalIp;
exports.dynamicImport = dynamicImport;
const typescript_1 = __importStar(require("typescript"));
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
// 获取本地IPv4地址
function getLocalIp() {
    const interfaces = (0, os_1.networkInterfaces)();
    for (const iface in interfaces) {
        if (!interfaces[iface])
            continue;
        for (const alias of interfaces[iface]) {
            // 过滤IPv4地址，排除127.0.0.1（localhost）
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
/**console颜色 */
exports.chalk = {
    blue: (text) => {
        return `\x1b[34m${text}\x1b[0m`;
    },
    green: (text) => {
        return `\x1b[32m${text}\x1b[0m`;
    },
    red: (text) => {
        return `\x1b[31m${text}\x1b[0m`;
    }
};
/**commonjs动态导入ts方案 */
function dynamicImport(source) {
    const ext = (0, path_1.extname)(source);
    // 创建临时文件夹
    const tempDir = (0, path_1.resolve)(process.cwd(), 'node_modules', '.temp');
    if (!(0, fs_1.existsSync)(tempDir)) {
        (0, fs_1.mkdirSync)(tempDir, { recursive: true });
    }
    const filename = (0, path_1.basename)(source).replace(ext, '');
    const tsCode = (0, fs_1.readFileSync)(source, 'utf-8');
    const result = typescript_1.default.transpileModule(tsCode, {
        fileName: source,
        compilerOptions: {
            target: typescript_1.default.ScriptTarget.ES5,
            module: typescript_1.default.ModuleKind.CommonJS,
            sourceMap: true,
            sourceRoot: (0, path_1.dirname)(source),
            jsx: typescript_1.JsxEmit.ReactJSX,
            esModuleInterop: true,
            allowJs: true,
        }
    });
    const jsCode = result.outputText;
    // 写入临时文件
    const path = (0, path_1.resolve)(tempDir, filename + '.js');
    (0, fs_1.writeFileSync)(path, jsCode);
    (0, fs_1.writeFileSync)((0, path_1.resolve)(tempDir, filename + '.js.map'), result.sourceMapText);
    return require(path);
}
//# sourceMappingURL=utils.js.map