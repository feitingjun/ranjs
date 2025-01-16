"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writePackageJson = writePackageJson;
exports.writeTsConfigJson = writeTsConfigJson;
exports.writeRanrcTs = writeRanrcTs;
exports.writeAppTs = writeAppTs;
exports.writeIndexPageTsx = writeIndexPageTsx;
exports.writeRanIndexts = writeRanIndexts;
exports.writeEntryTsx = writeEntryTsx;
exports.writeRanTypesTs = writeRanTypesTs;
exports.writeRanDefineTs = writeRanDefineTs;
exports.writeRanRoutesTs = writeRanRoutesTs;
exports.wirteRuntime = wirteRuntime;
exports.createTmpDir = createTmpDir;
const fs_1 = require("fs");
const path_1 = require("path");
const hbs_1 = require("./hbs");
const TML_DIR = (0, path_1.resolve)(__dirname, 'template');
/**写入package.json文件 */
function writePackageJson(root, description) {
    const packageJson = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, '../', 'package.json'), 'utf-8');
    const { version } = JSON.parse(packageJson);
    const path = root.split('/');
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'package.json.hbs'),
        outPath: (0, path_1.resolve)(root, 'package.json'),
        data: { projectName: path[path.length - 1], description, version }
    });
}
/**写入tsconfig.json文件 */
function writeTsConfigJson(root, srcDir) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'tsconfig.json.hbs'),
        outPath: (0, path_1.resolve)(root, 'tsconfig.json'),
        data: { srcDir, srcDirRoot: srcDir.split('/')[0] }
    });
}
/**写入ranrc.ts文件 */
function writeRanrcTs(root, srcDir) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, '.ranrc.ts.hbs'),
        outPath: (0, path_1.resolve)(root, '.ranrc.ts'),
        data: { srcDir }
    });
}
/**写入app.ts文件 */
function writeAppTs(root, srcDir) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'app.ts.hbs'),
        outPath: (0, path_1.resolve)(root, srcDir, 'app.ts'),
    });
}
/**写入page.tsx文件 */
function writeIndexPageTsx(root, srcDir) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'page.tsx.hbs'),
        outPath: (0, path_1.resolve)(root, srcDir, 'page.tsx'),
    });
}
/**创建.ran/index.ts文件 */
function writeRanIndexts(tmpDir, exports) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'index.ts.hbs'),
        outPath: (0, path_1.resolve)(tmpDir, 'index.ts'),
        data: { exports }
    });
}
/**创建.ran/entry.tsx文件 */
function writeEntryTsx(tmpDir, data) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'entry.tsx.hbs'),
        outPath: (0, path_1.resolve)(tmpDir, 'entry.tsx'),
        data: {
            ...data,
            srcDir: (0, path_1.resolve)(tmpDir, '..')
        }
    });
}
/**写入.san/types.ts */
function writeRanTypesTs(tmpDir, pageConfigTypes = [], appConfigTypes = []) {
    const all = [...pageConfigTypes, ...appConfigTypes].reduce((acc, item) => {
        const index = acc.findIndex(v => v.source === item.source);
        if (index > -1 && Array.isArray(item.specifier) && Array.isArray(acc[index].specifier)) {
            acc[index].specifier = [...acc[index].specifier, ...item.specifier];
        }
        else {
            acc.push(item);
        }
        return acc;
    }, []);
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'types.ts.hbs'),
        outPath: (0, path_1.resolve)(tmpDir, 'types.ts'),
        data: { all, pageConfigTypes, appConfigTypes }
    });
}
/**写入.san/define.ts */
function writeRanDefineTs(tmpDir) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'define.ts.hbs'),
        outPath: `${tmpDir}/define.ts`,
        data: {
            srcDir: (0, path_1.resolve)(tmpDir, '..')
        }
    });
}
/**写入.ran/manifest.ts */
function writeRanRoutesTs(tmpDir, manifest) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'manifest.ts.hbs'),
        outPath: (0, path_1.resolve)(tmpDir, 'manifest.ts'),
        data: { manifest: Object.values(manifest).sort((a, b) => {
                const nA = a.id.replace(/\/?layout/, ''), nB = b.id.replace(/\/?layout/, '');
                return nA.length === nB.length ? b.id.indexOf('layout') : nA.length - nB.length;
            }) }
    });
}
/**写入.san/runtimes.ts */
function wirteRuntime(tmpDir, runtimes) {
    (0, hbs_1.renderHbsTpl)({
        sourcePath: (0, path_1.resolve)(TML_DIR, 'runtime.ts.hbs'),
        outPath: (0, path_1.resolve)(tmpDir, 'runtime.ts'),
        data: { runtimes }
    });
}
/**创建临时文件夹 */
function createTmpDir({ root, srcDir, options }) {
    const { manifest = {}, pageConfigTypes, appConfigTypes, exports, imports, aheadCodes, tailCodes, runtimes } = options;
    const tmpDir = (0, path_1.resolve)(root, srcDir, '.ran');
    if (!(0, fs_1.existsSync)(tmpDir)) {
        (0, fs_1.mkdirSync)(tmpDir, { recursive: true });
    }
    // 创建.ran/index.ts文件
    writeRanIndexts(tmpDir, exports);
    // 创建.ran/entry.tsx
    writeEntryTsx(tmpDir, {
        imports, aheadCodes, tailCodes
    });
    // 创建.ran/types.ts
    writeRanTypesTs(tmpDir, pageConfigTypes, appConfigTypes);
    // 创建.ran/define.ts
    writeRanDefineTs(tmpDir);
    // 创建.ran/routes.ts
    writeRanRoutesTs(tmpDir, manifest);
    // 创建.ran/runtime.tsx
    wirteRuntime(tmpDir, runtimes);
}
//# sourceMappingURL=writeFile.js.map