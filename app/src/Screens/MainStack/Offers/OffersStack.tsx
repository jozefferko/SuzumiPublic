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
import InAppOffer from './InAppOffer';
import Offers from './index';

const stack = createStackNavigator();
function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

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
                <Text style={styles.title}>
                    {capitalizeFirstLetter(title as string)}
                </Text>
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

const OffersStack = () => {
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
                name="offersList"
                component={Offers}
                options={({navigation, route}) => ({
                    headerShown: false,
                })}
            />
            <stack.Screen
                name="inAppOffer"
                component={InAppOffer}
                options={({navigation, route}) => ({
                    headerShown: true,
                })}
            />
            <stack.Screen
                name="inAppArticle"
                component={InAppOffer}
                options={({navigation, route}) => ({
                    headerShown: true,
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
    },
    icon: {
        alignSelf: 'center',
    },
});
export default OffersStack;
