import React from 'react';
import './Header.css';

export default function Header(props) {
  return (
    <div className="Header">
      <div className="header clearfix">
        <nav>
          <ul className="nav nav-pills pull-right">
            {props.navLinks.map((each, i) => {
              if ({}.hasOwnProperty.call(each, 'navProps')) {
                return <li className="Header-navitem" key={i} role="presentation" {...each.navProps}>{each.content}</li>;
              }
              return <li className="Header-navitem" key={i} role="presentation">{each}</li>;
            })}
          </ul>
        </nav>
        {props.children}
      </div>
    </div>
  );
}
