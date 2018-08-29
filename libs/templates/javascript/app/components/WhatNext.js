import React, { Component } from 'react';
import Task from './Task';

class WhatNext extends Component {
  constructor(props) {
    super(props);
    
    const tasks =  [{
      id: 1,
      label: 'Scaffold and run crab default template',
      checked: true
    }, {
      id: 2,
      label: 'Remove default CDN stylesheet',
      checked: false
    }, {
      id: 3,
      label: 'Remove unnecessary components',
      checked: false
    }, {
      id: 4,
      label: 'Create new route component',
      checked: false
    }];

    this.state = { tasks };
  }

  handleClick(id) {
    // it would be easy to just modify the state properties, but that's not how React 
    // wants to play. We need to replace out the state with an entirely new entry.

    let tasks = this.state.tasks.map((task) => {
      if (task.id === id) {
        task.checked = !task.checked;
      }
      return task;
    });

    this.setState({ tasks });
    // now would be a very good time to save things to an API, etc
  }

  taskItems() {
    return (<ul className="list-reset my-5">
      {this.state.tasks.map(item => <Task item={item} key={item.id} clickAction={this.handleClick.bind(this)} />)}
    </ul>
    )
  }

  render() {
    return (<div className="flex flex-wrap">
    <div className="w-full md:w-2/3 md:pr-10">

      <h2 className="text-3xl">Where do we go from here?</h2>

      <p className="my-5">This application is not intended to be a comprehensive app, nor a React tutorial. It's a base template for building your application. As a result, few if any architectural or design decisions have been made.</p>

      <h3 className="text-xl">CSS Frameworks</h3>

      <p className="my-5">One of the first things many developers will want to do is implement their CSS framework of choice - Bootstrap, Bulma, Foundation, and Materialize are all common and completely valid choices.</p>

      <p className="my-5">This application instead uses a framework called Tailwind, which uses utility classes rather than pre-defined component styles. These utility classes are simply imported via a CDN in <span className="font-mono text-sm">/index.html</span>. The same with the font-awesome icons used for the company icons at the bottom of the page and the checkboxes to the right. To strip out the tailwind dependency all you need to do is remove that CDN link. Then you can use any framework you like. A Scss file is already working and loading minimal classes at <span className="font-mono text-sm">styles/app.scss</span>. You can strip the content out of that, then begin adding your own code.</p>

      <h3 className="text-xl">Making your own components</h3>

      <p className="my-5">There are two main types of components in React, class based and functional. Functional are simple, stateless components that have all their data passed in as props. You can easily make both types of components with crab commands. Note that though class components are the default, you'll make a simpler and </p>

      <p className="my-5">For example, the checkbox at the right uses a slightly complex (and gross) bit of logic to determine which icon to load for a task. We could make a custom component to just handle that.</p>

      <pre className="bg-black rounded text-white p-4 w-full mt-5">crab g TaskCheck -f</pre>

      <h3 className="my-5 text-xl">Making Pages</h3>

      <p className="my-5">The process of making a working route in React is the same as a component. The only additional step is to add an entry in the list of routes (here in the <span className="font-mono text-sm">app/App.js</span> file, wrapped in a <span className="font-mono text-sm">&lt;Switch /&gt;</span> component. You can copy this pattern for your own pages. Don't forget to import the component at the top. The same goes with the link - you can see the list of NavLink components at the top. This is a special form of the Link component that automatically add a .active class to </p>

    </div>

    <div className="w-full md:w-1/3">
      <h3>Checklist</h3>

      <p className="my-5">You can check these boxes when you've completed these 
        customisations. It should be noted that these "clicks" are not persisted 
        anywhere, and Parcel rebuilding after making changes will reset it to default. 
        This is really just a coded demo of React component state management.</p>

      {this.taskItems()}
        
    </div>
  </div>);
  }
}

export default WhatNext;