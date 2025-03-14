export const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.less', '.page.tsx']

export const rules = [{
  test: /\.tsx?$/,
  use: {
    loader: 'ts-loader',
    options: {
      transpileOnly: true
    }
  },
  exclude: /node_modules/
}, {
  // 处理CSS和LESS文件
  test: /\.(css|less)$/,
  use: [
    // 将样式注入到DOM中
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: {
          // 开启CSS Modules功能
          localIdentName: '[local]__[hash:base64:5]'
        },
        importLoaders: 2
      },
    },
    'postcss-loader',
    'less-loader'
  ]
}]