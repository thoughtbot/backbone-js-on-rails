class TasksController < ApplicationController
  before_filter :authorize
  respond_to :html, :json

  wrap_parameters :task, :include => [:assignments_attributes, :title, :complete]

  def index
    @tasks = tasks_visible_to_current_user
    @users = user_id_and_email_attributes
  end

  def show
    @task = current_user.tasks.find(params[:id])
  end

  def create
    respond_with(current_user.tasks.create(task_params))
  end

  def update
    task = current_user.tasks.find(params[:id])
    task.update_attributes(task_params)
    respond_with(task)
  end

  private

  def user_id_and_email_attributes
    User.all.map { |user| { :id => user.id, :email => user.email } }
  end

  def tasks_visible_to_current_user
    (current_user.tasks + current_user.assigned_tasks).uniq
  end

  def task_params
    task = params[:task] || {}
    task.delete_if {|k,v| v.nil?}
  end
end
