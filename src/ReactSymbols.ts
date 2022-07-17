export const REACT_ELEMENT_TYPE = Symbol.for('react.element');
export const REACT_MEMO_TYPE = Symbol.for('react.memo');
export const REACT_LAZY_TYPE = Symbol.for('react.lazy');

export type IReactSymbols = Symbol;  // TODO: 上面所有的 REACT_TYPE, 取并集。