import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import TasksLib "../lib/tasks";
import TasksTypes "../types/tasks";

mixin (
  tasks : List.List<TasksTypes.Task>,
  nextTaskId : Nat,
) {
  var _taskCounter : Nat = nextTaskId;

  public query ({ caller }) func getTasks() : async [TasksTypes.Task] {
    TasksLib.getAll(tasks, caller);
  };

  public shared ({ caller }) func createTask(params : TasksTypes.CreateTaskParams) : async TasksTypes.Task {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    let task = TasksLib.create(tasks, _taskCounter, caller, params);
    _taskCounter += 1;
    task;
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    TasksLib.delete(tasks, caller, id);
  };
};
