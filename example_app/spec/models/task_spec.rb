require 'spec_helper'

describe Task do
  it { should belong_to :user }
  it { should validate_presence_of :user_id }
  it { should have_many :attachments }
end
