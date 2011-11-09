describe("ExampleApp.Collections.Attachments", function() {
  it("contains instances of ExampleApp.Models.Attachment", function() {
    var collection = new ExampleApp.Collections.Attachments();
    expect(collection.model).toEqual(ExampleApp.Models.Attachment);
  });

  it("is persisted at /tasks", function() {
    var collection = new ExampleApp.Collections.Attachments();
    expect(collection.url).toEqual("/attachments");
  });
});

