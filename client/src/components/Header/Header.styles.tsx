import styled from "styled-components";

export const HeaderContainer = styled.header`
    background-color: ${props => props.theme.colors.background.paper};
    border-bottom: 1px solid ${props => props.theme.colors.border.main};
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const MenuBtn = styled.button`
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: ${props => props.theme.borderRadius.lg};
    transition: background-color ${props => props.theme.transitions.duration.base};
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: ${props => props.theme.colors.gray[100]};
    }
`;

export const HeaderBrand = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const BrandIcon = styled.div`
    width: 2.1rem;
    height: 2.1rem;
    background-color: ${props => props.theme.colors.primary[600]};
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const BrandTitle = styled.h1`
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const GuestBadge = styled.span`
    font-size: ${props => props.theme.typography.fontSize.sm};
    background-color: ${props => props.theme.colors.warning.light};
    color: ${props => props.theme.colors.warning.dark};
    padding: 0.25rem 8px;
    border-radius: ${props => props.theme.borderRadius.full};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

export const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.gray[700]};
`;