import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/incubator";
import Common "../types/common";

module {
  public func create(
    projects : List.List<Types.IncubatorProject>,
    nextId : Nat,
    caller : Common.UserId,
    params : Types.CreateIncubatorParams,
  ) : Types.IncubatorProject {
    let project : Types.IncubatorProject = {
      id = nextId;
      callerId = caller;
      name = params.name;
      imageUrl = params.imageUrl;
      pptFileName = params.pptFileName;
      docFileName = params.docFileName;
      srcFileName = params.srcFileName;
      youtubeUrl = params.youtubeUrl;
      instaUrl = params.instaUrl;
      googleUrl = params.googleUrl;
      createdAt = Time.now();
    };
    projects.add(project);
    project;
  };

  public func getAll(
    projects : List.List<Types.IncubatorProject>,
    _caller : Common.UserId,
  ) : [Types.IncubatorProject] {
    projects.toArray();
  };

  public func delete(
    projects : List.List<Types.IncubatorProject>,
    _caller : Common.UserId,
    id : Nat,
  ) : Bool {
    let sizeBefore = projects.size();
    let filtered = projects.filter(func(p) { p.id != id });
    projects.clear();
    projects.append(filtered);
    projects.size() < sizeBefore;
  };
};
