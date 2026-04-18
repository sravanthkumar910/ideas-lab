import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/tasks";
import Common "../types/common";

module {
  public func create(
    tasks : List.List<Types.Task>,
    nextId : Nat,
    caller : Common.UserId,
    params : Types.CreateTaskParams,
  ) : Types.Task {
    let task : Types.Task = {
      id = nextId;
      callerId = caller;
      description = params.description;
      taskDate = params.taskDate;
      taskTime = params.taskTime;
      createdAt = Time.now();
    };
    tasks.add(task);
    task;
  };

  public func getAll(
    tasks : List.List<Types.Task>,
    _caller : Common.UserId,
  ) : [Types.Task] {
    tasks.toArray();
  };

  public func delete(
    tasks : List.List<Types.Task>,
    _caller : Common.UserId,
    id : Nat,
  ) : Bool {
    let sizeBefore = tasks.size();
    let filtered = tasks.filter(func(t) { t.id != id });
    tasks.clear();
    tasks.append(filtered);
    tasks.size() < sizeBefore;
  };
};
