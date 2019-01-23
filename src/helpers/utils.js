export function wellLookedMb(b) {
    let x = Math.round(b/1024/100);
    let c = Math.trunc(x/10);
    let d = x - Math.trunc(x/10) * 10;
    if (d !== 0) return c + "." + d; else return c;
}
