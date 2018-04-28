import React, { Component } from 'react';
import { connect } from 'react-redux';
import {TweenMax} from "gsap";

import * as actions from '../actions';

import $ from 'jquery';

const Tools = require('../utils/tools');
const os = require('os');
/*
* There are notifications for:
* ECC news (can be deleted) (can be stacked)
* Application update available (permanent notification)
* Staking earnings and earnings from file storage hosting (can be deleted) (can be stacked)
* Messaging (can be deleted) (can be stacked)
* Upcoming payments (permanent notification, until paid or expiration date) (can be stacked)
* File storage running out of space (can be deleted, let user decide when to warn again or something)
*/

class NotificationPopup extends React.Component {
 constructor() {
    super();
    this.getNotificationsBody = this.getNotificationsBody.bind(this);
    this.getNewsNotifications = this.getNewsNotifications.bind(this);
    this.handleHoverAnsPayments = this.handleHoverAnsPayments.bind(this);
    this.handleHoverOutAnsPayments = this.handleHoverOutAnsPayments.bind(this);
  }

  componentDidMount(){
    $('#newsNotifications').on("click", () => {
      this.props.setSelectedPanel("news");
      this.props.setNotifications(false);
      this.props.selectedSideBar("news");
      this.props.setShowingNews(true);
    });
    $('#earningsNotification').on("click", () => {
      this.props.setSelectedPanel("transactions");
      this.props.setTransactionsData(this.props.transactions, "generate");
      this.props.selectedSideBar("wallet", "transactions");
      this.props.setNotifications(false);
    });
    $('#applicationUpdate').on("click", () => {
      this.props.setUpdateApplication(true);
      this.props.setNotifications(false);
    });
    $('#notificationContainer').on("click", (event) => {
      event.stopPropagation();
    });
    setTimeout(() => {
      this.subscribeToEvent();
    }, 100);
  }

  subscribeToEvent(){
    $(window).on("click", () => {
      this.props.setNotifications(false)
    });
  }

  componentWillUnmount(){
    $(window).off();
    $('#notificationContainer').off();
  }

  handleCancel(){
    this.props.setUnlocking(false);
  }

  getNotificationsBody(){
    if(this.props.notifications["total"] === 0 && !this.props.updateAvailable){
      return(
        <p id="noNotifications" className="notificationsHeaderContentFix">{ this.props.lang.noNotifications }</p>
      )
    }
    else{
      return(
        <div id="notificationsBody">
          {this.getNewsNotifications()}
          {this.getStakingNotifications()}
          {this.getAnsIncomingPayments()}
          {this.getUpdateNotification()}
        </div>
      )
    }
  }

  handleHoverAnsPayments(){
    TweenMax.fromTo('#payAns', 0.3, {autoAlpha:0, scale:0.5}, {autoAlpha: 1, scale:1})
  }

  handleHoverOutAnsPayments(){
    TweenMax.fromTo('#payAns', 0.3, {autoAlpha:1, scale: 1}, {autoAlpha: 0, scale:0.5})
  }

  getAnsIncomingPayments(){
    if(this.props.notifications["ansPayments"]["payments"].length === 0){
      return null;
    }
    let earnings = Tools.getIconForTheme("overview", false);
    let ansPaymentsObject = this.props.notifications["ansPayments"];
    let totalAnsPayments = ansPaymentsObject["payments"].count;
    let date = ansPaymentsObject["firstDueDate"];
    let body = <p id="mediumPosts">{ this.props.lang.ansPayment } - {Tools.formatNumber(ansPaymentsObject["payments"][0]["cost"])} <span className="ecc">ECC</span></p>;
    const today = new Date();
    let time = Tools.calculateTimeTo(this.props.lang, today, new Date(date));
    if(totalAnsPayments > 1)
     body = <p id="mediumPosts">{totalAnsPayments} { this.props.lang.ansPayments } - {Tools.formatNumber(ansPaymentsObject["payments"][0]["cost"])} <span className="ecc">ECC</span></p>;
    return(
      <div style={{position: "relative"}} onMouseEnter={this.handleHoverAnsPayments} onMouseLeave={this.handleHoverOutAnsPayments}>
        <NotificationItem
          id="ansPaymentsNotification"
          handleMouseIn={this.props.handleHoverPayments}
          image = {earnings}
          body = {body}
          time = {time}
          class = {this.props.last === "incomingStakingPayments" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners resetCursor" : "notificationItem newsItemBorder resetCursor" }/>
          <div className="payAns" id="payAns">
            <p>{totalAnsPayments > 1 ? this.props.lang.extendANSSubscriptions : this.props.lang.extendANSSubscription }</p>
          </div>
        </div>
    )
  }

  getUpdateNotification(){
    if(!this.props.updateAvailable) return null;
    let settings = require('../../resources/images/settings-white.png');
    let body = <p>{ this.props.lang.clickToUpdateApp }</p>;
    let className = "applicationUpdate";
    if(this.props.notifications["differentKinds"] === 0){
      className = "applicationUpdateOnlyNotif"
    }
    return(
      <div className={className} id="applicationUpdate">
       <img src={settings}/>
        {body}
      </div>
    )
  }

  getStakingNotifications(){
    if(this.props.notifications["stakingEarnings"].total === 0){
      return null;
    }
    let earnings = Tools.getIconForTheme("overview", false);
    let earningsObject = this.props.notifications["stakingEarnings"];
    let totalEarnings = earningsObject.count;
    let date = earningsObject.date;
    let body = <p id="mediumPosts">{ this.props.lang.stakingReward } - {Tools.formatNumber(earningsObject["total"])} <span className="ecc">ECC</span></p>;
    const today = new Date();
    let time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if(totalEarnings > 1)
     body = <p id="mediumPosts">{totalEarnings} { this.props.lang.stakingRewards } - {Tools.formatNumber(earningsObject["total"])} <span className="ecc">ECC</span></p>;
    return(
      <NotificationItem
        id="earningsNotification"
        image = {earnings}
        body = {body}
        time = {time}
        class = {this.props.last === "earnings" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners" : "notificationItem newsItemBorder" }/>
    )
  }

  getNewsNotifications(){
    if(this.props.notifications["news"].total === 0){
      return null;
    }
    let news = Tools.getIconForTheme("eccNewsNotif", false);
    let totalNews = this.props.notifications["news"].total;
    let date = this.props.notifications["news"].date;
    let newsBody = <p id="mediumPosts">{ this.props.lang.newMediumPost }</p>;
    const today = new Date();
    let time = Tools.calculateTimeSince(this.props.lang, today, new Date(date));
    if(totalNews > 1)
      newsBody = <p id="mediumPosts">{totalNews} { this.props.lang.newMediumPosts }</p>;
    return(
      <NotificationItem
        id="newsNotifications"
        image = {news}
        body = {newsBody}
        time = {time}
        class = {this.props.last === "news" && !this.props.updateAvailable ? "notificationItem newsItemRoundCorners" : "notificationItem newsItemBorder" }/>
    )
  }

  getNotificationsCounter(){
    if(this.props.notifications["total"] === 0 && !this.props.updateAvailable){
      return null;
    }
    return(
      <div id="notificationCounter">
        <p>{this.props.updateAvailable ? 1 + this.props.notifications["total"] : this.props.notifications["total"]}</p>
      </div>
    )
  }

  render() {
     return (
      <div ref="second">
        <div id="notificationContainer" className={process.platform === 'darwin' ? "notificationContainerMac" : ""}>
          <div id="notificationHeader">
            <div id="notificationsHeaderContent" style={{top: this.props.notifications["total"] === 0 && !this.props.updateAvailable ? "6px" : "0px"}}>
            <p>{ this.props.lang.notifications }</p>
            {this.getNotificationsCounter()}
          </div>
          </div>
          {this.getNotificationsBody()}
        </div>
      </div>
      );
    }
}

const mapStateToProps = state => {
  return{
    lang: state.startup.lang,
    notifications: state.notifications.entries,
    transactions: state.chains.transactionsData,
    last: state.notifications.entries["last"],
    updateAvailable: state.startup.guiUpdate || state.startup.daemonUpdate,
  };
};


export default connect(mapStateToProps, actions)(NotificationPopup);


class NotificationItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.class} id={this.props.id}>
       <img src={this.props.image}/>
        {this.props.body}
        <p className="timeNews">{this.props.time}</p>
      </div>
    );
  }
}
