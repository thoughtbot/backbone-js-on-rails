describe("ExampleApp", function(){
  it("has a namespace for Models", function() {
    expect(ExampleApp.Models).toBeTruthy();
  });

  it("has a namespace for Collections", function() {
    expect(ExampleApp.Collections).toBeTruthy();
  });

  it("has a namespace for Views", function() {
    expect(ExampleApp.Views).toBeTruthy();
  });

  it("has a namespace for Routers", function() {
    expect(ExampleApp.Routers).toBeTruthy();
  });

  describe("init()", function() {
    it("accepts data JSON and instantiates a collection from it", function() {
      var data = {
        "tasks": [{"title":"thing to do"}, {"title":"another thing"}],
        "users": [{"id":"1","email":"alice@example.com"}]
      };
      ExampleApp.init(data);

      expect(ExampleApp.tasks).not.toEqual(undefined);
      expect(ExampleApp.tasks.length).toEqual(2);
      expect(ExampleApp.tasks.models[0].get('title')).toEqual("thing to do");
      expect(ExampleApp.tasks.models[1].get('title')).toEqual("another thing");

      expect(ExampleApp.users.length).toEqual(1);
    });

    it("instantiates a Tasks router", function() {
      ExampleApp.Routers.Tasks = sinon.spy();
      ExampleApp.init({});
      expect(ExampleApp.Routers.Tasks).toHaveBeenCalled();
    });

    it("starts Backbone.history", function() {
      Backbone.history = { start: sinon.spy() };
      ExampleApp.init({});
      expect(Backbone.history.start).toHaveBeenCalled();
    });
  });
});
