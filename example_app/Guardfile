# IMPORTANT: place Spork guard before RSpec/Cucumber/Test::Unit guards!
guard 'spork', :cucumber_env => { 'RAILS_ENV' => 'test' }, :rspec_env => { 'RAILS_ENV' => 'test' } do
  watch('config/application.rb')
  watch('config/environment.rb')
  watch(%r{^config/environments/.+\.rb$})
  watch(%r{^config/initializers/.+\.rb$})
  watch('Gemfile')
  watch('Gemfile.lock')
  watch('spec/spec_helper.rb')
  watch(%r{spec/factories.rb$})
  watch(%r{spec/factories/.+\.rb$})
  watch(%r{spec/support/.+\.rb$})
  watch(%r{features/support/.+\.rb$})
end
