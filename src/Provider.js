import React from 'react';

const Provider = React.createClass({
    propTypes: {
        children: React.PropTypes.node
    },

    childContextTypes: {
        pushAQPending: React.PropTypes.func
    },

    getChildContext() {

    },

    render() {
        const { children } = this.props;
        return React.Children.only(children);
    }
});

export default Provider;
