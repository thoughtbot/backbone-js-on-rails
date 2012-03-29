class User < ActiveRecord::Base
  include Clearance::User

  has_many :tasks
  has_many :assignments
  has_many :assigned_tasks, through: :assignments, class_name: "Task", source: :task
end
