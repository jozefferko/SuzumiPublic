import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Static} from 'runtypes';
import {bookAalborg, bookRanders} from '../../assets/staticImages';
import theme from '../../assets/theme.style';
import {FSRestaurant} from '../../common/types/firestore';
import ConfirmButton from '../../components/ConfirmButton';
import {useLocale} from '../../hooks/useLocale';
import {useSafeSelector} from '../../redux/selectors';
import {openLinkInApp} from '../../utils/link';

const Booking = () => {
    const {t} = useLocale();
    const safeRestaurant = useSafeSelector<Static<typeof FSRestaurant>>(
        (state) => state.restaurant,
    );
    return (
        <View style={styles.wrapper}>
            <Text style={styles.header}>{t('Book table')}</Text>
            <View style={styles.card}>
                <Image
                    source={bookAalborg}
                    resizeMode="cover"
                    style={styles.image}
                />
                <View style={styles.labelBox}>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={styles.locName}>Aalborg</Text>
                        <Text style={styles.address}>
                            Jernbanegade 2, 9000 Aalborg
                        </Text>
                    </View>
                    <ConfirmButton
                        textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                        style={{marginLeft: 5, paddingVertical: 7}}
                        title={t('Book table')}
                        onPress={() =>
                            safeRestaurant
                                .map(($) => $.links.booking.aalborg)
                                .ifJust(openLinkInApp)
                        }
                    />
                </View>
            </View>
            <View style={styles.card}>
                <Image
                    source={bookRanders}
                    resizeMode="cover"
                    style={styles.image}
                />
                <View style={styles.labelBox}>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={styles.locName}>Randers</Text>
                        <Text style={styles.address}>
                            Middelgade 3, 8900 Randers
                        </Text>
                    </View>
                    <ConfirmButton
                        textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                        style={{marginLeft: 5, paddingVertical: 7}}
                        title={t('Book table')}
                        onPress={() =>
                            safeRestaurant
                                .map(($) => $.links.booking.randers)
                                .ifJust(openLinkInApp)
                        }
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginTop: 40,
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
    },
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
        padding: theme.padding,
        paddingBottom: theme.padding * 2,
    },
    card: {
        marginTop: 35,
        flex: 1,
        justifyContent: 'flex-start',
    },
    image: {
        borderRadius: 5,
        width: '100%',
        flex: 1,
    },
    labelBox: {
        flexWrap: 'wrap',
        marginTop: 20,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    locName: {
        color: '#ffffff',
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
    },
    address: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
    },
});

export default Booking;
