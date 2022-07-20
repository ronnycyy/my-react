import { Deletion, Placement } from './ReactFiberFlags';
import { IFiber, IProps, IReactElement } from "./models";
import { REACT_ELEMENT_TYPE } from "./ReactSymbols";
import { createFiberFromElement, createWorkInProgress } from './ReactFiber';

/**
 * 协调子 fiber 结点。
 * 
 * @param shouldTrackSideEffects 是否追踪副作用
 */
function childReconciler(shouldTrackSideEffects: boolean) {
  // 函数里面又声明函数，你看 React 也这么写。。

  /**
   * 老的子 fiber 在新的虚拟DOM树里不存在了，标记为删除。
   * @param returnFiber 
   * @param childToDelete 
   */
  function deleteChild(returnFiber: IFiber, childToDelete: IFiber) {
    // 初次挂载不需要判断
    if (!shouldTrackSideEffects) {
      return;
    }
    // 把自己这个副作用添加到父 effectList 尾。
    const lastEffect = returnFiber.lastEffect;
    if (lastEffect) {
      // 父有 effectList, 追加到尾。
      lastEffect.nextEffect = childToDelete;
      // 更新尾指针
      returnFiber.lastEffect = childToDelete;
    } else {
      // 父没有 effectList，新建一条。
      returnFiber.lastEffect = returnFiber.firstEffect = childToDelete;
    }
    // 要删掉了所以清空副作用链
    childToDelete.nextEffect = null;
    // 标记删除
    childToDelete.flags = Deletion;
  }

  /**
   * 自己和弟弟们都标记为删除
   * @param returnFiber 父结点
   * @param childToDelete 自己
   */
  function deleteRemainingChildren(returnFiber: IFiber, childToDelete: IFiber) {
    while (childToDelete) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }

  /**
   * 根据新属性复用老fiber
   * @param oldFiber 待复用的老fiber
   * @param pendingProps 新属性
   */
  function useFiber(oldFiber: IFiber, pendingProps: IProps) {
    return createWorkInProgress(oldFiber, pendingProps);
  }

  /**
   * 
   * 多结点 DIFF
   * 
   * 🔥🔥🔥 所谓单/多结点 DIFF，指的是新结点！新结点单个就是单结点diff，新结点多个就是多结点diff!
   * 
   * 协调单个子结点 (单个子结点指的是: 新虚拟DOM是单结点，老fiber可能有多个。)
   * 
   * 比如:
   * 更新前 li1,li2,li3,li4
   * 更新后 li2
   * 那么就比较 li1<->li2❌(Deletion), li2<->li2✅(复用), li3(Deletion), li4(Deletion)
   * 
   * @param returnFiber 新产生 fiber 的 父结点 (workInProgress)
   * @param currentFirstChild 老 fiber 的大儿子 (current.child)
   * @param newChild 要渲染的虚拟DOM (单个ReactElement)
   */
  function reconcileSingleElement(returnFiber: IFiber, currentFirstChild: IFiber | null, newChild: IReactElement) {

    // 新虚拟DOM的key (key主要用来处理`移动`的情况，更新前后key一样说明是同一个元素)
    const newKey = newChild.key;
    // 第一个老fiber结点
    let child = currentFirstChild;
    while (child) {
      if (child.key === newKey) {
        // 如果 老fiber的key 和 新fiber的key 相同，说明新老结点是同一个元素。

        if (child.type === newChild.type) {
          // type 还相同，复用child，child的弟弟们都不要了(key绝对不同)，全标记为删除。

          // 从child的弟弟开始，往后都标记删除。
          deleteRemainingChildren(returnFiber, child.sibling);
          // 根据新属性，复用 child。
          // 注意🔥🔥🔥 这时新老fiber的stateNode都指向老视图！后续更新就是在老视图上更新!
          const existing = useFiber(child, newChild.props);
          // 产生的是 workInProgress 的子结点，所以连上 workInProgress。
          existing.return = returnFiber;
          // 使用这个复用的结点，下面的流程都不用走了。
          return existing;
        }
        else {
          // type 不同，自己和弟弟们都标记为删除 (自己type不同，弟弟们key不同)。
          deleteRemainingChildren(returnFiber, child);
          // 都删了，后面弟弟们不用匹配了
          // 直接跳到外面，这一层老的都没有能用的，所以新建 fiber 结点。
          break;
        }
      }
      else {
        // 如果 老fiber的key 和 新fiber的key 不相同，说明新老结点不是同一个元素，更新后又是单结点，说明老结点已经不存在了，标记删除。
        // 老大不要了，接下来和老二比较，老二是有可能和 新fiber 相同的。
        // 比如: 更新前 li1,li2,li3;  更新后 li2, 那么 li1 可以标记删除。
        deleteChild(returnFiber, child);
      }
      // 新虚拟DOM继续和弟弟们比较
      child = child.sibling;
    }

    // 根据 虚拟DOM 创建 fiber 结点。
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
      // 删除的副作用在 reconcileSingleElement 里已经标记了，所以`删`先放进的 effectList，最后执行 DOM 操作的顺序是: 先删后建。
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  /**
   * 根据虚拟DOM创建 returnFiber 的 子fiber
   * @param returnFiber 待创建子结点的父fiber
   * @param newChild 子结点来源: 虚拟DOM
   */
  function createChild(returnFiber: IFiber, newChild: IReactElement) {
    // ReactElement 转 Fiber
    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    returnFiber.child = created;
    return created;
  }

  /**
   * 
   * 多结点 DIFF
   * 
   * 🔥🔥🔥 所谓单/多结点 DIFF，指的是新结点！新结点单个就是单结点diff，新结点多个就是多结点diff!
   * 
   * @param returnFiber workInProgress，是即将新生成的这群结点的父, 如 ul。
   * @param currentFirstChild 老 fiber 的大儿子，如 null  (本次更新: ul>null => ul>li*3)
   * @param newChilds 多个新的结点 (ReactElement)，如 [liA,liB,liC]。
   */
  function reconcileChildrenArray(returnFiber: IFiber, currentFirstChild: IFiber | null, newChilds: Array<IReactElement>) {
    // 将要返回的第一个新fiber
    let resultingFirstChild = null;
    // 上一个新fiber
    let perviousNewFiber: IFiber = null;
    // 第一个老fiber
    let oldFiber = currentFirstChild;
    // 新的虚拟DOM的索引
    let newIdx = 0;
    if (!oldFiber) {
      // 如果没有老fiber了，循环虚拟DOM数组，为每个虚拟DOM创建一个新Fiber。
      // 0(老) 对 多(新)
      for (; newIdx < newChilds.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChilds[newIdx]);  // liA
        // newFiber.flags = Placement;  [首次挂载]  源码没有在这里加标记, 而是到 ReactFiberCompleteWork.ts 里去: completeWork.appendAllChildren
        if (!perviousNewFiber) {
          // 如果没有上一个新fiber, 说明这一个是大儿子。
          resultingFirstChild = newFiber;
        } else {
          // 上一个连上这一个，最后所有新的子结点连起来: liA->liB->liC->null
          perviousNewFiber.sibling = newFiber;
        }
        // 给下一个新的子结点使用
        perviousNewFiber = newFiber;
      }
      // 返回大儿子
      return resultingFirstChild;
    }
    return resultingFirstChild;
  }

  /**
   * 🔥🔥🔥 所谓单/多结点 DIFF，指的是新结点！新结点单个就是单结点diff，新结点多个就是多结点diff!
   * 
   * 对比 current.child 和 虚拟DOM，产生 workInProgress.child。
   * 
   * @param returnFiber 新产生 fiber 的 父结点 (workInProgress)
   * @param currentFirstChild 老 fiber 的大儿子 (current.child), 如果压根就没有 current 那这个值就是 null
   * @param newChild 新 fiber 的子虚拟DOM结点: 更新后的虚拟DOM, 单个或多个ReactElement
   */
  function reconcileChildFibers(returnFiber: IFiber, currentFirstChild: IFiber | null, newChild: IReactElement | Array<IReactElement>) {

    if (typeof newChild === 'object' && newChild !== null) {

      if (Array.isArray(newChild)) {
        // 如果 returnFiber 是一个 ul>li*3，那么 newChild 就是一个数组 (li*3)，进到这里。
        // 多个新的子 ReactElement
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
      }
      else {
        // 单个子 ReactElement
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
