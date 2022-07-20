import React from "./react";
import * as ReactDOM from './react-dom';
import { IReactElement } from "./models";

/**
* 我们一直写的 App 函数组件, 会被编译成 React.createElement(App, null, undefined), 其中 App 就是这个函数。
* 返回的 ReactElement 对象的 type 就是 App 函数，可以执行的，执行返回的值已经被编译成 React.createElement(..)，等待被调用。
* 也就是说，全部编译完了，变成 React.createElement(..) 了，才进入 React 运行时。
*/
// function App() {
//   return (
//     <div id="title" className="title">
//       <h1>Hello World</h1>
//       <div>
//         <span title="yes">Yes!</span>
//       </div>
//     </div>
//   );
// }

// const App = (
//   <div id="title" className="title">
//     <h1>Hello World</h1>
//     <div>
//       <span title="yes">Yes!</span>
//     </div>
//   </div>
// )

// const App = (
//   <div id="title" className="title">
//     title
//   </div>
// )

/**
 * 
 * <div id="title" className="title">
    <h1>Hello World</h1>
    <div>
      <span title="yes">Yes!</span>
    </div>
  </div>

  这个 JSX 经过 @babel/preset-react 编译, 结果为:

  React.createElement(
    "div", 
    {
      id: "title",
      className: "title"
    }, 
    React.createElement(
      "h1", 
      null, 
      "Hello World"
    ), 
    React.createElement(
      "div", 
      null, 
      React.createElement(
        "span", 
        {
          title: "yes"
        }, 
        "Yes!"
      )
    )
  );

  上面的函数执行，返回一个对象 (ReactElement):
  注意 props.children, 多个子结点会变成一个数组, 单个子结点会变成一个 对象(ReactElement) 或 字符串(纯文本)。

  {
    $$typeof: Symbol(react.element),
    type: "div",
    key: null,
    ref: null,
    props: {
      id: "title",
      className: "title",
      children: [
        {
          $$typeof: Symbol(react.element),
          key: null,
          props: {
            children: 'Hello World'
          },
          ref: null,
          type: "h1"
        },
        {
          $$typeof: Symbol(react.element),
          key: null,
          props: {
            children: {
              $$typeof: Symbol(react.element),
              key: null,
              props: {
                title: 'yes', 
                children: 'Yes!'
              },
              ref: null,
              type: "span"
            }
          },
          ref: null,
          type: "span"
        }
      ]
    }
  }
*/


/**
 * 同步模式
 * 注意这时 props 还是空的，函数执行以后才有 children。
 * ReactDOM.render({ $$typeof: Symbol(react.element), key: null, props: {}, ref: null, type: f App() }, root);
 */
// ReactDOM.render(App as IReactElement, document.getElementById("root"));

const root = document.getElementById('root');
const single = document.getElementById('single');
const singleUpdate1 = document.getElementById('singleUpdate1');
const singleUpdate2 = document.getElementById('singleUpdate2');
const singleUpdate3 = document.getElementById('singleUpdate3');

const single4 = document.getElementById('single4');
const singleUpdate4 = document.getElementById('singleUpdate4');


single.addEventListener('click', () => {
  // 初始化单结点 diff demo
  const element = <div key="1" id="title" title="abc">初始化结点</div>;
  ReactDOM.render(element as IReactElement, root);
});

// 情况一: key相同, type相同，props不同
// div.children="abc" -> div.children="div2"
singleUpdate1.addEventListener('click', () => {
  // 复用DOM结点, 只更新属性 (id,children,title)
  const element = <div key="1" id="title2">div2</div>;
  ReactDOM.render(element as IReactElement, root);
});

// 情况二: key相同, type不同，props相同
// div -> p
singleUpdate2.addEventListener('click', () => {
  // 删除老结点，添加新结点
  const element = <p key="1" id="title" title="abc">初始化结点</p>;
  ReactDOM.render(element as IReactElement, root);
});

// 情况三: key不同, type相同，props相同
// div.key="1" -> div.key="2"
singleUpdate3.addEventListener('click', () => {
  // 删除老结点，添加新结点
  const element = <div key="2" id="title" title="abc">初始化结点</div>;
  ReactDOM.render(element as IReactElement, root);
});


// 情况四: 老的有多个子结点，新的只有一个子结点
single4.addEventListener('click', () => {
  // 初始化多个子结点 
  const element = (
    <ul key="ul">
      <li key="A">a</li>
      <li key="B" id="B">b</li>
      <li key="C">c</li>
    </ul>
  )
  ReactDOM.render(element as IReactElement, root);
});

singleUpdate4.addEventListener('click', () => {
  const element = (
    <ul key="ul">
      <li key="B" id="B2">b</li>
    </ul>
  )
  ReactDOM.render(element as IReactElement, root);
});

