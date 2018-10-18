import React from 'react';
import { Route } from 'react-router-dom';

const SubRoute = route => (
  <Route
    path={route.path}
    render={props => (
      // pass the sub-routes down to keep nesting
      <route.component {...props} routes={route.routes} />
    )}
  />
);

export default SubRoute;