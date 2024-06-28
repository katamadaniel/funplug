// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Category from './Category';
import CategoryPage from './CategoryPage';
import { categories } from './categories';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Category} />
        {categories.map(category => (
          <Route key={category.name} path={category.path} component={CategoryPage} />
        ))}
      </Switch>
    </Router>
  );
};

export default App;
