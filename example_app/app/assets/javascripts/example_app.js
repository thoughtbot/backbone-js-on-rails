var ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function(tasks) {
    this.tasks = new ExampleApp.Collections.Tasks(tasks);

    new ExampleApp.Routers.Tasks();
    if (!Backbone.history.started) {
      Backbone.history.start();
      Backbone.history.started = true;
    }
  }
};
