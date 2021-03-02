import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Octicon from 'react-native-vector-icons/Octicons';
import {useSelector} from 'react-redux';
import theme from '../../assets/theme.style';
import {Condition} from '../../components/logicalLib';
import {RootState} from '../../redux';
import {offersNotSeen} from '../../redux/selectors';
import Booking from './Booking';
import HomeStack from './Home/HomeStack';
import OffersStack from './Offers/OffersStack';
import Scanner from './Scanner';
import Takeaway from './Takeaway';
import {useLocale} from '../../hooks/useLocale';

const Tab = createBottomTabNavigator();

const MainStack = ({}) => {
    const {t} = useLocale();
    const showOffersDot = useSelector(offersNotSeen());
    const takeawayLink = useSelector((state: RootState) =>
        state.restaurant ? state.restaurant.links.takeaway.aalborg : '',
    );
    const bookingLink = useSelector((state: RootState) =>
        state.restaurant ? state.restaurant.links.booking.aalborg : '',
    );
    return (
        <Tab.Navigator
            tabBarOptions={{
                style: {
                    backgroundColor: theme.BACKGROUND_COLOR_NAVIGATION,
                    borderTopColor: theme.BORDER_COLOR_NAVIGATION,
                    height: 60,
                },
                activeTintColor: '#FFFFFF',
                inactiveTintColor: '#999999',
                safeAreaInsets: {bottom: 5},
            }}>
            <Tab.Screen
                name="home"
                component={HomeStack}
                options={{
                    title: t('Home'),
                    tabBarIcon: (props) => (
                        <FontAwesomeIcon
                            style={styles.icon}
                            name="home"
                            size={25}
                            color={props.color}
                        />
                    ),
                    tabBarButton: (props) => (
                        <Pressable
                            onPress={props.onPress}
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                flex: 1,
                            }}>
                            <View {...props} />
                            <View style={{height: 11}} />
                        </Pressable>
                    ),
                }}
            />
            <Tab.Screen
                name="Offers"
                component={OffersStack}
                options={{
                    title: t('Offers'),
                    tabBarIcon: (props) => (
                        <MaterialIcon
                            style={styles.icon}
                            name="card-giftcard"
                            size={25}
                            color={props.color}
                        />
                    ),
                    tabBarButton: (props) => (
                        <Pressable
                            onPress={props.onPress}
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                flex: 1,
                            }}>
                            <View {...props} />
                            <View style={{height: 11}}>
                                <Condition if={showOffersDot}>
                                    <Octicon
                                        // style={styles.icon}
                                        name="primitive-dot"
                                        size={10}
                                        color={theme.NOTIFICATION_COLOR}
                                    />
                                    <></>
                                </Condition>
                            </View>
                        </Pressable>
                    ),
                }}
            />
            <Tab.Screen
                name="booking"
                component={Booking}
                options={{
                    title: t('Booking'),
                    tabBarIcon: (props) => (
                        <Icon
                            style={styles.icon}
                            name="calendar-range"
                            size={25}
                            color={props.color}
                        />
                    ),

                    tabBarButton: (props) => (
                        <Pressable
                            onPress={props.onPress}
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                flex: 1,
                            }}>
                            <View {...props} />
                            <View style={{height: 11}} />
                        </Pressable>
                    ),
                }}
            />
            <Tab.Screen
                name="takeaway"
                component={Takeaway}
                options={{
                    title: t('Takeaway'),
                    tabBarIcon: (props) => (
                        <Icon
                            style={styles.icon}
                            name="basket"
                            size={25}
                            color={props.color}
                        />
                    ),
                    tabBarButton: (props) => (
                        <Pressable
                            onPress={props.onPress}
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                flex: 1,
                            }}>
                            <View {...props} />
                            <View style={{height: 11}} />
                        </Pressable>
                    ),
                }}
            />
            <Tab.Screen
                name="qr"
                component={Scanner}
                options={{
                    title: 'QR',
                    tabBarIcon: (props) => (
                        <MaterialIcon
                            style={styles.icon}
                            name="qr-code"
                            size={25}
                            color={props.color}
                        />
                    ),
                    tabBarButton: (props) => (
                        <Pressable
                            onPress={props.onPress}
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                flex: 1,
                            }}>
                            <View {...props} />
                            <View style={{height: 11}} />
                        </Pressable>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    label: {
        paddingBottom: 5,
        fontSize: 10,
        color: '#3d3d3d',
    },
    icon: {
        marginTop: 5,
    },
});

export default MainStack;
