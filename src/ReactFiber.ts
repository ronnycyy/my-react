import { IFiber, IProps, IReactElement } from './models';
import { HostRoot, ReactWorkTags, HostComponent } from './ReactWorkTags';
import { NoFlags } from './ReactFiberFlags';

/**
 * 创建当前Fiber树的根结点 -- rootFiber
 */
export function createHostRootFiber() {
  return createFiber(HostRoot);
}

/**
 * 创建 Fiber 结点
 * @param tag Fiber 的标签。比如 HostRoot 指的是 rootFiber; HostComponent 指的是 div, span 等原生结点 Fiber。
 * @param pendingProps 等待生效的属性对象
 * @param key 唯一值
 */
function createFiber(tag: ReactWorkTags, pendingProps?: IProps, key?: string) {
  return new FiberNode(tag, pendingProps, key) as IFiber;
}

/**
 * Fiber 结点构造函数
 * 
 * @param tag 标签
 * @param pendingProps 待处理的属性对象
 * @param key 唯一标识
 */
function FiberNode(tag: ReactWorkTags, pendingProps?: IProps, key?: string) {
  this.tag = tag;
  this.pendingProps = pendingProps || null;
  this.key = key || null;
}

/**
 * 根据 老Fiber 创建 新Fiber, 返回 新Fiber。
 * 使用双缓冲结构: 树1 <--> 树2
 * 
 * @param current 视图对应的这棵 Fiber 树
 * @param pendingProps 新的属性。从 `更新后的 ReactElement` 中得来。
 */
export function createWorkInProgress(current: IFiber, pendingProps?: IProps): IFiber {
  // current.alternate 指向上次的 current 结点，本次 workInProgress 加以利用。
  let workInProgress = current.alternate;

  if (!workInProgress) {
    // 如果没有替身 (刚刚初始化完毕树1)
    // 新建一个 workInProgress fiber 结点
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    // 把属性全部搬过来
    workInProgress.type = current.type || null;
    workInProgress.stateNode = current.stateNode;
    // 相互指向
    workInProgress.alternate = current;
    current.alternate = workInProgress.alternate
  }
  else {
    // 如果有替身 (树1 <--> 树2)
    // 更新一下属性，完事。
    workInProgress.pendingProps = pendingProps || null;
  }
  // 初始化真实DOM标记
  workInProgress.flags = NoFlags;
  // 初始化树结构
  workInProgress.child = null;
  workInProgress.sibling = null;
  // 复用更新队列
  workInProgress.updateQueue = current.updateQueue;
  // 初始化真实DOM操作链表
  workInProgress.firstEffect = workInProgress.lastEffect = workInProgress.nextEffect = null;
  // 返回新Fiber
  return workInProgress;
}


/**
 * 根据 虚拟DOM 创建 Fiber 结点。
 * 
 * @param element 虚拟DOM, ReactElement。
 */
export function createFiberFromElement(element: IReactElement) {
  // 拿到 虚拟DOM 上的信息。
  const { key, type, props } = element;
  let tag: ReactWorkTags;

  if (typeof type === 'string') {    // type: 'div', 'span', ...
    // 创建一个原生结点的 Fiber。
    tag = HostComponent;
  }
  const fiber = createFiber(tag, props, key);
  fiber.type = type;

  return fiber;
}
