import { useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { fromJS } from "immutable";
import { yupResolver } from "@hookform/resolvers/yup";

import { HTTP_STATUS } from "../../config";
import { useI18n } from "../i18n";

import CancelPrompt from "./components/cancel-prompt";
import FormSection from "./components/form-section";
import { whichFormMode } from "./utils/which-mode";
import { submitHandler } from "./utils/form-submission";

const Component = ({
  formID,
  formSections,
  formOptions,
  formMode,
  onSubmit,
  validations,
  mode,
  initialValues,
  useCancelPrompt,
  formErrors,
  submitAllFields,
  useFormMode,
  renderBottom,
  showTitle = true,
  submitAlways,
  formClassName,
  registerFields,
  resetAfterSubmit = false
}) => {
  const i18n = useI18n();
  const dispatch = useDispatch();

  const formMethods = useForm({
    mode: useFormMode || "onSubmit",
    ...(initialValues && { defaultValues: initialValues }),
    ...(validations && { resolver: yupResolver(validations) }),
    ...formOptions
  });

  const {
    handleSubmit,
    setError,
    reset,
    errors,
    formState: { dirtyFields, isDirty, isSubmitted },
    register,
    unregister
  } = formMethods;

  const formState = formMode || whichFormMode(mode);

  useEffect(() => {
    registerFields.forEach(field => register(field));

    return () => {
      registerFields.forEach(field => unregister(field));
    };
  }, [register]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    formErrors
      ?.filter(error => error.get("status") === HTTP_STATUS.invalidRecord)
      .forEach(error => {
        setError(error.get("detail"), "", i18n.t(error.getIn(["message", 0])));
      });
  }, [formErrors]);

  useEffect(() => {
    reset(initialValues);
  }, [JSON.stringify(initialValues)]);

  useEffect(() => {
    if (resetAfterSubmit && isSubmitted) {
      reset(initialValues);
    }
  }, [resetAfterSubmit, isSubmitted]);

  const renderFormSections = () =>
    formSections.map(formSection => (
      <FormSection
        showTitle={showTitle}
        formSection={formSection}
        key={formSection.unique_id}
        errors={errors}
        formMethods={formMethods}
        formMode={formState}
      />
    ));

  const submit = data => {
    submitHandler({
      data,
      dispatch,
      dirtyFields,
      isEdit: formState.isEdit,
      initialValues,
      onSubmit,
      submitAllFields,
      submitAlways
    });
  };

  // Do not propagate form onSubmit
  // Based on https://github.com/react-hook-form/react-hook-form/issues/1005#issuecomment-626050339
  const notPropagatedOnSubmit = async event => {
    event.preventDefault();
    event.stopPropagation();

    return handleSubmit(submit)(event);
  };

  return (
    <>
      <CancelPrompt
        useCancelPrompt={useCancelPrompt}
        isShow={formState.isShow}
        isSubmitted={isSubmitted}
        isDirty={isDirty}
      />
      <form noValidate onSubmit={notPropagatedOnSubmit} id={formID} className={formClassName}>
        {renderFormSections(formSections)}
      </form>
      {renderBottom && renderBottom(formMethods)}
    </>
  );
};

Component.displayName = "Form";

Component.defaultProps = {
  formErrors: fromJS([]),
  formOptions: {},
  initialValues: {},
  mode: "new",
  registerFields: [],
  submitAllFields: false,
  submitAlways: false,
  useCancelPrompt: false
};

Component.propTypes = {
  formClassName: PropTypes.string,
  formErrors: PropTypes.object,
  formID: PropTypes.string.isRequired,
  formMode: PropTypes.object,
  formOptions: PropTypes.object,
  formSections: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  mode: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  registerFields: PropTypes.array,
  renderBottom: PropTypes.func,
  resetAfterSubmit: PropTypes.bool,
  showTitle: PropTypes.bool,
  submitAllFields: PropTypes.bool,
  submitAlways: PropTypes.bool,
  useCancelPrompt: PropTypes.bool,
  useFormMode: PropTypes.oneOf(["onSubmit", "onBlur"]),
  validations: PropTypes.object
};

export default Component;
