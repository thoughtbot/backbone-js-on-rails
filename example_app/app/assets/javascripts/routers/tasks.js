ExampleApp.Routers.Tasks = Support.SwappingRouter.extend({
  initialize: function(options) {
    this.el = $('#tasks');
    this.collection = options.collection;
    this.users = options.users;
  },

  routes: {
    "":          "index",
    "new":       "newTask",
    "tasks/:id": "show"
  },

  index: function() {
    var view = new ExampleApp.Views.TasksIndex({ collection: this.collection });
    this.swap(view);
  },

  newTask: function() {
    var view = new ExampleApp.Views.TasksNew({ collection: this.collection, users: this.users });
    this.swap(view);
  },

  show: function(taskId) {
    var task = this.collection.get(taskId);
    var tasksRouter = this;
    task.fetch({
      success: function() {
        var view = new ExampleApp.Views.TaskShow({ model: task });
        tasksRouter.swap(view);
      }
    });
  }
});
