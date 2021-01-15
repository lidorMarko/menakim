import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Menu from 'react-burger-menu/lib/menus/slide';
import styled, { keyframes } from 'styled-components/macro';
import { useStore } from '../../stores';
import { isAdmin } from '../../utils';

function Header() {
  const store = useStore();
  const [menuOpen, setMenuState] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation('header');

  return (
    <HeaderWrapper path={pathname}>
      <NavItemLive to="/live">
        <LiveIcon src="/icons/live.svg" alt="" style={{ marginRight: 10 }} />
      </NavItemLive>
      <Link to="/">
        <img src="/logo.svg" alt=" קילומטר אחד" />
      </Link>
      <NavProfileWrapper>
        <Menu
          isOpen={menuOpen}
          onStateChange={(state) => setMenuState(state.isOpen)}
          customBurgerIcon={<img src="/icons/hamburger.svg" alt="תפריט" />}
          customCrossIcon={false}
          disableAutoFocus
        >
          <Link to="/map" onClick={() => setMenuState(false)} className="bm-item">
            {t('map')}
          </Link>
          <hr />
          <Link to="/about" onClick={() => setMenuState(false)}>
            {t('about')}
          </Link>
          <hr />
          <a href="https://www.facebook.com/1km.co.il" target="_blank" rel="noreferrer noopener">
            {t('facebook')}
          </a>
          <a href="https://www.instagram.com/1km.co.il/" target="_blank" rel="noreferrer noopener">
            {t('instagram')}
          </a>
          <a href="https://github.com/guytepper/1km.co.il" target="_blank" rel="noreferrer noopener">
            {t('open-source')}
          </a>
          {isAdmin(store.userStore.user) && (
            <Link to="/admin" onClick={() => setMenuState(false)}>
              ניהול
            </Link>
          )}
        </Menu>
      </NavProfileWrapper>
    </HeaderWrapper>
  );
}

export default observer(Header);

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px 5px 20px;
  grid-row: 1;
  background: #fff;
  box-shadow: #e1e4e8 0px -1px 0px inset, #00000026 0px 4px 5px -1px;
  z-index: 10;
`;

const fadeIn = keyframes`
  from {
    opacity: 0.75;
  }

  to {
    opacity: 1;
  }
`;

const NavItemLive = styled(Link)`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  color: tomato;
  font-weight: bold;
  font-size: 18px;
  animation: ${fadeIn} 1.2s linear 1s infinite alternate;
  visibility: hidden;
`;

const NavProfileWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LiveIcon = styled.img`
  width: 27px;
  border-radius: 50px;
  margin-left: 5px;
  user-select: none;
`;
