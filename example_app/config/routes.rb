ExampleApp::Application.routes.draw do
  resources :tasks
  root :to => 'tasks#index'

  if ["development", "test"].include? Rails.env
    mount Jasminerice::Engine => "/jasmine"
  end
end
