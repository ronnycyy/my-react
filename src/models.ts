import { ReactFlags } from "./ReactFiberFlags";
import { IReactSymbols } from "./ReactSymbols";
import { ReactWorkTags } from "./ReactWorkTags";

// React 元素 (类比于 HTMLElement, React 世界里的 Element)
export interface IReactElement {
  $$typeof: IReactSymbols;  // React 元素种类，如 Memo, Lazy, 常规 ReactElement 等。
  type: TFiberType;  // 真实DOM标签 或 代表函数组件的函数。 如 'div', function App。
  props: IProps;
  key: string;
  index: string;  // 新结点在自己这一层的索引。 多结点 dom diff 使用，用来查找更新前对应的老结点，记录 lastPlacedIndex。
}

export interface IPayload {
  element?: IReactElement | Array<IReactElement>;  // 准备挂载的虚拟DOM。 rootFiber 的 update 对象具有，如 App 组件的 ReactElement。
};

// rootFiber 更新队列的一个小 update 对象
export interface IUpdate {
  payload: IPayload | Object;   // 更新的内容
  next: IUpdate | null;   // 指针，指向下一个 update 对象
}

//  rootFiber 的更新队列，是一个单向环状链表。
export interface IUpdateQueue_rootFiber {
  shared: {   // 共享的
    pending: IUpdate | null;   // pending 永远指向最后一个 update 对象， 因此 pending.next 指向第一个 update 对象 (环头)。
  }
}

// hostFiber 的更新队列，是一个由 多个 k,v 组成的数组, 如 [k1,v1,k2,v2,k3,v3,...]
export type IUpdateQueue_hostFiber = string[];


export interface IProps {
  children: IReactElement | Array<IReactElement>;
}

export type TFiberDOMType = keyof HTMLElementTagNameMap;
export type TFiberType = TFiberDOMType | Function;

// Fiber 结点
export interface IFiber {
  tag: ReactWorkTags;  // 标签。 如: rootFiber, 函数组件, 类组件, Memo, Suspense, 原生结点Fiber...

  type: TFiberType;  // 类型。如 'div', 'span', App函数, ...

  flags: ReactFlags;   // 真实DOM操作标记。协调阶段产生，提交阶段使用。

  index: number;   // 多结点 Dom DIff 相关

  /**
   * 真实DOM操作单向链表 (圣诞树上的那串彩灯)
   * 
   * Fiber 树:
   * 
   *     rootFiber
   *        A
   *    B       C
   * D
   * 
   * 
   * EffectList:
   * rootFiber ->  D ->  B  ->  C  ->  A ->  null
   *             三层(D)  二层(B,C)    一层(A)   (effectList，rootFiber 直接连到最低，然后从低往顶连)
   */
  firstEffect: IFiber | null;
  nextEffect: IFiber | null;
  lastEffect: IFiber | null;

  key: string;   // 唯一标识。DOM Diff 时很有用。

  pendingProps: IProps | null;   // 新属性。更新后虚拟DOM产生的属性对象，workInProgress 结点持有。
  memoizedProps: IProps | null;  // 老属性。更新前就有，current结点持有。
  updateQueue: IUpdateQueue_rootFiber | IUpdateQueue_hostFiber;  // 更新队列

  // 树结构
  return: IFiber;   // 父结点
  child: IFiber;    // 子结点
  sibling: IFiber;  // 下一个兄弟结点

  stateNode: IFiberRootNode | HTMLElement;  // fiber对应的真实DOM 或 整个应用的根结点(rootFiber.stateNode === fiberRootNode)

  // 双缓冲
  alternate: IFiber;  // 替身。本次的 current.alternate 指向上次的 current 结点，可用作 本次 workInProgress 结点，实现双缓冲。
}

// 整个 React 应用的根结点
export interface IFiberRootNode {
  containerInfo: TContainerInfo;   // 挂载 React 应用的真实 DOM 结点
  current: IFiber;  // 当前视图对应 Fiber 树的根结点
  finishedWork: IFiber;  // 更新后产生的 workInProgress 树的根结点
}

export type TContainerInfo = HTMLElement & { _reactRootContainer?: IFiberRootNode }