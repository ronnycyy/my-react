import { IReactElement } from './models';
import { createFiberRoot } from './ReactFiberRoot';
import { updateContainer } from './ReactFiberReconciler';

/**
 * 将 React 元素 (虚拟DOM) 渲染到真实 DOM 容器下。
 * 
 * @param element 要渲染的 React 元素
 * @param container 容器，一个真实的 DOM 结点，把 element 渲染到这个结点下
 * @param callback 回调函数，渲染完成后执行
 */
export function render(element: IReactElement, container: Element, callback?: Function) {
  // 创建 FiberRootNode
  // rootFiber 树诞生
  const fiberRootNode = createFiberRoot(container);
  // 更新根容器 (开始调和!)
  // workInProgress 树诞生
  updateContainer(element, fiberRootNode);
}
