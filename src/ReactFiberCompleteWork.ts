import { HostComponent } from './ReactWorkTags';
import { createInstance, finalizeInitialChildren } from './ReactDOMHostConfig';
import { IFiber } from './models';

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
      // 创建 workInProgress 对应的 真实 dom 结点。
      // 注意🔥: 创建不是渲染! 没有 dom 操作! 只是在内存中创建了一个 dom 对象!
      const type = workInProgress.type as keyof HTMLElementTagNameMap;   // 真实DOM元素类型，如 div, span, ...
      // 由于 React 是跨平台的，所以不能在这写 document.createElement，得编译时替换 createInstance 方法。
      const instance = createInstance(type, newProps);
      // 把真实 DOM 挂载在 fiber 结点上
      workInProgress.stateNode = instance;
      // 给真实 DOM 添加属性
      finalizeInitialChildren(instance, type, newProps);
      break;
    }
    default: {
      break;
    }
  }
}
