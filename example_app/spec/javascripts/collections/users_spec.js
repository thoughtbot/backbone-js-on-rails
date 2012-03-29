describe("ExampleApp.Collections.Users", function() {
  it("contains instances of ExampleApp.Models.User", function() {
    var collection = new ExampleApp.Collections.Users();
    expect(collection.model).toEqual(ExampleApp.Models.User);
  });
});
