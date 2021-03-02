import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SectionList, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import theme from '../../../assets/theme.style';
import {FSOffer, FSTimestamp} from '../../../common/types/firestore';
import {fFilter, fMap, maybeAll} from '../../../common/utils/fp';
import {useLocale} from '../../../hooks/useLocale';
import {RootState} from '../../../redux';
import {orderedOffersSelector, useSafeSelector} from '../../../redux/selectors';
import {setSettings} from '../../../redux/settingsSlice';
import Offer from './Offer';
import {secondsSinceFSTimestamp} from '../../../common/utils/dateOperations';
import {useTimedEffect} from '../../../hooks/useTimedEffect';

const offerExpiredPredicate = (offer: FSOffer): boolean => {
    return (
        secondsSinceFSTimestamp(offer.publish) >= 0 &&
        (!offer.shouldExpire || secondsSinceFSTimestamp(offer.expiry) < 0)
    );
    // const expiryDate = new Date(offer.expiry.seconds * 1000);
    // expiryDate.setDate(expiryDate.getDate() + offer.daysActive);
    // expiryDate.setHours(0);
    // expiryDate.setMinutes(0);
    // expiryDate.setSeconds(0);
    //
    // const currentDate = new Date();
    // return currentDate.getTime() < expiryDate.getTime();
};

const getNextUpdate = (offers: FSOffer[]): number =>
    _.flow(
        fMap((offer: FSOffer): FSTimestamp[] => [offer.publish, offer.expiry]),
        _.flatten,
        fFilter(
            (timestamp: FSTimestamp) =>
                new Date().getTime() < timestamp.seconds * 1000,
        ),
        _.minBy((timestamp: FSTimestamp) => timestamp.seconds),
        ($) => ($?.seconds ?? 0) * 1000,
    )(offers);

const Offers = () => {
    const {t} = useLocale();
    const d = useDispatch();
    const offersData = useSelector(orderedOffersSelector());
    const [filteredOffers, setFilteredOffers] = useState<FSOffer[]>([]);
    const [nextUpdate, setNextUpdate] = useState<number>(0);
    useEffect(() => {
        setNextUpdate(0);
    }, [offersData]);
    const filterOffers = useCallback(() => {
        if (new Date().getTime() >= nextUpdate) {
            setNextUpdate(getNextUpdate(Object.values(offersData)));
            setFilteredOffers(
                Object.values(offersData).filter(offerExpiredPredicate),
            );
        }
    }, [nextUpdate, offersData]);
    useTimedEffect(filterOffers);

    const news = useMemo<FSOffer[]>(
        () => filteredOffers.filter((offer) => offer.section === 'news'),
        [filteredOffers],
    );
    const offers = useMemo<FSOffer[]>(
        () => filteredOffers.filter((offer) => offer.section === 'offer'),
        [filteredOffers],
    );
    // console.log('timedOffers', preFilteredTimedOffers);
    // const [timedOffers, setTimedOffers] = useState<TimedOffer[]>([]);
    // useEffect(() => {
    //     const secTimer = setInterval(() => {
    //         setTimedOffers(getTimedOffers(preFilteredTimedOffers));
    //     }, 500);
    //     return () => clearInterval(secTimer);
    // }, [preFilteredTimedOffers, setTimedOffers]);

    //update last seen offer
    const safeLastSeen = useSafeSelector<number>(
        (state) => state.settings?.lastOfferSeen,
    );
    useEffect(() => {
        maybeAll(
            safeLastSeen,
            _.flow(
                Object.values,
                fMap(($) => $.publish.seconds),
                _.max,
                Maybe.fromNullable,
            )(offersData),
        )
            .chain(
                Maybe.fromPredicate(
                    ([lastSeen, latestOffer]) => lastSeen < latestOffer,
                ),
            )
            .ifJust(([lastSeen, latestOffer]) =>
                d(setSettings({lastOfferSeen: latestOffer})),
            );
    }, [safeLastSeen, offersData, d]);

    return (
        <View style={styles.wrapper}>
            <SectionList
                ItemSeparatorComponent={Separator}
                renderSectionHeader={({section: {title}}) => (
                    <Text style={styles.header}>{t(title)}</Text>
                )}
                sections={[
                    {
                        title: 'Offers',
                        data: offers,
                        renderItem: ({item, index, section: {title, data}}) => (
                            <Offer item={item} />
                        ),
                    },
                    {
                        title: 'News',
                        data: news,
                        renderItem: ({item, index, section: {title, data}}) => (
                            <Offer item={item} />
                        ),
                    },
                ]}
                keyExtractor={(item, index) => item.id}
            />
        </View>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    list: {
        // paddingTop: 50,
    },
    header: {
        paddingVertical: 40,
        backgroundColor: theme.BACKGROUND_COLOR,
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

export default Offers;
