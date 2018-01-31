import React, { Component } from 'react';
import { connect } from 'react-redux';
import { traduction, language } from '../../lang/lang';
import * as actions from '../../actions';
import {TweenMax} from "gsap";
import connectWithTransitionGroup from 'connect-with-transition-group';

class ThemeSelector extends React.Component {
 constructor() {
    super();
  }
  
 componentWillAppear (callback) {
    callback();
  }
  
  componentDidAppear(e) {
    console.log("componentDidAppear")
  }
  
   componentWillEnter (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 600, opacity: 0}, {x: 0, opacity:1,ease: Linear.easeNone, onComplete: callback});
  }
  
    componentDidEnter(callback) {
  }

  componentWillLeave (callback) {
    const el = this.refs.second;
    TweenMax.fromTo(el, 0.3, {x: 0, opacity: 1}, {x: -600, opacity: 0, ease: Linear.easeNone, onComplete: callback});
  }
  
  componentDidLeave(callback) {
  }  
  
  render() { 
      var shapeStyle = {
      fill: this.props.bgColor
    };
     return (
      <div ref="second">
           <p style={{fontWeight:"300"}} className="subTitle">
             {this.props.lang.selectTheme}
           </p>
         <div id="themes">
          <div className="themeSelector" id="darkTheme">
           <div className="themes">
             <div className="theme">
              <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
              <div className="divSquare" style={{backgroundColor: "#21242a"}}></div>
              <div className="divSquare" style={{backgroundColor: "#333840"}}></div>
              <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
             </div> 
           </div>
             <p className="themeName">Dark</p>
           </div>
           <div className="themeSelector">
           <div className="themes">
             <div className="theme">
              <div className="divSquare" style={{backgroundColor: "#d09128"}}></div>
              <div className="divSquare" style={{backgroundColor: "#14182f"}}></div>
              <div className="divSquare" style={{backgroundColor: "#c4c4d3"}}></div>
              <div className="divSquare" style={{backgroundColor: "#1e2544"}}></div>
             </div> 
           </div>
             <p className="themeName">Default</p>
           </div>
           <div className="themeSelector" id="lightTheme">
           <div className="themes">
             <div className="theme">
              <div className="divSquare" style={{backgroundColor: "#bbbbbb"}}></div>
              <div className="divSquare" style={{backgroundColor: "#17152a"}}></div>
              <div className="divSquare" style={{backgroundColor: "#de9b2b"}}></div>
              <div className="divSquare" style={{backgroundColor: "#ffffff"}}></div>
             </div> 
           </div>
             <p className="themeName">Light</p>
           </div>
         </div>
      </div>
      );
    } 
};

const mapStateToProps = state => {
  return{
    direction: state.setup.direction,
    lang: state.startup.lang
  };
};


export default connectWithTransitionGroup(connect(mapStateToProps, actions, null, {
    withRef: true,
  })(ThemeSelector));