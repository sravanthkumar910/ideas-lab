import Common "common";

module {
  public type IncubatorProject = {
    id : Nat;
    callerId : Common.UserId;
    name : Text;
    imageUrl : ?Text;
    pptFileName : ?Text;
    docFileName : ?Text;
    srcFileName : ?Text;
    youtubeUrl : Text;
    instaUrl : Text;
    googleUrl : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateIncubatorParams = {
    name : Text;
    imageUrl : ?Text;
    pptFileName : ?Text;
    docFileName : ?Text;
    srcFileName : ?Text;
    youtubeUrl : Text;
    instaUrl : Text;
    googleUrl : Text;
  };
};
