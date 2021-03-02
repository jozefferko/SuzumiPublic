import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {setSettings} from '../../../../redux/settingsSlice';

const Language = () => {
    const d = useDispatch();
    const {t, i18n} = useLocale();
    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            <ScrollView>
                <LanguageButton
                    label={t('English')}
                    enabled={i18n.language === 'en'}
                    onPress={() => d(setSettings({language: 'en'}))}
                />
                <LanguageButton
                    label={t('Danish')}
                    enabled={i18n.language === 'dk'}
                    onPress={() => d(setSettings({language: 'dk'}))}
                />
            </ScrollView>
        </View>
    );
};

const LanguageButton = (props: {
    label: string;
    enabled: boolean;
    onPress: () => any;
}) => (
    <>
        <TouchableOpacity
            style={SettingsButtonStyles.button}
            onPress={props.onPress}>
            <Text style={SettingsButtonStyles.label}>{props.label}</Text>
            <Condition if={props.enabled}>
                <Icon name="check" size={16} color="#FFFFFF" />
                <></>
            </Condition>
        </TouchableOpacity>
        <View style={SettingsButtonStyles.separator} />
    </>
);

const SettingsButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: theme.BACKGROUND_COLOR,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
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

export default Language;
