import { fetch } from './fetch';

/**
 * @callback PopulateEndpoint
 * @param {...string} [id] One or more ids which are used to generate the endpoint for a resource
 * @returns {string} The endpoint to a resource
 */

/**
 * @callback Sorter
 * @param {string[]} ids An array of IDs to sort
 * @param {Object} state The current state which contains the mapped resources
 * @returns {string[]} The sorted array of IDs
 */

/**
 * @typedef {Object} ReduxActions
 * @param {Function} [one] An action creator which adds an object
 * @param {Function} [many] An action creator which adds many objects
 * @param {Function} [delete] An action creator which removes an object
 */

/**
 * @typedef {Object} ReduxConfig
 * @prop {string} name The name of the resource
 * @prop {PopulateEndpoint} endpoint A function which can be used to return
 * an endpoint to the resource
 * @prop {string[]} supports An array of constants indicating the type of
 * actions which the resource supports
 * @prop {string} primaryKey The name of a property on each instance which
 * can be used as a unique key to identify a given resource
 * @prop {Sorter} sortFn A function which can be used
 */


/**
 * Sometimes the object will have sub-objects of it created before the object actually exists.
 * However, this is not cause to refetch the object after we just grabbed it.
 *
 * @param {Object} object
 * @returns {boolean} - Whether or not the object provided contains any keys which start with
 * an underscore.
 */
export function fullyLoadedObject(object) {
  return object && !!Object
    .keys(object)
    .filter(key => !key.startsWith('_'))
    .length;
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator takes a "path" array of resource ids
 * and an optional additional HTTP headers. When dispatched, it fetches
 * the resource by building the endpoint using the "path" of resource ids
 * and dispatches and action to store the single resource in the Redux store.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
*/
export function genThunkOne(config, actions) {
  return (ids = [], headers = {}) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const resource = await dispatch(fetch.get(endpoint, undefined, headers));
    dispatch(actions.one(resource, ...ids));
    return resource;
  };
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator fetches a single page and stores it
 * into the redux state by default. All results are optionally filtered so
 * only certain fields (or none) are updated. The results are returned.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
 */
export function genThunkPage(config, actions) {
  return function fetchPage(page = 0, ids = [], resourceFilter, headers) {
    return async (dispatch) => {
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
      const resources = await dispatch(fetch.get(endpoint, undefined, headers));
      resources[config.name] = resources.data || [];
      await dispatch(actions.many(resources, ...ids));
      return resources;
    };
  };
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator fetches all pages, stores them in
 * Redux and returns the result.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
 */
export function genThunkAll(config, actions, fetchPage) {
  function fetchAll(ids = [], resourceFilter, options) {
    return async (dispatch) => {
      // Grab first page so we know how many there are.
      const resource = await dispatch(
        fetchPage(0, ids, resourceFilter, options));
      const resources = [resource];

      // Grab all pages we know about and store them in Redux.
      const requests = [];
      for (let i = 1; i < resources[0].pages; i += 1) {
        requests.push(fetchPage(i, ids, resourceFilter, options));
      }

      // Gather all the results for for return to the caller
      const allPages = await Promise.all(requests.map(r => dispatch(r)));
      allPages.forEach(function (response) {
        resources.push(response);
      });

      const res = {
        ...resources[resources.length - 1],
        [config.name]: resources.reduce((a, b) => [...a, ...b[config.name]], []),
      };

      return res;
    };
  }

  return fetchAll;
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator takes one or more ids which are a
 * "path" to a specific resource and makes an API call to delete the
 * resource specified by that "path". The response from the API is returned.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
 */
export function genThunkDelete(config, actions) {
  return (...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.delete(endpoint));
    dispatch(actions.delete(...ids));
    return json;
  };
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator takes an object representing the keys
 * and values of a resource to be modified and one or more ids which are a
 * "path" to the specific resource, and makes an API call to modify the
 * resource specified by that "path". The response from the API is returned.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
 */
export function genThunkPut(config, actions) {
  return (resource, ...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.put(endpoint, resource));
    dispatch(actions.one(json, ...ids));
    return json;
  };
}

/**
 * Takes a Redux config and generated Redux actions and returns a thunk
 * action creator. This action creator takes an object representing a new
 * resource to be created and one or more ids which are a "path" to a
 * specific resource, and makes an API call to create the resource specified
 * by that "path". The response from the API is returned.
 *
 * @param {ReduxConfig} config A Redux generator config
 * @param {ReduxActions} actions Generated Redux actions for the config
 */
export function genThunkPost(config, actions) {
  return (resource, ...ids) => {
    return async (dispatch) => {
      const endpoint = config.endpoint(...ids, '');
      const json = await dispatch(fetch.post(endpoint, resource));
      dispatch(actions.one(json, ...ids));
      return json;
    };
  };
}
