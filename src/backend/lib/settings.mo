import List "mo:core/List";
import Map "mo:core/Map";
import Types "../types/settings";
import Common "../types/common";

module {
  public func saveProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    displayName : Text,
    email : Text,
    profilePhotoUrl : ?Text,
  ) : Types.UserProfile {
    let profile : Types.UserProfile = {
      principal = caller;
      displayName;
      email;
      profilePhotoUrl;
    };
    profiles.add(caller, profile);
    profile;
  };

  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  public func addWebLink(
    links : List.List<Types.WebLink>,
    nextId : Nat,
    caller : Common.UserId,
    title : Text,
    url : Text,
  ) : Types.WebLink {
    let link : Types.WebLink = {
      id = nextId;
      callerId = caller;
      title;
      url;
    };
    links.add(link);
    link;
  };

  public func getWebLinks(
    links : List.List<Types.WebLink>,
    _caller : Common.UserId,
  ) : [Types.WebLink] {
    links.toArray();
  };

  public func deleteWebLink(
    links : List.List<Types.WebLink>,
    _caller : Common.UserId,
    id : Nat,
  ) : Bool {
    let sizeBefore = links.size();
    let filtered = links.filter(func(l) { l.id != id });
    links.clear();
    links.append(filtered);
    links.size() < sizeBefore;
  };
};
