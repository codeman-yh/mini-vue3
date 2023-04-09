function toDisplayString(val) {
    return val == null ? '' : String(val);
}

const extend = Object.assign;
const isObject = (val) => val !== null && typeof val == 'object';
const isString = (val) => typeof val === 'string';
const hasChange = (val, newVal) => !Object.is(val, newVal);
const isOnEvent = (key) => /^on[A-Z]/.test(key);
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
// add-user -> AddUser
const camelize = (str) => str.replace(/-(\w)/g, (match, letter) => {
    return letter ? letter.toUpperCase() : '';
});
// add -> Add
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
// Add -> onAdd
const toHandlerKey = (str) => str ? 'on' + capitalize(camelize(str)) : '';

let activeEffect;
const targetDepMap = new WeakMap(); // 可用对象为键值，弱引用（可垃圾回收）
class ReactiveEffect {
    constructor(fn, scheduler) {
        this._fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
    }
    run() {
        activeEffect = this;
        let result = this._fn();
        activeEffect = null;
        return result;
    }
    stop() {
        if (this.active) {
            // 找到dep依赖并清除
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.subscribeList.delete(effect);
    });
    effect.deps.length = 0;
}
function track(target, key) {
    const dep = getDep(target, key);
    trackEffects(dep);
}
function trigger(target, key) {
    const dep = getDep(target, key);
    triggerEffects(dep);
}
function trackEffects(dep) {
    if (!dep.subscribeList.has(activeEffect) && activeEffect) {
        dep.subscribeList.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
function triggerEffects(dep) {
    dep.subscribeList.forEach(sub => {
        if (sub.scheduler) {
            sub.scheduler();
        }
        else {
            sub.run();
        }
    });
}
function effect(fn, options = {}) {
    let _effect = new ReactiveEffect(fn, options === null || options === void 0 ? void 0 : options.scheduler);
    if (options) {
        extend(_effect, options);
    }
    _effect.run();
    // 通过赋值runner绑定实例
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    // 调用实例
    runner.effect.stop();
}
class Dep {
    constructor() {
        this.subscribeList = new Set();
    }
}
function getDep(target, key) {
    let depMap = targetDepMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetDepMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Dep();
        depMap.set(key, dep);
    }
    return dep;
}

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowGet = createGetter(true, true);
const set = createSetter();
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed: ${target} is readonly.`);
        return true;
    }
};
const shallowHandlers = extend({}, readonlyHandlers, {
    get: shallowGet
});
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key, receiver) {
        if (key == "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "_v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        let res = Reflect.get(target, key, receiver);
        if (isShallow)
            return res;
        if (isObject(res)) {
            res = isReadonly ? readonly(res) : reactive(res);
        }
        // 收集依赖 track
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value, receiver) {
        let res = Reflect.set(target, key, value, receiver);
        // 触发依赖 trigger
        trigger(target, key);
        return res;
    };
}

function reactive(raw) {
    return createReactiveObj(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObj(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObj(raw, shallowHandlers);
}
function isReactive(raw) {
    return !!raw["_v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isReadonly(raw) {
    return !!raw["_v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isProxy(raw) {
    return isReactive(raw) || isReadonly(raw);
}
function createReactiveObj(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Dep();
    }
    get value() {
        // 收集依赖 如何找到依赖
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChange(this._value, newValue)) {
            this._value = newValue;
            triggerRefValue(this);
        }
    }
}
function ref(value) {
    return new RefImpl(value);
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            let value = Reflect.get(target, key);
            return unRef(value);
        },
        set(target, key, value) {
            // let refValue = isRef(value) ? value : ref(value)
            // let res = Reflect.set(target,key,refValue)
            // return res;
            const oldValue = target[key];
            if (isRef(oldValue) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function trackRefValue(ref) {
    trackEffects(ref.dep);
}
function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._getter = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._value = this._getter.run();
            this._dirty = false;
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedRefImpl(getter);
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        shapeFlag: GetShapeFlags(type),
        props: props || {},
        key: props ? props.key : null,
        component: null,
        children
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 插槽类型，是组件节点 chidren 是对象 
    if (typeof children === 'object') {
        if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDRENN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}
function GetShapeFlags(type) {
    return isObject(type) ? 2 /* ShapeFlags.STATEFUL_COMPONENT */ : 1 /* ShapeFlags.ELEMENT */;
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlot(slots, name, props) {
    let slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return h(Fragment, {}, slot(props));
        }
        else {
            return h(Fragment, {}, slot);
        }
    }
    else {
        return h(Text, {}, '');
    }
}

function emit(instance, event, ...arg) {
    let props = instance.props;
    let handler = props[toHandlerKey(event)];
    handler && handler(...arg);
}

function initProps(instance, props) {
    instance.props = props;
}

function initSlots(instance, children) {
    // 判断是否需要加载插槽处理
    let { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDRENN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (let key in children) {
        let val = children[key];
        slots[key] = typeof val === 'function' ? (props) => normalArray(val(props)) : normalArray(val);
    }
}
function normalArray(children) {
    return Array.isArray(children) ? children : [children];
}

let currentInstance = {};
let _compiler;
function createComponentInstance(vnode, parentComponent) {
    let instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        subTree: {},
        provides: parentComponent ? parentComponent.provides : {},
        parent: parentComponent,
        isMounted: false,
        update: null,
        next: null,
        emit: () => { }
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 基于options创建的有状态组件 
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const { setup } = instance.type;
    if (setup) {
        setCurrentInstance(instance);
        let setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // object
    if (typeof setupResult == 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
    // funtion
}
function finishComponentSetup(instance) {
    let component = instance.type;
    if (_compiler && !component.render) {
        if (component.template) {
            component.render = _compiler(component.template);
        }
    }
    instance.render = component.render;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
function getCurrentInstance() {
    return currentInstance;
}
function registerRuntimeCompiler(compiler) {
    _compiler = compiler;
}

function provide(key, val) {
    const currentInstance = getCurrentInstance();
    // 这里需要处理一下 如果初始化，让 provides 指向父组件的provides原型
    if (currentInstance) {
        let { provides, parent } = currentInstance;
        if (provides == (parent === null || parent === void 0 ? void 0 : parent.provides)) {
            provides = currentInstance.provides = Object.create(parent.provides);
        }
        currentInstance.provides[key] = val;
    }
}
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        return parentProvides[key];
    }
}

const publicPropertiesMap = {
    '$el': (i) => i.vnode.el,
    '$slots': (i) => i.slots,
    '$props': (i) => i.props
};
// 将render运行时绑定this 指向proxy
const publicInstanceProxyhandlers = {
    // 解构后重新命名成instance
    get({ _: instance }, key) {
        if (hasOwn(instance.setupState, key)) {
            return instance.setupState[key];
        }
        else if (hasOwn(instance.props, key)) {
            return instance.props[key];
        }
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
        }
    }
};

function shouleUpdateComponent(prevVNode, nextVNode) {
    let { props: nextProps } = nextVNode;
    let { props: preProps } = prevVNode;
    if (nextProps === preProps)
        return false;
    // 检测是否存在
    // 之前不存在 取决于现在有无值
    if (!preProps) {
        return !!nextProps;
    }
    // 之前存在 现在的值不存在就得更新
    if (!nextProps) {
        return true;
    }
    // 检测长度是否变化
    if (Object.keys(nextProps).length !== Object.keys(preProps).length) {
        return true;
    }
    // 检测props里面的key是否变化
    for (let key in nextProps) {
        if (preProps[key] !== nextProps[key]) {
            return true;
        }
    }
    return false;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        const app = {
            _component: rootComponent,
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                render(vnode, rootContainer, null);
            }
        };
        return app;
    };
}

const p = Promise.resolve();
// 在渲染之前要执行watchEffect里面的函数任务
const activePreFlushCbs = [];
const queue = [];
let isFlushPending = false;
function nextTick(fn) {
    fn ? p.then(fn) : p;
}
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
        queueFlush();
    }
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJob);
}
function flushJob() {
    isFlushPending = false;
    let preJob;
    while (preJob = activePreFlushCbs.shift()) {
        if (preJob) {
            preJob();
        }
    }
    let doJob;
    while (doJob = queue.shift()) {
        if (doJob) {
            doJob();
        }
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, rootContainer, parentComponent) {
        patch(null, vnode, rootContainer, parentComponent, null);
    }
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container, anchor);
                break;
            default:
                // check type component element 根据type的数据类型
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        // 初始化
        if (!n1) {
            mountComponent(n1, n2, container, parentComponent, anchor);
        }
        else {
            // 更新组件
            updateComponent(n1, n2);
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container, anchor) {
        let textNode = n2.el = document.createTextNode(n2.children);
        hostInsert(textNode, container, anchor);
    }
    function mountComponent(n1, n2, container, parentComponent, anchor) {
        const instance = n2.component = createComponentInstance(n2, parentComponent);
        console.log('createComponentInstance', instance.parent);
        // 加工实例
        setupComponent(instance);
        setupRenderEffect(instance, container, anchor);
    }
    function updateComponent(n1, n2) {
        console.log('更新组件');
        const instance = n2.component = n1.component;
        if (shouleUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            instance.next = null;
        }
    }
    function mountElement(n1, n2, container, parentComponent, anchor) {
        const el = n2.el = hostCreateElement(n2.type);
        const { props, children } = n2;
        if (props) {
            for (let key in props) {
                const val = props[key];
                hostPatchProp(el, key, val);
            }
        }
        if (n2.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (n2.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // children Array(递归调用patch)
            mountChildren(children, el, parentComponent, anchor);
        }
        hostInsert(el, container, anchor);
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        let oldProps = n1.props;
        let newProps = n2.props;
        let el = n2.el = n1.el;
        patchChildren(n1, n2, el, parentComponent, anchor);
        parchProps(el, oldProps, newProps);
    }
    function parchProps(el, oldProps, newProps) {
        // props
        // 1. 原属性有值 -> 新属性undefined/null 删除属性
        // 2. 原属性有值 -> 新属性值不同 替换属性值
        // 3. 原属性有值 -> 新属性不存在 删除属性
        // 4. 原属性不存在 -> 新属性存在 添加属性
        if (oldProps !== newProps) {
            for (let key in newProps) {
                if (oldProps[key] != newProps[key]) {
                    hostPatchProp(el, key, newProps[key]);
                }
            }
            if (JSON.stringify(oldProps) !== "{}") {
                for (let key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, null);
                    }
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        // 1. text -> text 2. text - array 3.array -> text 4.array -> array
        const c1 = n1.children;
        const c2 = n2.children;
        const preShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        if (preShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // text -> text
                c1 !== c2 && hostSetElementText(container, c2);
            }
            else {
                // text -> array
                hostRemove(n1.el);
                mountChildren(c2, container, parentComponent, anchor);
            }
        }
        else {
            if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // array -> text
                unMountChildren(c1);
                hostSetElementText(container, c2);
            }
            else {
                // array -> array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        // 从左侧比对
        while (i <= e1 && i <= e2) {
            if (isSameNodeType(c1[i], c2[i])) {
                patch(c1[i], c2[i], container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        // 从右侧比对
        while (i <= e1 && i <= e2) {
            if (isSameNodeType(c1[e1], c2[e2])) {
                patch(c1[e1], c2[e2], container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 已锁定范围 O(n) 尽量使n变小，提升性能
        // console.log(i)
        // console.log(e1)
        // console.log(e2)
        // 新的children比老的children长 // 左侧
        if (i > e1) { // 这里无论左右侧 都成立 说明之前的节点对比都相等
            if (i <= e2) {
                const nextPros = e2 + 1; // 这里一定会指向老children的第一个元素
                let anchor = nextPros < c2.length ? c2[nextPros].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) { // 老的children比新的children长
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 处理乱序部分
            // let s1 = e1 - i + 1
            // let s2 = e2 - i + 1
            let s1 = i;
            let s2 = i;
            let toBePatched = e2 - i + 1;
            let patched = 0;
            let keyToNewIndexMap = new Map();
            let newIndexToOldIndexMap = new Array(toBePatched).fill(-1);
            let moved = false;
            let maxNewIndex = 0;
            for (let i = s2; i <= e2; i++) {
                // 建立有key的索引表，优化查找
                if (c2[i].key !== null) {
                    keyToNewIndexMap.set(c2[i].key, i);
                }
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // 遍历对比是否存在节点
                    for (let j = s1; j <= e2; j++) {
                        if (isSameNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex < maxNewIndex) {
                    moved = true;
                }
                else {
                    maxNewIndex = newIndex;
                }
                if (!newIndex) {
                    hostRemove(prevChild.el);
                }
                else {
                    // 新节点在老节点中存在
                    newIndexToOldIndexMap[newIndex - s2] = i;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            let increaseSquence = moved ? getSequence(newIndexToOldIndexMap) : [];
            console.log(newIndexToOldIndexMap);
            console.log(increaseSquence);
            let j = increaseSquence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                let newIndex = i + s2;
                let anchor = newIndex + 1 <= c2.length ? c2[newIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === -1) {
                    // 创建
                    patch(null, c2[newIndex], container, parentComponent, anchor);
                    continue;
                }
                else if (moved) {
                    console.log(c2[newIndex].el);
                    if (j < 0 || i !== increaseSquence[j]) {
                        hostInsert(c2[newIndex].el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function unMountChildren(children) {
        children.forEach(v => {
            hostRemove(v.el);
        });
    }
    function setupRenderEffect(instance, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                // 初始化
                let proxy = new Proxy({ _: instance }, publicInstanceProxyhandlers);
                instance.proxy = proxy;
                let subTree = instance.subTree = instance.render.call(proxy, proxy);
                patch(null, subTree, container, instance, anchor);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                let proxy = new Proxy({ _: instance }, publicInstanceProxyhandlers);
                instance.proxy = proxy;
                if (instance.next) {
                    let { props: nextProps } = instance.next;
                    instance.props = nextProps;
                }
                let subTree = instance.render.call(proxy, proxy);
                let preSubTree = instance.subTree;
                patch(preSubTree, subTree, container, instance, anchor);
                instance.vnode.el = subTree.el;
                instance.subTree = subTree;
            }
        }, {
            scheduler: () => queueJob(instance.update)
        });
    }
    function isSameNodeType(v1, v2) {
        return v1.type === v2.type && v1.key === v2.key;
    }
    return {
        createApp: createAppAPI(render)
    };
}
function getSequence(arr) {
    let dp = new Array(arr.length).fill(1);
    // 利用动态规划求出当前元素的最长递增子序列个数
    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < i; j++) {
            if (arr[i] > arr[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    // 拿到每个0-i元素的最长递增子序列个数，取出最大值和下标
    let maxCount = Math.max.apply(null, dp);
    let maxIndex = 0;
    for (let i = 0; i < dp.length; i++) {
        if (dp[i] === maxCount) {
            maxIndex = i;
            break;
        }
    }
    // 求出最长子序列，将下标返回
    let result = [];
    let currentMax = arr[maxIndex];
    result.push(maxIndex);
    while (maxIndex > 0) {
        if (currentMax > arr[maxIndex - 1]) {
            result.push(maxIndex - 1);
            currentMax = arr[maxIndex - 1];
        }
        maxIndex--;
    }
    result.reverse();
    return result;
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    if (isOnEvent(key)) {
        let event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        if (val === undefined || val === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, val);
        }
    }
}
function insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
}
function remove(el) {
    el.parentNode.removeChild(el);
}
function setElementText(el, text) {
    console.log('setElementText');
    el.textContent = text;
}
const { createApp } = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});

var Vue = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ReactiveEffect: ReactiveEffect,
    computed: computed,
    createApp: createApp,
    createElementBlock: createVnode,
    createRenderer: createRenderer,
    createTextVnode: createTextVnode,
    effect: effect,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    isProxy: isProxy,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isRef: isRef,
    nextTick: nextTick,
    provide: provide,
    proxyRefs: proxyRefs,
    reactive: reactive,
    readonly: readonly,
    ref: ref,
    registerRuntimeCompiler: registerRuntimeCompiler,
    renderSlot: renderSlot,
    shallowReadonly: shallowReadonly,
    stop: stop,
    toDisplayString: toDisplayString,
    unRef: unRef
});

const TODISPLAYSTRING = Symbol('toDisplayString');
const CREATEELEMENTBLOCK = Symbol('createElementBlock');
const helperNameMap = {
    [TODISPLAYSTRING]: 'toDisplayString',
    [CREATEELEMENTBLOCK]: 'createElementBlock'
};

function generate(ast) {
    const context = createGenerateContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    const functionName = 'render';
    const arg = ['_ctx'];
    push(`return function ${functionName}`);
    push(`(${[...arg]}){`);
    push(`return `);
    genNode(ast.codegenNode, context);
    push("}");
    return context;
}
function genNode(node, context) {
    switch (node.type) {
        case 3 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 1 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 4 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push } = context;
    push(`${context.helper(TODISPLAYSTRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genExpression(node, context) {
    context.push(`${node.content}`);
}
function genElement(node, context) {
    const { push } = context;
    const { tag, props, children } = node;
    push(`${context.helper(CREATEELEMENTBLOCK)}(`);
    genNodeList(genNullableArgs([tag, props, children]), context);
    push(")");
}
function genCompoundExpression(node, context) {
    const { push } = context;
    for (let i = 0; i < node.children.length; i++) {
        if (isString(node.children[i])) {
            push(node.children[i]);
        }
        else {
            genNode(node.children[i], context);
        }
    }
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(`${node}`);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}
function genNullableArgs(args) {
    return args.map(arg => arg || 'null');
}
function createGenerateContext(ast) {
    const context = {
        code: '',
        push(code) {
            context.code += code;
        },
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
    };
    return context;
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const name = 'Vue';
    const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;
    if (ast.helpers.length > 0) {
        const arg = ast.helpers.map(aliasHelper).join(",");
        push(`const { ${arg} } = ${name} `);
    }
    push('\n');
}

function baseParse(content) {
    const context = creatParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        const s = context.source;
        let node;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] == "<") {
            if (/^[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseInterpolation(context) {
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    let closeIndex = context.source.indexOf(closeDelimiter, openDelimiter);
    advanceBy(context, openDelimiter.length);
    let rawContent = parseTextData(context, closeIndex - closeDelimiter.length);
    let content = rawContent.trim();
    advanceBy(context, closeDelimiter.length);
    return {
        type: 1 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
            content
        }
    };
}
function parseElement(context, ancestors) {
    const elementNode = parseTag(context, 0 /* TagType.start */);
    ancestors.push(elementNode);
    elementNode.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (isCloseWithSameTag(context.source, elementNode.tag)) {
        parseTag(context, 1 /* TagType.end */);
    }
    else {
        throw new Error('缺失结束标签：span');
    }
    return elementNode;
}
function parseTag(context, tagType) {
    let match = context.source.match(/^<\/?([a-z]*)/i);
    let tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (tagType == 0 /* TagType.start */) {
        return {
            type: 2 /* NodeTypes.ELEMENT */,
            tag,
        };
    }
}
function parseText(context) {
    const s = context.source;
    const endTokens = ["{{", "<"];
    let endIndex = s.length;
    for (let i = 0; i < endTokens.length; i++) {
        const index = s.indexOf(endTokens[i]);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content,
    };
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}
function creatParserContext(content) {
    return {
        source: content
    };
}
function createRoot(children) {
    return {
        type: 0 /* NodeTypes.ROOT */,
        children,
        helpers: [],
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function isEnd(context, ancestors) {
    const s = context.source;
    // 还需判断节点是否需要闭合
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            if (isCloseWithSameTag(s, ancestors[i].tag)) {
                return true;
            }
        }
        return;
    }
    return !context.source;
}
function isCloseWithSameTag(s, tag) {
    return s.slice(2, tag.length + 2) === tag;
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    // 遍历ast
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers.push(...context.helpers.keys());
}
function traverseNode(node, context) {
    const type = node.type;
    let plugins = context.nodeTransfrom;
    switch (type) {
        case 1 /* NodeTypes.INTERPOLATION */:
            context.helper(TODISPLAYSTRING);
            break;
        case 0 /* NodeTypes.ROOT */:
        case 2 /* NodeTypes.ELEMENT */:
            traverseChildren(node, context);
            break;
    }
    // 这里执行是保存闭包的节点？
    if (plugins) {
        plugins.forEach(plugin => {
            plugin(node, context);
        });
    }
}
function traverseChildren(node, context) {
    let astChildren = node.children;
    if (astChildren) {
        for (let i = 0; i < astChildren.length; i++) {
            traverseNode(astChildren[i], context);
        }
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransfrom: options.nodeTransfrom || [],
        helpers: new Map(),
        helper(name) {
            const count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1);
        }
    };
    return context;
}
function createRootCodegen(root) {
    const { children } = root;
    const node = children[0];
    if (node.codegenNode) {
        root.codegenNode = node.codegenNode;
    }
    else {
        root.codegenNode = node;
    }
}

function transformElement(node, context) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        context.helper(CREATEELEMENTBLOCK);
        const childNode = node.children[0];
        const vTag = `'${node.tag}'`;
        const vProps = node.props;
        const vnode = {
            type: 2 /* NodeTypes.ELEMENT */,
            tag: vTag,
            props: vProps,
            children: childNode
        };
        node.codegenNode = vnode;
    }
}

function transformExpression(node) {
    if (node.type === 1 /* NodeTypes.INTERPOLATION */) {
        processExpression(node.content);
    }
}
function processExpression(contentNode) {
    contentNode.content = `_ctx.${contentNode.content}`;
}

function transformText(node) {
    if (node.type === 2 /* NodeTypes.ELEMENT */) {
        for (let i = 0; i < node.children.length; i++) {
            let currentContainer = {};
            let child = node.children[i];
            // 查看下一个是否为Text类型的节点
            if (isText(child)) {
                for (let j = i + 1; j < node.children.length; j++) {
                    let next = node.children[j];
                    if (isText(next)) {
                        if (!currentContainer.children) {
                            // 创建初始值
                            currentContainer = node.children[i] = {
                                type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                children: [child]
                            };
                        }
                        currentContainer.children.push(" + ", next);
                        // 将添加进COMPOUND类型的数据从原数组删除
                        node.children.splice(j, 1);
                        j--;
                    }
                    else {
                        break;
                    }
                }
            }
        }
    }
}
function isText(node) {
    return node.type === 3 /* NodeTypes.TEXT */ || node.type === 1 /* NodeTypes.INTERPOLATION */;
}

function baseCompiler(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransfrom: [transformExpression, transformText, transformElement]
    });
    return generate(ast);
}

function compilerToRenderFuntion(template) {
    // 函数体
    const { code } = baseCompiler(template);
    const render = new Function("Vue", code)(Vue);
    return render;
}
registerRuntimeCompiler(compilerToRenderFuntion);

export { ReactiveEffect, computed, createApp, createVnode as createElementBlock, createRenderer, createTextVnode, effect, getCurrentInstance, h, inject, isProxy, isReactive, isReadonly, isRef, nextTick, provide, proxyRefs, reactive, readonly, ref, registerRuntimeCompiler, renderSlot, shallowReadonly, stop, toDisplayString, unRef };
