import React from 'react';
import {useAchievements} from '../hooks/global/achievements/useAchievements';
import useNotifications from '../hooks/global/useNotifications';
import useRestaurant from '../hooks/global/useRestaurant';
import useSettingsListener from '../hooks/global/useSettingsListener';
import useTiers from '../hooks/global/useTiers';
import useUserListener from '../hooks/global/useUserListener';

export default () => {
    useUserListener();
    useRestaurant();
    useSettingsListener();
    useAchievements();
    useTiers();
    useNotifications();
    // useFacebookData();
    return <></>;
};
