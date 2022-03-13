import React from 'react';
import './App.css';
import Map from './Map';
import LogControls from './LogControls';
import NoDataWarning from './NoDataWarning';

function App() {
  return (
    <div className="App">
      <LogControls />
      <NoDataWarning />
      <Map />
    </div>
  );
}

export default App;
