ExampleApp.Routers.Tasks = Backbone.Router.extend({
  routes: {
    "": "index",
    "new" : "newTask"
  },

  index: function() {
    var tasksIndexView = new ExampleApp.Views.TasksIndex();
    $('#tasks').html(tasksIndexView.render().el);
  },

  newTask: function() {
    $("a.create").hide();

    var tasksNewView = new ExampleApp.Views.TasksNew();
    $('#tasks').after(tasksNewView.render().el);
    $('#task_title').focus();
  }
});
