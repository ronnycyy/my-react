import { IFiber, IFiberRootNode } from "./models";
import { appendChild } from "./ReactDOMHostConfig";
import { HostComponent, HostRoot } from "./ReactWorkTags";


/**
 * 把 fiber 上的真实 DOM 插入到 视图
 * @param nextEffect 
 */
export function commitPlacement(nextEffect: IFiber) {
  const stateNode = nextEffect.stateNode as HTMLElement;
  const parentStateNode = getParentStateNode(nextEffect) as HTMLElement;
  appendChild(parentStateNode, stateNode);
}


function getParentStateNode(fiber: IFiber) {
  let parent = fiber.return;
  do {
    if (parent.tag === HostComponent) {
      // 如果是原生，就返回它的真实DOM
      return parent.stateNode;
    } else if (parent.tag === HostRoot) {
      // 必然会来到根
      return (parent.stateNode as IFiberRootNode).containerInfo;
    } else {
      // 函数组件、类组件
      parent = parent.return;
    }
  } while (parent);
}
