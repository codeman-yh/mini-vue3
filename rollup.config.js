import typescript from "@rollup/plugin-typescript";

export default {
    input: './packages/vue/src/index.ts',
    plugins: [
       typescript() 
    ],
    output:[
        {
            file: './packages/vue/dist/mini-vue.cjs.js',
            format: 'cjs',
        },
        {
            file: './packages/vue/dist/mini-vue.esm-bundler.js',
            format: 'es',
        }
    ],
    onwarn: (msg, warn) => {
        if (!/Circular/.test(msg)) {
          warn(msg)
        }
      },
  };