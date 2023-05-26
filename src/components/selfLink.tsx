import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

export const SelfLink = (props: LinkProps) => {
  return (
    <Link
      {...props}
      onClick={(e) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      }}
    />
  );
};
