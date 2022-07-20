import { IFiberRootNode, IReactElement } from "./models";
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

/**
 * 把 虚拟DOM 渲染到 真实DOM 容器中。
 * @param element React 元素
 * @param fiberRootNode 整个 React 应用的根结点
 */
export function updateContainer(element: IReactElement, fiberRootNode: IFiberRootNode) {
  // 拿到当前 Fiber 树的根结点
  const current = fiberRootNode.current;
  // 新建一个 update 对象
  const update = createUpdate();
  // payload 搭载 React 元素
  update.payload = { element: element };
  // update 入队
  enqueueUpdate(current, update);
  // 调度更新
  scheduleUpdateOnFiber(current);
}
