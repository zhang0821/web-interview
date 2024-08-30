### SSE
#### SSE（Server-Sent Events）
- 服务器向客户端推送实时数据的技术
- 建立在 HTTP 和简单文本格式之上，提供了一种轻量级的服务器推送方式，通常也被称为“事件流”（Event Stream）。
- 客户端和服务端之间建立一个长连接，并通过这条连接实现服务端和客户端的消息实时推送。

#### 基本实现

- 基于 EventSource
    - 提供三个标准事件，同时默认支持断线重连
    - onopen（建立连接成功时）、onmessage、onerror
```js
$.ajax({
    type: "post",
    url:"/chat/sendMsg",
    data:{
        msg: 'xx'
    },
    contentType: 'application/x-www-form-urlencoded',
    success: data => {
        const evsource = new EventSource('/server/adress/path'+data)
        evsource.addEventListener('open', () => {
            console.loog('连接成功')
        })
        evsource.addEventListener('message', evt) => {
            const content = JSON.parse(evt.data).content
            console.loog('接收到消息')
        })
        evsource.addEventListener('error', e) => {
            console.loog('出错了')
            evsource.close();
        })
        evsource.addEventListener('stop', () => {
            console.loog('结束了，主动close')
            evsource.close();
        })
    }
});
```

- 基于 @microsoft/fetch-event-source
- 基于 axios

```js
axios.get('https://my-domain.com/api/getStream', {
    responseType: 'stream',
    headers: {
        'Accept': 'text/event-stream',
    }
})
.then(response => {
        console.log('axios got a response');
        const stream = response.data;
        // stream.on('data', data => {
        // console.log(data.toString('utf8'));
        // consume response
        const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        // 或者是下面这种方式
        // const reader = stream.pipeThrough(new EventSourceStream()).readable.getReader();
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            console.log(value);
        }

    });
})
.catch(e => {
    console.error('got an error', e);
});    

// 旧版本
axios.get('https://my-domain.com/api/getStream', {
    headers: {
      'Accept': 'text/event-stream',
    },
    onDownloadProgress: (evt) => {
      // Parse response from evt.event.target.responseText || evt.event.target.response
      // The target holds the accumulator + the current response, so basically everything from the beginning on each response
      // Note that it's evt.target instead of evt.event.target for older axios versions
      let data = evt.event.target.responseText;
      console.log(data);
    }
  })

```


#### vs websockt

websocket 
- 全双工、实时双向通信（sse是服务端推送的单向）
- 低延迟，开销小（使用单一的持久链接，sse需要不断创建新的连接）
- 


### 相关项目--ai-duck（类似chatgpt流式交互）
#### 输入框的处理
#### 数据流的处理
#### 交互处理
- 如果处理答案自动输出时页面自动上滚
    - settimeou太影响性能
- 在数据流式输出时，用户操作上拉下滑时
