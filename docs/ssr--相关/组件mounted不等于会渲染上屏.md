背景
线上监控遇到的奇怪问题：


app mounted生命周期内打点耗时：1923ms

内核FCP: 2461ms

DCL（ DOMContentLoaded）：2366ms



问题
通常我们认为到达组件的mounted生命周期，意味着当前组件已经渲染上屏，很多展现点也是这样打点的。

但从任务系统首页首屏性能监控来看，mounted --> FCP间隔了500ms

FCP取的是`performance.getEntriesByName('first-contentful-paint')`内核点，按理说内核不会出错，需要一个demo验证下上屏时间与组件mounted的关系。



demo验证


`logCalc`是一个重计算函数，耗时5s，在到达mounted生命周期后调用，同时观察内核FCP触发的时间、上屏时间。



如果onMounted时组件已经上屏，意味着会先渲染，再执行`logCalc`。

demo结果


页面一直白屏，直到`logCalc`执行完毕，才到达FCP、DCL等节点。

原因

vue作为js代码只能影响DOM树创建，以及查询Layout、cssom，但最终上屏需要paint和composite，这不是js能控制的；

如果js线程有耗时任务或者dom计算，渲染上屏就会延后。






一次完整的重渲染流程：

Tasks => microtasks => recalculate Style => layout => pre-paint => paint => composite layers

结论
监控首屏性能，尤其在首屏渲染前期，js耗时任务堆积，mounted时间不一定等于渲染上屏，要以内核触发的时间为准。


