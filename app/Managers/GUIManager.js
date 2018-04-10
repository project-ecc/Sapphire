const electron = require('electron');
const fs = require('fs');
const { ipcRenderer } = require('electron');
const { app } = require('electron');
const request = require('request-promise-native');
const homedir = require('os').homedir();
var https = require('https');
const event = require('../utils/eventhandler');
const os = require('os');
const psList = require('ps-list');
const { exec } = require('child_process');
import Client from 'eccoin-js';
import {grabWalletDir} from "../utils/platform.service";
import {version} from './../../package.json';
var cp = require('child_process');
var checksum = require('checksum');
import {downloadFile} from "../utils/downloader";
import {getSapphireDownloadUrl} from "../utils/platform.service";


class GUIManager{

	constructor(){
		this.path = grabWalletDir();
		this.os = require("os");
		this.arch = os.arch();
		this.os = process.platform;
		this.arch = process.arch;
		this.installedVersion = version;
		this.currentVersion = -1;
		this.getLatestVersion();
		this.upgrading = false;
		this.toldUserAboutUpdate = false;
		console.log("wallet version: ", this.installedVersion);
		event.on('updateGui', () => {
			this.downloadGUI();
		});
	}

	getLatestVersion(){
    console.log('checking for latest gui version');

    const guiDownloadURL = getSapphireDownloadUrl();
    // download latest daemon info from server
    const opts = {
      url: guiDownloadURL
    };

    request(opts).then((data) => {
      const parsed = JSON.parse(data);
      this.currentVersion = parsed.versions[0].name.substring(1);
      if(this.currentVersion !== this.installedVersion && !this.upgrading && !this.toldUserAboutUpdate){
        this.toldUserAboutUpdate = true;
        event.emit('guiUpdate');
      }
      setTimeout(this.getLatestVersion.bind(this), 60000);
    }).catch(error => {
      console.log(error);
    });
	}


	downloadGUI() {

    const walletDirectory = grabWalletDir();
    const guiDownloadURL = getSapphireDownloadUrl();

		console.log("going to download GUI");
		this.upgrading = true;
		const self = this;

    return new Promise((resolve, reject) => {
      console.log('downloading GUI');

      // download latest daemon info from server
      const opts = {
        url: guiDownloadURL
      };

      request(opts).then(async (data) => {
        console.log('gui response' + data)
        const parsed = JSON.parse(data);
        const latestGui = parsed.versions[0];
        const zipChecksum = latestGui.checksum;
        const downloadUrl = latestGui.download_url;
        console.log('download URL:' +downloadUrl)

        const downloaded = await downloadFile(downloadUrl, walletDirectory,'Sapphire.zip', zipChecksum, true)
          .catch(error => console.log(error));;

        if (downloaded) {
          console.log("Done downloading gui");
          try{
            self.downloading = false;
            self.installedVersion = self.currentVersion;
            const child = cp.fork("./app/Managers/UpdateGUI", {detached:true});
            app.quit();
          }catch(e){
            console.log(e);
          }
        } else {
          self.downloadGUI();
          // reject(downloaded);
        }
      }).catch(error => {
        console.log(error);
        reject(false);
      });
    });
	}

}

module.exports = GUIManager;
