import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {defaultImage} from '../../../../assets/staticImages';
import theme from '../../../../assets/theme.style';
import ConfirmButton from '../../../../components/ConfirmButton';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeSelector} from '../../../../redux/selectors';
import {
    FSPathMap,
    FSProduct,
    FSStats,
    FSTimestamp,
} from '../../../../common/types/firestore';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../../redux';
import {UserStatus} from '../../../../redux/userSlice';
import {useTimeUntil} from '../../../../hooks/useTimeUntil';
import ConfirmContestEntry from './ConfirmContestEntry';
import {nothingLog, trigger} from '../../../../common/utils/fp';
import {Maybe} from 'purify-ts';
import {fsListener} from '../../../../common/utils/firestore/listeners';

type ContestItemProps = {
    product: FSProduct;
};
const stubTimestamp: FSTimestamp = {seconds: 0, nanoseconds: 0};
const ContestItem = (props: ContestItemProps) => {
    const [showPoUp, setShowPupUp] = useState(false);
    const {t} = useLocale();
    const price = useSelector(
        (state: RootState) => state.restaurant?.contest.current.price ?? 0,
    );
    const available = useSelector((state: RootState) =>
        state.restaurant && state.user.status === UserStatus.loaded
            ? state.restaurant.contest.current.price <= state.user.balance
            : false,
    );
    const safeEndDate = useSafeSelector<FSTimestamp>(
        (state: RootState) => state.restaurant?.contest.current.endDate,
    );
    const endDate = useMemo<FSTimestamp>(
        () => safeEndDate.orDefault(stubTimestamp),
        [safeEndDate],
    );
    const timUntil = useTimeUntil(endDate);
    const [totalEntries, setTotalEntries] = useState<number>(0);
    const d = useDispatch();
    useEffect(
        () =>
            fsListener<FSStats>({
                path: FSPathMap.stats,
                callback: (data: Maybe<FSStats>) => {
                    data.ifNothing(nothingLog('stats'))
                        .chainNullable(
                            ($) => $.counters[FSPathMap.contest.path],
                        )
                        .map(($) => $.count)
                        .ifNothing(trigger(setTotalEntries)(0))
                        .ifJust(setTotalEntries);
                },
            }),

        [],
    );

    return (
        <View style={styles.wrapper}>
            <FastImage
                source={
                    props.product.imgUrl
                        ? {uri: props.product.imgUrl}
                        : defaultImage
                }
                style={styles.productImage}
            />
            <View style={styles.labelBox}>
                <Text style={styles.title}>{t('Contest')}</Text>
                <Text style={styles.timeRemaining}>
                    {t('ends in {{time}}', {
                        time: timUntil,
                    })}
                </Text>
                <Text style={styles.description}>
                    {t(
                        'Buy an entry to win {{item}}. The more entries you buy the higher are your chances of winning!',
                        {
                            item: t(props.product.displayName),
                        },
                    )}
                </Text>

                <ConfirmButton
                    {...(!available
                        ? {
                              onPress: () => {},
                              style: {
                                  borderStyle: 'dashed',
                              },
                              outlined: true,
                              title: (
                                  <Text>
                                      <Icon
                                          name="lock"
                                          size={15}
                                          color={theme.HIGHLIGHT}
                                      />
                                      {price} {t('points')}
                                  </Text>
                              ),
                          }
                        : {
                              onPress: trigger(setShowPupUp)(true),
                              title: (
                                  <Text>
                                      {t(
                                          'Purchase entry for {{price}} points',
                                          {
                                              price: price,
                                          },
                                      )}
                                  </Text>
                              ),
                          })}
                />
                <Text style={styles.entries}>
                    {t('entriesTotalCount', {
                        count: totalEntries,
                    })}
                </Text>
            </View>
            <ConfirmContestEntry
                onClose={trigger(setShowPupUp)(false)}
                show={showPoUp}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        borderRadius: 5,
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        color: theme.BACKGROUND_COLOR,
    },
    productImage: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        resizeMode: 'cover',
    },
    timeRemaining: {
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    description: {
        marginTop: 12,
        marginBottom: 23,
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    labelBox: {
        padding: 30,
    },
    entries: {
        alignSelf: 'center',
        paddingTop: 10,
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        color: theme.HIGHLIGHT,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default ContestItem;
