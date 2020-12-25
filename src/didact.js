/*
 * @Author: 刘林
 * @Date: 2020-12-23 18:49:39
 * @LastEditors: 刘林
 * @LastEditTime: 2020-12-25 10:33:00
 */
/**
 *
 * 1.createElement // 根据jsx创建
 * 2.render // 渲染
 * 3.Concurrent Mode // 并发模式
 * 4.Fibers
 * 5.Render and Commit Phases
 * 6.Reconciliation
 * 7.Function Components
 * 8.Hooks
 */

// createElement
import { stateHooks } from './didact-dom';

/**
 * 
 * @param {*} type 元素类型
 * @param {*} props 额外属性
 * @param  {...any} children 子元素
 */
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // children,
      children: children.map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    }
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

export function useState(initial) {
  return stateHooks(initial)
}

const Didact = {
  createElement,
  useState
}

export default Didact;