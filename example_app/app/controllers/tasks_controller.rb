class TasksController < ApplicationController
  before_filter :authorize
  respond_to :html, :json

  def index
    respond_with(@tasks = current_user.tasks)
  end

  def show
    @task = current_user.tasks.find(params[:id])
  end

  def create
    respond_with(current_user.tasks.create(params[:task]))
  end

  def update
    task = current_user.tasks.find(params[:id])
    task.update_attributes(params[:task])
    respond_with(task)
  end
end
