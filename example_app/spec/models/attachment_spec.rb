require 'spec_helper'

describe Attachment do
  it { should have_attached_file(:upload) }
  it { should belong_to(:task) }
end
