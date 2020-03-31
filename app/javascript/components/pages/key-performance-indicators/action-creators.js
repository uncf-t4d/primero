import * as Actions from "./actions";

const fetcherFactory = (config) => (dateRange) => async (dispatch) => {
  dispatch({
    type: config.type,
    api: {
      path: config.path,
      params: { from: dateRange.from, to: dateRange.to }
    }
  });
};

export const fetchNumberOfCases = fetcherFactory({
  type: Actions.NUMBER_OF_CASES,
  path: "key_performance_indicators/number_of_cases"
})

export const fetchNumberOfIncidents = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.NUMBER_OF_INCIDENTS,
    api: {
      path: "key_performance_indicators/number_of_incidents",
      params: { from: dateRange.from, to: dateRange.to }
    }
  });
};

export const fetchReportingDelay = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.REPORTING_DELAY,
    api: {
      path: "key_performance_indicators/reporting_delay",
      params: { from: dateRange.from, to: dateRange.to }
    }
  });
};

export const fetchServiceAccessDelay = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.SERVICE_ACCESS_DELAY,
    api: {
      path: "key_performance_indicators/service_access_delay",
      params: { from: dateRange.from, to: dateRange.to }
    }
  });
};

export const fetchAssessmentStatus = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.ASSESSMENT_STATUS,
    api: {
      path: "key_performance_indicators/assessment_status",
      params: { from: dateRange.from, to: dateRange.to }
    }
  })
}

export const fetchCompletedCaseSafetyPlans = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.COMPLETED_CASE_SAFETY_PLANS,
    api: {
      path: "key_performance_indicators/completed_case_safety_plans",
      params: { from: dateRange.from, to: dateRange.to }
    }
  })
}

export const fetchCompletedCaseActionPlans = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.COMPLETED_CASE_ACTION_PLANS,
    api: {
      path: "key_performance_indicators/completed_case_action_plans",
      params: { from: dateRange.from, to: dateRange.to }
    }
  })
}

export const fetchCompletedSupervisorApprovedCaseActionPlans = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.COMPLETED_SUPERVISOR_APPROVED_CASE_ACTION_PLANS,
    api: {
      path: "key_performance_indicators/completed_supervisor_approved_case_action_plans",
      params: { from: dateRange.from, to: dateRange.to }
    }
  })
}

export const fetchServicesProvided = (dateRange) => async dispatch => {
  dispatch({
    type: Actions.SERVICES_PROVIDED,
    api: {
      path: "key_performance_indicators/services_provided",
      params: { from: dateRange.from, to: dateRange.to }
    }
  })
}

export const fetchAverageReferrals = fetcherFactory({
  type: Actions.AVERAGE_REFERRALS,
  path: "key_performance_indicators/average_referrals"
})

export const fetchReferralsPerService = fetcherFactory({
  type: Actions.REFERRALS_PER_SERVICE,
  path: "key_performance_indicators/referrals_per_service"
})
