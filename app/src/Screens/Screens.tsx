import analytics from '@react-native-firebase/analytics';
import {NavigationContainer} from '@react-navigation/native';
import React, {useContext, useMemo, useRef} from 'react';
import {Animated, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {HeaderAnimContext} from '../App';
import theme from '../assets/theme.style';
import Empty from '../components/Empty';
import {RootState} from '../redux';
import {UserStatus} from '../redux/userSlice';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const AnimatedStatusBar = Animated.createAnimatedComponent(StatusBar);

export const HeaderAnimEnableContext = React.createContext(
    (val: boolean) => {},
);
const enableAnim = new Animated.Value(0);
const setEnableAnim = (val: boolean) => enableAnim.setValue(val ? 1 : 0);
// Animated.timing(enableAnim, {
//     toValue: val ? 1 : 0,
//     easing: Easing.ease,
//     duration: 0,
//     useNativeDriver: false,
// }).start();
const Screens = () => {
    const {top} = useSafeAreaInsets();
    const barColorAnim = useContext(HeaderAnimContext);
    const enableInterpolated = Animated.multiply(barColorAnim, enableAnim);
    const barColor = enableInterpolated.interpolate({
        inputRange: [0, 200],
        outputRange: ['#2C3042', '#1C1F2A'],
        extrapolate: 'clamp',
    });
    const user = useSelector((state: RootState) => state.user);
    const isLoggedIn = useMemo<boolean>(
        () =>
            !!(
                user.status === UserStatus.loaded &&
                user.email &&
                user.phoneNumber &&
                user.displayName &&
                user.birthday
            ),
        [user],
    );

    const routeNameRef = useRef();
    const navigationRef = useRef<any>();
    return (
        <>
            <HeaderAnimEnableContext.Provider value={setEnableAnim}>
                <Animated.View
                    style={{
                        backgroundColor: barColor,
                        width: '100%',
                        height: top,
                    }}
                />
                <SafeAreaView
                    style={{
                        flex: 1,
                        backgroundColor: theme.BACKGROUND_COLOR_NAVIGATION,
                    }}>
                    <StatusBar
                        barStyle="light-content"
                        backgroundColor={theme.BACKGROUND_COLOR}
                        // backgroundColor="transparent"
                        translucent={true}
                    />
                    <NavigationContainer
                        ref={navigationRef}
                        onStateChange={() => {
                            const previousRouteName = routeNameRef.current;
                            const currentRouteName =
                                navigationRef.current?.getCurrentRoute().name ??
                                'loading';
                            if (previousRouteName !== currentRouteName) {
                                // The line below uses the expo-firebase-analytics tracker
                                // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
                                // Change this line to use another Mobile analytics SDK
                                // Analytics.setCurrentScreen(currentRouteName);
                                analytics().logScreenView({
                                    screen_name: currentRouteName,
                                    screen_class: currentRouteName,
                                });
                            }

                            // Save the current route name for later comparision
                            routeNameRef.current = currentRouteName;
                        }}>
                        {user.status === UserStatus.off ? (
                            <Empty />
                        ) : isLoggedIn ? (
                            <MainStack />
                        ) : (
                            <AuthStack />
                        )}
                    </NavigationContainer>
                </SafeAreaView>
            </HeaderAnimEnableContext.Provider>
        </>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 2,
        alignSelf: 'center',
        width: '80%',
        paddingTop: 40,
    },
    area: {
        flexDirection: 'column',
        alignContent: 'flex-start',
        flex: 1,
    },
});

export default Screens;
