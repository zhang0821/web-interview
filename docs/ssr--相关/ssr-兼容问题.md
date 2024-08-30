### 背景
线上代码肯定要处理esNext语法的transform+polyfill问题，通常csr模式直接使用@vite/plugin-legacy就可以按需生成对应的polyfill，同时在html内注入判断modern/legacy脚本，根据运行时的支持进行不同的module加载。

### 问题1 插件冲突
ssr场景下，编译生成html会在server端被vite-plugin-ssr接管，无法按plugin-legacy这样注入两份代码。

这其实也是插件型工具比较常见且头疼的问题，不同插件都需要接管某一个生命周期或钩子，不可避免的会遇到插件间的兼容性问题。

### 问题2 modern模式没有polyfill
最新modern模式的基线是chrome>=87, safari>=14，默认不注入polyfill，但es2021+以及某些机型上面的特殊case，会导致这个模式下没有polyfill存在问题，生产环境肯定要考虑异常量级、是否解决、解决方案。



可以开启modernPolyfills选项，但试了一下，直接注入了28k gzipped的polyfill，这可能过于冗余了，需要所有modern用户承担那一点点的case带来的消耗。

