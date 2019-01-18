export const links = {
    googlePlay: "https://play.google.com/store/apps/dev?id=8974857995051209835",
    facebook: "https://fb.me/anteex.developer",
    download: "https://play.google.com/store/apps/details?id=com.drop2comp&utm_source=drop2comp"
}

export const mainMenu = [
    {
        path: "",
        icon: "fa-qrcode",
        title: "Transfer files"
    },
    {
        path: "overview/",
        icon: "fa-question",
        title: "Overview"
    },
    {
        path: "private_policy/",
        icon: "fa-file-text-o",
        title: "Private policy"
    },
    {
        path: links.download,
        icon: "fa-download",
        title: "Download"
    },
    {
        path: links.googlePlay,
        icon: "fa-mobile",
        title: "More apps"
    },
    {
        path: links.facebook,
        icon: "fa-facebook-official",
        title: "Facebook"
    }
]

export const firebaseConfig = {
    apiKey: "AIzaSyAPSJ0vhurqrQXpvZBYLQl23movNXNBtk8",
    authDomain: "Drop2comp.firebaseapp.com",
    databaseURL: "https://drop2comp.firebaseio.com/",
    storageBucket: "gs://drop2comp.appspot.com/"
};

