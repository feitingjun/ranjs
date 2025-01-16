"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = require("webpack");
const react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
const path_1 = require("path");
const core_1 = __importDefault(require("../core"));
exports.default = {
    entry: ['webpack-hot-middleware/client?reload=true'],
    target: 'web',
    output: {
        path: (0, path_1.resolve)(process.cwd(), 'dist'),
        filename: 'ran.js',
        publicPath: '/'
    },
    optimization: {},
    plugins: [
        new react_refresh_webpack_plugin_1.default(),
        new webpack_1.HotModuleReplacementPlugin(),
        new core_1.default()
    ]
};
//# sourceMappingURL=webpack.config.js.map