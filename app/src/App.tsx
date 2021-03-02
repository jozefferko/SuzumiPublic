/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {GoogleSignin} from '@react-native-community/google-signin';
import React from 'react';
import {Animated} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import Hooker from './components/Hooker';
import './i18n';
import {store} from './redux';
import Screens from './Screens/Screens';
import codePush from 'react-native-code-push';

console.disableYellowBox = true;

const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_SUSPEND,
    minimumBackgroundDuration: 5,
    rollbackRetryOptions: {delayInHours: 4, maxRetryAttempts: 10},
};

GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.profile'],
    webClientId:
        '836648076551-p6mj9omu9uj1rj6m8nki0padcii5s7rh.apps.googleusercontent.com',
});
export const HeaderAnimContext = React.createContext(new Animated.Value(0));

const App = () => {
    return (
        <>
            <HeaderAnimContext.Provider value={new Animated.Value(0)}>
                <SafeAreaProvider>
                    <Provider store={store}>
                        <Hooker />
                        <Screens />
                    </Provider>
                </SafeAreaProvider>
            </HeaderAnimContext.Provider>
        </>
    );
};

export default codePush(codePushOptions)(App);
