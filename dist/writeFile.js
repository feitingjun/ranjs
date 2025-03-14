import { existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { renderHbsTpl } from "./hbs.js";
import { deepClone } from "./utils.js";
const __dirname = import.meta.dirname;
const TML_DIR = resolve(__dirname, 'template');
/**写入package.json文件 */
export function writePackageJson(root, description) {
    const packageJson = readFileSync(resolve(__dirname, '../', 'package.json'), 'utf-8');
    const { version } = JSON.parse(packageJson);
    const path = root.split('/');
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'package.json.hbs'),
        outPath: resolve(root, 'package.json'),
        data: { projectName: path[path.length - 1], description, version }
    });
}
/**写入tsconfig.json文件 */
export function writeTsConfigJson(root, srcDir) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'tsconfig.json.hbs'),
        outPath: resolve(root, 'tsconfig.json'),
        data: { srcDir, srcDirRoot: srcDir.split('/')[0] }
    });
}
/**写入ranrc.ts文件 */
export function writeRanrcTs(root, srcDir) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, '.ranrc.ts.hbs'),
        outPath: resolve(root, '.ranrc.ts'),
        data: { srcDir }
    });
}
/**写入app.ts文件 */
export function writeAppTs(root, srcDir) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'app.ts.hbs'),
        outPath: resolve(root, srcDir, 'app.ts'),
    });
}
/**写入page.tsx文件 */
export function writeIndexPageTsx(root, srcDir) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'page.tsx.hbs'),
        outPath: resolve(root, srcDir, 'page.tsx'),
    });
}
/**创建.ran/index.ts文件 */
export function writeRanIndexts(tmpDir, exports) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'index.ts.hbs'),
        outPath: resolve(tmpDir, 'index.ts'),
        data: { exports }
    });
}
/**创建.ran/entry.tsx文件 */
export function writeEntryTsx(tmpDir, data) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'entry.tsx.hbs'),
        outPath: resolve(tmpDir, 'entry.tsx'),
        data: {
            ...data,
            srcDir: resolve(tmpDir, '..')
        }
    });
}
/**写入.san/types.ts */
export function writeRanTypesTs(tmpDir, pageConfigTypes = [], appConfigTypes = []) {
    const all = deepClone([...pageConfigTypes, ...appConfigTypes]).reduce((acc, item) => {
        const index = acc.findIndex(v => v.source === item.source);
        if (index > -1 && Array.isArray(item.specifier) && Array.isArray(acc[index].specifier)) {
            acc[index].specifier = [...acc[index].specifier, ...item.specifier];
        }
        else {
            acc.push(item);
        }
        return acc;
    }, []);
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'types.ts.hbs'),
        outPath: resolve(tmpDir, 'types.ts'),
        data: { all, pageConfigTypes, appConfigTypes }
    });
}
/**写入.san/define.ts */
export function writeRanDefineTs(tmpDir) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'define.ts.hbs'),
        outPath: `${tmpDir}/define.ts`,
        data: {
            srcDir: resolve(tmpDir, '..')
        }
    });
}
/**写入.ran/manifest.ts */
export function writeRanRoutesTs(tmpDir, manifest) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'manifest.ts.hbs'),
        outPath: resolve(tmpDir, 'manifest.ts'),
        data: { manifest: Object.values(manifest).sort((a, b) => {
                const nA = a.id.replace(/\/?layout/, ''), nB = b.id.replace(/\/?layout/, '');
                return nA.length === nB.length ? b.id.indexOf('layout') : nA.length - nB.length;
            }) }
    });
}
/**写入.san/runtimes.ts */
export function wirteRuntime(tmpDir, runtimes) {
    renderHbsTpl({
        sourcePath: resolve(TML_DIR, 'runtime.ts.hbs'),
        outPath: resolve(tmpDir, 'runtime.ts'),
        data: { runtimes }
    });
}
/**创建临时文件夹 */
export function createTmpDir({ root, srcDir, options }) {
    const { manifest = {}, pageConfigTypes, appConfigTypes, exports, imports, aheadCodes, tailCodes, runtimes } = options;
    const tmpDir = resolve(root, srcDir, '.ran');
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir, { recursive: true });
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