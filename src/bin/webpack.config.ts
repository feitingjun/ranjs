import webpack, { Configuration } from 'webpack'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import { resolve } from 'path'
import CorePlugin from '../core'

const { HotModuleReplacementPlugin } = webpack

export default {
  entry: ['webpack-hot-middleware/client?reload=true'],
  target: 'web',
  output: {
    path: resolve(process.cwd(), 'dist'),
    filename: 'ran.js',
    publicPath: '/'
  },
  devtool: 'source-map',
  optimization: {
    
  },
  plugins: [
    new ReactRefreshWebpackPlugin({
      overlay: false, // 禁用刷新错误提示
      esModule: true, // 启用ES模块热更新，ESM需要设置为true，否则会报错
    }),
    new HotModuleReplacementPlugin(),
    new CorePlugin()
  ]
} as Configuration