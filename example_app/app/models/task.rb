class Task < ActiveRecord::Base
  belongs_to :user
  has_many :attachments
  has_many :assignments
  has_many :assigned_users, through: :assignments, class_name: "User", source: :user
  validates :user_id, :presence => true

  accepts_nested_attributes_for :assignments
end
