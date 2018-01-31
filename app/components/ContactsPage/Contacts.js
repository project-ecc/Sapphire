import $ from 'jquery';
import React, { Component } from 'react';
import Wallet from '../../utils/wallet';
import { traduction } from '../../lang/lang';
const homedir = require('os').homedir();
import * as actions from '../../actions';
import connectWithTransitionGroup from 'connect-with-transition-group';
import { connect } from 'react-redux';
import AddressBook from '../SendTransactions/AddressBook';
import low from '../../utils/low';

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.handleChangeNewContactName = this.handleChangeNewContactName.bind(this);
    this.handleChangeNewContactAddress = this.handleChangeNewContactAddress.bind(this);
    this.addContact = this.addContact.bind(this);
    this.addNormalAddress = this.addNormalAddress.bind(this);
    this.resetFields = this.resetFields.bind(this);
    this.wallet = new Wallet();
  }

  componentDidMount(){
    if(this.props.newContactName)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});
    if(this.props.newContactAddress)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});
  }

  handleChangeNewContactName(event){
    const name = event.target.value;
    if(name.length == 0)
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 0});

    this.props.setNewContactName(name);

  }

  handleChangeNewContactAddress(event){
    const address = event.target.value;
    if(address.length == 0)
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
    else 
      TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 0});

    this.props.setNewContactAddress(address);
  }

  addContact(){
    if(this.props.newContactName == "" && this.props.newContactAddress == ""){
      TweenMax.to('#newContactAddress', 0.3, {css:{borderBottom: "2px solid #d09128"}});
      TweenMax.to('#newContactAddress', 0.3, {css:{borderBottom: "2px solid #1c2340"}, delay: 1});
    }
    else if(this.props.newContactAddress != ""){
      //normal address
      console.log("adding normal address")
      this.addNormalAddress();
    }
    else{
      //ANS address
    }
  }

  addressAlreadyExists(){
    TweenMax.fromTo('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressExists', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addressAddedSuccessfuly(){
    TweenMax.fromTo('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressAdded', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addressInvalid(){
    TweenMax.fromTo('#addressInvalid', 0.2, {autoAlpha: 0, scale: 0.5}, {autoAlpha: 1, scale: 1});
    TweenMax.to('#addressInvalid', 0.2, {autoAlpha: 0, scale: 0.5, delay: 3});
  }

  addNormalAddress() {
    const self = this;

    this.wallet.validate(this.props.newContactAddress).then((isAddressValid) => {
      console.log(isAddressValid)
        if (isAddressValid.isvalid) {
          const tt = low.get('friends').find({ address: self.props.newContactAddress }).value();
          if (tt != null) {
            self.addressAlreadyExists();
            self.resetFields();
            return;
          } else {
            const name = self.props.newContactName;
            const address = self.props.newContactAddress;
            if (address !== '') {
              low.get('friends').push({ name, address }).write();
              const friendList = low.get('friends').value();
              self.props.setContacts(friendList);
              //this is a temporary workaround because setContacts is not triggering a re-render of AddressBook.js
              this.props.setHoveredAddress(["a"]);
              self.resetFields();
              self.addressAddedSuccessfuly();
            }
          }
        } 
        else{
          this.addressInvalid()
          this.resetFields(false);
        }
        
    }).catch((err) => {
      console.log(err);
    });
  }


  resetFields(){
    this.props.setNewContactAddress("");
    TweenMax.set('#addressAccountPlaceHolder', {autoAlpha: 1});
    this.props.setNewContactName("");
    TweenMax.set('#addressNamePlaceHolder', {autoAlpha: 1});
  }

  render() {
    return (
      <div className="sendPanel" style={{height: "100%", width: "100%", paddingLeft: "40px", paddingRight: "40px", overflowX: "hidden"}}>
        <AddressBook sendPanel={false}/>
        <div style={{position: "relative", top: "60px"}}>
          <p id="addressExists" style={{position: "absolute", width:"100%", textAlign: "center", color: "#d09128", fontSize: "15px", visibility: "hidden"}}>Contact already exists</p>
          <p id="addressAdded" style={{position: "absolute", width:"100%", textAlign: "center", color: "#d09128", fontSize: "15px", visibility: "hidden"}}>Contact added successfully</p>
          <p id="addressInvalid" style={{position: "absolute", width:"100%", textAlign: "center", color: "#d09128", fontSize: "15px", visibility: "hidden"}}>Invalid Address</p>
        </div>
        <div id="inputAddress" style={{width: "750px", margin: "0 auto", position: "relative", marginTop:"80px"}}>
          <div style={{display: "inline-block", width: "70%", position: "relative"}}>
          <div id="addressName">
              <p id="addressNamePlaceHolder" style={{position:"absolute", top: "5px", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>Name</p>
              <input id="newContactName" className="privateKey" type="text" style={{textAlign: "left", margin: "0 0", width:"100%", display: "inline-block", position: "relative", color: "#555d77", fontWeight: "600", fontSize: "15px"}} value={this.props.newContactName} onChange={this.handleChangeNewContactName} autoFocus></input>
            </div>
            <div id="addressAccount" style={{position: "relative",  marginTop: "10px"}}>
              <p id="addressAccountPlaceHolder" style={{position:"absolute", top: "5px", color: "#555d77", fontSize: "15px", fontWeight: "600", left: "2px"}}>Address</p>
              <input id="newContactAddress" className="privateKey" type="text" style={{textAlign: "left", margin: "0 0", width:"100%", display: "inline-block", position: "relative", color: "#555d77", fontWeight: "600", fontSize: "15px"}} value={this.props.newContactAddress} onChange={this.handleChangeNewContactAddress}></input>
            </div>
          </div>
            <div onClick={this.addContact} className="buttonUnlock" style={{marginLeft: "20px", display: "inline-block", background: "-webkit-linear-gradient(top, rgb(214, 167, 91) 0%, rgb(162, 109, 22) 100%)", color: "#d9daef", width: "auto", padding: "0px 20px", top:"29px"}}>
             Add Contact
            </div>
            <p id="ansExplanation" style={{display: "inline-block", color: "#555d77", fontSize: "14px", fontWeight: "600", position: "relative", top:"15px", width:"660px"}}>Type the name of an <span className="ecc">ANS contact</span> and click to add him or fill the Address input (+ optional Name) to add a regular address.</p>
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    newContactName: state.application.newContactName,
    newContactAddress: state.application.newContactAddress
  };
};

export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(Contacts));
