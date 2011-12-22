var ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function(data) {
    this.tasks = new ExampleApp.Collections.Tasks(data.tasks);

    new ExampleApp.Routers.Tasks({ collection: this.tasks });
    if (!Backbone.history.started) {
      Backbone.history.start();
      Backbone.history.started = true;
    }
  }
};
