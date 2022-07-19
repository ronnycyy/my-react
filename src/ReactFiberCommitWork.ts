import { IFiber, IFiberRootNode, IUpdateQueue_hostFiber } from "./models";
import { appendChild, removeChild } from "./ReactDOMHostConfig";
import { HostComponent, HostRoot } from "./ReactWorkTags";
import { updateProperties } from './ReactDOMComponent';

/**
 * 提交: 更新
 * @param current 老fiber
 * @param finishedWork 新fiber
 */
export function commitWork(current: IFiber, finishedWork: IFiber) {
  // 抓一下更新队列:  [k1,v1,k2,v2,k3,v3,...]
  const updatePayload = finishedWork.updateQueue;
  // 以后不用它了，销毁。
  finishedWork.updateQueue = null;
  if (updatePayload) {
    // 这时候 finishedWork.stateNode 和 current.stateNode 一样! 都指向老的视图！
    // 不信可以查看 reconcileSingleElement 里的 useFiber
    updateProperties(finishedWork.stateNode as HTMLElement, updatePayload as IUpdateQueue_hostFiber);
  }
}

/**
 * 提交: 删掉 fiber 的真实 DOM
 * @param fiberToDealWithEffect 当前需要处理副作用的fiber
*/
export function commitDeletion(fiberToDealWithEffect: IFiber) {
  if (!fiberToDealWithEffect) {
    return;
  }
  const stateNode = fiberToDealWithEffect.stateNode as HTMLElement;
  const parentStateNode = getParentStateNode(fiberToDealWithEffect) as HTMLElement;
  removeChild(parentStateNode, stateNode);
}

/**
 * 提交: 插入 fiber 的真实 DOM 到 视图
 * @param fiberToDealWithEffect 当前需要处理副作用的fiber
*/
export function commitPlacement(fiberToDealWithEffect: IFiber) {
  const stateNode = fiberToDealWithEffect.stateNode as HTMLElement;
  const parentStateNode = getParentStateNode(fiberToDealWithEffect) as HTMLElement;
  appendChild(parentStateNode, stateNode);
}

/**
 * 获取fiber的父DOM结点。
 * @param fiber 
 */
function getParentStateNode(fiber: IFiber) {
  let parent = fiber.return;
  do {
    if (parent.tag === HostComponent) {
      // 如果是原生，就返回它的真实DOM
      return parent.stateNode;
    } else if (parent.tag === HostRoot) {
      // 🔥如果一直找不到，最后必然会来到根
      return (parent.stateNode as IFiberRootNode).containerInfo;
    } else {
      // 函数组件、类组件
      parent = parent.return;
    }
  } while (parent);
}
