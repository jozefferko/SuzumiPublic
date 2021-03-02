import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useSelector} from 'react-redux';
import theme from '../../assets/theme.style';
import {RootState} from '../../redux';
import Auth from './Auth';
import MissingInfo from './MissingInfo';
import MissingPhone from './MissingPhone';
const stack = createStackNavigator();

const AuthStack = () => {
    const user = useSelector((state: RootState) => state.user);
    return (
        <stack.Navigator
            screenOptions={{
                cardStyle: {backgroundColor: theme.BACKGROUND_COLOR},
            }}>
            {!user.id ? (
                <stack.Screen
                    name="phone"
                    component={Auth}
                    options={({navigation, route}) => ({headerShown: false})}
                />
            ) : !user.phoneNumber ? (
                <stack.Screen
                    name="missingPhone"
                    component={MissingPhone}
                    options={({navigation, route}) => ({headerShown: false})}
                />
            ) : (
                <stack.Screen
                    name="phone"
                    component={MissingInfo}
                    options={({navigation, route}) => ({headerShown: false})}
                />
            )}
        </stack.Navigator>
    );
};

export default AuthStack;
