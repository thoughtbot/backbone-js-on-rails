ExampleApp.Routers.Tasks = Backbone.Router.extend({
  routes: {
    "": "index"
  },

  index: function() {
    new ExampleApp.Views.TasksIndex();
  }
});
