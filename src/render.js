/* @flow */

import ReactDOMServer from 'react-dom/server'
import Provider from './Provider';

/*
 * Recursively render a react element until all async resolutions are completed.
 */
function render(
    getElement: () => el: React$Element<*>
) : Promise<string> {
    const pending = [];
    const pushAQPending = (promise) => {
        pending.push(promise);
    };

    const result = (
        <Provider pushAQPending={pushAQPending}>
            {getElement()}
        </Provider>
    );

    // This is a crappy/hacky method since it render
    // the element to string N times.
    // Maybe we could use a test renderer, and at the end render to string.
    const out = ReactDOMServer.renderToString(result);

    if (pending.length == 0) {
        return Promise.resolve(out);
    }

    return Promise.all(pending)
    .then(() => {
        return render(getElement);
    })
}

export default render;
