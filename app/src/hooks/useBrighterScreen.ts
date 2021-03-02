import {useEffect} from 'react';
import {Platform} from 'react-native';
import SystemSetting from 'react-native-system-setting';

export const useBrighterScreen = (enable: boolean) => {
    useEffect(() => {
        if (enable) {
            if (Platform.OS === 'ios') {
                SystemSetting.saveBrightness().then(() => {
                    SystemSetting.setBrightness(1);
                });
            } else {
                SystemSetting.setAppBrightness(1);
            }
            return () => {
                if (Platform.OS === 'ios') {
                    SystemSetting.restoreBrightness();
                } else {
                    SystemSetting.setAppBrightness(-1);
                }
            };
        }
    }, [enable]);
};
