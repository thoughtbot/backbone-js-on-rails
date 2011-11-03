class Task < ActiveRecord::Base
  belongs_to :user
  has_many :attachments
  validates :user_id, :presence => true
end
