import { Bot, Menu, UserCircle } from "lucide-react";
import React from "react";
import {
  BrandIcon,
  BrandTitle,
  HeaderBrand,
  HeaderContainer,
  HeaderLeft,
  HeaderRight,
  MenuBtn,
  UserInfo
} from "./Header.styles";

interface HeaderProps {
  onMenuClick: () => void;
}


const Header: React.FC<HeaderProps> = ({onMenuClick}) => {
  return (
      <HeaderContainer>
        <HeaderLeft>
          <MenuBtn onClick={() => onMenuClick()}>
            <Menu style={{width: '1.25rem', height: '1.25rem'}}/>
          </MenuBtn>
          <HeaderBrand>
            <BrandIcon>
              <Bot
                  strokeWidth={2.7}
                  style={{width: '1.3rem', height: '1.3rem', color: 'white'}}
              />
            </BrandIcon>
            <BrandTitle>Doc Chat</BrandTitle>
          </HeaderBrand>
        </HeaderLeft>

        <HeaderRight>
          <UserInfo>
            <UserCircle style={{width: '1.25rem', height: '1.25rem'}}/>
            <span>Guest User</span>
          </UserInfo>
        </HeaderRight>
      </HeaderContainer>
  )
}

export default Header;
