import {
    CardStyleInterpolators,
    createStackNavigator,
    StackHeaderProps,
} from '@react-navigation/stack';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../../assets/theme.style';
import {Condition} from '../../../components/logicalLib';
import {useLocale} from '../../../hooks/useLocale';
import {RootState} from '../../../redux';
import {useSafeSelector} from '../../../redux/selectors';
import {UserStatus} from '../../../redux/userSlice';
import Achievements from './Achievements';
import Home from './Home';
import Products from './Products';
import Profile from './Profile';
import Settings from './Settings';
import AppInfo from './Settings/AppInfo';
import Language from './Settings/Language';
import PhoneUpdate from './Settings/PhoneUpdate';
import Transactions from './Transactions';
import Feedback from './Feedback';

const stack = createStackNavigator();

const CornerBalance = () => {
    const safeBalance = useSafeSelector((state: RootState) =>
        state.user.status === UserStatus.loaded ? state.user.balance : null,
    );
    const {t} = useLocale();
    return (
        <View style={cornerBalanceStyles.wrapper}>
            <Text style={cornerBalanceStyles.balanceHeader}>
                {t('Your Balance')}
            </Text>
            <Text style={cornerBalanceStyles.points}>
                {safeBalance.orDefault('')}
                <Text style={cornerBalanceStyles.pointsLabel}>
                    {' ' + t('points')}
                </Text>
            </Text>
        </View>
    );
};
const cornerBalanceStyles = StyleSheet.create({
    wrapper: {
        alignSelf: 'flex-end',
        paddingBottom: theme.padding,
        paddingRight: theme.padding,
    },
    balanceHeader: {
        color: '#999999',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Medium',
        fontSize: 13,
    },
    points: {
        color: '#999999',
        textAlign: 'right',
        fontFamily: 'Roboto-Medium',
        fontSize: 20,
    },
    pointsLabel: {
        color: '#999999',
        fontFamily: 'Roboto-light',
        fontSize: 13,
    },
});

const Header = ({scene, previous, navigation}: StackHeaderProps) => {
    const {t} = useLocale();
    const {options} = scene.descriptor;
    const title =
        options.headerTitle !== undefined
            ? options.headerTitle
            : options.title !== undefined
            ? options.title
            : scene.route.name;

    return (
        <View style={styles.wrapper}>
            <Pressable style={styles.button} onPress={navigation.goBack}>
                <Icon
                    style={styles.icon}
                    name="arrow-left"
                    size={22}
                    color="#FFFFFF"
                />
                <Text style={styles.title}>{t(title as string)}</Text>
            </Pressable>
            <Condition
                if={
                    scene.route.name === 'rewards' ||
                    scene.route.name === 'transactions'
                }>
                <CornerBalance />
                <></>
            </Condition>
        </View>
    );
};

const HomeStack = () => {
    return (
        <stack.Navigator
            headerMode={'screen'}
            screenOptions={{
                cardStyle: {backgroundColor: theme.BACKGROUND_COLOR},
                headerStyle: {backgroundColor: theme.BACKGROUND_COLOR},
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                header: Header,
            }}>
            <stack.Screen
                name="mainPage"
                component={Home}
                options={({navigation, route}) => ({
                    headerShown: false,
                })}
            />
            <stack.Screen
                name="rewards"
                component={Products}
                options={({navigation, route}) => ({
                    headerShown: true,
                    headerTitle: 'coupons',
                })}
            />
            <stack.Screen
                name="achievements"
                component={Achievements}
                options={({navigation, route}) => ({
                    headerShown: true,
                })}
            />
            <stack.Screen
                name="transactions"
                component={Transactions}
                options={({navigation, route}) => ({
                    headerShown: true,
                })}
            />
            <stack.Screen
                name="profile"
                component={Profile}
                options={({navigation, route}) => ({
                    headerShown: true,
                    headerTitle: 'edit profile',
                })}
            />
            {/*settings*/}
            <stack.Screen
                name="settings"
                component={Settings}
                options={({navigation, route}) => ({
                    headerShown: true,
                })}
            />
            <stack.Screen
                name="language"
                component={Language}
                options={({navigation, route}) => ({
                    headerShown: true,
                })}
            />
            <stack.Screen
                name="phoneupdate"
                component={PhoneUpdate}
                options={({navigation, route}) => ({
                    headerShown: true,
                    headerTitle: 'Edit Phone Number',
                })}
            />
            <stack.Screen
                name="appinfo"
                component={AppInfo}
                options={({navigation, route}) => ({
                    headerShown: true,
                    headerTitle: 'App',
                })}
            />
            <stack.Screen
                name="feedback"
                component={Feedback}
                options={({navigation, route}) => ({
                    headerShown: true,
                    headerTitle: 'Feedback',
                })}
            />
        </stack.Navigator>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'row',

        backgroundColor: theme.BACKGROUND_COLOR,
        justifyContent: 'space-between',
    },
    button: {
        flexDirection: 'row',
        padding: theme.padding,
    },
    title: {
        paddingLeft: 20,
        fontSize: 22,
        fontFamily: 'Roboto-Medium',
        color: '#FFF',
        textTransform: 'capitalize',
    },
    icon: {
        alignSelf: 'center',
    },
});
export default HomeStack;
