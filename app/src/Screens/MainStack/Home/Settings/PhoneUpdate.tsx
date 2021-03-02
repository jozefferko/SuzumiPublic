import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {useLocale} from '../../../../hooks/useLocale';
import PhoneAuth from '../../../AuthStack/PhoneAuth';

const Language = () => {
    const d = useDispatch();
    const {t} = useLocale();
    const navigation = useNavigation();
    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            <KeyboardAwareScrollView
                extraHeight={75}
                extraScrollHeight={50}
                contentContainerStyle={styles.background}>
                <View style={styles.spacer} />
                <Text style={styles.text}>{t('Enter a new phone number')}</Text>

                <PhoneAuth type={'update'} onComplete={navigation.goBack} />
                <View style={styles.spacer} />
            </KeyboardAwareScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    phoneInput: {
        marginTop: 10,
        color: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 15,
        padding: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#F8F8F8',
    },
    codeInput: {
        flex: 1,
        marginTop: 10,
        color: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 10,
        padding: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#F8F8F8',
        textAlign: 'center',
    },
    text: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Roboto',
    },
    wrapper: {
        paddingHorizontal: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialsContainer: {
        marginBottom: 30,
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialsButton: {
        marginHorizontal: 15,
        borderRadius: 28,
        width: 53,
        height: 53,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        flex: 3,
    },
    confirmButton: {
        flex: 1,
        marginTop: 23,
    },
    background: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suzumiIcon: {
        marginBottom: 20,
        resizeMode: 'contain',
        width: 85,
        height: 85,
    },
    suzumiText: {
        marginBottom: 33,
        resizeMode: 'contain',
        width: 140,
        height: 46,
    },
});

export default Language;
