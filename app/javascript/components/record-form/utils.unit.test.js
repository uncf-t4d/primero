import { parseISO } from "date-fns";
import { fromJS } from "immutable";

import { useFakeTimers } from "../../test";
import {
  APPROVALS,
  CHANGE_LOGS,
  INCIDENT_FROM_CASE,
  RECORD_OWNER,
  REFERRAL,
  TRANSFERS_ASSIGNMENTS
} from "../../config";
import { SHOW_APPROVALS } from "../../libs/permissions";

import { getDefaultRecordInfoForms } from "./form/utils";
import { FormSectionRecord, FieldRecord, NavRecord } from "./records";
import { DATE_FIELD, SELECT_FIELD, TICK_FIELD, SUBFORM_SECTION, TEXT_FIELD } from "./constants";
import * as utils from "./utils";

describe("<RecordForms /> - utils", () => {
  describe("compactValues", () => {
    it("returns object of values that changed", () => {
      const initialValues = {
        name: "John",
        phone: "555-555-5555",
        sex: null,
        un_no: null,
        caregiver_name: "",
        caregiver_number: "234-323-2353",
        services: [
          {
            unique_id: "123",
            un_id: "2134"
          }
        ],
        locations: ["loc-1"],
        past_locations: ["loc-2", "loc-3"],
        test_locations: ["loc-4"],
        same_locations: ["loc-4", "loc-5"],
        same_relatives: [
          {
            unique_id: "123",
            name: "Name 1"
          },
          {
            unique_id: "345",
            name: "Name 2"
          }
        ],
        location_relatives: [
          {
            unique_id: "123",
            name: "Name 1",
            location: ["loc_1", "loc_2"]
          },
          {
            unique_id: "345",
            name: "Name 2",
            location: ["loc_1", "loc_2"]
          }
        ],
        relatives: [
          {
            unique_id: "234",
            father_name: "Joe"
          },
          {
            uncle_name: "Jimmy",
            unique_id: "125",
            phone: ""
          }
        ]
      };

      const values = {
        name: "John",
        phone: "555-555-5556",
        sex: null,
        services: [
          {
            _destroy: true,
            unique_id: "123"
          }
        ],
        locations: ["loc-1", "loc-2"],
        past_locations: ["loc-3"],
        future_locations: [],
        test_locations: [],
        same_locations: ["loc-4", "loc-5"],
        caregiver_number: "",
        incident_details: [
          {
            cp_incident_perpetrator_national_id_no: "",
            cp_incident_perpetrator_nationality: "",
            cp_incident_perpetrator_occupation: "",
            cp_incident_perpetrator_other_id_no: ""
          }
        ],
        same_relatives: [
          {
            unique_id: "123",
            name: "Name 1"
          },
          {
            unique_id: "345",
            name: "Name 2"
          }
        ],
        relatives: [
          {
            unique_id: "234",
            father_name: "Joe"
          },
          {
            mother_name: "James"
          },
          {
            uncle_name: "Jimmy",
            unique_id: "125",
            phone: "555-333-5534"
          }
        ],
        location_relatives: [
          {
            unique_id: "123",
            name: "Name 1",
            location: []
          },
          {
            unique_id: "345",
            name: "Name 2",
            location: ["loc_1", "loc_2", "loc_3"]
          }
        ]
      };

      const expected = {
        caregiver_number: "",
        phone: "555-555-5556",
        services: [
          {
            _destroy: true,
            unique_id: "123"
          }
        ],
        locations: ["loc-1", "loc-2"],
        test_locations: [],
        past_locations: ["loc-3"],
        relatives: [
          {
            mother_name: "James"
          },
          {
            unique_id: "125",
            phone: "555-333-5534"
          }
        ],
        location_relatives: [
          {
            unique_id: "123",
            location: []
          },
          {
            unique_id: "345",
            location: ["loc_1", "loc_2", "loc_3"]
          }
        ]
      };

      expect(utils.compactValues(values, initialValues)).to.deep.equal(expected);
    });
  });

  describe("emptyValues", () => {
    it("should return true if all of the object's values are empty", () => {
      const testObject = {
        a: [],
        b: {},
        c: false
      };

      expect(utils.emptyValues(testObject)).to.be.true;
    });
    it("should return false if any of the object's values are not empty", () => {
      const testObject = {
        a: [],
        b: "Test 2"
      };

      expect(utils.emptyValues(testObject)).to.be.false;
    });
  });

  describe("getRedirectPath", () => {
    it("should return the path to the case id if there is a incidentFromCase", () => {
      expect(utils.getRedirectPath({ isNew: true }, {}, "case-id-1")).to.equal("/cases/case-id-1");
    });

    it("should return the path to the incident id if is not new", () => {
      expect(utils.getRedirectPath({ isEdit: true }, { recordType: "incidents", id: "incident-id-1" }), "").to.equal(
        "/incidents/incident-id-1"
      );
    });

    it("should return the path to incidents if is new", () => {
      expect(utils.getRedirectPath({ isNew: true }, { recordType: "incidents", id: "incident-id-1" }, "")).to.equal(
        "/incidents"
      );
    });
  });

  describe("constructInitialValues", () => {
    let clock = null;

    beforeEach(() => {
      const today = parseISO("2010-01-05T18:30:00Z");

      clock = useFakeTimers(today);
    });

    it("should generate default values if they are defined", () => {
      const forms = [
        FormSectionRecord({
          unique_id: "form_1",
          fields: [
            FieldRecord({ name: "field_1", selected_value: "default_value_1" }),
            FieldRecord({
              name: "field_2",
              type: SELECT_FIELD,
              multi_select: true,
              selected_value: `["value_1", "value_2"]`
            }),
            FieldRecord({
              name: "field_3",
              type: TICK_FIELD,
              selected_value: true
            }),
            FieldRecord({
              name: "field_4",
              type: DATE_FIELD,
              selected_value: "today"
            })
          ]
        })
      ];

      const expectedInitialValues = {
        field_1: "default_value_1",
        field_2: ["value_1", "value_2"],
        field_3: true,
        field_4: "2010-01-05"
      };

      expect(utils.constructInitialValues(forms)).to.deep.equal(expectedInitialValues);
    });

    it("should not generate default values if they are not defined", () => {
      const forms = [
        FormSectionRecord({
          unique_id: "form_1",
          fields: [
            FieldRecord({ name: "field_1" }),
            FieldRecord({
              name: "field_2",
              type: SELECT_FIELD,
              multi_select: true
            }),
            FieldRecord({
              name: "field_3",
              type: TICK_FIELD
            }),
            FieldRecord({
              name: "field_4",
              type: DATE_FIELD
            })
          ]
        })
      ];

      const expectedInitialValues = {
        field_1: "",
        field_2: [],
        field_3: false,
        field_4: null
      };

      expect(utils.constructInitialValues(forms)).to.deep.equal(expectedInitialValues);
    });

    afterEach(() => {
      clock.restore();
    });
  });

  describe("sortSubformValues", () => {
    it("should return subforms with display conditions from subform_section_configuration", () => {
      const forms = [
        FormSectionRecord({
          unique_id: "form_1",
          fields: [
            FieldRecord({ name: "field_1", selected_value: "default_value_1" }),
            FieldRecord({
              display_name: "Test SubField",
              subform_section_id: FormSectionRecord({
                unique_id: "subform_1",
                fields: [
                  FieldRecord({
                    display_name: "Test Sub Field Allowed",
                    name: "allowed_field",
                    type: TEXT_FIELD,
                    visible: true
                  }),
                  FieldRecord({
                    display_name: "Test Sub Field Disallowed",
                    name: "disallowed_field",
                    type: TEXT_FIELD,
                    visible: true
                  })
                ]
              }),
              subform_section_configuration: {
                fields: ["allowed_field"],
                display_conditions: [
                  {
                    allowed_field: "gerald"
                  }
                ]
              },
              name: "subform_1",
              type: SUBFORM_SECTION
            })
          ]
        })
      ];

      const initialValues = {
        subform_1: [
          { allowed_field: "stanley", disallowed_field: "test disallowed", _hidden: true },
          { allowed_field: "gerald", disallowed_field: "test disallowed" }
        ],
        subform_2: [],
        subform_3: []
      };

      const expected = {
        subform_1: [
          { allowed_field: "stanley", disallowed_field: "test disallowed", _hidden: true },
          {
            allowed_field: "gerald",
            disallowed_field: "test disallowed"
          }
        ]
      };

      const result = utils.sortSubformValues(initialValues, forms);

      expect(result).to.deep.equals(expected);
    });

    it("should return subforms sorted by subformSortBy field", () => {
      const forms = [
        FormSectionRecord({
          unique_id: "form_1",
          fields: [
            FieldRecord({ name: "field_1", selected_value: "default_value_1" }),
            FieldRecord({
              display_name: "Test SubField",
              subform_section_id: FormSectionRecord({
                unique_id: "subform_1",
                fields: [
                  FieldRecord({
                    display_name: "Test Sub Field Allowed",
                    name: "allowed_field",
                    type: TEXT_FIELD,
                    visible: true
                  })
                ]
              }),
              subform_section_configuration: {
                subform_sort_by: "allowed_field"
              },
              name: "subform_1",
              type: SUBFORM_SECTION
            })
          ]
        })
      ];

      const initialValues = {
        subform_1: [{ allowed_field: "b" }, { allowed_field: "c" }, { allowed_field: "a" }],
        subform_2: [],
        subform_3: []
      };

      const expected = {
        subform_1: [{ allowed_field: "a" }, { allowed_field: "b" }, { allowed_field: "c" }]
      };

      const result = utils.sortSubformValues(initialValues, forms);

      expect(result).to.deep.equals(expected);
    });
  });

  describe("buildFormNav", () => {
    it("should return the nav with the permission_actions if defined", () => {
      const expected = NavRecord({
        group: "group_1",
        groupOrder: 1,
        name: "Approvals",
        order: 1,
        formId: APPROVALS,
        is_first_tab: true,
        permission_actions: SHOW_APPROVALS
      });

      const approvalsForm = FormSectionRecord({
        unique_id: APPROVALS,
        form_group_id: "group_1",
        name: { en: "Approvals" },
        order: 1,
        order_form_group: 1,
        is_first_tab: true
      });

      expect(utils.buildFormNav(approvalsForm)).to.deep.equal(expected);
    });

    it("should return the nav without permission_actions if not defined", () => {
      const expected = NavRecord({
        group: "group_1",
        groupOrder: 1,
        name: "Form 1",
        order: 1,
        formId: "form_id_1",
        is_first_tab: true
      });

      const form = FormSectionRecord({
        unique_id: "form_id_1",
        form_group_id: "group_1",
        name: { en: "Form 1" },
        order: 1,
        order_form_group: 1,
        is_first_tab: true
      });

      expect(utils.buildFormNav(form)).to.deep.equal(expected);
    });
  });

  describe("pickFormDefaultForms", () => {
    it("should return default forms for the not found in the state", () => {
      const forms = fromJS({
        1: FormSectionRecord({
          unique_id: RECORD_OWNER,
          form_group_id: "group_1",
          name: { en: "Record Owner in State" },
          order: 1,
          order_form_group: 1,
          is_first_tab: true
        })
      });

      const result = Object.keys(
        utils.pickFromDefaultForms(forms, getDefaultRecordInfoForms({ t: value => value, locale: "en" }))
      );

      expect(result).to.deep.equal([APPROVALS, INCIDENT_FROM_CASE, REFERRAL, TRANSFERS_ASSIGNMENTS, CHANGE_LOGS]);
    });
  });
});
