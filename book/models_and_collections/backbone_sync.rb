module BackboneSync
  module Rails
    module Faye

      # module to mix into your ActiveModel::Observer
      module Observer
        def after_update(model)
          Event.new(model, :update).broadcast
        end

        def after_create(model)
          Event.new(model, :create).broadcast
        end

        def after_destroy(model)
          Event.new(model, :destroy).broadcast
        end
      end

      class Event
        def initialize(model, event)
          @model = model
          @event = event
        end

        def broadcast
          Message.new(channel, data).send
        end

        private

        def channel
          "/sync/#{@model.class.table_name}"
        end

        def data
          { @event => { @model.id => @model.as_json } }
        end
      end

      # To publish from outside of an `EM.run {}` loop:
      # http://groups.google.com/group/faye-users/browse_thread/thread/ae6e2a1cc37b3b07
      class Message
        def initialize(channel, data)
          @channel = channel
          @data = data
        end

        def send
          Net::HTTP.post_form(uri, :message => payload) 
        end

        private

        def uri
          URI.parse("#{BackboneSync::Rails::Faye.root_address}/faye")
        end

        def payload
          {:channel => @channel, :data => @data}.to_json
        end
      end
    end
  end
end
