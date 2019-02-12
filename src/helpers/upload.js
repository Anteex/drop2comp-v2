import { config } from '../config'
import axios from 'axios'
import $ from 'jquery'


export function processUpload(file, progress, uploadState, clientId) {

    let timerId, request;

    const abortLocalUpload = (resolve, reject) => {
        console.log("Local uploading error");
        clearTimeout(timerId);
        request.abort();
        startRemoteUpload(resolve, reject);
    }

    const startLocalUpload = (resolve, reject) => {
        console.log("Upload locally");
        console.time("LocalUpload");
        let url = config.localProtocol + '://' + uploadState.address + ":" + config.localPort + "/" + clientId;

        let formData = new FormData();
        const blob = new Blob([file], { type: 'application/octet-stream' });
        formData.append('filesize', file.size);
        formData.append('file', blob, file.name);
        console.log("File size: " + file.size);

        axios
          .post(url, formData, {
            onUploadProgress: ProgressEvent => {
              let percent = Math.round(ProgressEvent.loaded / ProgressEvent.total*100);
              progress(percent);
              console.log('Upload is ' + percent + '% done');
            }
          })
          .then(res => {
            console.timeEnd("LocalUpload");
            console.log("Upload status: OK");
            resolve(0)
          })
          .catch(function (error) {
            console.timeEnd("LocalUpload");
            console.log("Upload status: error");
            startRemoteUpload(file);
          });
    }

    const startRemoteUpload = (resolve, reject) => {
        console.log("REMOTE UPLOADING");
        resolve(0);
        return;
/*        if (this.remoteAvailable) {
            if (file.size < (this.state.maxFileSize * 1024)) {
                console.log("Upload remotely");
                this.dialogDownloading(LOADING, 0);
                let storageRef = firebase.storage().ref();
                let fileRef = storageRef.child('userfiles/' + this.state.clientId + '/' + file.name);
                let metadata = {
                    contentType: 'application/octet-stream',
                };
                let uploadTask = fileRef.put(file, metadata);
                let context = this;
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    function(snapshot) {
                        let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        console.log('Upload is ' + progress + '% done');
                        context.dialogDownloading(LOADING, progress);
                    }, function(error) {
                        context.dialogDownloading(HIDE);
                        console.log("Event (" + context.state.clientId + ") : error");
                        firebase.database().ref('links/' + context.state.clientId + '/client' ).set({
                            geturl: "error"
                        });
                        context.updateQR();
                    }, function() {
                        context.dialogDownloading(HIDE);
                        uploadTask.snapshot.ref.getDownloadURL().then(
                            function(downloadURL) {
                                console.log("Event (" + context.state.clientId + ") : restart");
                                firebase.database().ref('links/' + context.state.clientId + '/client' ).set({
                                    geturl: downloadURL
                                });
                                firebase.database().ref('files/' + context.state.clientId).set({
                                    timestamp: Date.now(),
                                    userid: context.state.clientId,
                                    fileref: "/userfiles/" + context.state.clientId + "/" + file.name
                                });
                                context.updateQR();
                            }
                        );
                    });
            } else {
                console.log("Upload remotely abort. File too large for remote transfer.");
                this.dialogDownloading(HIDE);
                this.dialogMessage(SHOW, "File too large for remote transfer");
                console.log("Event (" + this.state.clientId + ") : error");
                firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
                    geturl: "error"
                });
                this.updateQR();
            }
        } else {
            console.log("Upload remotely abort. Maximum file transfers per day limit reached.");
            this.dialogDownloading(HIDE);
            this.dialogMessage(SHOW, "Maximum file transfers per day limit reached");
            console.log("Event (" + this.state.clientId + ") : error");
            firebase.database().ref('links/' + this.state.clientId + '/client' ).set({
                geturl: "error"
            });
            this.updateQR();
        } */
    }

    return new Promise( (resolve, reject) => {
        if (uploadState.address.match( /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ ) !== null) {
            let url = config.localProtocol + '://' + uploadState.address + ":" + config.localPort;
            timerId = setTimeout(abortLocalUpload, config.localTimeOut, resolve, reject);
            request = $.ajax({
                url: url,
                success: () => {
                    console.log("OK");
                    clearTimeout(timerId);
                    startLocalUpload(resolve, reject);
                }
            });
        } else {
            startRemoteUpload(resolve, reject);
        }
    })
}
