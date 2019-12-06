// @flow

import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';

import './ZnMenuLayout.css';

function geteSelectedElems(items: Array<*>, selected: Array<string>, open: Array<string>): boolean {
  // eslint-disable-next-line no-restricted-syntax
  for (const link of items) {
    if (link.subMenu && link.subMenu.length) {
      const test = geteSelectedElems(link.subMenu, selected, open);
      if (test) {
        selected.push(link.key);
        open.push(link.key);
        return true;
      }
    } else {
      const { pathname } = window.location;
      const match = link.match
        ? link.match(pathname)
        : link.to && pathname === link.to;
      if (match) {
        selected.push(link.key);
        return true;
      }
    }
  }
  return false;
}

type Props = {
  links: Array<{
    key?: string | number,
    name: string,
    iconName?: string,
    to?: string,
    onClick?: () => void,
    subMenu?: Array<*>,
    match?: (pathname: string) => boolean,
  }>,
  selected?: Array<string>,
  open?: Array<string>,
  logo: *,
};
export default function ZnMenuLayout(props: Props) {
  const { links, logo } = props;
  let { selected, open } = props;
  const newSelected = [];
  const newOpen = [];
  geteSelectedElems(links, newSelected, newOpen);
  selected = selected || newSelected;
  open = open || newOpen;

  const renderMenuItems = (items: Array<*>): * => {
    const renderLine = (link) => (
      <span>
        {!!link.iconName && <Icon type={link.iconName} />}
        <span>{link.name}</span>
      </span>
    );

    return items.map((link) => {
      if (link.subMenu && link.subMenu.length) {
        return (
          <Menu.SubMenu key={link.key || link.name} title={renderLine(link)}>
            {renderMenuItems(link.subMenu)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={link.key || link.name}>
          {!link.to ? (
            renderLine(link)
          ) : (
            <Link to={link.to} onClick={link.onClick}>
              {renderLine(link)}
            </Link>
          )}
        </Menu.Item>
      );
    });
  };

  return (
    <div className="zn-menu-layout">
      <div className="logo">
        <img src={logo} alt="zen" />
      </div>
      <hr />

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={selected}
        defaultOpenKeys={open}
      >
        {renderMenuItems(links)}
      </Menu>

      <div className="footer">
        <div>Copyright @2019 zen</div>
      </div>
    </div>
  );
}

ZnMenuLayout.defaultProps = {
  selected: [],
  open: [],
};
