ExampleApp.Views.TasksIndex = Backbone.View.extend({
  id: 'tasks',
  tagName: 'div',

  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind("add", this.render);
  },

  render: function () {
    $(this.el).html(JST['tasks/index']({ tasks: ExampleApp.tasks }));

    var tasksIndexView = this;
    ExampleApp.tasks.each(function(task) {
      var taskView = new ExampleApp.Views.TaskView({model: task});
      tasksIndexView.$('table').append(taskView.render().el);
    });

    return this;
  }
});
