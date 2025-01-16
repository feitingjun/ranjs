import { HotModuleReplacementPlugin } from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { resolve } from 'path';
import CorePlugin from '../core';
export default {
    entry: ['webpack-hot-middleware/client?reload=true'],
    target: 'web',
    output: {
        path: resolve(process.cwd(), 'dist'),
        filename: 'ran.js',
        publicPath: '/'
    },
    optimization: {},
    plugins: [
        new ReactRefreshWebpackPlugin(),
        new HotModuleReplacementPlugin(),
        new CorePlugin()
    ]
};
//# sourceMappingURL=webpack.config.js.map