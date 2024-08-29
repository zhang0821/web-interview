// 100个HTTP请求如何快速请求完，限制最大并发数10个
 
class Node {
   constructor(node) {
       this.value = node;
       this.next = null;
   }
}

class Queue {
   constructor(name) {
       this.name = name;
       this.clear();
   }

   enqueue(item) {
       const node  = new Node(item)
       if(!this.head) {
           this.head = node;
           this.tail = node;
       }
       else {
           this.tail = node;
           this.tail.next = node;
       }
       this.size++;
   }

   dequeue() {
       if(!this.head) {
           return;
       }
       const curNode = this.head;
       this.head = curNode.next;
       this.size--;
       return curNode.value;
   }

   clear() {
       this.head = undefined;
       this.tail = undefined;
       this.size = 0;
   }
}

// 串行执行 尽可能快
// 浏览器有限制 一次最多执行6个
// 用map记录，完成一个删除一个记录一个新的
const mockFetch = i => {
   return new Promise((resolve, reject) => {
       console.log('run mockFetch url' + i);
       setTimeout(() => {
           Math.random() > 0.5 ? reject(i) : resolve(i)
       }, 5000);
   })
};

const runingQueue = new Queue('runingQueue');
let runingCount = 0;
const waitQueue = new Queue('waitQueue');
const waitList = [];
const max = 4;
let start = Date.now();
const queueReq = url => {
   return new Promise((resolve, reject) => {
       let isFull = runingCount >= max;
       // let isFull = runingQueue.size >= max;
       const runner = () => {
           return mockFetch(url)
                       .then(res => {
                           console.log('fetch then', res)
                           resolve(res);
                       })
                       .catch(err => {
                           console.log('fetch catch', err)
                           reject(err);
                       })
                       .finally(() => {
                           runingCount--;
                           // runingQueue.dequeue();
                           const next = waitQueue.dequeue();
                           // const next = waitList.shift();
                           if(next) {
                               next();
                               setTimeout(() => {
                                   runingCount++;
                                   // runingQueue.enqueue(next);
                               }, 0);
                           }
                           else {
                               console.log('没有啦');
                           }
                       });
       }
       if(isFull) {
           waitQueue.enqueue(runner)
           // waitList.push(runner)
       }
       else {
           // runingQueue.enqueue(runner)
           runingCount++;
           runner();
       }
   })
}

let done = 0
for(let i = 0;i < 10; i++) {
   queueReq(i)
   .catch(err => {
       console.log('这是catch 第' + i + '个请求')
   })
   .finally(() => {
       done++;
       console.log('main finally iiii', i, done)
       if(done === 10) {
           console.log('total time', Date.now() - start);
       }
   })
}