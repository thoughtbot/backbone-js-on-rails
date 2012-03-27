ExampleApp::Application.routes.draw do
  resources :tasks do
    resources :attachments, :only => [:create, :show]
  end

  root :to => 'tasks#index'
end
