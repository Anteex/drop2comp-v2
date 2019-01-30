export const config = {
    localProtocol: 'http',
    localPort: 8080,
    localTimeOut: 3000
}


export const links = {
    googlePlay: "https://play.google.com/store/apps/dev?id=8974857995051209835",
    facebook: "https://fb.me/anteex.developer",
    download: "https://play.google.com/store/apps/details?id=com.drop2comp&utm_source=drop2comp"
}

export const mainMenu = [
    {
        path: "",
        icon: "fa-qrcode",
        titleId: "transfer"
    },
    {
        path: "overview/",
        icon: "fa-question",
        titleId: "overview"
    },
    {
        path: "private_policy/",
        icon: "fa-file-text-o",
        titleId: "policy"
    },
    {
        path: links.download,
        icon: "fa-download",
        titleId: "download"
    },
    {
        path: links.googlePlay,
        icon: "fa-mobile",
        titleId: "more"
    },
    {
        path: links.facebook,
        icon: "fa-facebook-official",
        titleId: "facebook"
    }
]

export const firebaseConfig = {
    apiKey: "AIzaSyAPSJ0vhurqrQXpvZBYLQl23movNXNBtk8",
    authDomain: "Drop2comp.firebaseapp.com",
    databaseURL: "https://drop2comp.firebaseio.com/",
    storageBucket: "gs://drop2comp.appspot.com/"
};


