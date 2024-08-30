### vuex
- vuex 的核心概念包括：状态（state）、突变（mutations）、行为（actions）和getters
- 只有一个store，app实例上挂载这个store

```js
// Vuex 的store 必须要先从createStore函数创建
import { createStore } from "vuex";
const store = createStore({
  state: {
    items: []
  },
  getters: {
    totalCost: (state) =>
      state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  mutations: {
    addItem(state, item) {
        state.items.push(item)
    },
    removeItem(state, itemId) {
      state.items = state.items.filter((item) => item.id !== itemId);
    }
  }
});

// 需要在main.js中引入建立的store
import store from "./stores/cart";
const app = createApp(App);
app.use(store);


// 组建内使用
import { useStore } from "vuex";
const store = useStore();
const items = computed(() => store.state.items);
const totalCost = computed(() => store.getters.totalCost);
const removeItem = (id) => store.commit("removeItem", id);

```
### pinia
- 可以有多个store、app实例上挂载pinia实例（createPinia()）

```js
import { defineStore } from 'pinia'
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    save: {
      me: 'saved',
      notMe: 'not-saved',
    },
  }),

    // 结合 pinia-plugin-persistedstate
    // import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
    // const pinia = createPinia()
    // pinia.use(piniaPluginPersistedstate)
  persist: {
    // 在这里进行自定义配置
    // 用于指定 state 中哪些数据需要被持久化。[] 表示不持久化任何状态，undefined 或 null 表示持久化整个 state。
    paths: ['items', 'save.me'],
  },
  // 整个持久化
  persist: true,
  getters: {
    totalCost(state) {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    }
  },
  actions: {
    addItem(item) {
        this.items.push(item)
    },
    removeItem(itemId) {
      this.items = this.items.filter((item) => item.id !== itemId)
    }
  }
})

// 或者
export const useCartStore = defineStore('cart', () => {
    const items = ref([]);
    const totalCost = computed(() => {
        return items.value.reduce((total, item) => total + item.price * item.quantity,0);
    })
    const addItem = (item) => {
        item.value.push(item);
    }
    const removeItem = (itemId) => {
      items.value = items.value.filter((item) => item.id !== itemId)
    }

    return {
        items,
        addItem,
        removeItem,
    }
}, {
    // 整个store 持久化
   persist: true, 
}}
```
组件或者文件内使用的时候
**tips** storeToRefs来将store 的状态转换为ref，这样我们就可以在模板中直接使用这些状态。
```js
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart";

// 一旦被实例化，就可以直接访问了
const cartStore = useCartStore();
// 对于变量，通过storeToRefs来处理，这样拿到的数据仍然是响应式的
const { items, totalCost } = storeToRefs(cartStore);
function removeItem(id) {
  cartStore.removeItem(id);
}
```

### 区别

pinia优点：
- 更简单，更轻量级（压缩后只有1.6kb）、基于vue3的composition api，编写代码灵活性和可复用性更好
- ts支持更好、支持ssr
- 不再有module嵌套问题（vuex下，一个唯一的store下继承多个module，每个模块下都有一组（state+mutations+actions+getters））
- 没有【命名空间】的概念了，不需要记住模块间的复杂关系
- 无需手动添加每个store，模块默认情况下，创建的时候就自动注册了
- 代码分割机制更友好
- 提供了pinia状态持久化（配置 pinia-plugin-persistedstate）

vuex：
- 是基于Vue 2，使用了Vue 2的选项API和基于发布-订阅模式的状态管理。
- Vuex对于TypeScript的支持相对较弱，需要额外的配置和类型定义。
- Vuex提供了丰富的插件生态系统，可以轻松地扩展和定制Vuex的功能。许多常用的扩展和中间件都可以与Vuex集成。相比Pinia的插件生态系统相对较小
- 社区更加完善，比如遇到问题，google到解决方案的概率大很多。。
- 需要构建一个中大型单页应用，很可能会需要更好地在组件外部管理状态，需要Vuex 