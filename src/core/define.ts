import { RanConfig, Plugin, Runtime } from './types'

/**定义.ranrc.ts用户配置 */
export function defineRanConfig(config: RanConfig){ return config }

/**定义插件 */
export function definePlugin(plugin:Plugin){ return plugin }

/**定义运行时函数 */
export function defineRuntime(fn:Runtime){ return fn }