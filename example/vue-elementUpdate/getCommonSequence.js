function getCommonSequence(arr1, arr2){

    let l1 = arr1.length
    let l2 = arr2.length
    // let dp = []
    let dp = Array.from({ length: l1}, () => new Array(l2).fill(0));
    dp[0][0] = arr1[0] == arr2[0] ? 1 : 0

    for(let i=1; i<l1;i++){
        dp[i][0] = Math.max( dp[i-1][0] , arr1[i] == arr2[0] ? 1 : 0)
    }

    for(let j=1; j<l2;j++){
        dp[0][j] = Math.max( dp[0][j-1] ,arr2[j] == arr1[0] ? 1 : 0)
    }

    for(let i = 1; i<l1; i++){
        for(let j = 1; j<l2; j++){
            if(arr1[i] == arr2[j]){
                dp[i][j] = dp[i-1][j-1] + 1
            }else{
                dp[i][j] = Math.max(dp[i-1][j],dp[i][j-1]) 
            }
        }
    }

    let result = []
    let i = l1 - 1
    let j = l2 -1
    while(i>=0 && j>=0){
        if(arr1[i] == arr2[j]){
            result.push(arr1[i])
            i--
            j--
        }else if(dp[i-1][j] > dp[i][j-1]){
            i--
        }else{
            j--
        }
    }

    return result.reverse();
}

function getSequenceVue3(arr){
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
    j = result[result.length - 1]
    if (arr[j] < arrI) {
    p[i] = j
    result.push(i)
    continue
    }
    u = 0
    v = result.length - 1
    while (u < v) {
    c = (u + v) >> 1
    if (arr[result[c]] < arrI) {
    u = c + 1
    } else {
    v = c
    }
    }
    if (arrI < arr[result[u]]) {
    if (u > 0) {
    p[i] = result[u - 1]
    }
    result[u] = i
    }
    }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
    result[u] = v
    v = p[v]
    }
    return result
}

function getSequence(arr){
    let dp = new Array(arr.length).fill(1)
    // 利用动态规划求出当前元素的最长递增子序列个数
    for(let i = 1; i< arr.length; i++){
        for(let j = 0; j < i; j++){
            if(arr[i] >  arr[j]){
                dp[i] = Math.max(dp[i], dp[j] +1 )
            }
        }
    }

    // 拿到每个0-i元素的最长递增子序列个数，取出最大值和下标
    let maxCount = Math.max.apply(null,dp)
    let maxIndex = 0
    for(let i =0; i<dp.length; i++){
        if(dp[i] === maxCount){
            maxIndex = i;
            break;
        }
    }

    // 求出最长子序列，将下标返回
    let result = []
    let currentMax = arr[maxIndex]
    result.push(maxIndex)
    while(maxIndex > 0){
        if(currentMax > arr[maxIndex-1]){
            result.push(maxIndex-1)
            currentMax = arr[maxIndex-1]
        }
        maxIndex--
    }
    result.reverse()
    return result
}

let a = ['c','b','a',1,2,3,'f',4,'e']
let b = [1,'a','e','f',2,3,'g',4]

// [5,3,1,2,6,5,7,9,4]  2, 3, 5, 6, 7
console.log(getSequence([3,2,0,4]))