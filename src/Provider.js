/* @flow */

import React from 'react';

/*
 * Provider for context used in the server-side.
 */
const Provider = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        enqueue: React.PropTypes.func.isRequired,
        enqueueCleanup: React.PropTypes.func.isRequired
    },

    childContextTypes: {
        enqueueAQPromise: React.PropTypes.func,
        enququeAQCleanup: React.PropTypes.func
    },

    getChildContext() {
        const { enqueue, enqueueCleanup } = this.props;
        return {
            enqueueAQPromise: enqueue,
            enququeAQCleanup: enqueueCleanup
        };
    },

    render() {
        const { children } = this.props;
        return React.Children.only(children);
    }
});

export default Provider;
