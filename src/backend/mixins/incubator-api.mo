import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import IncubatorLib "../lib/incubator";
import IncubatorTypes "../types/incubator";

mixin (
  projects : List.List<IncubatorTypes.IncubatorProject>,
  nextIncubatorId : Nat,
) {
  var _incubatorCounter : Nat = nextIncubatorId;

  public query ({ caller }) func getIncubatorProjects() : async [IncubatorTypes.IncubatorProject] {
    IncubatorLib.getAll(projects, caller);
  };

  public shared ({ caller }) func createIncubatorProject(params : IncubatorTypes.CreateIncubatorParams) : async IncubatorTypes.IncubatorProject {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    let project = IncubatorLib.create(projects, _incubatorCounter, caller, params);
    _incubatorCounter += 1;
    project;
  };

  public shared ({ caller }) func deleteIncubatorProject(id : Nat) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    IncubatorLib.delete(projects, caller, id);
  };
};
