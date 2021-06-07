import { push } from "connected-react-router";

import isOnline from "./is-online";
import setCaseIncidentData from "./set-case-incident-data";

const redirectConditions = (store, callback = {}, json) => {
  const {
    incidentPath,
    moduleID,
    redirect,
    redirectToEdit,
    redirectWhenAccessDenied,
    redirectWithIdFromResponse
  } = callback;

  // eslint-disable-next-line camelcase
  if (redirectWhenAccessDenied && json?.data?.record_access_denied) {
    return redirect;
  }
  if (redirectWithIdFromResponse) {
    return `${redirect}/${json?.data?.id}`;
  }
  if (redirectToEdit) {
    return `${redirect}/${json?.data?.id}/edit`;
  }
  if (incidentPath) {
    return incidentPath === "new" ? `/incidents/${moduleID}/new` : incidentPath;
  }

  return redirect;
};

const handleRestCallback = (store, callback, response, json, fromQueue = false) => {
  const isArrayCallback = Array.isArray(callback);

  if (callback?.setCaseIncidentData) {
    setCaseIncidentData(store, json?.data);
  }

  if (callback && (!fromQueue || callback?.api?.performFromQueue || isArrayCallback)) {
    if (isArrayCallback) {
      callback.forEach(cb => {
        const { dispatchIfStatus } = cb;

        if (dispatchIfStatus && response?.status !== dispatchIfStatus) {
          return;
        }
        handleRestCallback(store, cb, response, json, fromQueue);
      });
    } else {
      const isObjectCallback = typeof callback === "object";
      const isApiCallback = isObjectCallback && "api" in callback;

      const successPayload = isObjectCallback
        ? {
            type: callback.action,
            payload: callback.payload
          }
        : {
            type: callback,
            payload: { response, json }
          };

      store.dispatch(isApiCallback ? { type: callback.action, api: callback.api } : successPayload);

      if (isObjectCallback && callback.redirect && !fromQueue) {
        const { preventSyncAfterRedirect } = callback;
        const redirectPath = redirectConditions(store, callback, json);

        store.dispatch(push(redirectPath, { preventSyncAfterRedirect: preventSyncAfterRedirect && isOnline(store) }));
      }
    }
  }
};

export default handleRestCallback;
