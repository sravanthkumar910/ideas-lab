import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/ideas";
import Common "../types/common";

module {
  public func create(
    ideas : List.List<Types.Idea>,
    nextId : Nat,
    caller : Common.UserId,
    params : Types.CreateIdeaParams,
  ) : Types.Idea {
    let idea : Types.Idea = {
      id = nextId;
      callerId = caller;
      name = params.name;
      deadline = params.deadline;
      photoUrl = params.photoUrl;
      place = params.place;
      problem = params.problem;
      description = params.description;
      ideaType = params.ideaType;
      status = params.status;
      youtubeUrl = params.youtubeUrl;
      instaUrl = params.instaUrl;
      googleUrl = params.googleUrl;
      createdAt = Time.now();
    };
    ideas.add(idea);
    idea;
  };

  public func getAll(
    ideas : List.List<Types.Idea>,
    _caller : Common.UserId,
  ) : [Types.Idea] {
    ideas.toArray();
  };

  public func delete(
    ideas : List.List<Types.Idea>,
    _caller : Common.UserId,
    id : Nat,
  ) : Bool {
    let sizeBefore = ideas.size();
    let filtered = ideas.filter(func(i) { i.id != id });
    ideas.clear();
    ideas.append(filtered);
    ideas.size() < sizeBefore;
  };

  public func update(
    ideas : List.List<Types.Idea>,
    _caller : Common.UserId,
    id : Nat,
    params : Types.UpdateIdeaParams,
  ) : { #ok; #err : Text } {
    var found = false;
    ideas.mapInPlace(
      func(idea) {
        if (idea.id == id) {
          found := true;
          { idea with
            name = params.name;
            deadline = params.deadline;
            photoUrl = params.photoUrl;
            place = params.place;
            problem = params.problem;
            description = params.description;
            ideaType = params.ideaType;
            status = params.status;
            youtubeUrl = params.youtubeUrl;
            instaUrl = params.instaUrl;
            googleUrl = params.googleUrl;
          };
        } else { idea };
      }
    );
    if (found) #ok else #err("Idea not found");
  };
};
