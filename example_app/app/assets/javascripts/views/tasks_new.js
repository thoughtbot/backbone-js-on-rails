ExampleApp.Views.TasksNew = Backbone.View.extend({
  // id: "new_task",

  // events: {
  //   "submit form": "save",
  //   "click .buttons a": "leave"
  // },

  // initialize: function() {
  //   this.model = new ExampleApp.Models.Task();
  // },

  // render: function () {
  //   $(this.el).html(JST['tasks/new']());
  //   this.$('#task_title').focus();
  //   return this;
  // },

  // save: function(event) {
  //   event.preventDefault();
  //   event.stopPropagation();

  //   var self = this;

  //   this.$("input[type='submit']").attr('disabled', 'disabled').val('Please wait...');

  //   this.model.save({ title: this.$('#task_title').val() }, {
  //     success: function(model, response) {
  //       ExampleApp.tasks.add(model);
  //       self.model = new ExampleApp.Models.Task();
  //       self.render();
  //     },
  //     error: function(model, response) {
  //       sel.$('input.create').removeAttr('disabled').val('Create task');
  //     }
  //   });

  //   return false;
  // },

  // leave: function() {
  //   $("a.create").show();

  //   this.unbind();
  //   this.remove();
  // }
});
