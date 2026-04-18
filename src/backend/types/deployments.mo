import Common "common";

module {
  public type Deployment = {
    id : Nat;
    callerId : Common.UserId;
    name : Text;
    deployedUrl : Text;
    githubUrl : Text;
    engineType : Text;
    architecture : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateDeploymentParams = {
    name : Text;
    deployedUrl : Text;
    githubUrl : Text;
    engineType : Text;
    architecture : Text;
  };

  public type UpdateDeploymentParams = {
    name : Text;
    deployedUrl : Text;
    githubUrl : Text;
    engineType : Text;
    architecture : Text;
  };
};
