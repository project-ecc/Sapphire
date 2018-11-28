import React, { Component } from 'react';
import ThemeSelectorStep from '../../InitialSetupPage/ThemeSelectorStep';
import { Button } from 'reactstrap';
import hash from '../../../router/hash';
import {connect} from "react-redux";
import * as actions from "../../../actions";

class Theme extends Component {
  constructor(props) {
    super(props);

    this.nextStep = this.nextStep.bind(this);
  }

  nextStep() {
    this.props.setStepInitialSetup('importwallet');
    hash.push('/setup/import');
  }

  render() {
    return (
      <div>
        Select ur theme mate
        <ThemeSelectorStep />
        <Button onClick={this.nextStep}>Import Wallet</Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    lang: state.startup.lang
  };
};


export default connect(mapStateToProps, actions)(Theme);