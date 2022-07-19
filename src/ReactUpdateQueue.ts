import { IFiber, IUpdateQueue_rootFiber, IUpdate } from "./models";

/**
 * 初始化 Fiber 结点的更新队列 (环)
 * @param fiber Fiber结点
 */
export function initializeUpdateQueue(fiber: IFiber) {
  // 更新队列 --> 环状链表
  const updateQueue: IUpdateQueue_rootFiber = {
    shared: {
      pending: null
    }
  }
  // 初始化更新队列
  fiber.updateQueue = updateQueue;
}

/**
 * 创建一个 update 对象
 */
export function createUpdate(): IUpdate {
  return { payload: null, next: null };
}

/**
 * 向 Fiber 更新队列 (环) 中添加一个 update 结点
 * @param fiber Fiber结点
 * @param update  一个update对象
 * 
 * 示意图
 * https://processon.com/diagraming/62cedb8d7d9c0806ee2b054c
 */
export function enqueueUpdate(fiber: IFiber, update: IUpdate) {
  const updateQueue = fiber.updateQueue as IUpdateQueue_rootFiber;
  const pending = updateQueue.shared.pending;

  if (!pending) {
    // 环里一个结点也没有
    // 自己成环
    update.next = update;
  }
  else {
    // 环里有结点，而且可能有很多
    // 新来的 update 用 next 指针连上环头。  (准备作为新尾)
    update.next = pending.next;
    // 旧环尾，断开原来的 next 指针，转而指向新来的 update 对象。 (新尾诞生，成环)
    pending.next = update;
  }
  // 无论一开始环有没有结点，最后都要让 pending 指向新来的 update  (pending 永远指向最后一个 update 对象)
  updateQueue.shared.pending = update;
}


// 模拟实际加 update 对象的情况
function test() {
  // 1. 初始化 fiber 的更新队列 (环)
  const fiber = { baseState: { number: 0 } } as unknown as IFiber;
  initializeUpdateQueue(fiber);
  // 2. 第一个 update 入环
  const u1 = createUpdate();
  u1.payload = { number: 1 };
  enqueueUpdate(fiber, u1);
  // 3. 第二个 update 入环
  const u2 = createUpdate();
  u2.payload = { number: 1 };
  enqueueUpdate(fiber, u2);
  // 3. 第三个 update 入环
  const u3 = createUpdate();
  u3.payload = { number: 1 };
  enqueueUpdate(fiber, u3);

  // 结果:   pending(u3) -> u1 -> u2 -> u3
  // fiber.updateQueue.shared.pending 指向最后一个 update。
  // fiber.updateQueue.shared.pending.next 指向第一个 update。
}