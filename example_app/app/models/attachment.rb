class Attachment < ActiveRecord::Base
  has_attached_file :upload
  belongs_to :task
end
