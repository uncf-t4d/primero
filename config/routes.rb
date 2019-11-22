Rails.application.routes.draw do
  root to: 'home#v2'

  scope :v2 do
    get '/', to: 'home#v2'
    get '*all', to: 'home#v2'
  end

  devise_for :users, class_name: 'User',
             path: '/api/v2/tokens',
             controllers: { sessions: 'api/v2/tokens' }, only: :sessions,
             path_names: { sign_in: '', sign_out: '' },
             sign_out_via: :delete,
             defaults: { format: :json }, constraints: { format: :json }


  namespace :api do
    namespace :v2, defaults: { format: :json },
                   constraints: { format: :json },
                   only: [:index, :create, :show, :update, :destroy ] do

      resources :children, as: :cases, path: :cases do
        resources :flags, only: [:index, :create, :update]
        resources :assigns, only: [:index, :create]
        resources :referrals, only: [:index, :create, :destroy]
        resources :transfers, only: [:index, :create, :update]
        resources :transfer_requests, only: [:index, :create, :update]
        resources :transitions, only: [:index]
        collection do
          post :flags, to: 'flags#create_bulk'
          post :assigns, to: 'assigns#create_bulk'
          post :referrals, to: 'referrals#create_bulk'
          post :transfers, to: 'transfers#create_bulk'
        end
      end

      resources :incidents do
        resources :flags, only: [:index, :create, :update]
        post :flags, to: 'flags#create_bulk', on: :collection
      end

      resources :tracing_requests do
        resources :flags, only: [:index, :create, :update]
        post :flags, to: 'flags#create_bulk', on: :collection
      end

      resources :form_sections, as: :forms, path: :forms
      resources :users do
        collection do
          get :'assign-to', to: 'users_transitions#assign_to'
          get :'transfer-to', to: 'users_transitions#transfer_to'
          get :'refer-to', to: 'users_transitions#refer_to'
        end
      end
      resources :dashboards, only: [:index]
      resources :contact_information, only: [:index]
      resources :system_settings, only: [:index]
      resources :tasks, only: [:index]
      resources :saved_searches, only: [:index, :create, :destroy]
      resources :reports, only: [:index, :show]

    end
  end

end
