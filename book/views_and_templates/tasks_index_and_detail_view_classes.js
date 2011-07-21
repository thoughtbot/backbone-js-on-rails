var TasksIndex = Backbone.View.extend({
  template: JST['tasks/tasks_index'],
  tagName: 'section',
  id: 'tasks',

  initialize: function() {
    _.bindAll(this, "render");
    TaskApp.tasks.bind("change", this.render);
    TaskApp.tasks.bind("add", this.render);
  },

  render: function() {
    $(this.el).html(this.template({task: this.model}));
  }
});

var TasksDetail = Backbone.View.extend({
  tagName: 'section',
  id: 'tasks',

  initialize: function() {
    _.bindAll(this, "render", "renderCompletedTasks", "renderOverdueTasks");
    TaskApp.tasks.bind("change", this.render);
    TaskApp.tasks.bind("add", this.render);
  },

  render: function() {
    $(this.el).html(JST['tasks/task_detail']({task: this.model}));
  }
});

