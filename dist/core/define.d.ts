import { RanConfig, Plugin, Runtime } from './types';
/**定义.ranrc.ts用户配置 */
export declare function defineRanConfig(config: RanConfig): RanConfig;
/**定义插件 */
export declare function definePlugin(plugin: Plugin): Plugin;
/**定义运行时函数 */
export declare function defineRuntime(fn: Runtime): Runtime;
