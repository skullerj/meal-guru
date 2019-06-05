import styled from 'styled-components';

export default styled.input`
  border: none;
  background: black;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  padding: 8px;
  text-align: center;
  border-radius: 4px;

  &:focus {
    background: space-gray;
    color: rgba(255,255,255,0.8);
  }
`
