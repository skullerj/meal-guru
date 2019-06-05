import React from 'react';

import Button from './components/Button.js';
import Input from './components/Input.js';


function App() {
  return (
    <div className="App">
      <header className="App-header">
          <Button>Here comes the app</Button>
          <br />
          <Input value="This is the text"/>
      </header>
    </div>
  );
}

export default App;
