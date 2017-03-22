/* @flow */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Provider from './Provider';

type GetElement = () => React.Element<*>

/*
 * Recursively render a react element until all async resolutions are completed.
 * This function is made for the server.
 */

function renderWithCleaner(
     getElement: GetElement,
     enqueueCleanup
 ) : Promise<string> {
    const pending = [];

    const enqueue = (promise) => {
        pending.push(promise);
    };

    const result = (
         <Provider enqueue={enqueue} enqueueCleanup={enqueueCleanup}>
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
     });
}

function render(
    getElement: GetElement
) : Promise<string> {
    const cleaner = [];
    const enqueueCleanup = (fn) => {
        cleaner.push(fn);
    };

    return renderWithCleaner(getElement, enqueueCleanup)
    .then((html) => {
        return Promise.all(
            cleaner.map(fn => fn())
        )
        .then(() => html);
    });
}

export default render;
