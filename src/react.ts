import { IProps, TFIberType } from './models';
/**
 * 手写 React
 */

import { REACT_ELEMENT_TYPE } from './ReactSymbols';
import { IReactElement } from './models';

// 不要放在 props 里的属性
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 * Create and return a new ReactElement of the given type.
 * 根据传入的类型，创建并返回一个新的 React 元素 (虚拟DOM)。
 * @param type 元素类型，如 'div'
 * @param config 配置对象, 即标签上的属性, 如 { id: string, className: string, readonly: boolean }
 * @param children 第一个子结点，如果有多个子结点，会依次放在后面。如 children1, children2, children3, ...
 */
function createElement(type: string, config: any, children: IReactElement): IReactElement {
  let propName: string;

  // Reserved names are extracted
  const props: IProps = { children: null };

  // 唯一标识
  let key = null;
  // 真实dom引用
  let ref = null;

  // 提取 config 到 props:  { id: props.id, className: props.className, title: props.title, ... }
  if (config) {
    // 单独拿出来 key, ref 属性
    if (config.key) {
      key = config.key;
    }
    if (config.ref) {
      ref = config.ref;
    }
    // 剩余的属性，如 id, title, className, ..., 排除保留属性，然后放到 props 里。
    for (propName in config) {
      // 排除保留属性
      if (!RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // 提取子结点到 props.children
  // 前两个参数是 type 和 config，剩下的都是子结点。如 React.createElement(type, config, child1, child2, child3, ...)
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    // 只有一个子结点，直接拿了, 不需要数组。
    props.children = children;
  }
  else if (childrenLength > 1) {
    // 有两个以上的子结点，做成数组
    const childArray = new Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      // 绕过 type 和 config, 剩下的一个个放到数组里。
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // 构造一个 React 元素，返回。
  return ReactElement(type, key, ref, props);
}

/**
 * 创建 React 元素的工厂函数。
 * 
 * 不再使用 class 语法，所以不要通过 new 来调用它。
 * 同样的，也不要用 instanceof 来检查一个对象是否是它的实例，那样是无效的，
 * 而应该检查 $$typeof 是否等于 Symbol.for('react.element')，以判断一个对象是否是 React 元素。
 * 
 * @param type 元素类型，如 'div'
 * @param key 唯一标识
 * @param ref DOM引用
 * @param props 属性，包含普通属性和子结点属性。如 { id: string, className: string, children: Array<ReactElement> }
 */
function ReactElement(type: TFIberType, key: string, ref, props: IProps) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,  // type, key, ref 都放在 props 外边
    props  // 剩余属性放到 props 里，如 id, className, title, ...
  }
  return element;
}

const React = {
  createElement
}

export default React;