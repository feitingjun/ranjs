import webpack, { Compiler } from 'webpack'
import { watch } from 'fs'
import { resolve, join } from 'path'
import express, { Express } from 'express'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { createProxyMiddleware, Options } from 'http-proxy-middleware'
import config from './webpack.config'
import { chalk, getLocalIp } from '../utils'

// 启动开发服务器
const startServer = (app:Express, port:number) => {
  // 启动开发服务器
  const server = app.listen(port)
  server.on('error', (err:NodeJS.ErrnoException) => {
    if(err.code === 'EADDRINUSE') return startServer(app, port + 1)
    console.error(err)
  })
  // 开发服务器启动成功后执行webpack编译
  server.on('listening', () => {
    console.log(`服务器启动成功：`)
    console.log(`  - Local: ${chalk.green(`http://localhost:${port}`)}`)
    console.log(`  - Network: ${chalk.green(`http://${getLocalIp()}:${port}`)}\n`)
    const watcher = watch(resolve(process.cwd(), '.ranrc.ts'), () => {
      console.log(chalk.blue(`.ranrc.ts 文件变更，服务器重启中...`))
      watcher.close()
      server.close(createApp)
    })
  })
}
// 配置http代理
const setProxy = (app:Express, devServer:Compiler['options']['devServer']) => {
  const proxy = devServer && devServer?.proxy as { [key:string]: Options }
  if(proxy){
    Object.keys(proxy).forEach(key => {
      app.use(key, createProxyMiddleware(proxy[key]))
    })
  }
}

const createApp = async () => {
  config.mode = 'development'
  const app = express()
  // 设置静态文件路径
  app.use(express.static('public'))
  const compiler = webpack(config)
  // 获取端口
  let port = 8000
  const devServer = compiler.options.devServer
  if(devServer && devServer.port){
    port = devServer.port
  }
  // 启动开发服务器
  await startServer(app, port)
  // 启动webpack-dev-middleware中间件
  const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: compiler.options.output.publicPath,
    stats: 'errors-warnings',
    writeToDisk: true
  })
  // 使用开发服务中间件
  app.use(devMiddleware)
  // 使用热更新中间件
  app.use(webpackHotMiddleware(compiler))
  setProxy(app, devServer)
  app.all('*', (req, res) => {
    compiler.outputFileSystem?.readFile(join(compiler.outputPath, 'index.html'), (err, result) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.setHeader('content-type', 'text/html')
      res.send(result)
    })
  })
}

export default createApp