export const extend = Object.assign

export const isObject = (val) => val !== null && typeof val == 'object'

export const isString = (val) => typeof val === 'string'

export const hasChange = (val, newVal) => !Object.is(val,newVal)

export const isOnEvent = (key) => /^on[A-Z]/.test(key)

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj,key)

// add-user -> AddUser
export const camelize = (str: string) => str.replace(/-(\w)/g,(match,letter)=>{
    return letter ? letter.toUpperCase() : ''
})

// add -> Add
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Add -> onAdd
export const toHandlerKey = (str: string) => str ? 'on' + capitalize(camelize(str)) : '';

export * from './shapeFlags'
export * from './toDisplayString'