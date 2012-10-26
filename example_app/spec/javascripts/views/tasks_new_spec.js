//= require application

describe("ExampleApp.Views.TasksNew", function() {
  var view, alice, users, model, e;

  beforeEach(function() {
    alice = new ExampleApp.Models.User({
      id: 123,
      email: 'alice@example.com'
    });
    users = new ExampleApp.Collections.Users([alice]);

    view = new ExampleApp.Views.TasksNew({ users: users });
    view.render();

    model = view.model;
    model.save = sinon.spy();

    e = new Event(undefined);
  });

  it("persists a new model when saving", function() {
    view.save(e);
    expect(model.save).toHaveBeenCalled();
  });

  it("populates its model when saving", function() {
    view.addAssignee();
    view.$('ul.assignees select').val('alice@example.com');
    view.$('input[name=title]').val('Deliver a package');
    view.save(e);

    expect(model.get('title')).toEqual('Deliver a package');
    expect(model.assignedUsers.at(0)).toEqual(alice);
  });

  it("adds assignee fields", function() {
    expect(view.$('ul.assignees li select').size()).toEqual(0);
    view.addAssignee();
    expect(view.$('ul.assignees li select').size()).toEqual(1);
  });

  it("finds assignees from its user collection by email", function() {
    view.addAssignee();
    view.$('ul.assignees select').val('alice@example.com');
    view.save(e);

    expect(view.assignedUsers().length).toEqual(1);
    expect(view.assignedUsers()).toEqual([alice]);
  });

  it("trims blank assignees", function() {
    view.addAssignee();
    expect(view.assignedUsers().length).toEqual(0);
  });

  it("trims duplicate assignees", function() {
    view.addAssignee();
    view.addAssignee();

    view.$('ul.assignees select').first().val('alice@example.com');
    view.$('ul.assignees select').last().val('alice@example.com');

    expect(view.assignedUsers().length).toEqual(1);
  });
});
