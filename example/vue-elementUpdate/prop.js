import {h,ref} from '../../packages/vue/dist/mini-vue.esm-bundler.js'

const prop = {
    render() {
        return h(
            'div',
            this.props,
            [
                h('button',{onClick: this.newPropsUndefinedOrNull},'newPropsUndefinedOrNull'),
                h('button',{onClick: this.newPropsValDifferent},'newPropsValDifferent'),
                h('button',{onClick: this.newPropsWithoutProp},'newPropsWithoutProp'),
                h('button',{onClick: this.newPropsHasNewProp},'newPropsHasNewProp'),
            ]
        )
    },
    setup() {
        let props = ref({
            foo: 'foo'
        })
        const newPropsUndefinedOrNull = () => {
            props.value = {
                foo: null
            }
        }
        const newPropsValDifferent = () => {
            props.value = {
                foo: '123'
            }
        }
        const newPropsWithoutProp = () => {
            props.value = {
                
            }
        }
        const newPropsHasNewProp = () => {
            props.value = {
                newFoo: 'newFoo'
            }
        }
        return{
            newPropsUndefinedOrNull,
            newPropsValDifferent,
            newPropsWithoutProp,
            newPropsHasNewProp,
            props
        }
    }
} 


export default prop