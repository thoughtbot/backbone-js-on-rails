// ExampleApp.Views.TaskForm = Backbone.View.extend({
//   tagName: "form",
// 
//   initialize: function() {
//     _.bindAll(this, "render");
//   },
// 
//   render: function() {
//     console.log("Form render, this.el: ");
//     console.log($(this.el));
//     return this;
//   },
// 
//   commit: function() {
//     this.fieldset.commit();
//   }
// });

ExampleApp.Views.TasksNew = Backbone.View.extend({
  id: "new_task",

  events: {
    "submit form": "save",
    "click .buttons a": "leave"
  },

  initialize: function() {
    _.bindAll(this, "render");
    this.model = new ExampleApp.Models.Task();
    this.form = new Backbone.Form({ model: this.model });
    this.form.render();
  },

  render: function () {
    console.log("ABOUT TO EMPTY");
    console.log($(this.el));
    $(this.el).empty();

    $(this.el).append("<form></form>");
    $('form', this.el).append(this.form.el);
    $('form', this.el).append('<li class="bbf-field"><input type="submit" value="Create task"></li>');
    $('form', this.el).append('<li class="bbf-field"><a href="#">I\'m done adding tasks</a></li>');
    // $(this.el).html(JST['tasks/new']());
    // this.$('#task_title').focus();
    return this;
  },

  save: function(event) {
    event.preventDefault();
    event.stopPropagation();

    var self = this;

    this.$("input[type='submit']").attr('disabled', 'disabled').val('Please wait...');

    // this.

    this.model.save({ title: this.$('#task_title').val() }, {
      success: function(model, response) {
        console.log("success");
        ExampleApp.tasks.add(model);
        self.model = new ExampleApp.Models.Task();
        self.render();
      },
      error: function(model, response) {
        console.log("fail");
        self.$('input.create').removeAttr('disabled').val('Create task');
      }
    });

    return false;
  },

  leave: function() {
    $("a.create").show();

    this.form.leave();
    this.unbind();
    this.remove();
  }
});
