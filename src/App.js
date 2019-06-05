import React from 'react';
import styled from 'styled-components';
import Button from './components/Button.js';
import Input from './components/Input.js';
import Header from './components/Header.js';
import H1 from './components/H1.js';
import A from './components/A.js';
import GlobalStyles from './Styles';


const HeaderContent = styled.section`
  display: flex;
  flex-direction: row;
  padding: 16px;
`;

const Spacer = styled.div`
  display: flex;
  flex: 1;
`;

const HeaderLink = styled(A)`
  align-self: center;
  margin-left: 8px;
  padding-right: 8px;
  &:not(:last-child) {
    border-right: 1px solid black;
  }
`

function App() {
  return (
    <div className="App">
      <GlobalStyles />
      <Header>
        <HeaderContent>
          <H1>MEAL GURU</H1>
          <Spacer />
          <HeaderLink>Link One</HeaderLink>
          <HeaderLink>Link Two</HeaderLink>
        </HeaderContent>
      </Header>
      <header className="App-header">
        <Button>Here comes the app</Button>
        <br />
        <Input value="This is the text"/>
      </header>
    </div>
  );
}

export default App;
