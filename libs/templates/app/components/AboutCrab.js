import React from 'react';

const AboutCrab = (props) => {
  return (<div className="flex flex-wrap">
    <div className="w-full md:w-2/3 md:pr-10">
      <h2 className="text-3xl">What is Crab</h2>

      <p className="my-5">Every major framework has a command line interface. The functionality offered by them varies widely. 
      EmberCLI is the most productive, as Ember's draconian conventions allow all sorts of assumptions, and its build tools
       allow the CLI to be extended powerfully. Angular CLI is a fork of EmberCLI with functionality necessarily removed, and Aurelia CLI while slightly differing in functionality offers some comprehensive tooling.</p>

       <p className="my-5">VueCLI used to be a very poor experience, but in the past six months has taken impressive strides. This leaves React with only create-react-app.</p>

       <h3 className="text-2xl">Why not use Create React App?</h3>

       <p className="my-5">There is nothing inherently wrong with create-react-app, and it helped solve the problem React faced with difficulty getting started.</p>

       <p className="my-5">But there are two key problems with it. For a start there is no router in a </p>

    </div>
    <div className="w-full md:w-1/3">

    </div>
  </div>);
}

export default AboutCrab;