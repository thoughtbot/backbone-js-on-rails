class UserHasManyTasks < ActiveRecord::Migration
  def up
    add_column :tasks, :user_id, :integer
  end

  def down
    remove_column :tasks, :user_id
  end
end
