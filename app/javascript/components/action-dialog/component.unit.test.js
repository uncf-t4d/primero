import { expect } from "chai";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@material-ui/core";

import { setupMountedComponent } from "../../test";

import ActionDialog from "./component";

describe("<ActionDialog />", () => {
  let component;
  const props = {
    open: true,
    successHandler: () => {},
    cancelHandler: () => {},
    dialogTitle: "",
    dialogTitleSmall: "",
    dialogText: "",
    confirmButtonLabel: "",
    children: [],
    onClose: () => {},
    confirmButtonProps: {},
    omitCloseAfterSuccess: false
  };

  beforeEach(() => {
    ({ component } = setupMountedComponent(ActionDialog, props, {}));
  });

  it("should render Dialog", () => {
    expect(component.find(Dialog)).to.have.lengthOf(1);
  });

  it("should render DialogActions", () => {
    expect(component.find(DialogActions)).to.have.lengthOf(1);
  });

  it("should render DialogContent", () => {
    expect(component.find(DialogContent)).to.have.lengthOf(1);
  });

  it("should render DialogTitle", () => {
    expect(component.find(DialogTitle)).to.have.lengthOf(1);
  });

  it("should render IconButton", () => {
    expect(component.find(IconButton)).to.have.lengthOf(1);
  });

  it("should render Button", () => {
    expect(component.find(Button)).to.have.lengthOf(2);
  });

  it("should accept valid props", () => {
    const actionDialogProps = { ...component.find(ActionDialog).props() };

    expect(component.find(ActionDialog)).to.have.lengthOf(1);
    [
      "open",
      "successHandler",
      "cancelHandler",
      "dialogTitle",
      "dialogText",
      "confirmButtonLabel",
      "children",
      "onClose",
      "confirmButtonProps",
      "omitCloseAfterSuccess",
      "dialogTitleSmall"
    ].forEach(property => {
      expect(actionDialogProps).to.have.property(property);
      delete actionDialogProps[property];
    });
    expect(actionDialogProps).to.be.empty;
  });
});
