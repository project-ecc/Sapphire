import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";

class SetupDone extends React.Component {
 constructor() {
    super();
  }

  renderNewUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>Setup done!</p>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300"}}>Your wallet is now going to sync to the blockchain. <br></br>This process takes some time, please be patient.</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>Thank you for chosing <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  renderExistingUser(){
    return(
      <div>
        <p style={{marginTop: "30px", fontSize: "21px", fontWeight:"300", marginTop:"55px"}}>Setup done!</p>
        <p style={{marginTop: "50px", fontSize: "21px", fontWeight:"300"}}>Thank you for chosing <span className="ecc">ECC</span>!</p>
      </div>
    )
  }

  componentWillMount(){
    this.props.setSetupDoneInternal(true);
  }

  render() { 
    const toReturn = this.props.paymentChainSync < 95 ? this.renderNewUser() : this.renderExistingUser();
     return (
      <div>
        {toReturn}
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    paymentChainSync: state.chains.paymentChainSync
  };
};


export default connect(mapStateToProps, actions)(SetupDone);