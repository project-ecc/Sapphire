import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { SettingsIcon, CloudUploadIcon, FileExportIcon } from 'mdi-react';
import * as actions from '../../actions/index';
import Toast from '../../globals/Toast/Toast';
import ExportPrivateKeysModal from './partials/ExportPrivateKeysModal';
import ChangePasswordModal from './partials/ChangePasswordModal';
import ImportPrivateKeysModal from './partials/ImportPrivateKeysModal';

import UnencryptedWalletPartial from './cards/UnencryptedWalletCard'

import Header from '../Others/Header';
import Body from '../Others/Body';

const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

class Wallet extends Component {
  constructor(props) {
    super(props);

    this.onClickBackupLocation = this.onClickBackupLocation.bind(this);
    this.handleExportPrivateKeys = this.handleExportPrivateKeys.bind(this);
    this.handleChangePasswordClicked = this.handleChangePasswordClicked.bind(this);
    this.handleImportPrivateKey = this.handleImportPrivateKey.bind(this);
  }

  backupWallet(location) {
    this.props.wallet.command([{
      method: 'backupwallet', parameters: [location]
    }]).then(data => {
      //Work on error handling
      if (data[0] === null) {
        Toast({
          title: this.props.lang.exportedWallet,
          message: location,
          color: 'green'
        });
      } else {
        Toast({
          title: this.props.lang.exportFailed,
          message: "error backing up wallet: " + data,
          color: 'red'
        });
      }
      this.props.setBackupOperationInProgress(false);
    }).catch(err => {
      this.props.setBackupOperationInProgress(false);
      Toast({
        title: this.props.lang.exportFailed,
        message: "error backing up wallet: " + err,
        color: 'red'
      });
    })
  }

  onClickBackupLocation() {
    if(this.props.backingUpWallet) return;
    this.props.setBackupOperationInProgress(true);
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, (folderPaths) => {
      if (folderPaths === undefined) {
        this.props.setBackupOperationInProgress(false);
        return;
      }

      this.backupWallet(`${folderPaths}/walletBackup.dat`);
    });
  }

  handleExportPrivateKeys(){
    this.modal.getWrappedInstance().toggle();
  }

  handleChangePasswordClicked(){
    this.passwordModal.getWrappedInstance().toggle();
  }

  handleImportPrivateKey(){
    this.importKeysModal.getWrappedInstance().toggle();
  }

  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          <SettingsIcon />
          { this.props.lang.wallet }
        </Header>
        <Body>
          { this.props.unencryptedWallet && (
            <UnencryptedWalletPartial />
          )}
          <p id="walletBackup">{ this.props.lang.backup }</p>
          <p id="walletBackupExplanation" className="mt-3">{ this.props.lang.backupExplanation }</p>
          <div className="d-flex justify-content-center mt-3">
            <Button onClick={this.onClickBackupLocation} color="warning">
              { this.props.lang.backup } wallet.dat
              <CloudUploadIcon className="ml-2" />
            </Button>
            <Button onClick={this.handleExportPrivateKeys} color="warning" className="ml-3" disabled={this.props.unencryptedWallet}>
              { this.props.lang.exportPrivateKeys }
              <FileExportIcon className="ml-2" />
            </Button>
          </div>

          <div className="mt-3">
            { !this.props.unencryptedWallet && (
              <div className="row settingsToggle">
                <div className="col-sm-10 text-left removePadding">
                  <p className="walletBackupOptions">{ this.props.lang.password }</p>
                </div>
                <div className="col-sm-2 text-right removePadding">
                  <Button color="link" onClick={this.handleChangePasswordClicked}>{ this.props.lang.change }</Button>
                </div>
              </div>
            )}
            <div className="row settingsToggle" >
              <div className="col-sm-10 text-left removePadding">
                <p className="walletBackupOptions">{ this.props.lang.privateKey }</p>
              </div>
              <div className="col-sm-2 text-right removePadding">
                <Button color="link" onClick={this.handleImportPrivateKey}>{ this.props.lang.import }</Button>
              </div>
            </div>
          </div>
        </Body>

        <ExportPrivateKeysModal ref={(e) => { this.modal = e; }} />
        <ChangePasswordModal ref={(e) => { this.passwordModal = e; }} />
        <ImportPrivateKeysModal ref={(e) => { this.importKeysModal = e; }} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang,
    wallet: state.application.wallet,
    backingUpWallet: state.application.backingUpWallet,
    unencryptedWallet: state.startup.unencryptedWallet
  };
};

export default connect(mapStateToProps, actions)(Wallet);
