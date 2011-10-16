//= require application

describe("ExampleApp.Views.TaskItem", function() {
  var task, view;

  beforeEach(function() {
    task = new ExampleApp.Models.Task({ title: "Wake up" });
    view = new ExampleApp.Views.TaskItem({ model: task });
  });

  it("renders an individual task", function() {
    $el = $(view.render().el);
    expect($el).toHaveText(/Wake up/);
  });

  it("checks the checkbox for completed tasks", function() {
    task.set({ complete: true });
    $el = $(view.render().el);
    expect($el.find("input[type=checkbox]")).toBeChecked();
  });

  it("unchecks the checkbox for incomplete tasks", function() {
    task.set({ complete: false });
    $el = $(view.render().el);
    expect($el.find("input[type=checkbox]")).not.toBeChecked();
  });
});

