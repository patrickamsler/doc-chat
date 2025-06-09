import styled from 'styled-components';

export const SidebarContainer = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  background-color: ${props => props.theme.colors.grey100};
  transform: translateX(${props => (props.$open ? '0' : '-100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 999;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

export const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: ${props => props.theme.colors.primaryA0};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
`;

export const DocumentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
`;

export const DocumentItem = styled.li`
  padding: 8px 4px;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.grey300};
  text-align: left;

  &:hover {
    background-color: ${props => props.theme.colors.grey200};
  }
`;

export const Timestamp = styled.span`
  display: block;
  font-size: 12px;
  color: ${props => props.theme.colors.grey500};
`;
