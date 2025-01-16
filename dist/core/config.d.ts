export declare const extensions: string[];
export declare const rules: ({
    test: RegExp;
    use: {
        loader: string;
        options: {
            transpileOnly: boolean;
        };
    };
    exclude: RegExp;
} | {
    test: RegExp;
    use: (string | {
        loader: string;
        options: {
            modules: {
                localIdentName: string;
            };
            importLoaders: number;
        };
    })[];
    exclude?: undefined;
})[];
