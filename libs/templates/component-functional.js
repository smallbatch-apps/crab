import React from 'react';
{{#if imports}}{{#each imports}}{{{this}}}
{{/each}}{{/if}}
const {{componentName}} = (props) => {
  return (<div>{{#if content}}{{#each content}}
    {{{this}}}{{/each}}{{else}}
    {/* Content goes here */}{{/if}}
  </div>);
}

export default {{componentName}};