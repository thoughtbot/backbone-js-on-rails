ExampleApp.Routers.Tasks = Backbone.Router.extend({
  routes: {
    "": "index",
    "new" : "newTask"
  },

  index: function() {
    var tasksIndexView = new ExampleApp.Views.TasksIndex({ collection: ExampleApp.tasks });
    $('#tasks').html(tasksIndexView.render().el);
  },

  newTask: function() {
    $("a.create").hide();

    var tasksNewView = new ExampleApp.Views.TasksNew();
    $('#tasks').empty().html(tasksNewView.render().el);
    $('#task_title').focus();
  }
});
