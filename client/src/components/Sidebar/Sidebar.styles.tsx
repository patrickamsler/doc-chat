import styled from 'styled-components';
import { FileText } from 'lucide-react';

export const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
    width: 100%;
    height: 100%;
    background-color: ${props => props.theme.colors.background.sidebar};
    border-right: 1px solid ${props => props.theme.colors.border.main};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

export const SidebarHeader = styled.div`
    padding: 16px;
    border-bottom: 1px solid ${props => props.theme.colors.border.main};
`;

export const UploadBtn = styled.button`
    width: 100%;
    background-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.text.inverse};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    padding: 0.5rem 1rem;
    height: 34px;
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    transition: background-color ${props => props.theme.transitions.duration.base};

    &:hover {
        background-color: ${props => props.theme.colors.primary[700]};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const SidebarContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;
`;

export const SidebarTitle = styled.h2`
    font-size: ${props => props.theme.typography.fontSize.xs};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.secondary};
    text-transform: uppercase;
    text-align: left;
    margin-left: 4px;
    margin-bottom: 8px;
`;

export const DocumentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const DocumentItem = styled.button<{ $isSelected: boolean }>`
    width: 100%;
    text-align: left;
    border-radius: ${props => props.theme.borderRadius.lg};
    transition: all ${props => props.theme.transitions.duration.base};
    background-color: ${props => props.$isSelected ? props.theme.colors.primary[50] : props.theme.colors.gray[50]};
    border: 2px solid ${props => props.$isSelected ? props.theme.colors.primary[600] : 'transparent'};
    cursor: pointer;
    padding: 8px;

    &:hover {
        background-color: ${props => props.$isSelected ? props.theme.colors.primary[50] : props.theme.colors.gray[100]};
    }
`;

export const DocumentItemContent = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
`;

export const DocumentIcon = styled(FileText)<{ $isSelected: boolean }>`
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
    color: ${props => props.$isSelected ? props.theme.colors.primary[600] : props.theme.colors.gray[400]};
`;

export const DocumentInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

export const DocumentTitle = styled.p<{ $isSelected: boolean }>`
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.$isSelected ? props.theme.colors.primary[900] : props.theme.colors.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
`;

export const Timestamp = styled.p`
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    margin-top: 0.25rem;
    margin-bottom: 0;
`;

export const EmptyState = styled.div`
    text-align: center;
    padding: 48px 0;
`;

export const EmptyIconWrapper = styled.div`
    width: 4rem;
    height: 4rem;
    background-color: ${props => props.theme.colors.gray[100]};
    border-radius: ${props => props.theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
`;

export const EmptyTitle = styled.p`
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.gray[600]};
    margin-bottom: 0.25rem;
`;

export const EmptySubtitle = styled.p`
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    margin: 0;
`;