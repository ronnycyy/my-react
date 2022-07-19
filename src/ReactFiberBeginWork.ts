import { HostRoot, HostComponent } from './ReactWorkTags';
import { IFiber, IPayload, IReactElement, IUpdateQueue_rootFiber, TFiberDOMType } from "./models";
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber';
import { shouldSetTextContent } from './ReactDOMHostConfig';

/**
 * 创建并返回 workInProgress 的第一个子 fiber 结点 (大儿子)
 * 
 * @param current 老结点 (更新前, 代表视图)
 * @param workInProgress 新结点 (更新后)
 */
export function beginWork(current: IFiber, workInProgress: IFiber) {
  // 根据不同的类型，区分构建流程
  switch (workInProgress.tag) {
    case HostRoot: {
      // rootFiber 也要开始工作的啊!
      return updateHostRoot(current, workInProgress);
    }
    case HostComponent: {
      // 生成完 rootFiber.child 以后，child 变成 workInProgress, 如果是 `原生DOM对应的Fiber` 就会到这里，生成它们的子结点。
      return updateHostComponent(current, workInProgress);
    }
    default: {
      break;
    }
  }
}

/**
 * 构建 rootFiber 的子结点
 * 
 * @param current 旧 rootFiber
 * @param workInProgress 新 rootFiber
 */
function updateHostRoot(current: IFiber, workInProgress: IFiber) {
  const updateQueue = workInProgress.updateQueue as IUpdateQueue_rootFiber;
  // 获取要渲染的虚拟DOM。如 App 组件对应的 ReactElement。
  const nextChildren = (updateQueue.shared.pending.payload as IPayload).element;
  // DOM DIFF
  // 对比`新虚拟DOM`和`老fiber的大儿子`, 产生 `workInProgress的大儿子` -- workInProgress.child
  reconcileChildren(current, workInProgress, nextChildren);
  // 首次挂载的情况下, 此处得到的 rootFiber.child 的 flags 已经被置成 Placement。
  return workInProgress.child;
}

/**
 * 构建原生组件 Fiber 的子结点
 * 
 * @param current 老 fiber
 * @param workInProgress 新 fiber (原生组件)
 */
function updateHostComponent(current: IFiber, workInProgress: IFiber) {
  // 获取此 原生组件 的类型, 如 'div', 'span', ...
  const type = workInProgress.type;
  // 新属性, 包括  id, title, className, children, ...
  const nextProps = workInProgress.pendingProps;
  // 新 fiber 的 ReactElement 子结点 (们)
  let nextChildren = nextProps.children;

  // React的优化:
  // 原生组件只有一个子结点并且这个子结点是纯文本结点时，React不会为这个纯文本子结点创建fiber结点，而是当成一个属性处理。
  let isDirectTextChild = shouldSetTextContent(type as TFiberDOMType, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }

  // DOM DIFF
  // 对比`新fiber的虚拟DOM`和`老fiber的大儿子`, 产生 `新fiber的大儿子` -- workInProgress.child
  reconcileChildren(current, workInProgress, nextChildren);
  // 首次挂载的情况下, 此处得到的 rootFiber.child 的 flags 已经被置成 Placement。
  return workInProgress.child;
}

/**
 * 对比`新虚拟DOM`和`老fiber的大儿子`, 产生 `workInProgress的大儿子` (workInProgress.child)
 * @param current 老 fiber
 * @param workInProgress 新 fiber
 * @param nextChildren 本次更新产生的虚拟DOM
 */
function reconcileChildren(current: IFiber, workInProgress: IFiber, nextChildren: IReactElement | Array<IReactElement>) {
  if (current) {
    // 有老fiber, 说明这是一次更新。(追踪副作用, 打标记)
    // 对比 老fiber的大儿子 和 新虚拟DOM, 产生 新fiber的大儿子。
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
  else {
    // 没有老fiber, 说明这是首次渲染。(不追踪副作用)
    // 首次挂载时，rootFiber有current，但是 rootFiber.child没有current, 所以当 rootFiber.child 作为 workInProgress 时会到这里。
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,  // current为null, current的child也就认为是null。
      nextChildren
    );
  }
}


