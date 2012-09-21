require 'spec_helper'

describe User do
  it { should have_many :tasks }
  it { should have_many :assignments }

  it "has many assigned tasks through assignments" do
    task = FactoryGirl.create(:task)
    user = FactoryGirl.create(:user)

    FactoryGirl.create(:assignment, task: task, user: user)

    user.reload.assigned_tasks.should == [task]
  end
end
