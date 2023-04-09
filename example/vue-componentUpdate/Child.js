import { h, ref, reactive } from "../../packages/vue/dist/mini-vue.esm-bundler.js";
export default {
  name: "Child",
  setup(props, { emit }) {
    
  },
  render(proxy) {
    return h("div", {}, [h("div", {}, "child" + this.$props.msg)]);
  },
};
