import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax, TimelineMax} from "gsap";
import * as actions from '../../actions';
import CloseButtonPopup from '../Others/CloseButtonPopup';
import ConfirmButtonPopup from '../Others/ConfirmButtonPopup';
import Input from '../Others/Input';
import $ from 'jquery';
const Tools = require('../../utils/tools');

class ChangePassword extends React.Component {
 constructor() {
    super();
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  showWrongPassword(){
    Tools.showTemporaryMessage('#wrongPassword');
  }

  componentWillUnmount(){
    this.props.setPassword("");
    this.props.passwordConfirmation("");
    this.props.setNewPassword("");
  }

  handlePasswordChange(event) {
    let pw = event.target.value;
    if(pw.length === 0){
      TweenMax.set('#enterPassword', {autoAlpha: 1});
    }
    else
      TweenMax.set('#enterPassword', {autoAlpha: 0});

    this.props.setPassword(pw);
  }

  handlePasswordConfirmationChange(event){
    let pw = event.target.value;
    if(pw.length === 0){
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 1});
    }
    else
      TweenMax.set('#enterPasswordRepeat', {autoAlpha: 0});

    this.props.passwordConfirmation(pw)
  }

  handleNewPasswordChange(event){
    let pw = event.target.value;
    if(pw.length === 0){
      TweenMax.set('#enterPasswordConfirmation', {autoAlpha: 1});
    }
    else
      TweenMax.set('#enterPasswordConfirmation', {autoAlpha: 0});

    this.props.setNewPassword(pw)
  }

  changePassword(){
    let wasStaking = this.props.isStaking;
    this.props.wallet.walletChangePassphrase(this.props.passwordVal, this.props.newPassword).then((data)=>{
      if(data === null){
        if(wasStaking){

        }
        Tools.showTemporaryMessage('#wrongPassword', this.props.lang.operationSuccessful );
        setTimeout(()=>{
          this.props.setChangingPassword(false)
        }, 2000)
      }
      else if(data.code && data.code === -14){
        Tools.showTemporaryMessage('#wrongPassword', this.props.lang.wrongPasswordProper );
      }
      this.props.setPopupLoading(false)
    })
    .catch((err) => {
      console.error(err);
      this.props.setPopupLoading(false)
    });
  }

  handleConfirm(){
    if(this.props.passwordVal === "" || this.props.passwordValConfirmation === "" || this.props.newPassword === ""){
      Tools.showTemporaryMessage('#wrongPassword', this.props.lang.fillAllFields );
    }
    else if(this.props.newPassword !== this.props.passwordValConfirmation){
      Tools.showTemporaryMessage('#wrongPassword', this.props.lang.passwordsDontMatch );
    }
    else{
      this.props.setPopupLoading(true);
      this.changePassword();
    }
  }

  handleCancel(){
    this.props.setChangingPassword(false)
  }

  render() {
     return (
      <div className="changePassword">
        <CloseButtonPopup handleClose={this.handleCancel}/>
        <p className="popupTitle">{ this.props.lang.changePassword }</p>
        <Input
          divStyle={{marginTop: "45px", width: "300px"}}
          placeholder= { this.props.lang.currentPassword }
          placeholderId="enterPassword"
          placeHolderClassName="inputPlaceholder changePasswordInput"
          value={this.props.passwordVal}
          handleChange={this.handlePasswordChange.bind(this)}
          type="password"
          inputId="enterPasswordId"
          inputStyle={{width: "300px"}}
          autoFocus={true}
        />
        <Input
          divStyle={{marginTop: "20px", width: "300px"}}
          placeholder= {  this.props.lang.newPassword}
          placeholderId="enterPasswordRepeat"
          placeHolderClassName="inputPlaceholder changePasswordInput"
          value={this.props.passwordValConfirmation}
          handleChange={this.handlePasswordConfirmationChange.bind(this)}
          type="password"
          inputId="newPasswordId"
          inputStyle={{width: "300px"}}
        />
        <Input
          divStyle={{marginTop: "20px", width: "300px"}}
          placeholder= { this.props.lang.repeatPassword }
          placeholderId="enterPasswordConfirmation"
          placeHolderClassName="inputPlaceholder changePasswordInput"
          value={this.props.newPassword}
          handleChange={this.handleNewPasswordChange.bind(this)}
          type="password"
          inputId="repeatNewPasswordId"
          inputStyle={{width: "300px"}}
        />
        <p id="wrongPassword" className="wrongPassword" style= {{paddingTop:"10px"}}>{ this.props.lang.wrongPassword }</p>
        <ConfirmButtonPopup inputId={"#enterPasswordId, #enterPasswordId, #repeatNewPasswordId"} handleConfirm={this.handleConfirm} textLoading={this.props.lang.confirming} text={ this.props.lang.confirm }/>
      </div>
      );
    }

}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    passwordVal: state.application.password,
    passwordValConfirmation: state.setup.confirmationPassword,
    newPassword: state.application.newPassword,
    isStaking: state.chains.isStaking,
    wallet: state.application.wallet
  };
};


export default connect(mapStateToProps, actions)(ChangePassword);
