class TaskHasManyAttachments < ActiveRecord::Migration
  def up
    add_column :attachments, :task_id, :integer
  end

  def down
    remove_column :attachments, :task_id
  end
end
