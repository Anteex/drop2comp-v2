import sha1 from 'crypto-js/sha1'


export default function uniqid() {
    let today = new Date();
    return sha1(Math.random() * today.getTime() + "").toString()
}