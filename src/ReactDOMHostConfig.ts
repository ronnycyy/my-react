/** 
 * React 是跨平台的，这个文本只负责操作原生DOM的部分。
*/

import { IProps, TFiberDOMType } from './models';
import { createElement, setInitialProperties, diffProperties } from './ReactDOMComponent';
import { ReactWorkTags } from './ReactWorkTags';

/**
 * 如果 workInProgress的子结点(虚拟DOM, ReactElement) 只是一个数字或者字符串，就设置它的文本内容就行，不需要创建子fiber结点。
 * 
 * @param type 原生fiber类型，如 'div', 'span'
 * @param props 属性
 */
export function shouldSetTextContent(type: TFiberDOMType, props: IProps) {
  // 新 fiber 子结点(虚拟DOM, ReactElement) 是否是纯文本
  return typeof props.children === 'string' || typeof props.children === 'number';
}

export function createInstance(type: TFiberDOMType, props: IProps) {
  return createElement(type)
}

export function finalizeInitialChildren(document: HTMLElement, type: TFiberDOMType, props: IProps) {
  // 初始化真实 dom 的属性
  setInitialProperties(document, type, props);
}

// 真实DOM操作: 增
export function appendChild(parentInstance: HTMLElement, child: HTMLElement) {
  parentInstance.appendChild(child);
}

// 真实DOM操作: 删
export function removeChild(parentInstance: HTMLElement, child: HTMLElement) {
  parentInstance.removeChild(child);
}

/**
 * 返回原生fiber的更新队列（属性diff）
 * 
 * @param domElement
 * @param tag 
 * @param oldProps 
 * @param newProps 
*/
export function prepareUpdate(domElement: HTMLElement, tag: ReactWorkTags, oldProps: IProps, newProps: IProps) {
  return diffProperties(
    domElement,
    tag,
    oldProps,
    newProps
  )
}