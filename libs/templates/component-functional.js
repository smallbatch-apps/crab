import React from 'react';
{{#if imports}}{{#each imports}}{{{this}}}
{{/each}}{{/if}}
{{#if components}}{{#each components}}{{{this}}}
import {{this}} from './{{this}}';
{{/each}}{{/if}}
const {{resourceName}} = (props) => {
  return (<div>{{#if content}}{{#each content}}
    {{{this}}}{{/each}}{{else}}
    {/* Content goes here */}{{/if}}
  </div>);
}

export default {{resourceName}};