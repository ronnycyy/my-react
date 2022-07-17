import { NoFlags } from './../../__my-react/src/ReactFiberFlags';
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
    // 创建真实 DOM 结点, 根据 workInProgress.pendingProps 赋予属性。
    completeWork(current, completedWork);
    // 收集当前fiber的副作用，交给父fiber。 (生成圣诞树上的彩灯💡)
    collectEffectList(returnFiber, completedWork);
    // 自己已经完成✅，如果有弟弟，下一个工作的就是弟弟，如果没有，就回到父级。
    const siblingFiber = completedWork.sibling;
    if (siblingFiber) {
      workInProgress = siblingFiber;
      // 自己结束，让弟弟开始工作 (beginWork)
      return;
    } else {
      // 没有弟弟，说明自己是最小的儿子，让父级进入循环，也完成工作。(最小的儿子完成工作了，父亲也就完成工作了)
      completedWork = returnFiber;
      // 往上窜的过程，随时准备结束整个协调流程。怎么讲？:
      // 如果到达了 rootFiber，rootFiber.return === null, 这时候不会进 completedWork 的循环，而是跳出，回到 workLoopSync 的循环，
      // 然后 workInProgress === null, 结束循环，也就结束了整个协调流程。
      workInProgress = completedWork;
    }
  } while (completedWork);
}

/**
 * 收集当前fiber的副作用，交给父fiber。 (生成圣诞树上的彩灯💡)
 * 
 * @param returnFiber 父fiber
 * @param completedWork 当前完成工作的fiber✅
 */
function collectEffectList(returnFiber: IFiber, completedWork: IFiber) {
  const flags = completedWork.flags;

  // 1. 把自己的链 接上父结点 effectList 的尾巴。
  // Fiber 这棵圣诞树🌲，现在要连一条彩灯出来了💡!
  if (!returnFiber.firstEffect) {
    // 如果父级没有 effectList, 把 fiber 的 effectList 给它。
    returnFiber.firstEffect = completedWork.firstEffect;
  }
  if (completedWork.lastEffect) {
    if (returnFiber.lastEffect) {
      // 如果父子都有 effectList，把 子的 effectList 连上 父的尾巴。
      returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
    }
    // 父级 effectList 已更新，更新尾指针，指向整条链表尾。
    returnFiber.lastEffect = completedWork.lastEffect;
  }

  // 2. 把自己连到父结点 effectList 的最后面。
  // 所以，最后副作用链表是从底结点到顶结点的，它长这样: rootFiber -> grandGrandGrandChild -> grandGrandChild -> grandChild -> child。
  if (flags !== NoFlags) {
    // 如果完成工作的结点有副作用，就需要添加到 effectList 里。
    if (returnFiber.lastEffect) {
      // 如果父结点已经有 effectList，加到后面
      returnFiber.lastEffect.nextEffect = completedWork;
    } else {
      // 如果没有，新建 effectList  
      returnFiber.firstEffect = completedWork;
    }
    returnFiber.lastEffect = completedWork;
  }
}


// 测试 effectList 连接效果
function test() {
  const rootFiber = { key: 'rootFiber' } as IFiber;
  const fiberA = { key: "A", flags: 2 } as IFiber;
  const fiberB = { key: "B", flags: 2 } as IFiber;
  const fiberC = { key: "C", flags: 2 } as IFiber;
  const fiberD = { key: "D", flags: 2 } as IFiber;
  // B 下面一子 D
  collectEffectList(fiberB, fiberD);
  // A 下面两子 B C
  collectEffectList(fiberA, fiberB);
  collectEffectList(fiberA, fiberC);
  // rootFiber 下面一子 A
  collectEffectList(rootFiber, fiberA);
  let effectList = '';
  let nextEffect = rootFiber.firstEffect;
  while (nextEffect) {
    effectList += `${nextEffect.key}->`;
    nextEffect = nextEffect.nextEffect;
  }
  effectList += `null`;

  /**
   * Fiber 树:
   * 
   *     rootFiber
   *        A
   *    B       C
   * D
   * 
   * 
   * EffectList:
   * rootFiber ->  D ->  B  ->  C  ->  A ->  null
   *             三层(D)  二层(B,C)    一层(A)   (effectList，rootFiber 直接连到最低，然后从低往顶连)
   */

  return effectList;
}