import { fromJS } from "immutable";

import { getInsight, getInsightFilter, getIsGroupedInsight } from "./selectors";

const stateWithoutRecords = fromJS({});
const stateWithRecords = fromJS({
  records: {
    insights: {
      selectedReport: {
        id: 1,
        name: { en: "Test Report" },
        graph: true,
        graph_type: "bar"
      }
    }
  }
});

describe("<Insights /> - Selectors", () => {
  describe("selectInsight", () => {
    it("should return records", () => {
      const expected = fromJS({
        id: 1,
        name: { en: "Test Report" },
        graph: true,
        graph_type: "bar"
      });

      const records = getInsight(stateWithRecords, 1);

      expect(records).to.deep.equal(expected);
    });

    it("should return empty object when records empty", () => {
      const expected = fromJS({});
      const records = getInsight(stateWithoutRecords, 1);

      expect(records).to.deep.equal(expected);
    });
  });

  describe("getIsGroupedInsight", () => {
    it("returns true if the insights have group_id", () => {
      const stateWithGroups = fromJS({
        records: {
          insights: {
            selectedReport: {
              report_data: {
                subreport_1: {
                  indicator_1: [
                    {
                      group_id: "group_1",
                      data: [{ id: "option_1", total: 10 }]
                    }
                  ]
                }
              }
            }
          }
        }
      });

      expect(getIsGroupedInsight(stateWithGroups, "subreport_1")).to.be.true;
    });

    it("returns false if the insights don't have group_id", () => {
      expect(getIsGroupedInsight(stateWithoutRecords, "subreport_1")).to.be.false;
    });
  });

  describe("getInsightFilter", () => {
    it("returns a filter if exists", () => {
      const stateWithFilters = fromJS({ records: { insights: { filters: { grouped_by: "month" } } } });

      expect(getInsightFilter(stateWithFilters, "grouped_by")).to.equal("month");
    });

    it("returns a filter if exists", () => {
      expect(getInsightFilter(stateWithoutRecords, "grouped_by")).to.be.undefined;
    });
  });
});
