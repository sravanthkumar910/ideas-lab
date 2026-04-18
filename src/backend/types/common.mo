module {
  public type Timestamp = Int;
  public type UserId = Principal;

  public type DashboardStats = {
    liveProjects : Nat;
    completedProjects : Nat;
    pendingIdeas : Nat;
  };
};
