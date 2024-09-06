## 路由模式

### hash模式（对应HashHistory）

- 通过监听 URL 的哈希部分变化，相应更新页面。会覆盖锚点定位功能
- 不会向服务器发送新的请求，会触发 onhashchange 事件。
- #号后面内容 hash值不会被提交到server
- hash值的改变会在浏览器历史中新增一个记录，能通过回退按钮控制hash值切换
- window.onhashchange = () => {}

### history模式（对应HTML5History）
- html5 新推出的功能，比 Hash url 更美观
- history 模式下，浏览器刷新页面，会按照路径发送真实的资源请求。
- history 模式下，服务端要设置支持允许地址可访问

#### 改变url： pushState、replaceState

- 两个方法来记录路由状态，只改变 URL 不会引起页面刷新

#### 监听url变化：onpopstate

- onpopstate 事件是浏览器历史导航的核心事件,它标识了页面状态的变化时机,在点击浏览器的前进或者后退功能时触发
- history.pushState() 或 history.replaceState() 方法修改浏览器的历史记录时，不会直接触发 onpopstate 事件。

demo

```js
history.replaceState({}, null, '/b') // 替换路由
history.pushState({}, null, '/a') // 路由压栈，记录浏览器的历史栈 不刷新页面
history.back() // 返回
history.forward() // 前进
history.go(-2) // 后退2次

window.onpopstate = function(event) {
  // 根据当前 URL 加载对应页面
};

```

#### history 模式下 404 页面的处理


    => 在 history 模式下，浏览器会向服务器发起请求，服务器根据请求的路径进行匹配：
    => 如果服务器无法找到与请求路径匹配的资源或路由处理器，服务器可以返回 /404 路由，跳转到项目中配置的 404 页面，指示该路径未找到。
    故 => 在服务器配置中添加一个通配符路由，将所有非静态资源的请求都重定向到主页或一个自定义的 404 页面，以保证在前端处理路由时不会出现真正的 404 错误页面。
