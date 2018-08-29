import React from 'react';
import { Link } from 'react-router-dom';

const Home = (props) => {
  return (<div className="flex">
    <div className="w-2/3 pr-10">
      <h2 className="text-3xl">🦀 Welcome to your new crab React app</h2>

      <p className="my-5">This is a placeholder app created by CRAB, a command-line tool intended to help you get a start in building React applications.</p>

      <p className="my-5">The app is being built and served by <a href="https://parceljs.org/">ParcelJS</a>, a zero-config build system that makes working with React a lot easier. If you're seeing this page now, you're using ParcelJS. If you want to know more about functionality or features for building or deployment, or support for various technologies and features, feel free to look more into Parcel. It is what is doing all of that work - Crab just built a blueprint.</p>

      <p className="my-5">To modify your app, open it in any editor, and you should be able to modify it easily. You can create new pages using the crab cli tool, which makes React standard templates easily. For more information go to the <Link to="/what-next" className="no-underline text-grey-darker hover:underline">What Next</Link> page</p>
    </div>
    <div className="w-1/3">
      <h3>Using Crab-CLI</h3>

      <p className="my-5">The crab cli tool allows you to quickly build out the components that make up your React app. Though it's not able to help with importing them into each other (yet) it can help you get started quickly.</p>

      <pre class="bg-black rounded text-white p-4 w-full mt-5">cd components<br />
crab g TodoList<br />
crab g TodoItem -f<br />
crab g ItemCheckbox -f<br />
</pre>

    <p className="my-5">Parcel will automatically load and build those files. To make them work as routes, you just need to import them into <span className="font-mono text-sm">components/App.js</span> and add an entry to the other routes.</p>
    </div>
  </div>);
}

export default Home;