/*
 * @Author: 刘林
 * @Date: 2020-12-23 15:16:00
 * @LastEditors: 刘林
 * @LastEditTime: 2020-12-25 10:33:30
 */
import React, { useState } from './didact';
import ReactDOM from './didact-dom';
// import React from 'react';
// import ReactDOM from 'react-dom';
// import { createElement } from './didact';

// console.log(Didact)

// const element = createElement('h1', null, 123);
// const ele = <h1 id="h1" style={{ color: 'green', fontSize: '44px' }}>123</h1>;
// const ele = <div><h1>213</h1><h2>h2</h2></div>
function App() {
  const [state, setState] = useState(1);
  return (
    <button onClick={() => { setState(state + 1) }}>
      Count: {state}
    </button>
  );
}
// class App {
//   render() {
//     return <div><h1 style={{ color: 'green', fontSize: '44px' }}>hi {props.name}</h1><h2 style={{ color: 'green', fontSize: '44px' }}>hi {props.name}</h2></div>
//   }
// }
const ele = <App />;
console.log(ele)
ReactDOM.render(ele, document.getElementById('root'));