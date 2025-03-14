export declare function getLocalIp(): string | undefined;
/**console颜色 */
export declare const chalk: {
    blue: (text: string) => string;
    green: (text: string) => string;
    red: (text: string) => string;
};
/**commonjs动态导入ts方案 */
export declare function dynamicImport(source: string): Promise<any>;
export declare function deepClone<T>(obj: T): T;
