import Common "common";

module {
  public type Task = {
    id : Nat;
    callerId : Common.UserId;
    description : Text;
    taskDate : Text;
    taskTime : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateTaskParams = {
    description : Text;
    taskDate : Text;
    taskTime : Text;
  };

  public type UpdateTaskParams = {
    description : Text;
    taskDate : Text;
    taskTime : Text;
  };
};
