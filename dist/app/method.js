"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = exports.useLoaderData = exports.useConfig = exports.useAppContext = void 0;
const client_1 = require("react-dom/client");
const react_1 = require("react");
const react_router_1 = require("react-router");
const ReactRouter = __importStar(require("react-router"));
const AppContext = (0, react_1.createContext)({
    manifest: {},
    routes: [],
    appData: {}
});
const useAppContext = () => {
    return (0, react_1.useContext)(AppContext);
};
exports.useAppContext = useAppContext;
const useConfig = () => {
    return (0, react_router_1.useLoaderData)().config;
};
exports.useConfig = useConfig;
const useLoaderData = () => {
    return (0, react_router_1.useLoaderData)().data;
};
exports.useLoaderData = useLoaderData;
const loader = (module) => {
    const { loader: dataLoader, config: pageConfig = {} } = module;
    return async ({ request }) => {
        const { pathname, search, searchParams } = new URL(request.url);
        const ctx = {
            pathname,
            search,
            query: Object.fromEntries(searchParams.entries())
        };
        const data = dataLoader && typeof dataLoader === 'function' ? await dataLoader({ ctx }) : dataLoader;
        return {
            data: data,
            config: typeof pageConfig === 'function' ? await pageConfig({
                ctx, data
            }) : pageConfig
        };
    };
};
const generateRoutes = (manifest, wrappers, parentId) => {
    return Object.values(manifest)
        .filter(v => v.parentId == parentId)
        .map(v => {
        return {
            id: v.id,
            path: v.path,
            pathname: v.pathname,
            parendId: v.parentId,
            layout: v.layout,
            HydrateFallback: () => (0, react_1.createElement)('div', null, 'loading...'),
            async lazy() {
                const module = await v.component();
                return {
                    loader: loader(module),
                    Component: () => wrappers.reduce((acc, fn) => {
                        return (0, react_1.createElement)(fn, {
                            routeId: v.id,
                            layout: v.layout,
                            path: v.path,
                            pathname: v.pathname,
                            parentId: v.parentId,
                        }, acc);
                    }, (0, react_1.createElement)(module.default, null))
                };
            },
            children: generateRoutes(manifest, wrappers, v.id)
        };
    });
};
/**根据路由清单递归生成路由 */
const generateRoutesByManifest = (manifest, parentId) => {
    return Object.values(manifest)
        .filter(v => v.parentId == parentId)
        .map(v => {
        const children = generateRoutesByManifest(manifest, v.id);
        return {
            ...v,
            children
        };
    });
};
const createApp = ({ manifest, app: appConfig, runtimes }) => {
    window.ReactRouter1 = ReactRouter;
    const { root = 'app', strict, router: mode, patchManifest, patchRoutes, appData, rootContainer } = appConfig ?? {};
    // 处理插件运行时
    const providers = [];
    const wrappers = [];
    const addProvider = (fn) => {
        providers.push(fn);
    };
    const addWrapper = (fn) => {
        wrappers.push(fn);
    };
    runtimes?.forEach(runtime => {
        runtime({
            appContext: {
                manifest,
                appConfig
            },
            addProvider,
            addWrapper
        });
    });
    let createRouter = react_router_1.createBrowserRouter;
    if (mode === 'hash') {
        createRouter = react_router_1.createHashRouter;
    }
    if (mode === 'memory') {
        createRouter = react_router_1.createMemoryRouter;
    }
    if (patchManifest && typeof patchManifest === 'function') {
        manifest = patchManifest(manifest);
    }
    let routes = generateRoutes(manifest, wrappers);
    if (patchRoutes && typeof patchRoutes === 'function') {
        routes = patchRoutes(routes);
    }
    const router = createRouter(routes, { basename: '/' });
    let app = (0, react_1.createElement)(react_router_1.RouterProvider, { router });
    app = providers.reduce((acc, fn) => {
        return (0, react_1.createElement)(fn, null, acc);
    }, app);
    app = (0, react_1.createElement)(AppContext.Provider, { value: {
            manifest,
            routes,
            appData
        } }, app);
    if (rootContainer && typeof rootContainer === 'function') {
        app = rootContainer(app);
    }
    if (strict) {
        app = (0, react_1.createElement)(react_1.StrictMode, null, app);
    }
    let rootEle = document.getElementById(root);
    if (!rootEle) {
        rootEle = document.createElement('div');
        rootEle.id = root;
        document.body.appendChild(rootEle);
    }
    (0, client_1.createRoot)(rootEle).render(app);
};
exports.createApp = createApp;
//# sourceMappingURL=method.js.map