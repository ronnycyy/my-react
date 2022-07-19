import { ReactWorkTags } from './ReactWorkTags';
import { IProps, TFiberDOMType, IUpdateQueue_hostFiber } from './models';

export function createElement(type: TFiberDOMType) {
  return document.createElement(type);
}

/**
 * 把 ReactElement的属性 转化成 真实DOM的属性。
 * 
 * @param domElement 真实DOM
 * @param type 真实DOM的类型
 * @param props fiber 传过来的 DOM 属性对象 (ReactElement.prototype.props --> fiber.pendingProps)
 */
export function setInitialProperties(domElement: HTMLElement, type: TFiberDOMType, props: IProps) {
  for (const propKey in props) {
    const value = props[propKey];

    if (propKey === 'children') {
      // 子结点
      if (typeof value === 'string' || typeof value === 'number') {
        // 子结点是纯文本，直接赋值给 dom 结点。
        domElement.textContent = value.toString();
      }
    }
    else if (propKey === 'style') {
      // 样式
      // ReactElement的样式全部搬到真实DOM上。
      const style = value;
      for (const styleKey in style) {
        domElement.style[styleKey] = style[styleKey];
      }
    }
    else {
      // 非子结点，也非样式，普通属性
      // 直接把属性复制过来
      domElement[propKey] = value;
    }
  }
}

/**
 * 对比新老属性
 * 
 * 由新老属性的差异，得出更新队列 (hostFiber.updateQueue)，返回。
 * 
 * 删、改、增 属性
 * 
 * @param domElement
 * @param tag 
 * @param oldProps 
 * @param newProps 
*/
export function diffProperties(domElement: HTMLElement, tag: ReactWorkTags, oldProps: IProps, newProps: IProps) {
  let updatePayload = null;
  let propKey: string;

  // 遍历老属性
  for (propKey in oldProps) {
    if (oldProps.hasOwnProperty(propKey) && !newProps.hasOwnProperty(propKey)) {
      // 老的有，新的没有，删掉
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }

  // 遍历新属性
  for (propKey in newProps) {
    const newValue = newProps[propKey];
    if (propKey === 'children') {
      if (typeof newValue === 'string' || typeof newValue === 'number') {
        if (newValue !== oldProps[propKey] as any) {
          // 文本子结点有更新，放进队列
          (updatePayload = updatePayload || []).push(propKey, newValue);
        }
      }
    }
    else {
      if (newValue !== oldProps[propKey]) {
        // 普通属性有更新(改) 或 普通属性是新增的(增)
        // 放进队列
        (updatePayload = updatePayload || []).push(propKey, newValue);
      }
    }
  }
  return updatePayload;
}

/** 
 * 根据更新队列更新真实 DOM 结点
 * @param domToBeUpdate 待更新的 DOM 结点 (老视图，现在 current.stateNode === workInProgress.stateNode === 老视图)
 * @param updatePayload 更新队列
 */
export function updateProperties(domToBeUpdate: HTMLElement, updatePayload: IUpdateQueue_hostFiber) {
  for (let i = 0, len = updatePayload.length; i < len; i += 2) {
    // 每次取两个: 得到 k 和 v。
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];

    if (propKey === 'children') {
      // 更新文本子结点
      domToBeUpdate.textContent = propValue;
    }
    else if (propValue === null) {
      // 删掉更新后已经没有的属性
      domToBeUpdate.removeAttribute(propKey);
    }
    else {
      // 更新普通属性
      domToBeUpdate.setAttribute(propKey, propValue);
    }
  }
}
