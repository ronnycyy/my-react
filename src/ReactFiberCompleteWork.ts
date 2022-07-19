import { Update } from './ReactFiberFlags';
import { HostComponent, ReactWorkTags } from './ReactWorkTags';
import { createInstance, finalizeInitialChildren, prepareUpdate } from './ReactDOMHostConfig';
import { IFiber, IProps } from './models';

/**
 * 创建真实 DOM 结点, 根据 workInProgress.pendingProps 赋予属性。
 * 
 * @param current 老 fiber
 * @param workInProgress 新 fiber
 */
export function completeWork(current: IFiber, workInProgress: IFiber) {
  // 拿到 ReactElement 传过来的 props, 也就是更新后的 属性对象
  // PS: 查看 createFiber 方法，它将虚拟DOM的属性传给了Fiber结点构造函数。
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case HostComponent: {

      if (current && workInProgress.stateNode) {
        // 更新
        // 新Fiber构建完成时，收集更新并且标识 更新副作用
        updateHostComponent(current, workInProgress, workInProgress.tag, newProps);
      } else {
        // 创建
        // 创建 workInProgress 对应的 真实 dom 结点。
        // 注意🔥: 创建不是渲染! 没有 dom 操作! 只是在内存中创建了一个 dom 对象!
        const type = workInProgress.type as keyof HTMLElementTagNameMap;   // 真实DOM元素类型，如 div, span, ...
        // 由于 React 是跨平台的，所以不能在这写 document.createElement，得编译时替换 createInstance 方法。
        const instance = createInstance(type, newProps);
        // 把真实 DOM 挂载在 fiber 结点上
        workInProgress.stateNode = instance;
        // 给真实 DOM 添加属性
        finalizeInitialChildren(instance, type, newProps);
      }
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 对比新老fiber的属性，决定是否标记为更新
 * @param current 老fiber
 * @param workInProgress 新fiber
 * @param tag fiber标签，如 rootFiber, 函数组件, ...
 * @param newProps 新属性 (来自新ReactDOM)
 */
function updateHostComponent(current: IFiber, workInProgress: IFiber, tag: ReactWorkTags, newProps: IProps) {
  const oldProps = current.memoizedProps;
  const instance = workInProgress.stateNode as HTMLElement;
  // 准备更新
  // 拿到更新队列: [k1,v1,k2,v2,k3,v3,...]
  const updatePayload = prepareUpdate(instance, workInProgress.tag, oldProps, newProps);
  /**
   * 根fiber的更新队列是一条由 update 对象组成的环状链表
   * rootFiber.updateQueue = u4 -> u1 -> u2 -> u3 -> u4
   * 
   * 原生fiber的更新队列是一个由多个 k,v 组成的数组
   * fiber.updateQueue = [k1,v1,k2,v2,k3,v3,...]
   */
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    // 加上 `更新` 标记
    workInProgress.flags |= Update;
  }
}
