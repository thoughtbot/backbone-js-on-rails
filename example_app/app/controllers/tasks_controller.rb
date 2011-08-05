class TasksController < ApplicationController
  respond_to :html, :json

  def index
    respond_with(@tasks = Task.all)
  end
end
