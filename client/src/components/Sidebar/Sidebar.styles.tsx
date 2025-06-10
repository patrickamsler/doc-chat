import styled from 'styled-components';

export const SidebarContainer = styled.div<{ $open: boolean }>`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 400px;
    background-color: ${props => props.theme.colors.grey50};
    transform: translateX(${props => (props.$open ? '0' : '-100%')});
    transition: ${props => (props.$open ? 'transform 0.2s ease-in-out' : 'none')};
    z-index: 999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

export const SidebarContent = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
`;

export const ToggleButton = styled.button<{ $open: boolean }>`
    position: fixed;
    top: 6px;
    left: 10px;
    z-index: 1000;
    background: ${props => props.theme.colors.primaryA0};
    color: ${props => props.theme.colors.white};
    border: none;
    border-radius: 4px;
    width: 25px;
    height: 25px;
    cursor: pointer;
    display: ${props => (props.$open ? 'none' : 'block')};
`;

export const DocumentList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
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

export const SidebarHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
`;

export const CloseButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.colors.primaryA0};
    font-size: 20px;
    cursor: pointer;
`;

export const DocumentTitle = styled.span`
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${props => props.theme.colors.textDark};
`;

export const Timestamp = styled.span`
    margin-top: 3px;
    display: block;
    font-size: 12px;
    color: ${props => props.theme.colors.grey800};
`;