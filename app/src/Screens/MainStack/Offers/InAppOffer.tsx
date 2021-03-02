import React, {useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {defaultImage} from '../../../assets/staticImages';
import theme from '../../../assets/theme.style';
import {FSOffer} from '../../../common/types/firestore';
import {useLocale} from '../../../hooks/useLocale';
import {formatFSTimestamp} from '../../../common/utils/dateOperations';
import {Condition} from '../../../components/logicalLib';

// export type TimedOffer = FSOffer & {expiresIn: string};

const InAppOffer = ({route, navigation}: any) => {
    /* 2. Get the param */
    const offer: FSOffer = route.params.offer;

    const {t} = useLocale();
    useEffect(() => {
        navigation.setOptions({title: t(offer.section)});
    }, [navigation, offer.section, t]);

    const expiryDate = formatFSTimestamp(offer.expiry);
    return (
        <>
            <Separator />
            <ScrollView
                style={styles.wrapper}
                contentContainerStyle={{
                    flexDirection: 'column',
                }}>
                <FastImage
                    source={offer.imgUrl ? {uri: offer.imgUrl} : defaultImage}
                    style={styles.productImage}
                />
                <Condition if={offer.shouldExpire}>
                    <Text style={styles.expiration}>
                        {t('Expires on')} {expiryDate}
                    </Text>
                    <></>
                </Condition>
                <View style={{width: '100%'}}>
                    <Text style={styles.title}>{t(offer.displayName)}</Text>
                    <Text style={styles.description}>
                        {t(offer.description)}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    list: {
        // paddingTop: 50,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
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
        padding: theme.padding,
    },
    expiration: {
        fontSize: 13,
        paddingBottom: 5,
        fontFamily: 'Roboto-Light',
        color: '#ffffff',
    },
    productImage: {
        width: '100%',

        height: 300,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        resizeMode: 'cover',
        marginBottom: 30,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Roboto-Medium',
        color: '#FFF',
    },
    description: {
        marginTop: 20,
        marginBottom: 23,
        fontSize: 15,
        fontFamily: 'Roboto-Light',
        color: '#FFFFFF',
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default InAppOffer;
