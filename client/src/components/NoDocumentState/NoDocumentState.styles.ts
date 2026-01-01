import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.div`
  text-align: center;
  max-width: 28rem;
`;

export const IconWrapper = styled.div`
  width: 6rem;
  height: 6rem;
  background-color: ${props => props.theme.colors.primary[50]};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

export const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

export const Text = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 1.5rem;
`;

export const UploadButton = styled.button`
  background-color: ${props => props.theme.colors.primary[600]};
  color: ${props => props.theme.colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  padding: 0.75rem 1.5rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: background-color ${props => props.theme.transitions.duration.base};

  &:hover {
    background-color: ${props => props.theme.colors.primary[700]};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
