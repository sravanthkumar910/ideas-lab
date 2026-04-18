import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import FilesLib "../lib/files";
import Common "../types/common";

mixin (
  fileStore : Map.Map<Common.ObjectId, Common.StoredFile>,
  nextFileId : Nat,
) {
  var _fileCounter : Nat = nextFileId;

  // Upload an idea photo (JPG, PNG, GIF up to 5 MB)
  public shared ({ caller }) func uploadIdeaPhoto(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#ideaPhoto, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Upload an incubator project image (JPG/PNG up to 3 MB)
  public shared ({ caller }) func uploadIncubatorImage(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#incubatorImage, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Upload an incubator PPT file (up to 20 MB)
  public shared ({ caller }) func uploadIncubatorPpt(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#incubatorPpt, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Upload an incubator DOC file (up to 10 MB)
  public shared ({ caller }) func uploadIncubatorDoc(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#incubatorDoc, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Upload an incubator SRC file (ZIP/archive up to 10 MB)
  public shared ({ caller }) func uploadIncubatorSrc(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#incubatorSrc, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Upload a profile photo (JPG/PNG up to 5 MB)
  public shared ({ caller }) func uploadProfilePhoto(
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : async { #ok : Common.UploadFileResult; #err : Text } {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    switch (FilesLib.validateFile(#profilePhoto, contentType, data.size())) {
      case (?err) return #err(err);
      case null {};
    };
    let objectId = FilesLib.makeObjectId(caller, _fileCounter);
    _fileCounter += 1;
    #ok(FilesLib.upload(fileStore, objectId, caller, filename, contentType, data));
  };

  // Download a file by objectId
  public query func downloadFile(objectId : Common.ObjectId) : async ?Common.DownloadFileResult {
    FilesLib.download(fileStore, objectId);
  };

  // Delete a file by objectId (caller must own the file)
  public shared ({ caller }) func deleteFile(objectId : Common.ObjectId) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    FilesLib.delete(fileStore, objectId);
  };
};
