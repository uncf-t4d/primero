require 'rails_helper'

describe IndicatorQueryService, search: true do
  before :each do
    permission_case = Permission.new(
      resource: Permission::CASE, actions: [Permission::READ]
    )
    role_self = Role.new(group_permission: Permission::SELF, permissions: [permission_case])
    role_self.save(validate: false)
    role_group = Role.new(group_permission: Permission::GROUP, permissions: [permission_case])
    role_group.save(validate: false)
    group1 = UserGroup.create!(name: 'Group1')

    @foo = User.new(user_name: 'foo', role: role_self, user_groups: [group1])
    @foo.save(validate: false)
    @bar = User.new(user_name: 'bar', role: role_group, user_groups: [group1])
    @bar.save(validate: false)

    @indicators = Dashboard::CASE_OVERVIEW.indicators +
      Dashboard::WORKFLOW.indicators +
      Dashboard::WORKFLOW_TEAM.indicators

    Child.create!(data: { record_state: true, status: 'open', owned_by: 'foo', workflow: 'new' })
    Child.create!(data: { record_state: true, status: 'open', owned_by: 'foo', last_updated_by: 'bar', workflow: 'assessment' })
    Child.create!(data: { record_state: false, status: 'open', owned_by: 'foo', workflow: 'new' })
    Child.create!(data: { record_state: true, status: 'closed', owned_by: 'foo', date_closure: 1.day.ago, workflow: 'closed' })
    Child.create!(data: { record_state: true, status: 'closed', owned_by: 'foo', date_closure: 2.days.ago, workflow: 'closed' })
    Child.create!(data: { record_state: true, status: 'closed', owned_by: 'foo', date_closure: 15.days.ago, workflow: 'closed' })
    Child.create!(data: { record_state: true, status: 'open', owned_by: 'bar', workflow: 'new' })

    Sunspot.commit
  end

  describe 'individual user scope' do

    let(:stats) do
      IndicatorQueryService.query(@indicators, @foo)
    end

    it 'shows the number of all open cases' do
      expect(stats['case']['open']['open']['count']).to eq(2)
    end

    it 'shows the string queries to get all open cases' do
      expected_query = %w[record_state=true status=open]
      expect(stats['case']['open']['open']['query']).to match_array(expected_query)
    end

    it 'shows the number of updated cases' do
      expect(stats['case']['updated']['updated']['count']).to eq(1)
    end

    it 'shows the string queries to get all updated cases' do
      expected_query = %w[record_state=true status=open not_edited_by_owner=true]
      expect(stats['case']['updated']['updated']['query']).to match_array(expected_query)
    end

    it 'shows the number of recently closed cases' do
      expect(stats['case']['closed_recently']['closed_recently']['count']).to eq(2)
    end

    it 'shows the workflows breakdown' do
      expect(stats['case']['workflow']['new']['count']).to eq(1)
      expect(stats['case']['workflow']['assessment']['count']).to eq(1)
      expect(stats['case']['workflow']['closed']['count']).to eq(0)
    end

    it 'shows the string queries to get the workflow breakdown' do
      expected_query_new = %w[record_state=true status=open workflow=new]
      expect(stats['case']['workflow']['new']['query']).to match_array(expected_query_new)
      expected_query_assessment = %w[record_state=true status=open workflow=assessment]
      expect(stats['case']['workflow']['assessment']['query']).to match_array(expected_query_assessment)
    end
  end

  describe 'team user scope' do

    let(:stats) do
      IndicatorQueryService.query(@indicators, @bar)
    end

    it 'shows the team workflow breakdown' do
      expect(stats['case']['workflow_team']['foo']['new']['count']).to eq(1)
      expect(stats['case']['workflow_team']['foo']['assessment']['count']).to eq(1)
      expect(stats['case']['workflow_team']['bar']['new']['count']).to eq(1)
      expect(stats['case']['workflow_team']['bar']['assessment']['count']).to eq(0)
    end

    it 'shows the string queries to get the workflow breakdown by user' do
      expected_query_foo_new = %w[record_state=true status=open owned_by=foo workflow=new]
      expect(stats['case']['workflow_team']['foo']['new']['query']).to match_array(expected_query_foo_new)

      expected_query_foo_assessment = %w[record_state=true status=open owned_by=foo workflow=assessment]
      expect(stats['case']['workflow_team']['foo']['assessment']['query']).to match_array(expected_query_foo_assessment)

      expected_query_bar_new = %w[record_state=true status=open owned_by=bar workflow=new]
      expect(stats['case']['workflow_team']['bar']['new']['query']).to match_array(expected_query_bar_new)

      expected_query_bar_assessment = %w[record_state=true status=open owned_by=bar workflow=assessment]
      expect(stats['case']['workflow_team']['bar']['assessment']['query']).to match_array(expected_query_bar_assessment)
    end
  end

  after :each do
    [User, UserGroup, Role, Child].each(&:destroy_all)
    Sunspot.commit
  end

end