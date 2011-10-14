ExampleApp.Routers.Tasks = Backbone.Router.extend({
  initialize: function() {
    console.log("setting collection on router");
    this.collection = ExampleApp.tasks; // eventually pass in
  },

  routes: {
    "": "index",
    "new" : "newTask"
  },

  index: function() {
    var tasksIndexView = new ExampleApp.Views.TasksIndex({ el: '#tasks', collection: this.collection });
    tasksIndexView.render();
  },

  newTask: function() {
    var tasksNewView = new ExampleApp.Views.TasksNew({ el: '#tasks', collection: this.collection });
    tasksNewView.render();
  }
});
