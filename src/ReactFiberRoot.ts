import { IFiberRootNode, TContainerInfo } from './models';
import { createHostRootFiber } from './ReactFiber';
import { initializeUpdateQueue } from './ReactUpdateQueue';

/**
 * FiberRootNode: 整个应用的根结点, rootFiber: 当前 Fiber 树的根结点, 两者相互指向。
 * 
 * FiberRootNode -- current -->  rootFiber
 * rootFiber  -- stateNode --> FiberRootNode
 */

/**
 * 创建并返回整个 React 应用的根结点 -- FiberRootNode。 
 * 
 * @param containerInfo 挂载React应用的DOM结点，如 div#root。
 */
export function createFiberRoot(containerInfo: TContainerInfo): IFiberRootNode {
  // 创建整个React应用的根结点
  const fiberRootNode = { containerInfo: containerInfo, current: null, finishedWork: null };
  // 创建当前Fiber树的根结点
  const rootFiber = createHostRootFiber();
  // 相互连接
  fiberRootNode.current = rootFiber;
  rootFiber.stateNode = fiberRootNode;
  // 初始化更新队列 
  // 仅初始化，无 update 对象
  initializeUpdateQueue(rootFiber);
  // 返回整个React应用的根结点
  return fiberRootNode;
}




