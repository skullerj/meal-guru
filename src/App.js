import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
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
    <Router>
      <>
        <GlobalStyles />
        <Header>
          <HeaderContent>
            <H1>MEAL GURU</H1>
            <Spacer />
            <Link to="/">
              <HeaderLink>Home</HeaderLink>
            </Link>
            <Link to="/recepies">
              <HeaderLink>Recepies</HeaderLink>
            </Link>
            <Link to="/planing">
              <HeaderLink>Planinng</HeaderLink>
            </Link>
            <Link to="/cart">
              <HeaderLink>Cart</HeaderLink>
            </Link>
          </HeaderContent>
        </Header> 
        <Switch>
          <Route path="/" exact render={() => <H1>Welcome to the first view</H1>}/>
          <Route path="/recepies" render={() => <H1>Recepies</H1>}/>
          <Route path="/planing" render={() => <H1>Planing</H1>}/>
          <Route path="/cart" render={() => <H1>Cart</H1>}/>
          <Route render={() => <H1>You are lost my fellow padawan</H1>} />
        </Switch>
      </>
    </Router>
  );
}

export default App;
