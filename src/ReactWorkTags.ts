/**
 * 每一种 Fiber 都有自己的标签，如 rootFiber, 函数组件Fiber, 类组件Fiber。
*/ 

// 函数组件Fiber
export const FunctionComponent = 0;
// 类组件Fiber
export const ClassComponent = 1;
// 不知道是函数组件还是类组件
export const IndeterminateComponent = 2;
// rootFiber
export const HostRoot = 3;
export const HostPortal = 4;
// 原生结点对应的Fiber, 如 div, span, ...
export const HostComponent = 5;
export const HostText = 6;
// React.Fragment
export const Fragment = 7;
export const Mode = 8;
// const ThemeContext = React.createContext('light');
export const ContextConsumer = 9;
export const ContextProvider = 10;
// React.forwardRef
export const ForwardRef = 11;
export const Profiler = 12;
// Suspense 结点Fiber
export const SuspenseComponent = 13;
// Memo 结点 Fiber
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;

export type ReactWorkTags = 
    typeof FunctionComponent
  | typeof ClassComponent
  | typeof IndeterminateComponent
  | typeof HostRoot
  | typeof HostPortal
  | typeof HostComponent
  | typeof HostText
  | typeof Fragment
  | typeof Mode
  | typeof ContextConsumer
  | typeof ContextProvider
  | typeof ForwardRef
  | typeof Profiler
  | typeof SuspenseComponent
  | typeof MemoComponent
  | typeof SimpleMemoComponent
  | typeof LazyComponent
  | typeof IncompleteClassComponent
  | typeof DehydratedFragment
  | typeof SuspenseListComponent
  | typeof ScopeComponent
  | typeof OffscreenComponent
  | typeof LegacyHiddenComponent
  | typeof CacheComponent
  | typeof TracingMarkerComponent