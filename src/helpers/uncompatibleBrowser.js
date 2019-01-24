export function partiallyCompatibleBrowser() {
    let ua = window.navigator.userAgent;
    return (ua.indexOf("Edge") > 0 || getInternetExplorerVersion() > 0)
}

export function unCompatibleBrowser() {
    return (!window.File || !window.FileReader || !window.FileList || !window.Blob)
}

function getInternetExplorerVersion() {
    let rv = -1;
    if (navigator.appName === 'Microsoft Internet Explorer') {
        let ua = navigator.userAgent;
        let re  = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
        if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
    } else if (navigator.appName === 'Netscape') {
        let ua = navigator.userAgent;
        let re  = new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})");
        if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
    }
    return rv
}
