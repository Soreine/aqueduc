/* @flow */

import React from 'react';

type MapPropsToPromise = (
    props: Object,
    prevProps: ?Object
) => ?Promise<*>;

type Cleanup = (
    props: Object
) => ?Promise<*>;

type ComponentWrapper = (ReactClass<*>) => ReactClass<*>;

/*
 *
 */
function connect(
    mapPropsToPromise: MapPropsToPromise,
    cleanup: Cleanup = () => {}
) : ComponentWrapper {
    return (Component: ReactClass<*>) => {

        class AqueducContext extends React.Component {

            /*
             * On browser, we fetch the resources on mount and update.
             */
            componentDidMount() {
                this.fetchAsync(this.props);
            }

            componentWillReceiveProps(nextProps) {
                this.fetchAsync(nextProps, this.props);
            }

            /*
             * Fetch the data and store the cleanup result.
             */
            fetchAsync(props, prevProps) {
                const promise : ?Promise<*> = mapPropsToPromise(props, prevProps);

                if (promise) {
                    this.cleanup();

                    promise.then(
                        (result) => {
                            this.promiseExecuted = true;
                            this.promiseResult = result;
                        }
                    );
                }
            }

            /*
             * Cleanup the result of the fetch.
             */
            cleanup() {
                if (!this.promiseExecuted) {
                    return;
                }

                cleanup(this.promiseResult, this.props);
            }

            render() {
                const {
                    enqueueAQPromise,
                    enqueueAQCleanup
                } = this.context;
                const { props } = this;

                // On server-side rendering, we prepare for next rendering.
                if (enqueueAQPromise) {
                    const promise : ?Promise<*> = mapPropsToPromise(props);

                    if (promise) {
                        enqueueAQPromise(promise);
                        promise.then((result) => {
                            enqueueAQCleanup(() => cleanup(result, props));
                        });
                    }
                }

                return <Component {...props} />;
            }
        }

        AqueducContext.contextTypes = {
            enqueueAQPromise: React.PropTypes.func,
            enqueueAQCleanup: React.PropTypes.func
        };

        return AqueducContext;
    };
}

export default connect;
