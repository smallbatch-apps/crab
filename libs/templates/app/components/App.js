import React, { Component } from 'react';
import { Route, Switch, NavLink } from "react-router-dom";

import Home from './Home';
import AboutCrab from './AboutCrab';
import WhatNext from './WhatNext';

class App extends Component {

  render() {
    return (<div className="flex flex-col main-container">
      <div className="item blue flex-initial">
        <div className="container mx-auto my-10">
          <div className="flex">
            <div className="flex-auto"><h1 className="text-4xl">CRAB!</h1></div>
            <div className="flex-auto text-right nav">
              <NavLink to="/" exact className="text-blue-lightest border bg-blue hover:bg-blue-dark rounded px-5 py-2 no-underline">Home</NavLink>
              <NavLink to="/about-crab" className="ml-3 text-blue-lightest bg-blue hover:bg-blue-dark border rounded px-5 py-2 no-underline">About Crab</NavLink>
              <NavLink to="/whats-next" className="ml-3 text-blue-lightest bg-blue hover:bg-blue-dark border rounded px-5 py-2 no-underline">What's Next?</NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className="item flex-grow">
        <div className="container mx-auto my-10">
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/about-crab" component={AboutCrab}/>
            <Route path="/whats-next" component={WhatNext}/>
          </Switch>
        </div>
      </div>
      <footer className="item green flex-initial">
        <div className="container mx-auto my-10 text-right text-green-lightest">
          <a href="https://github.com/smallbatch-apps" className="text-green-lightest no-underline hover:text-green-light ml-3">
            <i className="fab fa-github fa-fw"></i>
          </a>  
          <a href="https://twitter.com/mattaugamer" className="text-green-lightest no-underline hover:text-green-light ml-3">
            <i className="fab fa-twitter fa-fw"></i>
          </a>  
          <a href="https://medium.com/@mattburgess" className="text-green-lightest no-underline hover:text-green-light ml-3">
            <i className="fab fa-medium-m fa-fw"></i>
          </a>  
          <a href="https://www.linkedin.com/in/matt-burgess-9a7a6095/" className="text-green-lightest no-underline hover:text-green-light mx-3">
            <i className="fab fa-linkedin-in fa-fw"></i>
          </a>  Matt Burgess
        </div>
      </footer>
    </div>
  );
  }
}

export default App;