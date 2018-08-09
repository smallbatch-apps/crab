import React, { Component } from 'react';
{{#if imports}}{{#each imports}}{{{this}}}
{{/each}}{{/if}}
class {{componentName}} extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {

  }

  render() {
    return (<div>{{#if content}}{{#each content}}
      {{{this}}}{{/each}}{{else}}
      {/* Content goes here */}{{/if}}
    </div>);
  }
}

export default {{componentName}};