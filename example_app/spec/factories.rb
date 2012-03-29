FactoryGirl.define do
  factory :task do
    association :user
    title 'Test Task'
  end

  factory :assignment do
    association :task
    association :user
  end
end
