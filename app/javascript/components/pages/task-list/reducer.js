import { fromJS, Map } from "immutable";
import * as Actions from "./actions";
import NAMESPACE from "./namespace";

const DEFAULT_STATE = Map({});

const reducer = (state = DEFAULT_STATE, { type, payload }) => {
  switch (type) {
    case Actions.TASKS:
      return state.set("tasks", fromJS(payload.data));
    default:
      return state;
  }
};

export const reducers = { [NAMESPACE]: reducer };
