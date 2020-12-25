/*
 * @Author: 刘林
 * @Date: 2020-12-24 09:57:12
 * @LastEditors: 刘林
 * @LastEditTime: 2020-12-25 10:32:39
 */


// 没有用执行单元

// function render(element, container) {
//   const dom = element.type === "TEXT_ELEMENT"
//     ? document.createTextNode(element.props.nodeValue)
//     : document.createElement(element.type);
//   // 将其他属性添加到真实dom中
//   const isProperty = key => key !== 'children';
//   const isStyleProperty = 'style';
//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach(name => {
//       if (name === isStyleProperty) {
//         Object.keys(element.props[name]).forEach(key => {
//           dom.style[key] = element.props[name][key]
//         })
//       } else {
//         dom[name] = element.props[name];
//       }
//     })
//   // 渲染子组件
//   element.props.children.forEach(child => {
//     render(child, dom);
//   });
//   container.appendChild(dom);
// }

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
const isStyleProperty = 'style';

function createDom(fiber) {
  // TODO 创建Dom
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode("")
    : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

// 使用执行单元
function render(element, container) {
  // TODO 
  // 简易fiber对象
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = [];
  nextUnitOfWork = wipRoot;
}

/**
 * 需用比较旧的fiber和新的fiber的属性，移除没有的属性，设置新的属性
 * @param {*} dom 
 * @param {*} prevProps 
 * @param {*} nextProps 
 */
function updateDom(dom, prevProps, nextProps) {
  // 移除旧的监听事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(
        eventType,
        prevProps[name]
      );
    })
  // 删除多余的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // 添加新增的监听事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(
        eventType,
        nextProps[name]
      );
    })
  // 添加新增的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      if (name === isStyleProperty) {
        Object.keys(nextProps[name]).forEach(key => {
          dom.style[key] = nextProps[name][key]
        })
      } else {
        dom[name] = nextProps[name];
      }
    })
}
function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  // domParent.appendChild(fiber.dom);
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    // domParent.removeChild(fiber.dom);
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 分片处理
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // requestIdleCallback 将在浏览器空闲时段内调用函数队列，这使得开发者能够在
  // 主时间循环上执行后台和低优先级工作，而不会影响关键时间，如动画和输入相应函数。
  // 函数一般会按先进先调用的顺序执行，然而如果回调函数指定了执行超时时间timeout，
  // 则有可能为了在超时前执行函数而打乱执行顺序 --- MDN requestIdleCallbak;

  // 现在react没有使用requestIdleCallback 而是使用scheduler来进行调度。
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

export function stateHooks(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    // console.log(action);
    if (action instanceof Function) {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  })
  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function performUnitOfWork(fiber) {
  // debugger
  // TODO 添加节点到DOM中
  // 判断是否是函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  // TODO 找到下一个执行单元
  // TODO 返回执行单元
}

function updateFunctionComponent(fiber) {
  // TODO
  wipFiber = fiber;
  hookIndex = 0;;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }
  // TODO 为子节点创建fider（执行单元）
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibing = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && oldFiber.type == element.type;

    // 新节点与旧节点的元素一致
    if (sameType) {
      // 更新节点
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }
    // 新增节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }
    // 删除节点
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION',
        deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: fiber,
    //   dom: null
    // }
    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibing.sibling = newFiber
    }
    prevSibing = newFiber;
    index++;
  }
}

const DidactDOM = {
  render,
  // useState
}

export default DidactDOM;