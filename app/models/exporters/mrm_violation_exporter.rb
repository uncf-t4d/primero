# frozen_string_literal: true

require 'write_xlsx'

# rubocop:disable Style/ClassAndModuleChildren
module Exporters
  # Class for MRMVioletion Exporter
  # rubocop:disable Metrics/ClassLength
  class MRMViolationExporter < BaseExporter
    # rubocop:enable Style/ClassAndModuleChildren
    class << self
      def id
        'mrm_violation_xlsx'
      end

      def mime_type
        'xlsx'
      end

      def supported_models
        [Incident]
      end
    end

    def initialize(output_file_path = nil)
      super(output_file_path)
      @worksheets = {}
      @workbook = WriteXLSX.new(buffer)
    end

    def complete
      @workbook.close
    end

    def export(incidents, *_args)
      mrm_incidents = incidents.select { |inc| inc.module.try(:id) == PrimeroModule::MRM }

      violation_types(mrm_incidents).each do |vtype|
        make_violations_tab(mrm_incidents, vtype, @workbook)
      end

      make_related_data_tab(mrm_incidents, @workbook, 'Individual Details', 'individual_details_subform_section',
                            'individual_violations')
      make_related_data_tab(mrm_incidents, @workbook, 'Perpetrators', 'perpetrator_subform_section',
                            'perpetrator_violations')
      make_related_data_tab(mrm_incidents, @workbook, 'Source', 'source_subform_section', 'source_violations')
      make_related_data_tab(mrm_incidents, @workbook, 'Group Details', 'group_details_section', 'group_violations')
    end

    private

    def violation_types(incidents)
      incidents.map do |i|
        violations = i.violations
        if violations.present?
          violations.keys.select { |k| violations[k].present? }
        else
          []
        end
      end.flatten.uniq
    end

    def violation_column_generators(type, _incidents)
      violation_props = Incident.properties_by_name['violations'].type.properties_by_name[type].type.properties
      prop_names = violation_props.map(&:name)

      prop_names.inject({}) { |acc, k| acc.merge({ k => ->(_incident, violation, _type, _rf = nil) { violation[k] } }) }
    end

    def incident_column_generators
      core_forms = ['Incident', 'Record Owner', 'Intervention']
      top_level_props = Incident.properties_by_form.slice(*core_forms).values.inject(&:merge)
      keys = top_level_props.keys
      keys.inject({}) { |acc, k| acc.merge({ k => ->(incident, _violation, _type, _rf = nil) { incident[k] } }) }
    end

    def prefix_column_generators
      {
        'incident_id' => ->(incident, _violation, _type, _rf = nil) { incident.incident_id },
        'violation_id' => ->(_incident, violation, _type, _rf = nil) { violation.unique_id },
        'summary' => ->(incident, violation, type, _rf = nil) { violation_summary_value(incident, violation, type) }
      }
    end

    def violation_titleized(type)
      type.gsub(/_/, ' ').titleize
    end

    def violation_summary_value(violation, type)
      parts = [
        violation_titleized(type),
        FormSection.find_by(unique_id: type).collapsed_fields.map { |cf| violation[cf] },
        violation.unique_id[0..4]
      ].flatten.compact
      parts.join(' - ')
    end

    def make_violations_tab(incidents, vtype, workbook)
      worksheet_name = "Violations-#{vtype.humanize.titleize}"[0..30]
      generators = [prefix_column_generators, incident_column_generators,
                    violation_column_generators(vtype, incidents)].inject(&:merge)
      add_new_worksheet(workbook, worksheet_name, generators) if @worksheets[worksheet_name].blank?
      worksheet = @worksheets[worksheet_name]['sheet']
      row_no = @worksheets[worksheet_name]['row']
      write_violations_for_incidents(incidents, worksheet, row_no, generators, worksheet_name)
    end

    def add_new_worksheet(workbook, worksheet_name, generators)
      @worksheets[worksheet_name] = {}
      @worksheets[worksheet_name]['sheet'] = workbook.add_worksheet(worksheet_name)
      @worksheets[worksheet_name]['row'] = 1
      @worksheets[worksheet_name]['sheet'].write_row(0, 0, generators.keys)
      # TODO: revisit, there is a memory leak in the gem.
      # fit_column_widths(worksheet, generators.keys)
    end

    def write_violations_for_incidents(incidents, worksheet, row_no, generators, worksheet_name)
      incidents.each do |inc|
        write_violation_row(inc, worksheet, row_no, generators)
      end
      @worksheets[worksheet_name]['row'] = row_no
    end

    def write_violation_row(inc, worksheet, row_no, generators)
      (inc.violations[vtype] || []).each do |violation|
        column_values = generators.map { |_, gen| gen.call(inc, violation, vtype) }
        worksheet.write_row(row_no, 0, format_values(column_values))
        row_no += 1
      end
    end

    def find_related_fields_for_violation(related_field, violation_link_field, incident, violation, type)
      index = incident.violations[type].index(violation)
      if index.nil?
        []
      else
        link_value = violation['unique_id']
        incident[related_field].select { |el| (el[violation_link_field] || []).include?(link_value) }
      end
    end

    def related_data_generators(related_field)
      nested_property = Incident.properties_by_name[related_field]
      if nested_property.present?
        keys = nested_property.type.properties_by_name.keys
        keys.inject({}) { |acc, k| acc.merge(k => ->(_incident = nil, _violation = nil, _type = nil, rf) { rf[k] }) }
      else
        {}
      end
    end

    def make_related_data_tab(incidents, workbook, tab_name, related_field, violation_link_field)
      generators = [prefix_column_generators, related_data_generators(related_field)].inject(&:merge)
      add_new_worksheet(workbook, tab_name, generators) if @worksheets[tab_name].blank?
      worksheet = @worksheets[tab_name]['sheet']
      row_no = @worksheets[tab_name]['row']
      incidents.each do |inc|
        write_violation_row_for_tab(inc, worksheet, row_no, generators, violation_link_field)
      end
      @worksheets[worksheet_name]['row'] = row_no
    end

    def write_violation_row_for_tab(inc, worksheet, row_no, generators, violation_link_field)
      inc.each_violation do |violation, type|
        find_related_fields_for_violation(related_field, violation_link_field, inc, violation, type).each do |rf|
          column_values = generators.map { |_, gen| gen.call(inc, violation, type, rf) }
          worksheet.write_row(row_no, 0, format_values(column_values))
          row_no += 1
        end
      end
    end

    def fit_column_widths(worksheet, column_data)
      column_data.each_with_index do |d, i|
        worksheet.set_column(0, i, (d || ' ' * 8).length)
      end
    end

    def format_values(values)
      values.map do |v|
        case v
        when Array
          v.join('; ')
        else
          v
        end
      end
    end
  end
  # rubocop:enable Metrics/ClassLength
end
