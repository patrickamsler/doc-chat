import styled from "styled-components";

export const InputContainer = styled.div`
    display: flex;
    padding: 15px;
    background-color: ${props => props.theme.colors.white};
`;

export const MessageInput = styled.textarea`
    flex: 1;
    min-height: 22px;
    max-height: 150px;
    padding: 10px 10px 0 10px;
    border: 1px solid ${props => props.theme.colors.grey300};
    border-radius: 4px;
    font-size: 16px;
    color: ${props => props.theme.colors.textDark};
    font-family: ${props => props.theme.fonts.body};
    resize: none; /* Prevent manual resizing */
    overflow-y: auto; /* Enable vertical scrolling when content exceeds max-height */
    line-height: 1.5;
    
    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primaryA0};
    }
`;

export const SendButton = styled.button<{ $height?: number }>`
  margin-left: 5px;
  width: 60px;
  min-height: 22px;
  height: ${({ $height }) => ($height ? `${$height}px` : '40px')};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.primaryA0};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  font-family: ${props => props.theme.fonts.body};

  &:hover {
    background-color: ${props => props.theme.colors.primaryA2};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.grey400};
    cursor: not-allowed;
  }

  svg {
    /* Make sure the icon is centered and sized appropriately */
    width: 20px;
    height: 20px;
  }
`;

