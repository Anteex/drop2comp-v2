import { config } from '../config'
import axios from 'axios'
import $ from 'jquery'
import * as firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'
import { OK, ERROR_MAX_FILE_PER_DAY, ERROR_MAX_REMOTE_SIZE, ERROR_REMOTE_UPLOAD, ERROR_FATAL } from '../helpers/const'


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
            resolve(OK)
          })
          .catch(function (error) {
            console.timeEnd("LocalUpload");
            console.log("Upload status: error");
            reject(ERROR_FATAL);
          });
    }

    const startRemoteUpload = (resolve, reject) => {
        if (uploadState.remoteAvailable) {
            if (file.size < (uploadState.remoteMaxSize * 1024)) {
                console.log("Upload remotely");
                let storageRef = firebase.storage().ref();
                let fileRef = storageRef.child('userfiles/' + clientId + '/' + file.name);
                let metadata = {
                    contentType: 'application/octet-stream',
                };
                let uploadTask = fileRef.put(file, metadata);
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                    function(snapshot) {
                        let perc = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        console.log('Upload is ' + perc + '% done');
                        progress(perc);
                    }, function(error) {
                        reject(ERROR_REMOTE_UPLOAD);
                    }, function() {
                        uploadTask.snapshot.ref.getDownloadURL().then(
                            function(downloadURL) {
                                let url = firebase.database().ref('multiupload/' + clientId + '/' ).push();
                                url.set({
                                    url: downloadURL,
                                    timestamp: Date.now(),
                                });
                                let filesRef = firebase.database().ref('files/').push();
                                filesRef.set({
                                    timestamp: Date.now(),
                                    userid: clientId,
                                    fileref: "/userfiles/" + clientId + "/" + file.name
                                });
                                resolve(OK)
                            }
                        )
                    })
            } else {
                console.log("Upload remotely abort. File too large for remote transfer.");
                reject(ERROR_MAX_REMOTE_SIZE);
            }
        } else {
            console.log("Upload remotely abort. Maximum file transfers per day limit reached.");
            reject(ERROR_MAX_FILE_PER_DAY);
        }
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
