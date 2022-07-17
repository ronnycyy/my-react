import { IProps, TFiberDOMType } from './models';

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
