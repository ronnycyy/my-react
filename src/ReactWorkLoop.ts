import { IFiber, IFiberRootNode } from "./models";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';

// 正在更新的 FiberRootNode
let workInProgressRoot = null;
// 正在更新的 Fiber 结点
let workInProgress = null;

/**
 * 从一个 Fiber 出发，调度更新。
 * 不管从什么地方发起的更新，最终都会到达这里。
 * 
 * @param fiber 当前需要调度更新的 Fiber
 */
export function scheduleUpdateOnFiber(fiber: IFiber) {
  // 从当前Fiber一路往上，找到rootFiber，从rootFiber开始更新。
  // 这就是 React 和 Vue 的不同之处，React 不管在哪发生更新，都从 根结点 开始调度。
  const fiberRootNode = markUpdateLaneFromFiberToRoot(fiber);
  performSyncWorkOnRoot(fiberRootNode);
}

/**
 * 从当前 Fiber 一路往上，找到当前 Fiber 树的根结点
 * @param soureFiber 当前需要调度更新的 Fiber
 */
function markUpdateLaneFromFiberToRoot(soureFiber: IFiber) {
  let node = soureFiber;

  // 一路往上，找到 rootFiber
  while (node.return) {
    node = node.return;
  }

  // 沿途设置 Lane?

  // 返回 FiberRootNode
  return node.stateNode as IFiberRootNode;
}

/**
 * 根据 老Fiber树 和 新ReactElement (虚拟DOM) 创建 新Fiber树，然后，根据 新Fiber树 更新 真实DOM对象。
 * @param fiberRootNode 整个 React 应用的根结点
 */
function performSyncWorkOnRoot(fiberRootNode: IFiberRootNode) {
  // 正在工作的 整个React应用的根
  workInProgressRoot = fiberRootNode;
  // 从 rootFiber 创建 workInProgress
  workInProgress = createWorkInProgress(workInProgressRoot.current);
  // 从 workInProgress 开始自上而下地构建 新的fiber树
  workLoopSync();
}

function workLoopSync() {
  debugger
  while (workInProgress) {
    // 执行每一个工作单元。所以，每一个 fiber 被视为一个工作单元。
    performUnitOfWork(workInProgress);
  }
}

/**
 * 执行单个工作单元
 * @param unitOfWork 要工作的 fiber 结点
 */
function performUnitOfWork(unitOfWork: IFiber) {
  // 获取替身
  const current = unitOfWork.alternate;
  // 开始构建当前 fiber 的子 fiber 链表。
  // 它会返回下一个要处理的 fiber, 一般都是 unitOfWork 的大儿子。
  const next = beginWork(current, unitOfWork);
  // 在 beginWork 后, 把 新属性 同步到 老属性 上。
  // 比如，更新前 title="mike"(memoizedProps), 更新后 title="david"(pendingProps)。
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next) {
    // 还有子结点, 继续工作 (回到上面的 while 继续 performUnitOfWork)
    workInProgress = next;
  }
  else {
    // 没有子结点了，当前 fiber 完成工作✅
    completeUnitOfWork(unitOfWork);
  }
}


/**
 * 当前 fiber 没有子fiber结点了，完成工作✅
 * @param unitOfWork 当前 fiber 结点
 */
function completeUnitOfWork(unitOfWork: IFiber) {
  let completedWork = unitOfWork;

  do {
    // 当前完成，有兄弟到兄弟，没兄弟到父级，回到根时结束。
    const current = completedWork.alternate;
    const returnFiber = current.return;
    completeWork(current, completedWork);
  } while (completedWork);
}
