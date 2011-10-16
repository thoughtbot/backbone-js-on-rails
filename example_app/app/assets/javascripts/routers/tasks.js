ExampleApp.Routers.Tasks = Backbone.Router.extend({
  initialize: function() {
    this.collection = ExampleApp.tasks; // TODO eventually pass in
  },

  routes: {
    "": "index",
    "new" : "newTask"
  },

  index: function() {
    var view = new ExampleApp.Views.TasksIndex({ collection: this.collection });
    $('#tasks').html(view.render().el);
  },

  newTask: function() {
    var view = new ExampleApp.Views.TasksNew({ collection: this.collection });
    $('#tasks').html(view.render().el);
  }
});
