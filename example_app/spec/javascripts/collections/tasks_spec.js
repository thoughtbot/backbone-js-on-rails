describe("ExampleApp.Collections.Tasks", function() {
  it("contains instances of ExampleApp.Models.Task", function() {
    var collection = new ExampleApp.Collections.Tasks();
    expect(collection.model).toEqual(ExampleApp.Models.Task);
  });

  it("is persisted at /tasks", function() {
    var collection = new ExampleApp.Collections.Tasks();
    expect(collection.url).toEqual("/tasks");
  });
});
