import Common "common";

module {
  public type UserProfile = {
    principal : Common.UserId;
    displayName : Text;
    email : Text;
    profilePhotoUrl : ?Text;
  };

  public type WebLink = {
    id : Nat;
    callerId : Common.UserId;
    title : Text;
    url : Text;
  };
};
