import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToggleButton from 'react-toggle';
import { Card, Button, CardTitle, CardText } from 'reactstrap';

import * as actions from '../../actions/index';
import Header from '../Others/Header';
import Body from '../Others/Body';
import UnlockModal from '../Others/UnlockModal';

const Tools = require('../../utils/tools');

class Index extends Component {
  constructor(props) {
    super(props);
    this.processStakingClicked = this.processStakingClicked.bind(this);
    this.lockWallet = this.lockWallet.bind(this);
    this.getEarnings = this.getEarnings.bind(this);
    this.startStaking = this.startStaking.bind(this);
  }

  processStakingClicked() {
    if (!this.props.staking) {
      this.unlockModal.getWrappedInstance().toggle();
    } else {
      this.lockWallet().then(() => {
        this.props.wallet.setGenerate().then(() => {
          this.props.setStaking(false);
        });
      });
    }
  }

  async lockWallet() {
    // const updated = await Tools.updateConfig(0);
    // if (updated){

    const batch = [];
    const obj = {
      method: 'walletlock', parameters: []
    };
    batch.push(obj);

    this.props.wallet.command(batch).then((data) => {
      console.log('data: ', data);
      data = data[0];
      if (data !== null && data.code === 'ECONNREFUSED') {
        console.log('daemon not working?');
      } else if (data !== null) {
        console.log('error unlocking wallet: ', data);
      }
    }).catch((err) => {
      console.log('err unlocking wallet: ', err);
    });
    // }
  }

  earningsFilterClicked(filter) {
    this.props.setFilterEarningsTime(filter);
  }

  earningsTypeFilterClicked(filter) {
    this.props.setFilterEarningsType(filter);
  }

  buildFilterObject(modifier, val) {
    return {
      modifier,
      val,
    };
  }

  getEarnings() {
    // Getting clever
    const timeFilter = [
      this.buildFilterObject('AllTime', this.props.allTimeEarningsSelected),
      this.buildFilterObject('Month', this.props.monthEarningsSelected),
      this.buildFilterObject('Week', this.props.weekEarningsSelected),
    ].filter(f => f.val)[0];

    const typeFilter = [
      this.buildFilterObject(['staking'], this.props.allEarningsSelected),
      this.buildFilterObject(['staking'], this.props.stakingEarningsSelected),
    ].filter(f => f.val)[0];

    return typeFilter.modifier
                  .map(modifier => `${modifier}${timeFilter.modifier}Earnings`)
                  .reduce((accumulator, val) => accumulator + parseFloat(this.props[val]), 0);
  }

  startStaking () {
    this.props.wallet.setGenerate().then(() => {
      setTimeout(() => this.props.setStaking(true), 1000);
    });
  }


  render() {
    return (
      <div className="padding-titlebar">
        <Header>
          { this.props.lang.overview }
        </Header>
        <Body noPadding>
          <Card body inverse className="bg-gradient-red standout mb-5">
            <CardTitle>Wallet Unencrypted</CardTitle>
            <CardText>
              Your wallet is currently unencrypted. Most functionality of Sapphire will be locked until you encrypt your wallet.
            </CardText>
            <Button color="danger" className="mt-2">Fix</Button>
          </Card>

          <Card body inverse className="homeSection text-center bg-gradient-blue standout" id="balanceInfo">
            <CardTitle id="balance" style={{ fontSize: '25px' }}>{ this.props.lang.balance }</CardTitle>
            <div className="row">
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <CardTitle className="text-white-50 mb-0"><small>{ this.props.lang.staking }</small></CardTitle>
                <p className="normalWeight">{this.props.stakingVal} <span className="ecc text-white">ecc</span></p>
                <div style={{ width: '52px', margin: '0 auto', marginTop: '10px' }}>
                  <ToggleButton
                    checked={this.props.staking}
                    onChange={() => {
                      this.processStakingClicked();
                    }}
                  />
                </div>
              </div>
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <p className="normalWeight" style={{ fontSize: '20px' }}>{this.props.balance} <span className="ecc text-white">ecc</span></p>
                <CardTitle className="text-white-50 mt-4 mb-0"><small>{ this.props.lang.total }</small></CardTitle>
                <p className="normalWeight">{this.props.total} <span className="ecc text-white">ecc</span></p>
              </div>
              <div className="col-sm-4" style={{ padding: '0 0' }}>
                <CardTitle className="text-white-50 mb-0"><small>{ this.props.lang.unconfirmed }</small></CardTitle>
                <p className="normalWeight">{this.props.unconfirmed} <span className="ecc text-white">ecc</span></p>
              </div>
            </div>
          </Card>

          <div className="homeSection" id="earnings">
            <div className="row">
              <div className="col-sm-4 align-self-left" style={{ padding: '0 0' }}>
                <div id="earningsOptions">
                  <div className="arrowHome" />
                  <div id="earningsFirst">
                    <p className="normalWeight homePanelTitleOne" style={{ fontSize: '20px' }}>{ this.props.lang.earnings }</p>
                  </div>
                  <p onClick={this.earningsTypeFilterClicked.bind(this, 'staking')} className={this.props.stakingEarningsSelected ? 'earningsFilters textSelected' : 'earningsFilters textSelectableHome'}> { this.props.lang.staking } </p>
                  <p onClick={this.earningsTypeFilterClicked.bind(this, 'all')} className={this.props.allEarningsSelected ? 'earningsFilters textSelected' : 'earningsFilters textSelectableHome'}> { this.props.lang.all }</p>
                </div>
              </div>
              <div className="col-sm-4 text-center" style={{ padding: '0 0' }}>
                <p className="normalWeight" style={{ fontSize: '20px', position: 'relative', top: '60px' }}>{Tools.formatNumber(this.getEarnings())} <span className="ecc">ecc</span></p>
                <p onClick={this.earningsFilterClicked.bind(this, 'week')} className={this.props.weekEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}>{ this.props.lang.lastWeek }</p>
                <p onClick={this.earningsFilterClicked.bind(this, 'month')} className={this.props.monthEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}>{ this.props.lang.lastMonth }</p>
                <p onClick={this.earningsFilterClicked.bind(this, 'allTime')} className={this.props.allTimeEarningsSelected ? 'earningsFiltersDate textSelected' : 'earningsFiltersDate textSelectableHome'}> { this.props.lang.all }</p>
              </div>
            </div>
          </div>
        </Body>
        <UnlockModal ref={(e) => { this.unlockModal = e; }} onUnlock={this.startStaking}>
          <p>{`${this.props.lang.unlockWalletExplanation1} ${this.props.lang.unlockWalletExplanation2}`} <span className="ecc">ECC</span>.</p>
        </UnlockModal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const balance = !state.chains.balance ? 0 : state.chains.balance;
  const staking = !state.chains.staking ? 0 : state.chains.staking;
  const newMint = !state.chains.newMint ? 0 : state.chains.newMint;
  const unconfirmedBalance = !state.chains.unconfirmedBalance ? 0 : state.chains.unconfirmedBalance;
  const immatureBalance = !state.chains.immatureBalance ? 0 : state.chains.immatureBalance;

  return {
    lang: state.startup.lang,
    staking: state.chains.isStaking,
    balance: Tools.formatNumber(balance),
    // temporary fix...
    total: Tools.formatNumber(parseFloat(balance) + parseFloat(staking) + parseFloat(newMint) + parseFloat(unconfirmedBalance) + parseFloat(immatureBalance)),
    unconfirmed: Tools.formatNumber(unconfirmedBalance),
    stakingVal: Tools.formatNumber(staking),
    unencryptedWallet: state.startup.unencryptedWallet,

    // Earnings stuff
    allEarningsSelected: state.earningsExpenses.allEarningsSelected,
    stakingEarningsSelected: state.earningsExpenses.stakingEarningsSelected,

    weekEarningsSelected: state.earningsExpenses.weekEarningsSelected,
    monthEarningsSelected: state.earningsExpenses.monthEarningsSelected,
    allTimeEarningsSelected: state.earningsExpenses.allTimeEarningsSelected,

    stakingAllTimeEarnings: state.application.totalStakingRewards,
    stakingWeekEarnings: state.application.lastWeekStakingRewards,
    stakingMonthEarnings: state.application.lastMonthStakingRewards,

    wallet: state.application.wallet,
    notifications: state.notifications.entries,
  };
};

export default connect(mapStateToProps, actions)(Index);