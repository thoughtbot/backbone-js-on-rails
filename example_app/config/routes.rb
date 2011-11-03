ExampleApp::Application.routes.draw do
  resources :tasks do
    resources :attachments, :only => [:create, :show]
  end

  root :to => 'tasks#index'

  if ["development", "test"].include? Rails.env
    mount Jasminerice::Engine => "/jasmine"
  end
end
