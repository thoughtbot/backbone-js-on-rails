require 'spec_helper'

describe Assignment do
  it { should belong_to :user }
  it { should belong_to :task }
end
