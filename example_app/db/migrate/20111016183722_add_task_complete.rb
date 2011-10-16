class AddTaskComplete < ActiveRecord::Migration
  def up
    add_column :tasks, :complete, :boolean, :default => false, :null => false
  end

  def down
    remove_column :tasks, :complete
  end
end
