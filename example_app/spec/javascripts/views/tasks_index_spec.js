//= require application

describe("ExampleApp.Views.TasksIndex", function() {
  it("renders a collection of tasks", function() {
    var tasksCollection = new ExampleApp.Collections.Tasks();
    tasksCollection.reset([
      { title: "Wake up" },
      { title: "Brush your teeth" }
    ]);

    var view = new ExampleApp.Views.TasksIndex({collection: tasksCollection});
    var $el = $(view.render().el);

    expect($el).toHaveText(/Wake up/);
    expect($el).toHaveText(/Brush your teeth/);
  });
});
