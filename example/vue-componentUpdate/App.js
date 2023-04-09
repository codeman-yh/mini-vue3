// 在 render 中使用 proxy 调用 emit 函数
// 也可以直接使用 this
// 验证 proxy 的实现逻辑
import { h, ref,nextTick, getCurrentInstance} from "../../packages/vue/dist/mini-vue.esm-bundler.js";
import Child from "./Child.js";

export default {
  name: "App",
  setup() {
    const msg = ref("123");
    const count = ref(1);
    window.msg = msg
    const instance = getCurrentInstance()
    const changeChildProps = () => {
      msg.value = "456";
    };

    const changeCount = () => {
      for(let i=0; i< 99; i++){
        count.value += 1
      }
      console.log(instance)
      nextTick(()=>{
        console.log(instance)
      })
    }

    return { msg, count,changeChildProps ,changeCount};
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好 count "+ this.count ),
      h(
        "button",
        {
          onClick: this.changeCount,
        },
        "change self count"
      ),
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change child props"
      ),
      h(Child, {
        msg: this.msg,
      }),
    ]);
  },
};
