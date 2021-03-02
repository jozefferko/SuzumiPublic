import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {useLocale} from '../../../../hooks/useLocale';

const AppInfo = () => {
    const d = useDispatch();
    const {t, i18n} = useLocale();
    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>About the app</Text>
                <Text style={styles.body}>
                    {`Denne app er udviklet af Swoop Media, et dansk iværksætterfirma, som tilbyder online bestillings-, web- og app-løsninger for restauranter.

Ønsker du et online takeaway bestillingssystem eller en app til din restaurant eller virksomhed?

Kontakt os på bobby@swoopmedia.dk for at høre mere.`}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    header: {
        paddingTop: 30,
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
    },
    body: {
        paddingTop: 10,
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Roboto-Light',
    },
});

export default AppInfo;
