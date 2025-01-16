import ts, { JsxEmit } from 'typescript';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { basename, resolve, extname, dirname } from 'path';
import { networkInterfaces } from 'os';
// 获取本地IPv4地址
export function getLocalIp() {
    const interfaces = networkInterfaces();
    for (const iface in interfaces) {
        if (!interfaces[iface])
            continue;
        for (const alias of interfaces[iface] ?? []) {
            // 过滤IPv4地址，排除127.0.0.1（localhost）
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
/**console颜色 */
export const chalk = {
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
export function dynamicImport(source) {
    const ext = extname(source);
    // 创建临时文件夹
    const tempDir = resolve(process.cwd(), 'node_modules', '.temp');
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
    }
    const filename = basename(source).replace(ext, '');
    const tsCode = readFileSync(source, 'utf-8');
    const result = ts.transpileModule(tsCode, {
        fileName: source,
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            sourceMap: true,
            sourceRoot: dirname(source),
            jsx: JsxEmit.ReactJSX,
            esModuleInterop: true,
            allowJs: true,
        }
    });
    const jsCode = result.outputText;
    // 写入临时文件
    const path = resolve(tempDir, filename + '.js');
    writeFileSync(path, jsCode);
    writeFileSync(resolve(tempDir, filename + '.js.map'), result.sourceMapText);
    return require(path);
}
//# sourceMappingURL=utils.js.map