import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router';
import { AliveScope } from 'react-activation';
export default () => {
    return (_jsx(AliveScope, { children: _jsx(Outlet, {}) }));
};
//# sourceMappingURL=layout.js.map