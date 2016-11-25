import React from 'react';

export default function FAIcon(props) {
  const { type, className, ...rest } = props;
  return (
    <i className={`fa fa-${type} ${className}`} {...rest} />
  );
}
