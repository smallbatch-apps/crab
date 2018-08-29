import React from 'react';

const AboutCrab = (props) => {
  return (<div className="flex flex-wrap">
    <div className="w-full md:w-2/3 md:pr-10">
      <h2 className="text-3xl">About this App</h2>

      <p className="my-5">This is a placeholder for your own app, meant to give you some guidance to get started on a React app of your own.</p>

      <p className="my-5">You should feel free to delete whatever you like, take it apart, add new functionality, and so on. </p>

      <p className="my-5">This app should help you get a start on building a SPA with React. It includes examples of: working routing, relatively complex state management, functional components, actions passed as props, an implementation of scss, async lifecycle functions, and more.</p>

      <p className="my-5">The scaffolded application is loaded with utility classes from Tailwind, which is pulled in from a CDN, so it should be easy to strip out and replace with your framework of choice. Whether that's Bootstrap, Materialize, or just your own Sass layout, all are valid choices. Thanks to Parcel JS it's just as easy to add Less, Stylus or whatever. If you want to use Tailwind itself properly there's a bit of a process <a href="https://tailwindcss.com/docs/installation" className="no-underline text-grey-darker">as per the instructions</a>.</p>

      <h3 className="text-2xl">Why not use Create React App?</h3>

      <p className="my-5">You can read more about my thinking on <a href="https://medium.com/@mattburgess/introducing-crab-a-react-cli-tool-e03aa86acd2e" className="no-underline text-grey-darker">the announcement post on Medium</a>. The short answer is that I think we can do better.</p>
    
    </div>
    <div className="w-full md:w-1/3">

      <h3>What is Crab?</h3>

      <p className="my-5">Crab is my attempt to improve the experience of developing React applications, especially for new developers. It provides a scaffolding system for creating a relatively feature-complete application with a single command.</p>
      
      <p className="my-5">It also allows developers to instantly create new components and other functionality with file generation commands.</p>
        
    </div>
  </div>);
}

export default AboutCrab;