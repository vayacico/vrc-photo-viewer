import React, { useState } from 'react';
import { ScanResultResponse } from '../../../dto/ScanResult';
import TitleBarContainer from './TitleBarContainer';
import MenuContainer from './MenuContainer';
import ContentContainer from './ContentContainer';
import StatusBarContainer from './StatusBarContainer';

const WindowContainer: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanPhoto = async (isRefresh: boolean) => {
    if (isScanning) {
      return {
        status: 'isScanning',
        photoCount: 0,
        oldPhotoCount: 0,
      } as ScanResultResponse;
    }
    setIsScanning(true);
    const response = await window.service.log.scanPhoto(isRefresh);
    setIsScanning(false);
    return response;
  };

  return (
    <>
      <TitleBarContainer />
      <MenuContainer />
      <ContentContainer isScanning={isScanning} scanPhoto={scanPhoto} />
      <StatusBarContainer isScanning={isScanning} scanPhoto={scanPhoto} />
    </>
  );
};
export default WindowContainer;
