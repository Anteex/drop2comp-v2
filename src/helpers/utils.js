export function wellLookedMb(bytes) {
    let x = Math.round(bytes/1024/100);
    let mbytes = Math.trunc(x/10);
    let d = x - Math.trunc(x/10) * 10;
    if (d !== 0) return mbytes + "." + d; else return mbytes;
}

export function bytesToRoundKB(bytes) {
  return Math.ceil(bytes/1024/100)*100;
}


export function compareArrays(arr1, arr2) {

    if (!arr1  || !arr2) return false;

    let result;
    arr1.forEach( (e1,i) => arr2.forEach( e2 => {
        if (e1.length > 1 && e2.length) {
            result = compareArrays(e1,e2)
        } else if (e1 !== e2 ) {
            result = false
        } else {
            result = true
        }
    }))
    return result
}
