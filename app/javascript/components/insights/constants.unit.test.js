import { MODULES } from "../../config/constants";

import * as constants from "./constants";

describe("<Report /> - constants", () => {
  const clone = { ...constants };

  it("should have known properties", () => {
    expect(clone).to.be.an("object");
    [
      "CONTROLS_GROUP",
      "CUSTOM",
      "DATE_CONTROLS",
      "DATE_CONTROLS_GROUP",
      "DATE_PATTERN",
      "DELETE_MODAL",
      "EXPORT_INSIGHTS_PATH",
      "INSIGHTS_CONFIG",
      "INSIGHTS_EXPORTER_DIALOG",
      "LAST_MONTH",
      "LAST_QUARTER",
      "LAST_YEAR",
      "MANAGED_REPORTS",
      "MONTH",
      "MONTH_OPTION_IDS",
      "NAME",
      "NAMESPACE",
      "QUARTER",
      "QUARTER_OPTION_IDS",
      "SHARED_FILTERS",
      "THIS_MONTH",
      "THIS_QUARTER",
      "THIS_YEAR",
      "TOTAL",
      "TOTAL_KEY",
      "VIOLATION",
      "YEAR",
      "YEAR_OPTION_IDS",
      "DATE_RANGE_VIEW_BY_DISPLAY_NAME",
      "DATE_RANGE_DISPLAY_NAME",
      "DATE_RANGE_FROM_DISPLAY_NAME",
      "DATE_RANGE_TO_DISPLAY_NAME",
      "FILTER_BY_DATE_DISPLAY_NAME",
      "FILTER_BY_VERIFICATION_STATUS_DISPLAY_NAME",
      "DATE_RANGE",
      "GROUPED_BY"
    ].forEach(property => {
      expect(clone).to.have.property(property);
      delete clone[property];
    });

    expect(clone).to.be.empty;
  });

  it("should have properties for INSIGHTS_CONFIG", () => {
    const clonedInsightsConfig = { ...constants.INSIGHTS_CONFIG };

    expect(clonedInsightsConfig).to.be.an("object");

    [MODULES.MRM, MODULES.GBV].forEach(property => {
      const clonedModuleObject = { ...clonedInsightsConfig[property] };

      expect(clonedInsightsConfig).to.have.property(property);
      delete clonedInsightsConfig[property];

      ["ids", "localeKeys", "defaultFilterValues", "filters"].forEach(prop => {
        expect(clonedModuleObject).to.have.property(prop);
        delete clonedModuleObject[prop];
      });
    });

    expect(clonedInsightsConfig).to.be.empty;
  });
});
