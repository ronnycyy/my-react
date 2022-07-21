import { IFiber, IFiberRootNode, IUpdateQueue_hostFiber } from "./models";
import { appendChild, insertBefore, removeChild } from "./ReactDOMHostConfig";
import { HostComponent, HostRoot } from "./ReactWorkTags";
import { updateProperties } from './ReactDOMComponent';
import { Placement } from "./ReactFiberFlags";

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
  const before = getHostSibling(fiberToDealWithEffect) as HTMLElement;
  if (before) {
    // 找到第一个不用插入DOM的弟弟的真实DOM，fiber 就插入在这个弟弟前面。
    // liA,liB,liC => liA,pB,liC  pB就要走这里，插入到liC前面
    insertBefore(parentStateNode, stateNode, before);
  } else {
    // 没有可以插入的弟弟，由父亲来添加 (加在最后)
    appendChild(parentStateNode, stateNode);
  }
}

/**
 * 返回 fiber 后面离它最近的真实 DOM 结点。
 * @param fiber 结点
 */
function getHostSibling(fiber: IFiber) {
  let node = fiber.sibling;
  while (node) {
    if ((node.flags & Placement) === 0) {
      // 找到第一个不用插入DOM的弟弟。
      // 需要插入的是没有DOM的，所以要找不用插入的。比如: `只有更新的` 或者 `干脆啥也没有的`。
      // 这时候已经完成了 协调阶段，fiber的所有弟弟 都已经生成，该加标记/不该加标记的都处理完了。
      return node.stateNode;
    }
    node = node.sibling;
  }
  return null;
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
