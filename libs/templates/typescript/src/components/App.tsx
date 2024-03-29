import { Switch, Route, Link } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import Homepage from './components/pages/Homepage';
import About from './components/pages/About';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <ul>
        <li><Link to="/" className="p-3 mr-3">Home</Link></li>
        <li><Link to="/about" className="p-3">About Crab</Link></li>
      </ul>

      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/" exact>
          <Homepage />
        </Route>
      </Switch>
    </div>
  );
}

export default App;