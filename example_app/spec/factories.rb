FactoryGirl.define do
  factory :task do
    association :user
    title 'Test Task'
  end
end
