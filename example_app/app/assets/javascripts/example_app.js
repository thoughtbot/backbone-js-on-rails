var ExampleApp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function(tasks) {
    new ExampleApp.Routers.Tasks();
    ExampleApp.Collections.Tasks.reset(tasks);
    Backbone.history.start();
  }
};
