// 组件状态，使用位运算效率更高
export const enum ShapeFlags{
    ELEMENT = 1,               // 00001
    STATEFUL_COMPONENT = 1<<1, // 00010
    TEXT_CHILDREN = 1 << 2,    // 00100
    ARRAY_CHILDREN = 1 << 3,   // 01000
    SLOT_CHILDRENN = 1 << 4    // 10000
}


// 查找 & 
// 修改 |