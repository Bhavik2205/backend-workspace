export class Constants {
  public static readonly JOB_CONFIG = {
    failed: {
      age: 24 * 3600,
    },
    completed: {
      age: 1 * 3600,
      count: 100,
    },
  };

  public static readonly ENVIRONMENTS = ["development", "stage", "production"];

  public static readonly JWT_TOKEN_VERSION = "v1"; // Just increase to invalidate all sessions.

  public static readonly PAGER = {
    page: 1,
    limit: 2000,
  };

  public static readonly FROM_EMAIL = "no-reply@example.com";

  public static readonly BCRYPT_SALT_ROUND = 10;

  public static readonly FIRST_NAME_MAX_LENGTH = 255;

  public static readonly LAST_NAME_MAX_LENGTH = 255;

  public static readonly EMAIL_MAX_LENGTH = 255;

  public static readonly COMPANY_NAME_MAX_LENGTH = 255;

  public static readonly VERIFICATION_CODE_MAX_LENGTH = 6;

  public static readonly PASSWORD_MAX_LENGTH = 255;

  public static readonly PASSWORD_MIN_LENGTH = 6;

  public static readonly RESET_PASS_EXPIRY = 900;

  public static readonly OTP_EXPIRY = 300;

  public static readonly OTP_LENGTH = 6;

  public static readonly VALID_MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/tiff",
    "image/vnd.adobe.photoshop",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "message/rfc822",
    "application/vnd.ms-outlook",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.apple.pages",
    "text/plain",
    "text/csv",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/xml",
    "audio/mp4",
    "audio/mpeg",
    "audio/x-ms-wma",
    "video/3gpp",
    "video/x-ms-asf",
    "video/x-msvideo",
    "video/x-flv",
    "video/x-m4v",
    "video/quicktime",
    "video/mp4",
    "video/mpeg",
    "application/x-shockwave-flash",
    "video/mp2t",
    "video/x-ms-wmv",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/vnd.wordperfect",
    "video/x-ms-vob",
    "image/x-tga",
    "application/vnd.apple.keynote",
    "application/x-subrip",
    "application/vnd.apple.numbers",
    "application/x-xfig",
    "application/vnd.ms-project",
    "application/vnd.ms-works",
    "application/zipx",
  ];
}
