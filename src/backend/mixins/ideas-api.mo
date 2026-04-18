import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import IdeasLib "../lib/ideas";
import IdeasTypes "../types/ideas";

mixin (
  ideas : List.List<IdeasTypes.Idea>,
  nextIdeaId : Nat,
) {
  var _ideaCounter : Nat = nextIdeaId;

  public query ({ caller }) func getIdeas() : async [IdeasTypes.Idea] {
    IdeasLib.getAll(ideas, caller);
  };

  public shared ({ caller }) func createIdea(params : IdeasTypes.CreateIdeaParams) : async IdeasTypes.Idea {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    let idea = IdeasLib.create(ideas, _ideaCounter, caller, params);
    _ideaCounter += 1;
    idea;
  };

  public shared ({ caller }) func deleteIdea(id : Nat) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    IdeasLib.delete(ideas, caller, id);
  };
};
