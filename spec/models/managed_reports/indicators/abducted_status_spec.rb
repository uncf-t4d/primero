# frozen_string_literal: true

require 'rails_helper'

describe ManagedReports::Indicators::AbductedStatus do
  before do
    clean_data(Incident, Violation, IndividualVictim, UserGroup, User, Agency, Role)

    permissions = [
      Permission.new(
        resource: Permission::MANAGED_REPORT,
        actions: [
          Permission::VIOLATION_REPORT
        ]
      )
    ]
    self_role = Role.create!(
      name: 'Self Role 1',
      unique_id: 'self-role-1',
      group_permission: Permission::SELF,
      permissions: permissions
    )

    group_role = Role.create!(
      name: 'Group Role 1',
      unique_id: 'group-role-1',
      group_permission: Permission::GROUP,
      permissions: permissions
    )

    agency_role = Role.create!(
      name: 'Agency Role 1',
      unique_id: 'agency-role-1',
      group_permission: Permission::AGENCY,
      permissions: permissions
    )

    all_role = Role.create!(
      name: 'All Role 1',
      unique_id: 'all-role-1',
      group_permission: Permission::ALL,
      permissions: permissions
    )

    agency_a = Agency.create!(name: 'Agency 1', agency_code: 'agency1', unique_id: 'agency1')
    agency_b = Agency.create!(name: 'Agency 2', agency_code: 'agency2', unique_id: 'agency2')

    group_a = UserGroup.create(unique_id: 'group-a', name: 'Group A')
    group_b = UserGroup.create(unique_id: 'group-b', name: 'Group B')

    @self_user = User.create!(
      full_name: 'Self User',
      user_name: 'self_user',
      email: 'self_user@localhost.com',
      agency_id: agency_a.id,
      user_groups: [group_a],
      role: self_role
    )

    @group_user = User.create!(
      full_name: 'Group User',
      user_name: 'group_user',
      email: 'group_user@localhost.com',
      agency_id: agency_b.id,
      user_groups: [group_b],
      role: group_role
    )

    @agency_user = User.create!(
      full_name: 'Agency User',
      user_name: 'agency_user',
      email: 'agency_user@localhost.com',
      agency_id: agency_b.id,
      user_groups: [group_b],
      role: agency_role
    )

    @all_user = User.create!(
      full_name: 'all User',
      user_name: 'all_user',
      email: 'all_user@localhost.com',
      agency_id: agency_a.id,
      user_groups: [group_a, group_b],
      role: all_role
    )

    incident1 = Incident.new_with_user(@self_user, { incident_date: Date.new(2020, 8, 8), status: 'open' })
    incident1.save!
    incident2 = Incident.new_with_user(@group_user, { incident_date: Date.new(2021, 8, 8), status: 'open' })
    incident2.save!
    incident3 = Incident.new_with_user(@agency_user, { incident_date: Date.new(2022, 1, 8), status: 'open' })
    incident3.save!
    incident4 = Incident.new_with_user(@all_user, { incident_date: Date.new(2022, 2, 18), status: 'open' })
    incident4.save!
    incident5 = Incident.new_with_user(@all_user, { incident_date: Date.new(2022, 3, 28), status: 'open' })
    incident5.save!

    Violation.create!(
      data: {
        type: 'abduction',
        violation_tally: { 'boys': 1, 'girls': 2, 'unknown': 3, 'total': 6 },
        abduction_regained_freedom: 'false'
      },
      incident_id: incident1.id
    )
    Violation.create!(
      data: {
        type: 'abduction',
        violation_tally: { 'boys': 1, 'girls': 1, 'unknown': 1, 'total': 3 },
        abduction_regained_freedom: 'unknown'
      },
      incident_id: incident2.id
    )
    Violation.create!(
      data: {
        type: 'maiming',
        violation_tally: { 'boys': 2, 'girls': 1, 'unknown': 2, 'total': 5 }
      },
      incident_id: incident3.id
    )
    Violation.create!(
      data: {
        type: 'abduction',
        violation_tally: { 'boys': 2, 'girls': 3, 'unknown': 2, 'total': 7 },
        abduction_regained_freedom: 'true',
        abduction_regained_freedom_how: 'escape'
      },
      incident_id: incident4.id
    )
    Violation.create!(
      data: {
        type: 'abduction',
        violation_tally: { 'boys': 2, 'girls': 5, 'unknown': 2, 'total': 9 },
        abduction_regained_freedom: 'true',
        abduction_regained_freedom_how: 'payment_of_ransom'
      },
      incident_id: incident5.id
    )
  end

  it 'returns data for violation tally indicator' do
    abducted_status_data = ManagedReports::Indicators::AbductedStatus.build(
      nil,
      { 'type' => SearchFilters::Value.new(field_name: 'type', value: 'abduction') }
    ).data

    expect(abducted_status_data).to match_array(
      [
        { total: 6, id: 'still_being_held' },
        { total: 9, id: 'released' },
        { total: 3, id: 'unknown' },
        { total: 7, id: 'escape' }
      ]
    )
  end

  describe 'records in scope' do
    it 'returns owned records for a self scope' do
      abducted_status_data = ManagedReports::Indicators::AbductedStatus.build(@self_user).data

      expect(abducted_status_data).to match_array(
        [
          { total: 6, id: 'still_being_held' }
        ]
      )
    end

    it 'returns group records for a group scope' do
      abducted_status_data = ManagedReports::Indicators::AbductedStatus.build(@group_user).data

      expect(abducted_status_data).to match_array(
        [
          { id: 'escape', total: 7 }, { id: 'released', total: 9 }, { id: 'unknown', total: 3 }
        ]
      )
    end

    it 'returns agency records for an agency scope' do
      abducted_status_data = ManagedReports::Indicators::AbductedStatus.build(@agency_user).data

      expect(abducted_status_data).to match_array(
        [
          { id: 'unknown', total: 3 }
        ]
      )
    end

    it 'returns all records for an all scope' do
      abducted_status_data = ManagedReports::Indicators::AbductedStatus.build(@all_user).data

      expect(abducted_status_data).to match_array(
        [
          { id: 'escape', total: 7 },
          { id: 'released', total: 9 },
          { id: 'still_being_held', total: 6 },
          { id: 'unknown', total: 3 }
        ]
      )
    end
  end

  describe 'grouped by' do
    context 'when is year' do
      it 'should return results grouped by year' do
        data = ManagedReports::Indicators::AbductedStatus.build(
          nil,
          {
            'grouped_by' => SearchFilters::Value.new(field_name: 'grouped_by', value: 'year'),
            'incident_date' => SearchFilters::DateRange.new(
              field_name: 'incident_date',
              from: '2020-08-01',
              to: '2022-10-10'
            ),
            'type' => SearchFilters::Value.new(field_name: 'type', value: 'abduction')
          }
        ).data

        expect(data).to match_array(
          [
            { group_id: 2022, data: [{ id: 'escape', total: 7 }, { id: 'released', total: 9 }] },
            { group_id: 2020, data: [{ id: 'still_being_held', total: 6 }] },
            { group_id: 2021, data: [{ id: 'unknown', total: 3 }] }
          ]
        )
      end
    end

    context 'when is month' do
      it 'should return results grouped by month' do
        data = ManagedReports::Indicators::AbductedStatus.build(
          nil,
          {
            'grouped_by' => SearchFilters::Value.new(field_name: 'grouped_by', value: 'month'),
            'incident_date' => SearchFilters::DateRange.new(
              field_name: 'incident_date',
              from: '2021-08-01',
              to: '2022-03-30'
            ),
            'type' => SearchFilters::Value.new(field_name: 'type', value: 'abduction')
          }
        ).data

        expect(data).to match_array(
          [
            { group_id: '2021-08', data: [{ id: 'unknown', total: 3 }] },
            { group_id: '2021-09', data: [] },
            { group_id: '2021-10', data: [] },
            { group_id: '2021-11', data: [] },
            { group_id: '2021-12', data: [] },
            { group_id: '2022-01', data: [] },
            { group_id: '2022-02', data: [{ id: 'escape', total: 7 }] },
            { group_id: '2022-03', data: [{ id: 'released', total: 9 }] }
          ]
        )
      end
    end

    context 'when is quarter' do
      it 'should return results grouped by quarter' do
        data = ManagedReports::Indicators::AbductedStatus.build(
          nil,
          {
            'grouped_by' => SearchFilters::Value.new(field_name: 'grouped_by', value: 'quarter'),
            'incident_date' => SearchFilters::DateRange.new(
              field_name: 'incident_date',
              from: '2020-06-01',
              to: '2022-03-20'
            ),
            'type' => SearchFilters::Value.new(field_name: 'type', value: 'abduction')
          }
        ).data

        expect(data).to match_array(
          [
            { group_id: '2020-Q2', data: [] },
            { group_id: '2020-Q3', data: [{ id: 'still_being_held', total: 6 }] },
            { group_id: '2020-Q4', data: [] },
            { group_id: '2021-Q1', data: [] },
            { group_id: '2021-Q2', data: [] },
            { group_id: '2021-Q3', data: [{ id: 'unknown', total: 3 }] },
            { group_id: '2021-Q4', data: [] },
            { group_id: '2022-Q1', data: [{ id: 'escape', total: 7 }] }
          ]
        )
      end
    end
  end
end
