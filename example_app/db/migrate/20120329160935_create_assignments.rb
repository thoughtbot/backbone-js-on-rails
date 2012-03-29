class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.belongs_to :user
      t.belongs_to :task

      t.timestamps
    end
  end
end
