/*
 * Example: How to use Aqueduc with Firebase.
 * This example will work both for server-side and client-side rendering.
 * It correctly cleanup listeners.
 */

import React from 'react';
import ReactRedux from 'react-redux';
import Aqueduc from 'aqueduc';
import * as firebase from 'firebase';

/*
 * The action "fetchedUser" update an user in the store's cache.
 */
import { fetchedUser } from './actions/user';

/*
 * The UserProfile render informations about an user after fetching it from an API.
 */
const UserCard = React.createClass({
    propTypes: {
        user: React.PropTypes.object
    },

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
    (props, prevProps) => {
        // We return nothing if no async operation is needed.
        // Note: This condition can be changed to fetch it again if cache is obsolete.
        if (props.user) {
            return;
        }

        const listener = (user) => {
            props.dispatch(fetchedUser(props.userID, user));
        };

        const off = () => {
            firebase.database().ref(`/users/${props.userID}`).off(listener);
        };

        return firebase.database().ref(`/users/${props.userID}`).on(listener)
        .then(() => off);
    },

    /*
     * When unmounting or after SSR, we clean the listeners
     */
    (off) => {
        off();
    }
);

export default connectToStore(connectToAqueduc(UserCard));
