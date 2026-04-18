import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import SettingsLib "../lib/settings";
import SettingsTypes "../types/settings";
import Common "../types/common";

mixin (
  profiles : Map.Map<Common.UserId, SettingsTypes.UserProfile>,
  webLinks : List.List<SettingsTypes.WebLink>,
  nextWebLinkId : Nat,
) {
  var _webLinkCounter : Nat = nextWebLinkId;

  public query ({ caller }) func getUserProfile() : async ?SettingsTypes.UserProfile {
    SettingsLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveUserProfile(
    displayName : Text,
    email : Text,
    profilePhotoUrl : ?Text,
  ) : async SettingsTypes.UserProfile {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    SettingsLib.saveProfile(profiles, caller, displayName, email, profilePhotoUrl);
  };

  public query ({ caller }) func getWebLinks() : async [SettingsTypes.WebLink] {
    SettingsLib.getWebLinks(webLinks, caller);
  };

  public shared ({ caller }) func addWebLink(title : Text, url : Text) : async SettingsTypes.WebLink {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    let link = SettingsLib.addWebLink(webLinks, _webLinkCounter, caller, title, url);
    _webLinkCounter += 1;
    link;
  };

  public shared ({ caller }) func deleteWebLink(id : Nat) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    SettingsLib.deleteWebLink(webLinks, caller, id);
  };
};
