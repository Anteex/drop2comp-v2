export default function downloadFile(sUrl) {

    //iOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
        alert('Your device does not support files downloading. Please try again in desktop browser.');
        return false;
    }

    //If in Chrome or Safari - download via virtual link click
    if (isChrome() || isSafari()) {
        //Creating new link node.
        let link = document.createElement('a');
        link.href = sUrl;

        if (link.download !== undefined) {
            //Set HTML5 download attribute. This will prevent file from opening if supported.
            link.download = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
        }

        //Dispatching click event.
        if (document.createEvent) {
            let e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            link.dispatchEvent(e);
            return true;
        }
    }

    // Force file download (whether supported by server).
    if (sUrl.indexOf('?') === -1) {
        sUrl += '?download';
    }

    window.open(sUrl, '_self');
    return true
}

function isChrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}

function isSafari() {
    return navigator.userAgent.toLowerCase().indexOf('safari') > -1;
}
