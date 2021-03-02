import React from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import theme from '../../../../assets/theme.style';
import {useImageUpload} from '../../../../hooks/useImageUpload';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeSelector} from '../../../../redux/selectors';
import {loadedState, UserStatus} from '../../../../redux/userSlice';
import Editor from './Editor';
import {useNavigation} from '@react-navigation/native';

const Profile = () => {
    const {t} = useLocale();

    const navigation = useNavigation();
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );

    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            <KeyboardAwareScrollView>
                {safeUser.mapOrDefault(
                    (user) => (
                        <Editor
                            user={user}
                            onSave={() => navigation.goBack()}
                        />
                    ),
                    null,
                )}
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
        padding: theme.padding,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    userImageBox: {
        paddingVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userImage: {
        borderRadius: 85,
        height: 125,
        width: 125,
    },
    imageLabel: {
        paddingTop: 20,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto-Light',
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default Profile;
