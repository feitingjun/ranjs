"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHbsTpl = void 0;
const fs_1 = require("fs");
const handlebars_1 = __importDefault(require("handlebars"));
const utils_1 = require("./utils");
handlebars_1.default.registerHelper('isArray', function (value, options) {
    return handlebars_1.default.Utils.isArray(value) ? options.fn(this) : options.inverse(this);
});
handlebars_1.default.registerHelper('isString', function (value, options) {
    return typeof value === 'string' ? options.fn(this) : options.inverse(this);
});
handlebars_1.default.registerHelper('isEqual', function (value1, value2) {
    return value1 === value2;
});
handlebars_1.default.registerHelper('and', function (value1, value2) {
    return value1 && value2;
});
handlebars_1.default.registerHelper('or', function (value1, value2) {
    return value1 || value2;
});
handlebars_1.default.registerHelper('rmTsx', function (value) {
    return value.replace(/\.tsx$/, '');
});
handlebars_1.default.registerHelper('boolean', function (value) {
    return !!value;
});
handlebars_1.default.registerHelper('repeat', function (num, str) {
    return str.repeat(num);
});
handlebars_1.default.registerHelper('space', function (value) {
    if (typeof value !== 'number') {
        value = 1;
    }
    return ' '.repeat(value);
});
/**根据handlebars模板写入文件 */
const renderHbsTpl = ({ sourcePath, outPath, data = {} }) => {
    const rendered = handlebars_1.default.compile((0, fs_1.readFileSync)(sourcePath, 'utf-8'))(data);
    if (rendered) {
        (0, fs_1.writeFileSync)(outPath, rendered);
    }
    else {
        console.log(utils_1.chalk.red(`加载模板文件失败: ${sourcePath}`));
    }
};
exports.renderHbsTpl = renderHbsTpl;
//# sourceMappingURL=hbs.js.map