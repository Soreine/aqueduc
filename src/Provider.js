/* @flow */

import React from 'react';

/*
 * Provider for context used in the server-side.
 */
const Provider = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        pushAQPending: React.PropTypes.func.isRequired
    },

    childContextTypes: {
        pushAQPending: React.PropTypes.func
    },

    getChildContext() {
        const { pushAQPending } = this.props;
        return {
            pushAQPending
        };
    },

    render() {
        const { children } = this.props;
        return React.Children.only(children);
    }
});

export default Provider;
