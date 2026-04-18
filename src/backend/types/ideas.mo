import Common "common";

module {
  public type Idea = {
    id : Nat;
    callerId : Common.UserId;
    name : Text;
    deadline : Text;
    photoUrl : ?Text;
    place : Text;
    problem : Text;
    description : Text;
    ideaType : Text;
    status : Text;
    youtubeUrl : Text;
    instaUrl : Text;
    googleUrl : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateIdeaParams = {
    name : Text;
    deadline : Text;
    photoUrl : ?Text;
    place : Text;
    problem : Text;
    description : Text;
    ideaType : Text;
    status : Text;
    youtubeUrl : Text;
    instaUrl : Text;
    googleUrl : Text;
  };
};
