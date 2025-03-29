create table ActivityLogs
(
  ID             INTEGER not null
    constraint PK_ActivityLogs
      primary key autoincrement,
  ActivityType   INTEGER not null,
  Timestamp      TEXT,
  NotificationID TEXT,
  UserID         TEXT,
  UserName       TEXT,
  WorldID        TEXT,
  WorldName      TEXT,
  Message        TEXT,
  Url            TEXT
);
