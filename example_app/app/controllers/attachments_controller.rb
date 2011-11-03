class AttachmentsController < ApplicationController
  before_filter :authorize
  respond_to :json

  def create
    attachment = current_task.attachments.new({ :upload => params[:upload] })
    attachment.save
    respond_with(current_task, attachment)
  end

  private

  def current_task
    current_user.tasks.find(params[:task_id])
  end
end
