# Aqueduc

Async server-side rendering for react and flux. It solves the problematic of rendering React+Redux application with async components being rendered once data are fetched.

Aqueduc is "flux-agnostic", and works very well with `redux` and `react-redux`.

### Installation

```
$ npm install aqueduc --save
```

### Usage

The first step is to connect components that require async data.

For example, let's consider an `<UserProfile username="johndoe" />` component.

```js
import React from 'react';
import ReactRedux from 'react-redux';
import Aqueduc from 'aqueduc';

import { fetchUser } from './actions/user';

const UserProfile = React.createClass({
    render() {
        const { user } = this.props;

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

// Connect the component to our redux store
const connectToStore = ReactRedux.connect((state, props) => ({
    user: state.getUser(props.username)
}));

// Connect to aqueduc to fetch the user when needed
// The component will be rendered again once the returned promise is resolved
const connectToAqueduc = Aqueduc.connect((props) => {
    if (props.user) {
        return;
    }

    return props.dispatch(fetchUser(props.username));
});

export default connectToAqueduc(connectToStore(UserProfile));
```

On the server, you can use Aqueduc to render the whole async application:

```js
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Aqueduc from 'aqueduc';

import UserProfile from './UserProfile';

Aqueduc.render(<UserProfile username="johndoe" />)
.then((el) => {
    return ReactDOMServer.renderToString(el);
});
```
