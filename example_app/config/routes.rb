ExampleApp::Application.routes.draw do
  resources :tasks, :only => [:show, :create, :update, :index] do
    resources :attachments, :only => [:show, :create]
  end

  root :to => 'tasks#index'
end
