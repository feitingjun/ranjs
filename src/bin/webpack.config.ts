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
    new ReactRefreshWebpackPlugin(),
    new HotModuleReplacementPlugin(),
    new CorePlugin()
  ]
} as Configuration