import webpack, { Compiler, WebpackOptionsNormalized } from 'webpack';
import { RanConfig, AddFileOptions, MakePropertyOptional, PluginOptions, RouteManifest, PluginWatcher } from './types';
/**插件功能
 * 1、加载.ranrc.ts并合并到webpack的配置
 * 2、自动生成.ran临时文件夹
 * 3、监听文件变更并自动生成路由清单
 * 4、提供ran插件功能
 */
export default class CorePlugin {
    userConfig: RanConfig;
    pageConfigTypes: AddFileOptions[];
    appConfigTypes: AddFileOptions[];
    exports: AddFileOptions[];
    imports: MakePropertyOptional<AddFileOptions, 'specifier'>[];
    aheadCodes: string[];
    tailCodes: string[];
    watchers: PluginWatcher[];
    runtimes: string[];
    compiler?: Compiler;
    constructor();
    apply(compiler: Compiler): void;
    /**处理文件监听 */
    watchFiles(): void;
    /**加载html模板 */
    addHtmlTemplate(): string;
    /**获取html */
    getHtmlText(assets: {
        [key: string]: webpack.sources.Source;
    }): string;
    /**创建临时文件夹 */
    createTmpDir(): void;
    /**合并配置 */
    mergeConfig(config: WebpackOptionsNormalized): void;
    /**加载插件 */
    laodPlugins(): void;
    /**watch函数列表 */
    addWatch(fn: PluginWatcher): void;
    /**生成路由清单 */
    generateRouteManifest(): RouteManifest;
    /**判断是否需要重新生成路由 */
    needGenerateRoutes(path: string): boolean;
    /**修改用户配置 */
    modifyUserConfig: PluginOptions['modifyUserConfig'];
    /**添加文件 */
    addFile: PluginOptions['addFile'];
    /**根据Handlebars模板写入文件 */
    addFileTemplate: PluginOptions['addFileTemplate'];
    /**添加额外的pageConfig的配置类型 */
    addPageConfigType: PluginOptions['addPageConfigType'];
    /**添加额外的appConfig的配置类型 */
    addAppConfigType: PluginOptions['addAppConfigType'];
    /**添加从ran命名空间导出的模块 */
    addExport: PluginOptions['addExport'];
    /**在入口文件的最前面添加import */
    addEntryImport: PluginOptions['addEntryImport'];
    /**在入口文件的最前插入代码 */
    addEntryCodeAhead: PluginOptions['addEntryCodeAhead'];
    /**在入口文件的最后插入代码 */
    addEntryCodeTail: PluginOptions['addEntryCodeTail'];
}
