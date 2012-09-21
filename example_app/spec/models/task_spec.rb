require 'spec_helper'

describe Task do
  it { should belong_to :user }
  it { should validate_presence_of :user_id }
  it { should have_many :attachments }
  it { should have_many :assignments }

  it "has many assigned users through assignments" do
    task = FactoryGirl.create(:task)
    user = FactoryGirl.create(:user)

    FactoryGirl.create(:assignment, task: task, user: user)

    task.reload.assigned_users.should == [user]
  end

  it "accepts nested attributes for assignments" do
    task = FactoryGirl.build(:task)
    user = FactoryGirl.create(:user)

    task.assignments_attributes = [{ user_id: user.id }]

    task.save

    task.reload.assigned_users.should == [user]
  end
end
