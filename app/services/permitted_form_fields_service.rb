# frozen_string_literal: true

# This service handles computing the permitted fields for a given role,
# based on the forms associated with that role. The query is optionally cached.
# The similarly named PermittedFieldService uses this service to compuyte the full list of permitted fields
class PermittedFormFieldsService
  attr_accessor :fields_by_name, :with_cache

  def self.instance
    new(Rails.configuration.use_app_cache)
  end

  def initialize(with_cache = false)
    self.with_cache = with_cache
  end

  def rebuild_cache(role, record_type, writeable, force = false)
    return unless force || fields_by_name.nil?

    # The assumption here is that the cache will be updated if any changes took place to Forms, or Roles
    cache_key = "permitted_form_fields_service/#{role.cache_key_with_version}/#{record_type}/#{writeable}"
    self.fields_by_name = Rails.cache.fetch(cache_key, expires_in: 48.hours) do
      permitted_fields_from_forms(role, record_type, writeable).map { |f| [f.name, f] }.to_h
    end
  end

  def permitted_fields_from_forms(role, record_type, writeable, visible_only = false)
    permission_level = writeable ? FormPermission::PERMISSIONS[:read_write] : writeable
    fields = Field.joins(form_section: :roles).where(
      fields: {
        form_sections: { roles: { id: role.id }, parent_form: record_type, visible: (visible_only || nil) }.compact
      }
    )
    if writeable
      fields = fields.where(fields: { form_sections: { form_sections_roles: { permission: permission_level } } })
    end
    fields
  end

  alias with_cache? with_cache

  def permitted_fields(role, record_type, writeable)
    if with_cache?
      rebuild_cache(role, record_type, writeable)
      fields_by_name.values
    else
      permitted_fields_from_forms(role, record_type, writeable)
    end
  end

  def permitted_field_names(role, record_type, writeable)
    if with_cache?
      rebuild_cache(role, record_type, writeable)
      fields_by_name.keys
    else
      permitted_fields_from_forms(role, record_type, writeable).distinct.pluck(:name)
    end
  end
end
