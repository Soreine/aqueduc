# Aqueduc

[![Build Status](https://travis-ci.org/SamyPesse/aqueduc.svg?branch=master)](https://travis-ci.org/SamyPesse/aqueduc)
[![NPM version](https://badge.fury.io/js/aqueduc.svg)](http://badge.fury.io/js/aqueduc)

Aqueduc provides async server-side rendering (SSR) for React/Flux based applications. It solves the problematic of rendering React application with async components being rendered once data are fetched.

Aqueduc is "flux-agnostic", and works perfectly with `redux` and `react-redux`.

A few notes to understand Aqueduc:

1. Connect a component which requires async data to a function to trigger a fetch once needed
2. Aqueduc will trigger fetch recursively while rendering the application in depth
3. Aqueduc **doesn't** store the data, neither pass it as props; your flux store is responsible for storing the data.
4. It works both on client and server rendering with a simple API

### Installation

```
$ npm install aqueduc --save
```

### Usage

The first step is to connect components that require async data.

For example, let's consider an `<UserProfile userID="johndoe" />` component.

```js
import React from 'react';
import ReactRedux from 'react-redux';
import Aqueduc from 'aqueduc';

import { fetchUser } from './actions/user';

/*
 * The UserProfile render informations about an user after fetching it from an API.
 */
const UserProfile = React.createClass({
    render() {
        const { user } = this.props;

        // If the user is not fetched yet, we can render a placeholder
        // or return null to hide this component.
        if (!user) {
            return null;
        }

        return (
            <div>
                <img src={user.photoURL} />
                <h1>{user.displayName}</h1>
            </div>
        );
    }
});

/*
 * We connect the component to our redux store,
 * the store contains a caching of all fetched users.
 */
const connectToStore = ReactRedux.connect((state, props) => ({
    user: state.getUser(props.userID)
}));

/*
 * We connect the component to Aqueduc to dispatch a fetching action
 * if we don't have the user in the cache.
 */
const connectToAqueduc = Aqueduc.connect((props) => {
    // We return nothing if no async operation is needed.
    // This condition can be changed to fetch it again if cache is old, etc
    if (props.user) {
        return;
    }

    return props.dispatch(fetchUser(props.userID));
});

export default connectToAqueduc(connectToStore(UserProfile));
```

Rendering on the client-side doesn't require any more work.

But if we want to render our entire application to HTML on the server, we should use `Aqueduc.render` instead of `ReactDOM.renderToString`.

```js
import React from 'react';
import { render } from 'aqueduc/server';

import UserProfile from './UserProfile';

Aqueduc.render(
    () => <UserProfile userID="johndoe" />
)
.then((html) => {
    console.log(html);
});
```

### FAQ

##### How well does Aqueduc “scale” in terms of performance?

Aqueduc performances depend on your application. If your application doesn't have async components, it'll be as fast as `ReactDOM.renderToString`.

But if your application has too many level of depth with async components, performances can drop. In that case the solution is to move most of the async requirements top-level so that `Aqueduc` can do parallel fetching.

##### Can I use Aqueduc with another flux implementation than Redux ?

Yes, Aqueduc is "flux-agnostic", but this repository only showcase examples with Redux.

##### Rendering is causing an infinite loop, what is happening ?

If your connector has a loophole, it may cause an infinite loop when using `Aqueduc.render`.

For example, it happens if the connector returns a promise when the fetching has already be done but returned an error.
