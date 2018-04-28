import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToggleButton from 'react-toggle';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import glob from 'glob';

import { exchanges } from '../utils/exchange';
import { traduction } from '../lang/lang';
import * as actions from '../actions';

const Tools = require('../utils/tools');
const event = require('../utils/eventhandler');
const homedir = require('os').homedir();
const lang = traduction();

class Home extends Component {
  constructor(props) {
    super(props);
    this.processStakingClicked = this.processStakingClicked.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
    this.getEarnings = this.getEarnings.bind(this);
    this.getUpcomingPayments = this.getUpcomingPayments.bind(this);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  processStakingClicked(){
    if(!this.props.staking) {
      this.props.setUnlocking(true);
    } else {
      this.lockWallet().then(() => {
        this.props.wallet.setGenerate().then(() => {
          this.props.setStaking(false);
        });
      });
    }
  }

  async lockWallet(){
    //const updated = await Tools.updateConfig(0);
    //if (updated){

      var batch = [];
      var obj = {
        method: 'walletlock', parameters: []
      };
      batch.push(obj);

      this.props.wallet.command(batch).then((data) => {
        console.log("data: ", data);
        data = data[0];
        if (data !== null && data.code === 'ECONNREFUSED') {
          console.log("daemon not working?")
        } else if (data !== null) {
          console.log("error unlocking wallet: ", data)
        }
      }).catch((err) => {
        console.log("err unlocking wallet: ", err);
      });
    //}
  }

  earningsFilterClicked(filter){
    this.props.setFilterEarningsTime(filter);
  }

  earningsTypeFilterClicked(filter){
    this.props.setFilterEarningsType(filter);
  }

  expensesFilterClicked(filter){
    this.props.setFilterExpensesTime(filter);
  }

  expensesTypeFilterClicked(filter){
    this.props.setFilterExpensesType(filter);
  }

  buildFilterObject(modifier, val) {
    return {
      modifier,
      val,
    }
  }

  getEarnings() {
    // Getting clever
    const timeFilter = [
      this.buildFilterObject('AllTime', this.props.allTimeEarningsSelected),
      this.buildFilterObject('Month', this.props.monthEarningsSelected),
      this.buildFilterObject('Week', this.props.weekEarningsSelected),
    ].filter(f => f.val)[0];

    const typeFilter = [
      this.buildFilterObject(['fileStorage', 'staking'], this.props.allEarningsSelected),
      this.buildFilterObject(['fileStorage'], this.props.fileStorageEarningsSelected),
      this.buildFilterObject(['staking'], this.props.stakingEarningsSelected),
    ].filter(f => f.val)[0];

    return typeFilter.modifier
                  .map(modifier => `${modifier}${timeFilter.modifier}Earnings`)
                  .reduce((accumulator, val) => accumulator + parseFloat(this.props[val]), 0);
  }

  getExpenses() {
    //filter all
    if(this.props.allTimeExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageAllTimeExpenses + this.props.messagingAllTimeExpenses + this.props.ansAllTimeExpenses;
    else if(this.props.monthExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageMonthExpenses + this.props.messagingMonthExpenses + this.props.ansMonthExpenses;
    else if(this.props.weekExpensesSelected && this.props.allExpensesSelected)
      return this.props.fileStorageWeekExpenses + this.props.messagingWeekExpenses + this.ansWeekExpenses;
    //filter file storage
    else if(this.props.fileStorageExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.fileStorageAllTimeExpenses;
    else if(this.props.fileStorageExpensesSelected && this.props.monthExpensesSelected)
      return this.props.fileStorageMonthExpenses;
    else if(this.props.fileStorageExpensesSelected && this.props.weekExpensesSelected)
      return this.props.fileStorageWeekExpenses;
    //filter messaging
    else if(this.props.messagingExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.messagingAllTimeExpenses;
    else if(this.props.messagingExpensesSelected && this.props.monthExpensesSelected)
      return this.props.messagingMonthExpenses;
    else if(this.props.messagingExpensesSelected && this.props.weekExpensesSelected)
      return this.props.messagingWeekExpenses;
    //filter ans
    else if(this.props.ansExpensesSelected && this.props.allTimeExpensesSelected)
      return this.props.ansAllTimeExpenses;
    else if(this.props.ansExpensesSelected && this.props.monthExpensesSelected)
      return this.props.ansMonthExpenses;
    else if(this.props.ansExpensesSelected && this.props.weekExpensesSelected)
      return this.props.ansWeekExpenses;
  }

  handleHoverAnsPayments(element){
    //TweenMax.fromTo(element, 0.3, {autoAlpha:0, scale:0.5}, {autoAlpha: 1, scale:1})
  }

  handleHoverOutAnsPayments(element){
    //TweenMax.fromTo(element, 0.3, {autoAlpha:1, scale: 1}, {autoAlpha: 0, scale:0.5})
  }

  getUpcomingPayments(){
    if(this.props.notifications["ansPayments"]["payments"].length === 0)
      return (<p className="noIcomingPayments">{this.props.lang.noUpcomingPayments}</p>);
    else{
      const payments = this.props.notifications["ansPayments"]["payments"];
      const today = new Date();
      return(
        <div>
          {payments.map((payment, index) => {
            let time = Tools.calculateTimeTo(this.props.lang, today, new Date(payment["dueDate"]));
            let amount = payment["cost"];
            return(
              <div key={amount + index} onMouseEnter={this.handleHoverAnsPayments.bind(this, "#payAns" + index)} onMouseLeave={this.handleHoverOutAnsPayments.bind(this, "#payAns" + index)} className="home__ans-payment">
                <div className="payAns" id={"payAns" + index}>
                  <p>{this.props.lang.extendANSSubscription }</p>
                </div>
                <p className="home__ans-payment-time">{time}</p>
                <span className="home__ans-payment-ans">ANS </span> <span className="home__ans-payment-amount">{amount}</span><span className="ecc"> ecc</span>
              </div>
            )
          }

          )}
        </div>
      )
    }
  }

  render() {
    let fileStorageEarnings = Tools.getIconForTheme("fileStorageNotSelected", false);
    if(this.props.fileStorageEarningsSelected)
      fileStorageEarnings = Tools.getIconForTheme("fileStorageSelected", false);

    let fileStorageExpenses = Tools.getIconForTheme("fileStorageNotSelected", false);
    if(this.props.fileStorageExpensesSelected)
      fileStorageExpenses = Tools.getIconForTheme("fileStorageSelected", false);

    let messaging = Tools.getIconForTheme("messagingNotSelected", false);
    if(this.props.messagingExpensesSelected)
      messaging = Tools.getIconForTheme("messagingSelected", false);

    return (
        <div id ="homeSections">
          <div className="homeSection text-center" id="balanceInfo">
            <div className="row" style={{margin: "0px 0px"}}>
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="homePanelTitleTwo stakingBalance">{ this.props.lang.staking }</p>
                <p className="normalWeight">{this.props.stakingVal} <span className="ecc">ecc</span></p>
                <div style={{width: "52px", margin: "0 auto", marginTop: "10px"}}>
                <ToggleButton
                  checked={this.props.staking}
                  onChange={() => {
                    this.processStakingClicked();
                  }} />
                </div>
              </div>
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="normalWeight homePanelTitleOne" id="balance" style={{fontSize: "20px"}}>{ this.props.lang.balance }</p>
                <p className="normalWeight" style={{fontSize: "20px"}}>{this.props.balance} <span className="ecc">ecc</span></p>
                <p className="totalBalance homePanelTitleTwo">{ this.props.lang.total }</p>
                <p className="normalWeight">{this.props.total} <span className="ecc">ecc</span></p>
              </div>
              <div className="col-sm-4"  style={{padding: "0 0"}}>
                <p className="unconfirmedBalance homePanelTitleTwo">{ this.props.lang.unconfirmed }</p>
                <p className="normalWeight">{this.props.unconfirmed} <span className="ecc">ecc</span></p>
              </div>
            </div>
          </div>
          <div className="homeSection"  id="earnings">
            <div className="row">
              <div className="col-sm-4 align-self-left" style={{padding: "0 0"}}>
                <div id="earningsOptions">
                  <div className="arrowHome"></div>
                  <div id="earningsFirst">
                    <p className="normalWeight homePanelTitleOne" style={{fontSize: "20px"}}>{ this.props.lang.earnings }</p>
                  </div>
                    <img onClick={this.earningsTypeFilterClicked.bind(this, "fileStorage")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorageEarnings}/>
                    <p onClick={this.earningsTypeFilterClicked.bind(this, "staking")} className={this.props.stakingEarningsSelected ? "earningsFilters textSelected" : "earningsFilters textSelectableHome"}> { this.props.lang.staking } </p>
                    <p onClick={this.earningsTypeFilterClicked.bind(this, "all")} className={this.props.allEarningsSelected ? "earningsFilters textSelected" : "earningsFilters textSelectableHome"}> { this.props.lang.all }</p>
                </div>
              </div>
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>{Tools.formatNumber(this.getEarnings())} <span className="ecc">ecc</span></p>
                <p onClick={this.earningsFilterClicked.bind(this, "week")} className= {this.props.weekEarningsSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}>{ this.props.lang.lastWeek }</p>
                <p onClick={this.earningsFilterClicked.bind(this, "month")} className= {this.props.monthEarningsSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}>{ this.props.lang.lastMonth }</p>
                <p onClick={this.earningsFilterClicked.bind(this, "allTime")} className= {this.props.allTimeEarningsSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}> { this.props.lang.all }</p>
              </div>
            </div>
          </div>
          <div className="homeSection" id="expenses">
            <div className="row" style={{margin: "0px 0px"}}>
              <div className="col-sm-4 align-self-left"  style={{padding: "0 0"}}>
                <div id="earningsOptions">
                  <div className="arrowHome arrowExpenses" style={{left: "0px"}}></div>
                  <div id="earningsFirst" style={{paddingLeft: "50px"}}>
                    <p className="normalWeight homePanelTitleOne" style={{fontSize: "20px"}}>{ this.props.lang.expenses }</p>
                  </div>
                    <img onClick={this.expensesTypeFilterClicked.bind(this, "messaging")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"5px", position:"relative", top: "103px", left: "12px"}} src={messaging}/>
                    <img onClick={this.expensesTypeFilterClicked.bind(this, "fileStorage")} style={{display: "inline-block",  cursor: "pointer", paddingLeft:"20px", position:"relative", top: "103px", left: "12px"}} src={fileStorageExpenses}/>
                    <p onClick={this.expensesTypeFilterClicked.bind(this, "ans")} className={this.props.ansExpensesSelected ? "earningsFilters textSelected" : "earningsFilters textSelectableHome"}> ANS </p>
                    <p onClick={this.expensesTypeFilterClicked.bind(this, "all")} className={this.props.allExpensesSelected ? "earningsFilters textSelected" : "earningsFilters textSelectableHome"}> { this.props.lang.all }</p>
                </div>
              </div>
              <div className="col-sm-4 text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight" style={{fontSize: "20px", position: "relative", top: "60px"}}>0 <span className="ecc">ecc</span></p>
                    <p onClick={this.expensesFilterClicked.bind(this, "week")} className={this.props.weekExpensesSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}>{ this.props.lang.lastWeek }</p>
                    <p onClick={this.expensesFilterClicked.bind(this, "month")} className={this.props.monthExpensesSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}>{ this.props.lang.lastMonth }</p>
                    <p onClick={this.expensesFilterClicked.bind(this, "allTime")} className={this.props.allTimeExpensesSelected ? "earningsFiltersDate textSelected" : "earningsFiltersDate textSelectableHome"}> { this.props.lang.all }</p>
              </div>
              <div className="col-sm-4  text-center"  style={{padding: "0 0"}}>
                  <p className="normalWeight homePanelTitleOne" style={{fontSize: "16px", paddingTop: "15px"}}>{ this.props.lang.nextPayments }</p>
                  {this.getUpcomingPayments()}
              </div>
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => {
  let balance = !state.chains.balance ? 0 : state.chains.balance;
  let staking = !state.chains.staking ? 0 : state.chains.staking;
  let newMint = !state.chains.newMint ? 0 : state.chains.newMint;
  let unconfirmedBalance = !state.chains.unconfirmedBalance ? 0 : state.chains.unconfirmedBalance;
  let immatureBalance = !state.chains.immatureBalance ? 0 : state.chains.immatureBalance;

  return{
    lang: state.startup.lang,
    staking: state.chains.isStaking,
    balance: Tools.formatNumber(balance),
    //temporary fix...
    total: Tools.formatNumber(balance + staking + newMint + unconfirmedBalance + immatureBalance),
    unconfirmed: Tools.formatNumber(unconfirmedBalance),
    stakingVal: Tools.formatNumber(staking),

    //Earnings stuff
    allEarningsSelected: state.earningsExpenses.allEarningsSelected,
    fileStorageEarningsSelected: state.earningsExpenses.fileStorageEarningsSelected,
    stakingEarningsSelected: state.earningsExpenses.stakingEarningsSelected,

    weekEarningsSelected: state.earningsExpenses.weekEarningsSelected,
    monthEarningsSelected: state.earningsExpenses.monthEarningsSelected,
    allTimeEarningsSelected: state.earningsExpenses.allTimeEarningsSelected,

    stakingAllTimeEarnings: state.application.totalStakingRewards,
    stakingWeekEarnings: state.application.lastWeekStakingRewards,
    stakingMonthEarnings: state.application.lastMonthStakingRewards,

    fileStorageAllTimeEarnings: state.application.totalFileStorageRewards,
    fileStorageWeekEarnings: state.application.lastWeekFileStorageRewards,
    fileStorageMonthEarnings: state.application.lastMonthFileStorageRewards,

    //Expenses stuff
    allExpensesSelected: state.earningsExpenses.allExpensesSelected,
    fileStorageExpensesSelected: state.earningsExpenses.fileStorageExpensesSelected,
    messagingExpensesSelected: state.earningsExpenses.messagingExpensesSelected,
    ansExpensesSelected: state.earningsExpenses.ansExpensesSelected,

    weekExpensesSelected: state.earningsExpenses.weekExpensesSelected,
    monthExpensesSelected: state.earningsExpenses.monthExpensesSelected,
    allTimeExpensesSelected: state.earningsExpenses.allTimeExpensesSelected,

    messagingAllTimeExpenses: state.application.totalmessagingExpenses,
    messagingWeekExpenses: state.application.lastWeekmessagingExpenses,
    messagingMonthExpenses: state.application.lastMonthStakingExpenses,

    fileStorageAllTimeExpenses: state.application.totalFileStorageExpenses,
    fileStorageWeekExpenses: state.application.lastWeekFileStorageExpenses,
    fileStorageMonthExpenses: state.application.lastMonthFileStorageExpenses,

    ansAllTimeExpenses: state.application.totalAnsExpenses,
    ansWeekExpenses: state.application.lastWeekAnsExpenses,
    ansMonthExpenses: state.application.lastMonthAnsExpenses,

    wallet: state.application.wallet,
    notifications: state.notifications.entries,
  };
};

export default connect(mapStateToProps, actions)(Home);
