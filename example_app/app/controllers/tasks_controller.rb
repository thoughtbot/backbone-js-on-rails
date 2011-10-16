class TasksController < ApplicationController
  respond_to :html, :json

  def index
    respond_with(@tasks = Task.all)
  end

  def create
    respond_with(Task.create(params[:task]))
  end

  def update
    task = Task.find(params[:id])
    task.update_attributes(params[:task])
    respond_with(task)
  end
end
