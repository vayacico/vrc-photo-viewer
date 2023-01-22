export default class DatabaseErrorException extends Error {
  type: 'CANNOT_OPEN_FILE' | 'FILE_IS_NOT_DB' | 'UNKNOWN';

  constructor(
    e: string,
    type: 'CANNOT_OPEN_FILE' | 'FILE_IS_NOT_DB' | 'UNKNOWN'
  ) {
    super(e);
    this.type = type;
  }
}
