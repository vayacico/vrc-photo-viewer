const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('service', {
  log: {
    getPhotos(from, to, results) {
      return ipcRenderer.invoke('GET_PHOTOS', from, to, results);
    },
    getWorlds(from, to, results) {
      return ipcRenderer.invoke('GET_WORLDS', from, to, results);
    },
    getUsers(from, to) {
      return ipcRenderer.invoke('GET_USERS', from, to);
    },
    scanPhoto(refresh) {
      return ipcRenderer.invoke('SCAN_PHOTOS', refresh);
    },
  },
  search: {
    searchPhotoByWorldName(keyword) {
      return ipcRenderer.invoke('SEARCH_PHOTO_BY_WORLD_NAME', keyword);
    },
    searchPhotoByUserName(keyword) {
      return ipcRenderer.invoke('SEARCH_PHOTO_BY_USER_NAME', keyword);
    },
    searchWorldByWorldName(keyword) {
      return ipcRenderer.invoke('SEARCH_WORLD_BY_WORLD_NAME', keyword);
    },
    searchWorldByUserName(keyword) {
      return ipcRenderer.invoke('SEARCH_WORLD_BY_USER_NAME', keyword);
    },
    getUserSuggestion(keyword) {
      return ipcRenderer.invoke('GET_USER_SUGGESTION', keyword);
    },
    getWorldSuggestion(keyword) {
      return ipcRenderer.invoke('GET_WORLD_SUGGESTION', keyword);
    },
  },
  statistics: {
    getWorldJoinCount(from, to) {
      return ipcRenderer.invoke('GET_STATISTICS_WORLD_JOIN_COUNT', from, to);
    },
    getUserJoinCount(from, to) {
      return ipcRenderer.invoke('GET_STATISTICS_USER_JOIN_COUNT', from, to);
    },
    getPhotoCount(from, to) {
      return ipcRenderer.invoke('GET_STATISTICS_PHOTO_COUNT', from, to);
    },
    getActivityHeatmap(from, to) {
      return ipcRenderer.invoke('GET_STATISTICS_ACTIVITY_HEAT_MAP', from, to);
    },
    getInstanceTypeCount(from, to) {
      return ipcRenderer.invoke('GET_STATISTICS_INSTANCE_TYPE_COUNT', from, to);
    },
  },
  thumbnail: {
    openThumbnailDirectory() {
      return ipcRenderer.invoke('OPEN_THUMBNAIL_DIRECTORY');
    },
    getThumbnail(originalFilePath) {
      return ipcRenderer.invoke('GET_THUMBNAIL', originalFilePath);
    },
  },
  settings: {
    openSettingFile() {
      return ipcRenderer.invoke('OPEN_SETTING_FILE_LOCATION');
    },
    getDbFileLocation() {
      return ipcRenderer.invoke('GET_DB_LOCATION');
    },
    getPhotoDirectoryLocations() {
      return ipcRenderer.invoke('GET_PHOTO_LOCATIONS');
    },
    selectDbFileLocation() {
      return ipcRenderer.invoke('SELECT_DB_LOCATION');
    },
    selectPhotoDirectoryLocation() {
      return ipcRenderer.invoke('SELECT_PHOTO_LOCATIONS');
    },
    updateFileSetting(settingForm) {
      return ipcRenderer.invoke('UPDATE_FILE_SETTING', settingForm);
    },
    getLanguageSetting() {
      return ipcRenderer.invoke('GET_LANGUAGE');
    },
    updateLanguageSetting(language) {
      return ipcRenderer.invoke('UPDATE_LANGUAGE', language);
    },
  },
  application: {
    close() {
      return ipcRenderer.invoke('APPLICATION_CLOSE');
    },
    minimize() {
      return ipcRenderer.invoke('WINDOW_MINIMIZE');
    },
    sizeChange() {
      return ipcRenderer.invoke('WINDOW_SIZE_CHANGE');
    },
    onDrag(path) {
      return ipcRenderer.invoke('START_DRAG', path);
    },
    openUrlInBrowser(url) {
      return ipcRenderer.invoke('APPLICATION_OPEN_IN_BROWSER', url);
    },
    openFileInDefaultApplication(path) {
      return ipcRenderer.invoke('APPLICATION_OPEN_FILE', path);
    },
    openLicenceFile() {
      return ipcRenderer.invoke('OPEN_LICENCE_FILE');
    },
    getVersion() {
      return ipcRenderer.invoke('GET_APPLICATION_VERSION');
    },
  },
});
