import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import theme from '../../../../assets/theme.style';
import {useFASignIn} from '../../../../hooks/useFASignIn';
import {useLocale} from '../../../../hooks/useLocale';
import {useDispatch, useSelector} from 'react-redux';
import {setSettings} from '../../../../redux/settingsSlice';
import {trigger} from '../../../../common/utils/fp';
import {openLinkInApp} from '../../../../utils/link';
import {RootState} from '../../../../redux';
import {Condition} from '../../../../components/logicalLib';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const Settings = () => {
    const d = useDispatch();
    const navigation = useNavigation();
    const {t} = useLocale();
    const {signOut} = useFASignIn(() => {});
    const feedbackEnabled = useSelector(
        (state: RootState) => state.restaurant?.feedback.enabled ?? false,
    );

    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>{t('account')}</Text>
                <SettingsButton
                    label={t('Edit profile')}
                    onPress={() => navigation.navigate('profile')}
                />
                <SettingsButton
                    label={t('Edit phone number')}
                    onPress={() => navigation.navigate('phoneupdate')}
                />
                <Text style={styles.sectionTitle}>{t('app settings')}</Text>
                <SettingsButton
                    label={t('Language')}
                    onPress={() => navigation.navigate('language')}
                />
                <SettingsButton
                    label={t('Help')}
                    onPress={() => d(setSettings({firstOpen: true}))}
                />
                <Text style={styles.sectionTitle}>{t('About')}</Text>
                <SettingsButton
                    label={t('App')}
                    onPress={() => navigation.navigate('appinfo')}
                />
                <Condition if={feedbackEnabled}>
                    <SettingsButton
                        label={t('Give us feedback')}
                        onPress={() => navigation.navigate('feedback')}
                    />
                    <></>
                </Condition>
                <SettingsButton
                    label={t('Terms of service')}
                    onPress={trigger(openLinkInApp)(
                        'https://suzumi.dk/vilkar-og-betingelser',
                    )}
                />
                <SettingsButton
                    label={t('Privacy policy')}
                    onPress={trigger(openLinkInApp)(
                        'https://suzumi.dk/behandling-af-personoplysninger-persondatapolitik-for-suzumi-appen',
                    )}
                />
                <SettingsButton label={t('Log out')} onPress={signOut} />
            </ScrollView>
        </View>
    );
};

const SettingsButton = (props: {label: string; onPress: () => any}) => (
    <>
        <TouchableOpacity
            style={SettingsButtonStyles.button}
            onPress={props.onPress}>
            <Text style={SettingsButtonStyles.label}>{props.label}</Text>
        </TouchableOpacity>
        <View style={SettingsButtonStyles.separator} />
    </>
);

const SettingsButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: theme.BACKGROUND_COLOR,
        paddingVertical: 15,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    label: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
    },
});
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
    sectionTitle: {
        paddingTop: 40,
        paddingBottom: 5,
        color: '#989898',
        fontSize: 16,
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Medium',
    },
});

export default Settings;
