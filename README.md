# Aqueduc

[![Build Status](https://travis-ci.org/SamyPesse/aqueduc.svg?branch=master)](https://travis-ci.org/SamyPesse/aqueduc)
[![NPM version](https://badge.fury.io/js/aqueduc.svg)](http://badge.fury.io/js/aqueduc)

Aqueduc provides async server-side rendering (SSR) for React/Flux based applications. It solves the problematic of rendering React applications with asynchronous components being rendered only once data are fetched.

Aqueduc is "flux-agnostic", and works perfectly with `redux` and `react-redux`.

A few notes to understand Aqueduc:

1. The API lets you connect a component which requires async data to trigger a fetch once data are needed.
2. It will trigger fetch recursively while rendering the application in depth, **you can have deep asynchronous components**.
3. It **doesn't** store the data, neither pass itself as props; your flux store is responsible for storing/caching the data.
4. It works both for client and server side rendering with a simple API.

Complete examples can be found in the [examples](./examples) directory.

### Installation

```
$ npm install aqueduc --save
```

### Usage

The first step is to connect your components that require async data.

For example, let's consider an `<UserCard userID="johndoe" />` component. The goal of this component is to fetch an user profile and render it. Only user profiles that are going to be rendered in the application need to be fetched.

```js
import React from 'react';
import ReactRedux from 'react-redux';
import Aqueduc from 'aqueduc';

import { fetchUser } from './actions/user';

/*
 * The UserProfile render informations about an user after fetching it from an API.
 */
const UserCard = React.createClass({
    render() {
        const { user } = this.props;

        // If the user has never be fetched, we can choose to render a placeholder
        // or return null to hide it.
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
 * We connect the component to our redux store.
 * Ex: The store can cache the fetched user profiles as a map.
 */
const connectToStore = ReactRedux.connect((state, props) => ({
    user: state.getUser(props.userID)
}));

/*
 * We connect the component to Aqueduc to dispatch the action to fetch the user from the API.
 * The implementation of this action depends on your application's logic.
 *
 * We trigger a fetch only the store returned us null for this userID.
 */
const connectToAqueduc = Aqueduc.connect(
    (props) => (
        !props.user
    ),
    (props) => {
        return props.dispatch(fetchUser(props.userID));
    }
);

export default connectToStore(connectToAqueduc(UserCard));
```

###### Client-side

Rendering on the client-side doesn't require any more work than connecting the component with `Aqueduc.connect`.

The fetching will be done on `componentDidMount` and `componentDidUpdate`.

###### Server-side

For applications requiring server-side rendering (SSR), we should use `Aqueduc.render` instead of `ReactDOM.renderToString`.

```js
import React from 'react';
import { render } from 'aqueduc/server';

import UserProfile from './UserProfile';

Aqueduc.render(
    () => <UserProfile userID="johndoe" />
)
.then((html) => {
    // This HTML can be sent along with the entire state of your store.
    console.log(html);
});
```

###### Cleanup

When async components have to cleanup resources behind them, a second argument can be passed to `connect`. For example the cleanup callback can be used on Firebase applications to unbind listeners.

The cleanup callback is called on `componentWillUnmount` when rendering on client-side, and after rendering the HTML on server-side.

```js
Aqueduc.connect(
    ({ user }) => !user,
    ({ user, userID, dispatch }) => user ? null : dispatch(fetchAndListenUser(userID)),
    ({ userID, dispatch }, result) => dispatch(removeUserListener(userID))
);
```

### API

##### `connect`

```js
Aqueduc.connect(
    isFetchNeeded: (props: Props, prevProps: Props) => boolean,
    fetch: (props: Props) => promise<T>,
    cleanup: (props: Props, result: T) => any,
    options: { withContext: boolean }
) : (Component => Component)
```

##### `render`

```js
Aqueduc.render(
    getElement: () => React.Element
) : promise<string>
```

### FAQ

##### How well does Aqueduc “scale” in terms of performance?

Aqueduc performances depend on your components tree. If your application doesn't have async components, it'll be as fast as `ReactDOM.renderToString`.

But if your application has too many level of depth with async components, performances can drop. In that case the solution is to move most of the async requirements top-level so that `Aqueduc` can do parallel fetching.

##### Can I use Aqueduc with another flux implementation than Redux ?

Yes, Aqueduc is "flux-agnostic". This repository only showcases examples with Redux.

##### Rendering is causing an infinite loop, what is happening ?

If your connector has a loophole, it may cause an infinite loop when using `Aqueduc.render`:

- The connector returns a promise when the fetching is not required or if the component doesn't handle error from the fetch.
- Connection of `react-redux` and `aqueduc` are reversed.

##### Can I access the `context` of my component in the connector ?

Yes, you can pass a fourth argument to `connect` which is the option and set `withContext` to `true`. The context will be passed as a third argument to `isFetchNeeded`, `fetch` and `cleanup`.
