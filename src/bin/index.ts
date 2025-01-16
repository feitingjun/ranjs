#!/usr/bin/env node
import { Command } from 'commander'

const program = new Command()

/**创建项目 */
program
.command('create')
.action(async () => {
  // 动态加载，静态导入dev相关的文件还没有创建会导致报错
  const create = (await import('./create')).default
  create()
})

/**启动项目 */
program
.command('dev')
.action(async () => {
  const dev = (await import('./dev')).default
  dev()
})

program.parse(process.argv)