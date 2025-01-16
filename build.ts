import ts from 'typescript'
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, watch } from 'fs'
import { join, extname } from 'path'
import { chalk } from './src/utils'

const config = ts.readConfigFile('./tsconfig.json', ts.sys.readFile)
const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd())

// 复制非ts文件到输出目录
const copyNonTsFiles = (srcDir: string = 'src', outDir: string = 'dist') => {
  readdirSync(srcDir).forEach(file => {
    const fullPath = join(srcDir, file)
    const outPath = join(outDir, file)
    if (statSync(fullPath).isDirectory()) {
      // 如果是目录，递归复制
      if (!existsSync(outPath)) {
        mkdirSync(outPath, { recursive: true })
      }
      copyNonTsFiles(fullPath, outPath)
    } else if (extname(fullPath) !== '.ts') {
      // 只复制非.ts 文件
      copyFileSync(fullPath, outPath)
    }
  })
}

// 执行构建
const build = () => {
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: {
      ...parsedConfig.options,
      sourceMap: process.argv.includes('-d')
    }
  })
  program.emit()
  copyNonTsFiles(parsedConfig.options.rootDir, parsedConfig.options.outDir)
  console.log(chalk.green('构建成功'))
}

build()
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  console.log(chalk.green('开始监听文件变更'))
  // 监听文件变更
  watch('src', { recursive: true }, (_, filename) => {
    console.log(`文件 ${filename} 变更，重新构建`)
    build()
  })
}