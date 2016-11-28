import React from 'react';
import { Link } from 'react-router';

import FAIcon from './FAIcon';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="text-muted">
          &copy; 2016 Steven Loria&nbsp;|&nbsp;
          <Link to="/">Home</Link>&nbsp;|&nbsp;
          <a href="http://github.com/sloria/simplist"><FAIcon type="github" /> Source code</a>
        </p>
      </div>
    </footer>
  );
}
