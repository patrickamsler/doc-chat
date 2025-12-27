import styled from 'styled-components';

export const ResizablePanelContainer = styled.div<{ $width: number }>`
    position: relative;
    width: ${props => props.$width}px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
`;

export const ResizeHandle = styled.div<{ $position: 'left' | 'right' }>`
    position: absolute;
    ${props => props.$position === 'left' ? 'left: 0;' : 'right: 0;'}
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background-color: ${props => props.theme.colors.border.dark};
    transition: background-color ${props => props.theme.transitions.duration.base};
    z-index: ${props => props.theme.zIndex.sticky};

    &:hover {
        background-color: ${props => props.theme.colors.primary[300]};
    }
`;

export const ResizeIndicator = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 1.5rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity ${props => props.theme.transitions.duration.base};

    ${ResizeHandle}:hover & {
        opacity: 1;
    }
`;

export const ResizeBar = styled.div`
    width: 4px;
    height: 2rem;
    background-color: ${props => props.theme.colors.primary[500]};
    border-radius: ${props => props.theme.borderRadius.full};
`;
