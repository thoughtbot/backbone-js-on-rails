//= require application

describe("ExampleApp.Views.TasksIndex", function() {
  it("renders a task table", function() {
    var view, el;

    view = new ExampleApp.Views.TasksIndex();
    view.render();

    $el = $(view.el);

    expect($el).toBe("#tasks");
    expect($el).toContain("table");
  });

  it("renders a collection of tasks", function() {
  });
});
