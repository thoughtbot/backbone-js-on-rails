ExampleApp.Routers.Tasks = Backbone.Router.extend({
  initialize: function() {
    this.collection = ExampleApp.tasks; // TODO eventually pass in
  },

  routes: {
    "":          "index",
    "new":       "newTask",
    "tasks/:id": "show"
  },

  index: function() {
    var view = new ExampleApp.Views.TasksIndex({ collection: this.collection });
    $('#tasks').html(view.render().el);
  },

  newTask: function() {
    var view = new ExampleApp.Views.TasksNew({ collection: this.collection });
    $('#tasks').html(view.render().el);
  },

  show: function(taskId) {
    var task = this.collection.get(taskId);
    task.fetch({
      success: function() {
        var view = new ExampleApp.Views.TaskShow({ model: task });
        $('#tasks').html(view.render().el);
      }
    });
  }
});
