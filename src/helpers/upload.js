export function processUpload(file, progress) {
    return new Promise( (resolve, reject) => {
        setTimeout(() => progress(20), 3000);
        setTimeout(() => progress(40), 6000);
        setTimeout(() => progress(60), 9000);
        setTimeout(() => progress(80), 12000);
        setTimeout(() => resolve(0), 15000);
    })
}
