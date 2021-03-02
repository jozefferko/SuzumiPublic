import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import theme from '../../assets/theme.style';
import {useFASignIn} from '../../hooks/useFASignIn';
import {useLocale} from '../../hooks/useLocale';
import {RootState} from '../../redux';
import {loadedState, UserStatus} from '../../redux/userSlice';
import Editor from '../MainStack/Home/Profile/Editor';

const MissingInfo = () => {
    const user = useSelector((state: RootState) => state.user);
    if (user.status === UserStatus.loaded) {
        return <MissingInfoContent user={user} />;
    } else {
        return <View />;
    }
};
type props = {
    user: loadedState;
};
const MissingInfoContent = (props: props) => {
    const {signOut} = useFASignIn(() => {});
    const {t} = useLocale();

    return (
        <KeyboardAwareScrollView
            extraHeight={75}
            extraScrollHeight={50}
            scrollEnabled
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.wrapper}>
            <View>
                <View
                    style={{
                        flexDirection: 'row',

                        backgroundColor: theme.BACKGROUND_COLOR,
                        justifyContent: 'flex-start',
                    }}>
                    <Pressable
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: theme.padding,
                            paddingLeft: 0,
                            paddingBottom: 0,
                        }}
                        onPress={signOut}>
                        <Icon
                            style={{
                                alignSelf: 'center',
                            }}
                            name="arrow-left"
                            size={22}
                            color="#FFFFFF"
                        />
                        <Text
                            style={{
                                paddingLeft: 20,
                                fontSize: 22,
                                fontFamily: 'Roboto-Medium',
                                color: '#FFF',
                                textTransform: 'capitalize',
                            }}>
                            {t('go back')}
                        </Text>
                    </Pressable>
                </View>

                <Editor user={props.user} />
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,

        flexDirection: 'column',
        paddingHorizontal: theme.padding,
        paddingBottom: theme.padding,
    },
});

export default MissingInfo;
