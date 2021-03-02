import {
    createMaterialTopTabNavigator,
    MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Entypo';
import {useSelector} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {unclaimedRewards} from '../../../../redux/selectors';
import ClaimedList from './ClaimedList';
import ProductsList from './ProductsList';

const Tab = createMaterialTopTabNavigator();

const Products = () => {
    const {t} = useLocale();
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const areUnclaimed = useSelector(unclaimedRewards());
    return (
        <Tab.Navigator
            swipeEnabled={scrollEnabled}
            style={{backgroundColor: theme.BACKGROUND_COLOR}}
            sceneContainerStyle={{backgroundColor: theme.BACKGROUND_COLOR}}
            tabBarOptions={{
                renderTabBarItem: (props: any) => (
                    <TouchableOpacity
                        key={props.route.name}
                        onPress={props.onPress}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 15,
                            flexDirection: 'row',
                        }}>
                        <Condition
                            if={areUnclaimed && props.route.name === 'claimed'}>
                            <Icon
                                name="dot-single"
                                size={25}
                                color={theme.BACKGROUND_COLOR}
                            />
                            <></>
                        </Condition>
                        <Text
                            style={{
                                color: '#FFFF',
                                flexDirection: 'row',
                                fontSize: 18,
                                fontFamily: 'Roboto-medium',
                                textTransform: 'uppercase',
                            }}>
                            {
                                //@ts-ignore
                                t(props.route.name)
                            }
                        </Text>
                        <Condition
                            if={areUnclaimed && props.route.name === 'claimed'}>
                            <Icon
                                name="dot-single"
                                size={25}
                                color={theme.NOTIFICATION_COLOR}
                            />
                            <></>
                        </Condition>
                    </TouchableOpacity>
                ),
                activeTintColor: '#FFFFFF',
                inactiveTintColor: '#565967',
                labelStyle: styles.tabHeader,
                showIcon: true,
                style: styles.tabs,
                indicatorStyle: {backgroundColor: 'rgb(255, 255, 255)'},
            }}>
            <Tab.Screen name="available" component={ProductsList} />
            <Tab.Screen
                name="claimed"
                children={(props) => (
                    <ClaimedList
                        scrollEnabled={scrollEnabled}
                        setScrollEnabled={setScrollEnabled}
                        {...props}
                    />
                )}
            />
        </Tab.Navigator>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    tabHeader: {
        flexDirection: 'row',
        fontSize: 18,
        fontFamily: 'Roboto-medium',
        textTransform: 'uppercase',
    },
    tabs: {backgroundColor: theme.BACKGROUND_COLOR, borderWidth: 0},
    list: {
        // paddingTop: 50,
    },
    header: {
        marginVertical: 40,
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
    },
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
        padding: theme.padding,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
        marginVertical: 30,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default Products;
