import { Placement } from './ReactFiberFlags';
import { IFiber, IReactElement } from "./models";
import { REACT_ELEMENT_TYPE } from "./ReactSymbols";
import { createFiberFromElement } from './ReactFiber';

/**
 * 协调子 fiber 结点。
 * 
 * @param shouldTrackSideEffects 是否追踪副作用
 */
function childReconciler(shouldTrackSideEffects: boolean) {
  // 函数里面又声明函数，你看 React 也这么写。。
  /**
   * 协调单个子结点
   * @param returnFiber 新产生 fiber 的 父结点 (workInProgress)
   * @param currentFirstChild 老 fiber 的大儿子 (current.child)
   * @param newChild 更新后的虚拟DOM (单个ReactElement)
   */
  function reconcileSingleElement(returnFiber: IFiber, currentFirstChild: IFiber | null, newChild: IReactElement) {
    // mount
    // 根据 虚拟DOM 创建 fiber 结点
    const created = createFiberFromElement(newChild);
    // 作为 子结点 连上 workInRrogress
    created.return = returnFiber;
    return created;
  }

  /**
   * @param newFiber 新创建的 Fiber 结点 (workInProgress.child)
   */
  function placeSingleChild(newFiber: IFiber) {
    if (shouldTrackSideEffects && !newFiber.alternate) {
      // 要追踪副作用 而且 替身不存在, 说明这是一个新增的结点，需要插入 DOM。
      // 打上`插入`标记，在`提交阶段`插入新的 DOM。
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  /**
   * 对比 current.child 和 虚拟DOM，产生 workInProgress.child。
   * 
   * @param returnFiber 新产生 fiber 的 父结点 (workInProgress)
   * @param currentFirstChild 老 fiber 的大儿子 (current.child), 如果压根就没有 current 那这个值就是 null
   * @param newChild 新 fiber 的子虚拟DOM结点: 更新后的虚拟DOM, 单个或多个ReactElement
   */
  function reconcileChildFibers(returnFiber: IFiber, currentFirstChild: IFiber | null, newChild: IReactElement | Array<IReactElement>) {
    if (typeof newChild === 'object' && newChild !== null) {
      if (Array.isArray(newChild)) {
        // 多个 ReactElement
      }
      else {
        // 单个 ReactElement
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE: {
            return placeSingleChild(
              reconcileSingleElement(
                returnFiber,
                currentFirstChild,
                newChild
              )
            );
          }
        }
      }
    }
    else {
      // 纯文本 或 纯数字
    }
    return null;
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = childReconciler(true);
export const mountChildFibers = childReconciler(false);
