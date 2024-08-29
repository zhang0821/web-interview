// 防抖
const debounce = (fn, delay = 10) => {
    let timer = null;
    return function() {
        let that = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(that, args);
        }, delay);
    }
}

// let runTester = debounce((info) => {
//     console.log('run tester' + info);
// }, 1000);

// let runTester1 = info => {
//     console.log('run tester' + info);
// };

// for (let i = 0; i < 5; i++) {
//     runTester('info111');
//     runTester1('2222');
// }

const debounceInstance = (fn, delay = 10, immediate = false) => {
    let timer = null;
    return function() {
        let that = this;
        let args = arguments;
        timer && clearTimeout(timer);
        if (immediate) {
            if (!timer) {
                fn.apply(that, args);
            } else {
                timer = setTimeout(() => {
                    timer = null
                }, delay);
            }
        }
        else {
            timer = setTimeout(() => {
                fn.apply(that, args);
            }, delay);
        }
    
    }
}

// 节流---定时器
const throlleted = (fn, wait) => {
    let timer = null;
    return function(...args) {
        if(!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, wait);
        }
        
    }
}
// 节流---时间戳
const throlleted2 = (fn, wait) => {
    let start = Date.now();
    return function(...args) {
        let thisTime = Date.now();
        if(thisTime - start >= wait) {
            fn.apply(this, args);
            start = thisTime;
        }
    }
}
// let throlletedTester = throlleted2(info => {
//     console.log('throlleted tester + ', info);
// }, 1000);

// let counter = 10;
// let testTimer = setInterval(() => {
//     if(counter <= 0) {
//         clearInterval(testTimer);
//     }
//     counter--;
//     throlletedTester('info111' + counter);
// }, 500);


// 深拷贝

const deepClone = (target, map = new WeakMap()) => {
    if(typeof target !== 'object' || target === null) {
        return target;
    }

    if(target instanceof RegExp) {
        return new RegExp(target);
    }
    if(target instanceof Date) {
        return new Date(target);
    }
    if(map.has(target)) {
        return map.get(target);
    }
    // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
    let newCloneObj = new target.constructor();
    map.set(target, newCloneObj);
    for(let key in target) {
        // 只克隆自身属性
        if(target.hasOwnProperty(key)) {
            newCloneObj[key] = deepClone(target[key], map);
        }
    }
    return newCloneObj;
}

const obj = deepClone({
    name: '123',
    age: 1,
    address: {
        city: 'beijing',
        func: function() {
            console.log('func');
        },
        c: {
            a: 1,
            reg: [1,2,3],
        },
    },
    now: new Date(),
    reg: /123/,
});

// 阶乘
const pow  = (x, n) => {
    let res = x
    while(n > 1) {
        res *= x;
        n--;
    }
    return res;
}
// console.log(pow(2, 4));

// 递归 递归次数过多容易造成栈溢出
function powRecursion (x, n) {
    if (n > 1) {
        return x * powRecursion(x, n-1)
    }
    return x;
}
// console.log(powRecursion(2, 4));

// 尾递归 在尾部直接调用自身的递归函数

function powRecursionLast (x, n, total) {
    if (n > 0) {
        return powRecursionLast(x, n-1, x * total)
    }
    return total;
}
// console.log(powRecursionLast(2, 4, 1));

// 装饰器
// function setFlag(target) {
//     target.hasRun = '123';
// }
// 装饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。
// 装饰器本质就是编译时执行的函数
// @setFlag
// class Cookie {
//     checkRun() {
//         return this.hasRun;
//     }
// }

// const cookie = new Cookie();
// console.log(cookie.checkRun())


// 手写实现 Object.entries
let myObj = { foo: 3, bar: 7 };
  for (let [key, value] of Object.entries(myObj)) {
    console.log(key, value);
  }

  function* iterEntries(obj) {
    let keys = Object.keys(obj);
    for (let i=0; i < keys.length; i++) {
      let key = keys[i];
      yield [key, obj[key]];
    }
  }
  
//   for (let [key, value] of iterEntries(myObj)) {
//     console.log(key, value);
//   }


  
// 超时取消请求
//simple-timeout-promise.js
const mockReq = () => {
    return new Promise(res => {
        const resDelay = Math.random() > 0.5 ? 1000 : 3000;
        setTimeout(() => {
            res('success resDelay is ' + resDelay);
        }, resDelay);
    });;
};

const delayTimer = timeout => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            rej('timeout');
        }, timeout);
    });
}

// test
// Promise.race([mockReq(), delayTimer(1500)]).then(res => {
//     console.log('then res: ', res);
// }).catch(err => {
//     console.error('err: ', err);
// }).finally(() => {
//     console.log('finally');
// });


const testSet = new Set();
const fn = info => {
    console.log(info)
}
testSet.add(fn.bind(null, 1));
testSet.add(fn.bind(null, 2));
