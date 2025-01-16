"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const prompts_1 = require("@inquirer/prompts");
const utils_1 = require("../utils");
const writeFile_1 = require("../writeFile");
exports.default = async () => {
    const projectName = await (0, prompts_1.input)({ message: '请输入项目名称', default: 'my-app' });
    const srcDir = await (0, prompts_1.input)({ message: '请输入src文件夹名称', default: 'src' });
    const description = await (0, prompts_1.input)({ message: '请输入项目描述' });
    // 判断文件夹是否存在
    if ((0, fs_1.existsSync)(projectName)) {
        console.log(utils_1.chalk.red(`${projectName}文件夹已存在`));
        return;
    }
    // 项目跟目录
    const root = (0, path_1.join)(process.cwd(), projectName);
    // 创建项目目录
    (0, fs_1.mkdirSync)((0, path_1.join)(process.cwd(), projectName, srcDir), { recursive: true });
    // 创建package.json文件
    (0, writeFile_1.writePackageJson)(root, description);
    // 创建tsconfig.json文件
    (0, writeFile_1.writeTsConfigJson)(root, srcDir);
    // 创建.ranrc.ts文件
    (0, writeFile_1.writeRanrcTs)(root, srcDir);
    // 创建src/app.ts文件
    (0, writeFile_1.writeAppTs)(root, srcDir);
    // 创建page.tsx文件
    (0, writeFile_1.writeIndexPageTsx)(root, srcDir);
    console.log(utils_1.chalk.green(`项目${projectName}创建成功`));
};
//# sourceMappingURL=create.js.map